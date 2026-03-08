import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Boxes, DollarSign, ShoppingBag, Truck,
  RotateCcw, FileText, BarChart3, Wallet, Settings
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/vendor', icon: LayoutDashboard },
  { title: 'Catalogue', url: '/vendor/catalogue', icon: Package },
  { title: 'Inventory', url: '/vendor/inventory', icon: Boxes },
  { title: 'Pricing', url: '/vendor/pricing', icon: DollarSign },
  { title: 'Orders', url: '/vendor/orders', icon: ShoppingBag },
  { title: 'Dispatch', url: '/vendor/dispatch', icon: Truck },
  { title: 'Returns', url: '/vendor/returns', icon: RotateCcw },
  { title: 'RFQ', url: '/vendor/rfq', icon: FileText },
  { title: 'Analytics', url: '/vendor/analytics', icon: BarChart3 },
  { title: 'Payouts', url: '/vendor/payouts', icon: Wallet },
  { title: 'Settings', url: '/vendor/settings', icon: Settings },
];

function VendorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">MedSupply India</h2>
        <p className="text-sm text-muted-foreground">Your product catalogue, orders, and analytics.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Products" value={142} subtitle="8 low stock" icon={Package} />
        <StatCard title="Pending Orders" value={12} subtitle="3 to dispatch today" icon={ShoppingBag} />
        <StatCard title="Revenue (MTD)" value="₹1.8L" subtitle="+14% vs last month" icon={Wallet} />
        <StatCard title="RFQ Requests" value={4} subtitle="2 new this week" icon={FileText} />
      </div>
    </div>
  );
}

export default function VendorPortal() {
  const location = useLocation();
  const isRoot = location.pathname === '/vendor';
  return (
    <PortalLayout portalName="Vendor Portal" navItems={navItems}>
      {isRoot ? <VendorDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
