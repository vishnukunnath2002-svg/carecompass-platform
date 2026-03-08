
-- 1. Add modules_included column to subscription_plans
ALTER TABLE subscription_plans ADD COLUMN modules_included text[] DEFAULT '{}';
-- Migrate existing data from module column
UPDATE subscription_plans SET modules_included = ARRAY[module] WHERE modules_included = '{}';

-- 2. Pharmacy partnerships table
CREATE TABLE pharmacy_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  store_tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_tenant_id, store_tenant_id)
);
ALTER TABLE pharmacy_partnerships ENABLE ROW LEVEL SECURITY;

-- Agency owners can manage their partnerships
CREATE POLICY "Agency manage own partnerships" ON pharmacy_partnerships FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = pharmacy_partnerships.agency_tenant_id AND tenants.owner_user_id = auth.uid()));

-- Store owners can view their partnerships
CREATE POLICY "Store view own partnerships" ON pharmacy_partnerships FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = pharmacy_partnerships.store_tenant_id AND tenants.owner_user_id = auth.uid()));

-- Admins manage all
CREATE POLICY "Admins manage partnerships" ON pharmacy_partnerships FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- 3. Pharmacy referrals table
CREATE TABLE pharmacy_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid REFERENCES pharmacy_partnerships(id),
  booking_id uuid,
  patient_user_id uuid,
  agency_tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  store_tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  reason text,
  status text DEFAULT 'referred',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pharmacy_referrals ENABLE ROW LEVEL SECURITY;

-- Agency owners can manage their referrals
CREATE POLICY "Agency manage own referrals" ON pharmacy_referrals FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = pharmacy_referrals.agency_tenant_id AND tenants.owner_user_id = auth.uid()));

-- Store owners can view referrals to them
CREATE POLICY "Store view own referrals" ON pharmacy_referrals FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = pharmacy_referrals.store_tenant_id AND tenants.owner_user_id = auth.uid()));

-- Admins manage all
CREATE POLICY "Admins manage referrals" ON pharmacy_referrals FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'));
