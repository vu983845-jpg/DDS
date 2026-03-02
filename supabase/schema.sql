-- Create specialized roles/enums
CREATE TYPE user_role AS ENUM ('viewer', 'dept_user', 'hse_admin');
CREATE TYPE department_name AS ENUM ('Steaming', 'Shelling', 'Borma', 'Peeling MC', 'ColorSorter', 'HandPeeling', 'Packing');
CREATE TYPE issue_status AS ENUM ('Open', 'Closed');
CREATE TYPE safety_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  role user_role DEFAULT 'viewer',
  department department_name, -- Nullable, e.g., for viewer or hse_admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Issues Table
CREATE TABLE public.issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department department_name NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE, -- Null if ongoing
  is_ongoing BOOLEAN DEFAULT false,
  machine_area TEXT,
  reason_code TEXT,
  description TEXT,
  duration_mins INT, -- Could be calculated or manually entered
  impact_level TEXT,
  notes TEXT,
  attachment_url TEXT,
  status issue_status DEFAULT 'Open',
  reporter_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safety Triggers Table
CREATE TABLE public.safety_triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  severity safety_severity NOT NULL,
  description TEXT NOT NULL,
  status issue_status DEFAULT 'Open',
  owner UUID REFERENCES public.profiles(id),
  action_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- DDS Notes Table (For the daily meeting outcomes)
CREATE TABLE public.dds_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  notes TEXT,
  actions_decided JSONB, -- Array of actions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dds_notes ENABLE ROW LEVEL SECURITY;

-- 1. Viewers can see everything (Select)
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Anyone can view safety triggers" ON public.safety_triggers FOR SELECT USING (true);
CREATE POLICY "Anyone can view DDS notes" ON public.dds_notes FOR SELECT USING (true);

-- 2. HSE Admin can do everything
CREATE POLICY "HSE Admin insert on profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hse_admin')
);
CREATE POLICY "HSE Admin update on profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hse_admin')
);
CREATE POLICY "HSE Admin delete on profiles" ON public.profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hse_admin')
);
CREATE POLICY "HSE Admin all on issues" ON public.issues FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hse_admin')
);
CREATE POLICY "HSE Admin all on safety" ON public.safety_triggers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hse_admin')
);
CREATE POLICY "HSE Admin all on notes" ON public.dds_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hse_admin')
);

-- 3. Department Users can Create and Update (within 24h) their own department issues
CREATE POLICY "Dept User insert issue" ON public.issues FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'dept_user' AND department = issues.department
  )
);

CREATE POLICY "Dept User update issue within 24h" ON public.issues FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'dept_user' AND department = issues.department
  )
  -- Add condition to only allow edits if the created_at is within the last 24 hours
  AND created_at >= (now() - interval '24 hours')
);

-- Trigger for updating `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safety_updated_at BEFORE UPDATE ON public.safety_triggers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.dds_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation from Auth -> Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'viewer'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
