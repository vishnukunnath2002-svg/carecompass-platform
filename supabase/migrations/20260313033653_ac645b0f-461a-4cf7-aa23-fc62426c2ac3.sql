
-- Attendance tracking for agency staff
CREATE TABLE public.staff_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'on_leave', 'holiday')),
  hours_worked NUMERIC,
  notes TEXT,
  marked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, date)
);

-- Leave requests for agency staff
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL DEFAULT 'casual' CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid', 'emergency')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payroll records for agency staff
CREATE TABLE public.staff_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_amount NUMERIC NOT NULL DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  days_worked INTEGER DEFAULT 0,
  days_absent INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid', 'disputed')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for staff_attendance
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage attendance" ON public.staff_attendance
  FOR ALL TO public USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Agency owners manage tenant attendance" ON public.staff_attendance
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = staff_attendance.tenant_id AND tenants.owner_user_id = auth.uid())
  );

CREATE POLICY "Providers view own attendance" ON public.staff_attendance
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.caregiver_profiles WHERE caregiver_profiles.id = staff_attendance.provider_id AND caregiver_profiles.user_id = auth.uid())
  );

-- RLS for leave_requests
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage leave requests" ON public.leave_requests
  FOR ALL TO public USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Agency owners manage tenant leaves" ON public.leave_requests
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = leave_requests.tenant_id AND tenants.owner_user_id = auth.uid())
  );

CREATE POLICY "Providers manage own leaves" ON public.leave_requests
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.caregiver_profiles WHERE caregiver_profiles.id = leave_requests.provider_id AND caregiver_profiles.user_id = auth.uid())
  );

-- RLS for staff_payroll
ALTER TABLE public.staff_payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payroll" ON public.staff_payroll
  FOR ALL TO public USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Agency owners manage tenant payroll" ON public.staff_payroll
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = staff_payroll.tenant_id AND tenants.owner_user_id = auth.uid())
  );

CREATE POLICY "Providers view own payroll" ON public.staff_payroll
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.caregiver_profiles WHERE caregiver_profiles.id = staff_payroll.provider_id AND caregiver_profiles.user_id = auth.uid())
  );

-- Triggers for updated_at
CREATE TRIGGER update_staff_attendance_updated_at BEFORE UPDATE ON public.staff_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_payroll_updated_at BEFORE UPDATE ON public.staff_payroll
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
