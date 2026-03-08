
-- Create agency_services table
CREATE TABLE public.agency_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  price_hourly NUMERIC,
  price_daily NUMERIC,
  price_weekly NUMERIC,
  conditions_served TEXT[] DEFAULT '{}',
  equipment_suggestions UUID[] DEFAULT '{}',
  assigned_staff UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agency_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency manage own services" ON public.agency_services FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = agency_services.tenant_id AND tenants.owner_user_id = auth.uid()));

CREATE POLICY "Public view active services" ON public.agency_services FOR SELECT TO anon, authenticated
USING (is_active = true);

-- Add agency_service_id to bookings
ALTER TABLE public.bookings ADD COLUMN agency_service_id UUID REFERENCES public.agency_services(id);

-- Add trigger for updated_at
CREATE TRIGGER update_agency_services_updated_at BEFORE UPDATE ON public.agency_services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_services;
