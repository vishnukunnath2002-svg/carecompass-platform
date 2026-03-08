import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Heart, Search, ShoppingBag, Store, CalendarDays,
  FileText, Wallet, Bell, Star, User, Users, Package
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/patient', icon: LayoutDashboard },
  { title: 'Find Care', url: '/patient/find-care', icon: Search },
  { title: 'My Bookings', url: '/patient/bookings', icon: CalendarDays },
  { title: 'Shop Products', url: '/patient/shop', icon: ShoppingBag },
  { title: 'My Orders', url: '/patient/orders', icon: Package },
  { title: 'Nearby Stores', url: '/patient/stores', icon: Store },
  { title: 'Health Records', url: '/patient/health', icon: Heart },
  { title: 'My Patients', url: '/patient/profiles', icon: Users },
  { title: 'Wallet', url: '/patient/wallet', icon: Wallet },
  { title: 'Invoices', url: '/patient/invoices', icon: FileText },
  { title: 'Reviews', url: '/patient/reviews', icon: Star },
  { title: 'Notifications', url: '/patient/notifications', icon: Bell },
  { title: 'Profile', url: '/patient/profile', icon: User },
];

function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Welcome back, Rajesh 👋</h2>
        <p className="text-sm text-muted-foreground">Manage your bookings, orders, and health records.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Bookings" value={2} subtitle="1 starts tomorrow" icon={CalendarDays} />
        <StatCard title="Product Orders" value={3} subtitle="1 out for delivery" icon={ShoppingBag} />
        <StatCard title="Store Orders" value={1} subtitle="Ready for pickup" icon={Store} />
        <StatCard title="Wallet Balance" value="₹2,450" subtitle="Last credit ₹500" icon={Wallet} />
      </div>
    </div>
  );
}

export default function PatientPortal() {
  const location = useLocation();
  const isRoot = location.pathname === '/patient';
  return (
    <PortalLayout portalName="Patient Portal" navItems={navItems}>
      {isRoot ? <PatientDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
