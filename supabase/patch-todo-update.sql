-- Add PIC and Deadline columns to todo_actions

ALTER TABLE public.todo_actions 
ADD COLUMN pic_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN deadline TIMESTAMP WITH TIME ZONE;
