-- Policy: Department Users can delete issues they created or belong to their department, within 24 hours of creation.
CREATE POLICY "Dept User delete issue within 24h" ON public.issues FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'dept_user' AND department = issues.department
  )
  -- Add condition to only allow deletes if the created_at is within the last 24 hours
  AND created_at >= (now() - interval '24 hours')
);
