
-- Subscription plans table for the 3 core modules
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  module text NOT NULL, -- 'manpower_marketplace', 'medical_ecommerce', 'store_connect'
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  is_free_trial boolean NOT NULL DEFAULT false,
  trial_days integer DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_users integer,
  max_listings integer,
  commission_override numeric,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tenant subscriptions - which tenant has which plan
CREATE TABLE public.tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active', -- active, trial, expired, cancelled
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_trial boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add lat/lng to tenants for agency location
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS lng double precision;

-- Add lat/lng to caregiver_profiles for provider location
ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS lng double precision;

-- RLS for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage plans"
ON public.subscription_plans FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone read active plans"
ON public.subscription_plans FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS for tenant_subscriptions
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage subscriptions"
ON public.tenant_subscriptions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Owners see own subscriptions"
ON public.tenant_subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenants
    WHERE tenants.id = tenant_subscriptions.tenant_id
    AND tenants.owner_user_id = auth.uid()
  )
);
