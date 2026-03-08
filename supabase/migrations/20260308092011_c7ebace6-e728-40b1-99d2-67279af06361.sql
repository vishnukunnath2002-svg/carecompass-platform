
-- =============================================
-- CYLO HEALTHCARE MARKETPLACE - CORE SCHEMA
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM (
  'super_admin', 'admin_manager', 'verification_officer', 'finance_admin', 'support_agent', 'content_manager',
  'patient',
  'agency_admin', 'agency_ops', 'agency_booking', 'agency_support', 'agency_recruiter', 'agency_finance',
  'provider',
  'vendor_admin', 'vendor_catalogue', 'vendor_inventory', 'vendor_orders', 'vendor_finance',
  'store_admin', 'store_counter', 'store_inventory', 'store_dispatch',
  'hospital_admin', 'hospital_procurement', 'hospital_discharge', 'hospital_nursing'
);

CREATE TYPE public.tenant_type AS ENUM ('agency', 'vendor', 'medical_store', 'hospital');
CREATE TYPE public.tenant_status AS ENUM ('pending', 'active', 'suspended', 'deactivated');
CREATE TYPE public.verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'disputed');
CREATE TYPE public.provider_type AS ENUM ('home_nurse', 'specialized_nurse', 'caregiver', 'baby_care', 'companion', 'bystander', 'domestic_helper');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- 2. UTILITY FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- 3. USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  tenant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, tenant_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 4. TENANTS
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_name TEXT,
  type tenant_type NOT NULL,
  status tenant_status NOT NULL DEFAULT 'pending',
  owner_user_id UUID REFERENCES auth.users(id),
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  gst_number TEXT,
  registration_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  modules_enabled JSONB DEFAULT '["homecare","ecommerce","store_connect"]',
  feature_config JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_tenants_ts BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Public view active tenants" ON public.tenants FOR SELECT USING (status = 'active');
CREATE POLICY "Admins full tenants" ON public.tenants FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners view own tenant" ON public.tenants FOR SELECT USING (auth.uid() = owner_user_id);

ALTER TABLE public.user_roles ADD CONSTRAINT fk_user_roles_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 5. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  gender gender_type,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ADDRESSES
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- 7. PATIENT PROFILES
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  age INTEGER,
  gender gender_type,
  blood_group TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  special_care_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_patient_profiles_ts BEFORE UPDATE ON public.patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Users manage own patients" ON public.patient_profiles FOR ALL USING (auth.uid() = user_id);

-- 8. CAREGIVER PROFILES
CREATE TABLE public.caregiver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  provider_type provider_type NOT NULL,
  qualification TEXT,
  registration_number TEXT,
  years_experience INTEGER DEFAULT 0,
  languages TEXT[],
  skills TEXT[],
  specializations TEXT[],
  bio TEXT,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  weekly_rate DECIMAL(10,2),
  travel_radius_km INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT true,
  verification_status verification_status DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  documents JSONB DEFAULT '{}',
  preferred_areas TEXT[],
  available_days TEXT[],
  available_hours JSONB DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.caregiver_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_caregiver_ts BEFORE UPDATE ON public.caregiver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Public view verified providers" ON public.caregiver_profiles FOR SELECT USING (verification_status = 'approved');
CREATE POLICY "Providers manage own" ON public.caregiver_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage providers" ON public.caregiver_profiles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 9. SERVICE CATEGORIES
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.service_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.service_categories FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 10. SPECIALIZATION TAGS
CREATE TABLE public.specialization_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.specialization_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read tags" ON public.specialization_tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags" ON public.specialization_tags FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 11. BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL DEFAULT 'BK-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  patient_profile_id UUID REFERENCES public.patient_profiles(id),
  provider_id UUID REFERENCES public.caregiver_profiles(id),
  tenant_id UUID REFERENCES public.tenants(id),
  service_category_id UUID REFERENCES public.service_categories(id),
  status booking_status DEFAULT 'pending',
  service_type TEXT,
  specialization_required TEXT[],
  patient_condition TEXT,
  address_id UUID REFERENCES public.addresses(id),
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  shift_type TEXT,
  total_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  add_ons JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_bookings_ts BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Customers see own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 12. BOOKING STATUS HISTORY
CREATE TABLE public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status booking_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view booking history" ON public.booking_status_history FOR SELECT USING (true);

-- 13. VITALS LOGS
CREATE TABLE public.vitals_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  provider_id UUID NOT NULL REFERENCES auth.users(id),
  patient_profile_id UUID REFERENCES public.patient_profiles(id),
  temperature DECIMAL(4,1),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pulse_rate INTEGER,
  oxygen_saturation DECIMAL(4,1),
  blood_sugar DECIMAL(5,1),
  weight DECIMAL(5,1),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers log vitals" ON public.vitals_logs FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Admins view vitals" ON public.vitals_logs FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- 14. PRODUCT CATEGORIES
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read product categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage product categories" ON public.product_categories FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 15. PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  category_id UUID REFERENCES public.product_categories(id),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  images TEXT[],
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  brand TEXT,
  certifications TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_prescription_required BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  moq INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_products_ts BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Anyone view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 16. ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  tenant_id UUID REFERENCES public.tenants(id),
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  shipping_address_id UUID REFERENCES public.addresses(id),
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_orders_ts BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Customers see own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 17. ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items visible" ON public.order_items FOR SELECT USING (true);

