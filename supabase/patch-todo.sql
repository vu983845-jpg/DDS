-- Table: todo_actions
-- Purpose: Track follow-up actions and TO-DO items from daily meetings or specific issues.

CREATE TABLE public.todo_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Done')),
    created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.todo_actions ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can view todo actions
CREATE POLICY "Enable read access for all users on todo_actions" ON "public"."todo_actions"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- 2. Everyone can insert todo actions
CREATE POLICY "Enable insert access for all users on todo_actions" ON "public"."todo_actions"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Only Admin or Creator can update status
CREATE POLICY "Enable update for creator or admin on todo_actions" ON "public"."todo_actions"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  (auth.uid() = created_by_id) OR
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'hse_admin'
  ))
);

-- 4. Only Admin or Creator can delete
CREATE POLICY "Enable delete for creator or admin on todo_actions" ON "public"."todo_actions"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  (auth.uid() = created_by_id) OR
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'hse_admin'
  ))
);
