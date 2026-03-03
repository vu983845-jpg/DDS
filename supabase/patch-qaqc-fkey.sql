-- To allow querying "qa_qc_logs(owner_id, profiles(name))", we must establish a foreign key from qa_qc_logs to public.profiles

ALTER TABLE public.qa_qc_logs 
DROP CONSTRAINT IF EXISTS qa_qc_logs_owner_id_fkey;

ALTER TABLE public.qa_qc_logs 
ADD CONSTRAINT qa_qc_logs_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;
