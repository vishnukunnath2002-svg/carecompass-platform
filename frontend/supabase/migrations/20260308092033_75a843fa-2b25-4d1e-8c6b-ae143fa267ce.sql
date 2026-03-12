
-- Fix audit_logs INSERT policy to require authenticated user
DROP POLICY "System inserts audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
