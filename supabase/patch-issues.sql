-- Add columns to track who closed the issue and when
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS closed_by_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;
