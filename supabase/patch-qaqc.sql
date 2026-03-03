-- Migration script to create the QA/QC Logs table

-- 1. Create the QA/QC Logs table
CREATE TABLE IF NOT EXISTS public.qa_qc_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('Audit', 'Defect', 'Update')),
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    owner UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_required TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.qa_qc_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Anyone can read QA/QC logs (Dashboard is public)
CREATE POLICY "Enable read access for all users" ON public.qa_qc_logs
    FOR SELECT
    USING (true);

-- Policy: Only QA/QC Admins can insert/update/delete logs
CREATE POLICY "Enable insert for QA/QC Admin" ON public.qa_qc_logs
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'qa_qc_admin'
        )
    );

CREATE POLICY "Enable update for QA/QC Admin" ON public.qa_qc_logs
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'qa_qc_admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'qa_qc_admin'
        )
    );

CREATE POLICY "Enable delete for QA/QC Admin" ON public.qa_qc_logs
    FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'qa_qc_admin'
        )
    );
