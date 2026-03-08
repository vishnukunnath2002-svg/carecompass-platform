import { useEffect, useState } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, ClipboardCheck, CalendarDays, Tag, DollarSign,
  Settings, BarChart3, Star, UserPlus, Wallet, Heart, ShoppingBag, Package,
  Handshake, ArrowRightLeft
} from 'lucide-react';

const baseNavItems = [
  { title: 'Dashboard', url: '/agency', icon: LayoutDashboard, module: null },
  { title: 'Staff / Providers', url: '/agency/staff', icon: Users, module: 'manpower_marketplace' },
  { title: 'Onboarding', url: '/agency/onboarding', icon: UserPlus, module: 'manpower_marketplace' },
  { title: 'Verification', url: '/agency/verification', icon: ClipboardCheck, module: 'manpower_marketplace' },
  { title: 'Bookings', url: '/agency/bookings', icon: CalendarDays, module: 'manpower_marketplace' },
  { title: 'Service Catalogue', url: '/agency/services', icon: Tag, module: 'manpower_marketplace' },
  { title: 'Pricing', url: '/agency/pricing', icon: DollarSign, module: 'manpower_marketplace' },
  { title: 'Health Logs', url: '/agency/health-logs', icon: Heart, module: 'manpower_marketplace' },
  { title: 'Browse Equipment', url: '/agency/equipment', icon: ShoppingBag, module: 'medical_ecommerce' },
  { title: 'Equipment Orders', url: '/agency/inventory', icon: Package, module: 'medical_ecommerce' },
  { title: 'Pharmacy Partners', url: '/agency/partnerships', icon: Handshake, module: 'store_connect' },
  { title: 'Patient Referrals', url: '/agency/referrals', icon: ArrowRightLeft, module: 'store_connect' },
  { title: 'Reviews', url: '/agency/reviews', icon: Star, module: null },
  { title: 'Payouts', url: '/agency/payouts', icon: Wallet, module: null },
  { title: 'Reports', url: '/agency/reports', icon: BarChart3, module: null },
  { title: 'Settings', url: '/agency/settings', icon: Settings, module: null },
];

function AgencyDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">CYLO Healthcare Agency</h2>
        <p className="text-sm text-muted-foreground">Manage your team, bookings, and operations.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Staff" value={24} subtitle="3 pending verification" icon={Users} />
        <StatCard title="Active Bookings" value={18} subtitle="5 starting today" icon={CalendarDays} />
        <StatCard title="Monthly Revenue" value="₹3.8L" subtitle="+22% vs last month" icon={Wallet} />
        <StatCard title="Avg Rating" value="4.7" subtitle="Based on 286 reviews" icon={Star} />
      </div>
    </div>
  );
}

export default function AgencyPortal() {
  const location = useLocation();
  const isRoot = location.pathname === '/agency';
  const { user } = useAuth();
  const [modulesEnabled, setModulesEnabled] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('tenants').select('modules_enabled').eq('owner_user_id', user.id).eq('type', 'agency').single()
      .then(({ data }) => {
        if (data?.modules_enabled) {
          setModulesEnabled(data.modules_enabled as string[]);
        } else {
          // Default: show all modules
          setModulesEnabled(['manpower_marketplace', 'medical_ecommerce', 'store_connect']);
        }
      });
  }, [user]);

  const navItems = baseNavItems.filter(item =>
    item.module === null || modulesEnabled.includes(item.module)
  );

  return (
    <PortalLayout portalName="Agency Portal" navItems={navItems}>
      {isRoot ? <AgencyDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
