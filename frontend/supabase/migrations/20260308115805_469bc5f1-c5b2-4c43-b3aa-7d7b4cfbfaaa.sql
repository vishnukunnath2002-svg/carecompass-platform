
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS domain_slug text UNIQUE;

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_tenants_domain_slug ON public.tenants(domain_slug);
