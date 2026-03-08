import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Store as StoreIcon, Package, Clock, FileText, ShoppingBag,
  Truck, BarChart3, Wallet, Settings, MapPin
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/store', icon: LayoutDashboard },
  { title: 'Store Profile', url: '/store/profile', icon: StoreIcon },
  { title: 'Catchment Area', url: '/store/catchment', icon: MapPin },
  { title: 'Inventory', url: '/store/inventory', icon: Package },
  { title: 'Operating Hours', url: '/store/hours', icon: Clock },
  { title: 'Prescriptions', url: '/store/prescriptions', icon: FileText },
  { title: 'Orders', url: '/store/orders', icon: ShoppingBag },
  { title: 'Dispatch', url: '/store/dispatch', icon: Truck },
  { title: 'Analytics', url: '/store/analytics', icon: BarChart3 },
  { title: 'Payouts', url: '/store/payouts', icon: Wallet },
  { title: 'Settings', url: '/store/settings', icon: Settings },
];

function StoreDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Apollo Pharmacy — Kochi</h2>
        <p className="text-sm text-muted-foreground">Manage orders, inventory, and prescriptions.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Inventory" value={320} subtitle="15 low stock" icon={Package} />
        <StatCard title="Today's Orders" value={8} subtitle="3 pending acceptance" icon={ShoppingBag} />
        <StatCard title="Revenue (MTD)" value="₹92K" subtitle="+8% vs last month" icon={Wallet} />
        <StatCard title="Prescriptions" value={12} subtitle="2 pending validation" icon={FileText} />
      </div>
    </div>
  );
}

export default function StorePortal() {
  const location = useLocation();
  const isRoot = location.pathname === '/store';
  return (
    <PortalLayout portalName="Medical Store" navItems={navItems}>
      {isRoot ? <StoreDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
