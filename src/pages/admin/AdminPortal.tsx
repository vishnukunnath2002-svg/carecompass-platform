import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, ClipboardCheck, Settings, Tag, Sliders, Gift,
  CalendarDays, ShoppingBag, Store, AlertTriangle, Wallet, BarChart3, FileText, Bell
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Tenants', url: '/admin/tenants', icon: Building2 },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Onboarding Queue', url: '/admin/onboarding', icon: ClipboardCheck },
  { title: 'Categories & Tags', url: '/admin/categories', icon: Tag },
  { title: 'Feature Flags', url: '/admin/features', icon: Sliders },
  { title: 'Commission Rules', url: '/admin/commissions', icon: Settings },
  { title: 'Promo Codes', url: '/admin/promos', icon: Gift },
  { title: 'Bookings', url: '/admin/bookings', icon: CalendarDays },
  { title: 'Product Orders', url: '/admin/orders', icon: ShoppingBag },
  { title: 'Store Orders', url: '/admin/store-orders', icon: Store },
  { title: 'Disputes', url: '/admin/disputes', icon: AlertTriangle },
  { title: 'Payouts', url: '/admin/payouts', icon: Wallet },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Content', url: '/admin/content', icon: FileText },
  { title: 'Notifications', url: '/admin/notifications', icon: Bell },
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Platform Overview</h2>
        <p className="text-sm text-muted-foreground">Monitor all activity across the CYLO marketplace.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Tenants" value={12} subtitle="+2 this month" icon={Building2} />
        <StatCard title="Total Users" value="2,847" subtitle="+185 this week" icon={Users} />
        <StatCard title="Active Bookings" value={156} subtitle="23 pending" icon={CalendarDays} />
        <StatCard title="Revenue (MTD)" value="₹4.2L" subtitle="+18% vs last month" icon={Wallet} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Product Orders" value={89} subtitle="12 in transit" icon={ShoppingBag} />
        <StatCard title="Store Orders" value={67} subtitle="8 pending" icon={Store} />
        <StatCard title="Pending Approvals" value={5} subtitle="2 agencies, 3 providers" icon={ClipboardCheck} />
        <StatCard title="Open Disputes" value={3} subtitle="1 escalated" icon={AlertTriangle} />
      </div>
    </div>
  );
}

export default function AdminPortal() {
  const location = useLocation();
  const isRoot = location.pathname === '/admin';

  return (
    <PortalLayout portalName="Super Admin" navItems={navItems}>
      {isRoot ? <AdminDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
