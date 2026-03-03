-- 1. Add new columns for free-text PIC name and selective Department
ALTER TABLE todo_actions ADD COLUMN IF NOT EXISTS pic_name TEXT;
ALTER TABLE todo_actions ADD COLUMN IF NOT EXISTS pic_department TEXT;

-- 2. Optional: We can drop the old pic_id foreign key if we no longer want it, or just leave it nullable.
-- We will just leave it there for historical data, but frontend will stop using it.
