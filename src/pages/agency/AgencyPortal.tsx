import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardCheck, CalendarDays, Tag, DollarSign,
  Settings, BarChart3, Star, UserPlus, Wallet, Heart
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/agency', icon: LayoutDashboard },
  { title: 'Staff / Providers', url: '/agency/staff', icon: Users },
  { title: 'Onboarding', url: '/agency/onboarding', icon: UserPlus },
  { title: 'Verification', url: '/agency/verification', icon: ClipboardCheck },
  { title: 'Bookings', url: '/agency/bookings', icon: CalendarDays },
  { title: 'Service Catalogue', url: '/agency/services', icon: Tag },
  { title: 'Pricing', url: '/agency/pricing', icon: DollarSign },
  { title: 'Health Logs', url: '/agency/health-logs', icon: Heart },
  { title: 'Reviews', url: '/agency/reviews', icon: Star },
  { title: 'Payouts', url: '/agency/payouts', icon: Wallet },
  { title: 'Reports', url: '/agency/reports', icon: BarChart3 },
  { title: 'Settings', url: '/agency/settings', icon: Settings },
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
  return (
    <PortalLayout portalName="Agency Portal" navItems={navItems}>
      {isRoot ? <AgencyDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
