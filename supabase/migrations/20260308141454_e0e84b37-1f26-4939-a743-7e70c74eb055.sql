
-- Create service_requests table
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_phone text,
  service_type text NOT NULL,
  description text NOT NULL,
  preferred_start_date date,
  preferred_shift text,
  patient_condition text,
  status text NOT NULL DEFAULT 'pending',
  agency_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Patients insert own requests
CREATE POLICY "Patients insert own requests"
ON public.service_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = patient_id);

-- RLS: Patients select own requests
CREATE POLICY "Patients select own requests"
ON public.service_requests FOR SELECT TO authenticated
USING (auth.uid() = patient_id);

-- RLS: Agency owners select requests for their tenant
CREATE POLICY "Agency owners select tenant requests"
ON public.service_requests FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.tenants
  WHERE tenants.id = service_requests.tenant_id
  AND tenants.owner_user_id = auth.uid()
));

-- RLS: Agency owners update requests for their tenant
CREATE POLICY "Agency owners update tenant requests"
ON public.service_requests FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.tenants
  WHERE tenants.id = service_requests.tenant_id
  AND tenants.owner_user_id = auth.uid()
));

-- RLS: Admins manage all
CREATE POLICY "Admins manage service requests"
ON public.service_requests FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Add updated_at trigger
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
