import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FileText, BarChart3, CalendarDays,
  Truck, Wallet, Users, ClipboardList, Hospital
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/hospital', icon: LayoutDashboard },
  { title: 'Bulk Orders', url: '/hospital/orders', icon: ShoppingBag },
  { title: 'RFQ', url: '/hospital/rfq', icon: FileText },
  { title: 'Quotes', url: '/hospital/quotes', icon: ClipboardList },
  { title: 'Purchase Orders', url: '/hospital/po', icon: Truck },
  { title: 'Discharge Care', url: '/hospital/discharge', icon: CalendarDays },
  { title: 'Invoices', url: '/hospital/invoices', icon: Wallet },
  { title: 'Users', url: '/hospital/users', icon: Users },
  { title: 'Analytics', url: '/hospital/analytics', icon: BarChart3 },
];

function HospitalDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">City Hospital</h2>
        <p className="text-sm text-muted-foreground">Procurement, RFQs, and discharge care coordination.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active POs" value={6} subtitle="2 pending delivery" icon={Truck} />
        <StatCard title="Open RFQs" value={3} subtitle="8 quotes received" icon={FileText} />
        <StatCard title="Spend (MTD)" value="₹12.4L" subtitle="Within budget" icon={Wallet} />
        <StatCard title="Discharge Bookings" value={4} subtitle="1 today" icon={CalendarDays} />
      </div>
    </div>
  );
}

export default function HospitalPortal() {
  const location = useLocation();
  const isRoot = location.pathname === '/hospital';
  return (
    <PortalLayout portalName="Hospital Portal" navItems={navItems}>
      {isRoot ? <HospitalDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