-- 18. MEDICAL STORE PROFILES
CREATE TABLE public.medical_store_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id),
  store_name TEXT NOT NULL,
  drug_licence_number TEXT,
  gst_number TEXT,
  owner_name TEXT,
  catchment_pincodes TEXT[],
  catchment_radius_km INTEGER DEFAULT 5,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  operating_hours JSONB DEFAULT '{}',
  delivery_available BOOLEAN DEFAULT true,
  own_delivery_staff BOOLEAN DEFAULT false,
  minimum_order_value DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  store_photos TEXT[],
  verification_status verification_status DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_store_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_store_profiles_ts BEFORE UPDATE ON public.medical_store_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Public view verified stores" ON public.medical_store_profiles FOR SELECT USING (verification_status = 'approved');
CREATE POLICY "Admins manage stores" ON public.medical_store_profiles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 19. STORE INVENTORY
CREATE TABLE public.store_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.medical_store_profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_prescription_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_inventory ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_store_inv_ts BEFORE UPDATE ON public.store_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Anyone view active inventory" ON public.store_inventory FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage inventory" ON public.store_inventory FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 20. STORE ORDERS
CREATE TABLE public.store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT 'SO-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  store_id UUID NOT NULL REFERENCES public.medical_store_profiles(id),
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  delivery_address_id UUID REFERENCES public.addresses(id),
  prescription_id UUID,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_store_orders_ts BEFORE UPDATE ON public.store_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Customers see own store orders" ON public.store_orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers create store orders" ON public.store_orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins manage store orders" ON public.store_orders FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 21. STORE ORDER ITEMS
CREATE TABLE public.store_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_order_id UUID NOT NULL REFERENCES public.store_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.store_inventory(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store order items visible" ON public.store_order_items FOR SELECT USING (true);

-- 22. PRESCRIPTIONS
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  patient_profile_id UUID REFERENCES public.patient_profiles(id),
  file_url TEXT NOT NULL,
  doctor_name TEXT,
  hospital_name TEXT,
  prescribed_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  reuse_allowed BOOLEAN DEFAULT false,
  reuse_count INTEGER DEFAULT 0,
  max_reuse INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prescriptions" ON public.prescriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view prescriptions" ON public.prescriptions FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- 23. WALLET TRANSACTIONS
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  source TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  balance_after DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own wallet" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage wallet" ON public.wallet_transactions FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 24. REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('provider', 'product', 'store', 'agency')),
  target_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 25. DISPUTES
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('booking', 'order', 'store_order')),
  reference_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_disputes_ts BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Users see own disputes" ON public.disputes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage disputes" ON public.disputes FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 26. NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 27. PLATFORM CONFIG
CREATE TABLE public.platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read config" ON public.platform_config FOR SELECT USING (true);
CREATE POLICY "Admins manage config" ON public.platform_config FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 28. FEATURE FLAGS
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins manage flags" ON public.feature_flags FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 29. COMMISSION RULES
CREATE TABLE public.commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'product_order', 'store_order')),
  percentage DECIMAL(5,2) NOT NULL,
  flat_fee DECIMAL(10,2) DEFAULT 0,
  tenant_id UUID REFERENCES public.tenants(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read commission rules" ON public.commission_rules FOR SELECT USING (true);
CREATE POLICY "Admins manage commission rules" ON public.commission_rules FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 30. PROMO CODES
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'flat')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  applicable_modules TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read active promos" ON public.promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage promos" ON public.promo_codes FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 31. HOSPITAL PROFILES
CREATE TABLE public.hospital_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id),
  hospital_name TEXT NOT NULL,
  registration_certificate TEXT,
  contact_person_name TEXT,
  contact_person_role TEXT,
  procurement_enabled BOOLEAN DEFAULT true,
  discharge_coordination BOOLEAN DEFAULT false,
  nursing_manager BOOLEAN DEFAULT false,
  billing_address TEXT,
  accounts_email TEXT,
  payment_preference TEXT,
  credit_requested BOOLEAN DEFAULT false,
  po_format TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_hospital_ts BEFORE UPDATE ON public.hospital_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE POLICY "Public view hospitals" ON public.hospital_profiles FOR SELECT USING (true);
CREATE POLICY "Admins manage hospitals" ON public.hospital_profiles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 32. HOSPITAL RFQs
CREATE TABLE public.hospital_rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  rfq_number TEXT UNIQUE NOT NULL DEFAULT 'RFQ-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded', 'cancelled')),
  deadline TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hospital_rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors view open RFQs" ON public.hospital_rfqs FOR SELECT USING (status = 'open');
CREATE POLICY "Admins manage RFQs" ON public.hospital_rfqs FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 33. HOSPITAL QUOTES
CREATE TABLE public.hospital_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.hospital_rfqs(id),
  vendor_tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(12,2),
  delivery_timeline TEXT,
  terms TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'accepted', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hospital_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quote visibility" ON public.hospital_quotes FOR SELECT USING (true);
CREATE POLICY "Admins manage quotes" ON public.hospital_quotes FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 34. PURCHASE ORDERS
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL DEFAULT 'PO-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  hospital_tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  vendor_tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  quote_id UUID REFERENCES public.hospital_quotes(id),
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(12,2),
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'acknowledged', 'fulfilled', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PO visibility" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Admins manage POs" ON public.purchase_orders FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 35. PAYOUTS
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'product_order', 'store_order')),
  reference_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bank_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own payouts" ON public.payouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage payouts" ON public.payouts FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 36. INVOICES
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL DEFAULT 'INV-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('booking', 'order', 'store_order')),
  reference_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 37. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "System inserts audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
CREATE POLICY "Users upload own docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own docs" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins view all docs" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'super_admin'));
