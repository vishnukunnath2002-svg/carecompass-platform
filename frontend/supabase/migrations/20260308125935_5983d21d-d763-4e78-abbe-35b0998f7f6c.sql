
-- Fix RLS policies on subscription_plans - they were RESTRICTIVE which requires ALL to pass
-- Drop and recreate as PERMISSIVE so either condition works

DROP POLICY IF EXISTS "Admins manage plans" ON subscription_plans;
DROP POLICY IF EXISTS "Anyone read active plans" ON subscription_plans;

CREATE POLICY "Admins manage plans"
ON subscription_plans
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone read active plans"
ON subscription_plans
FOR SELECT
TO anon, authenticated
USING (is_active = true);
