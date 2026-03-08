import { useEffect, useState } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, ClipboardCheck, CalendarDays, Tag, DollarSign,
  Settings, BarChart3, Star, UserPlus, Wallet, Heart, ShoppingBag, Package,
  Handshake, ArrowRightLeft
} from 'lucide-react';

function getBaseNavItems(basePath: string) {
  return [
    { title: 'Dashboard', url: basePath, icon: LayoutDashboard, module: null },
    { title: 'Staff / Providers', url: `${basePath}/staff`, icon: Users, module: 'homecare' },
    { title: 'Onboarding', url: `${basePath}/onboarding`, icon: UserPlus, module: 'homecare' },
    { title: 'Verification', url: `${basePath}/verification`, icon: ClipboardCheck, module: 'homecare' },
    { title: 'Bookings', url: `${basePath}/bookings`, icon: CalendarDays, module: 'homecare' },
    { title: 'Service Catalogue', url: `${basePath}/services`, icon: Tag, module: 'homecare' },
    { title: 'Pricing', url: `${basePath}/pricing`, icon: DollarSign, module: 'homecare' },
    { title: 'Health Logs', url: `${basePath}/health-logs`, icon: Heart, module: 'homecare' },
    { title: 'Browse Equipment', url: `${basePath}/equipment`, icon: ShoppingBag, module: 'ecommerce' },
    { title: 'Equipment Orders', url: `${basePath}/inventory`, icon: Package, module: 'ecommerce' },
    { title: 'Pharmacy Partners', url: `${basePath}/partnerships`, icon: Handshake, module: 'store_connect' },
    { title: 'Patient Referrals', url: `${basePath}/referrals`, icon: ArrowRightLeft, module: 'store_connect' },
    { title: 'Reviews', url: `${basePath}/reviews`, icon: Star, module: null },
    { title: 'Payouts', url: `${basePath}/payouts`, icon: Wallet, module: null },
    { title: 'Reports', url: `${basePath}/reports`, icon: BarChart3, module: null },
    { title: 'Settings', url: `${basePath}/settings`, icon: Settings, module: null },
  ];
}

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
  const { slug } = useParams();
  const basePath = slug ? `/t/${slug}/agency` : '/agency';
  const isRoot = location.pathname === basePath || location.pathname === `${basePath}/`;
  const { user } = useAuth();
  const [modulesEnabled, setModulesEnabled] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('tenants').select('modules_enabled').eq('owner_user_id', user.id).eq('type', 'agency').single()
      .then(({ data }) => {
        if (data?.modules_enabled) {
          setModulesEnabled(data.modules_enabled as string[]);
        } else {
          setModulesEnabled(['homecare', 'ecommerce', 'store_connect']);
        }
      });
  }, [user]);

  const allNavItems = getBaseNavItems(basePath);
  const navItems = allNavItems.filter(item =>
    item.module === null || modulesEnabled.includes(item.module)
  );

  return (
    <PortalLayout portalName="Agency Portal" navItems={navItems}>
      {isRoot ? <AgencyDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
