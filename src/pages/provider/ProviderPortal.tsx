import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import ProfileCompletion from '@/components/provider/ProfileCompletion';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, FileText, CalendarDays, CheckCircle, Activity,
  Wallet, BookOpen, Clock, Star
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/provider', icon: LayoutDashboard },
  { title: 'Profile', url: '/provider/profile', icon: User },
  { title: 'Documents', url: '/provider/documents', icon: FileText },
  { title: 'Verification', url: '/provider/verification', icon: CheckCircle },
  { title: 'Availability', url: '/provider/availability', icon: Clock },
  { title: 'Bookings', url: '/provider/bookings', icon: CalendarDays },
  { title: 'Vitals & Notes', url: '/provider/vitals', icon: Activity },
  { title: 'Training', url: '/provider/training', icon: BookOpen },
  { title: 'Earnings', url: '/provider/earnings', icon: Wallet },
  { title: 'Reviews', url: '/provider/reviews', icon: Star },
];

function ProviderDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Welcome, Nurse Priya 👩‍⚕️</h2>
        <p className="text-sm text-muted-foreground">Your bookings, earnings, and profile at a glance.</p>
      </div>
      <ProfileCompletion />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Bookings" value={3} subtitle="1 starting in 2 hrs" icon={CalendarDays} />
        <StatCard title="Verification" value="Verified" subtitle="All documents approved" icon={CheckCircle} />
        <StatCard title="This Month" value="₹28,500" subtitle="+₹4,200 pending" icon={Wallet} />
        <StatCard title="Rating" value="4.9" subtitle="52 reviews" icon={Star} />
      </div>
    </div>
  );
}

export default function ProviderPortal() {
  const location = useLocation();
  const isRoot = location.pathname === '/provider';
  return (
    <PortalLayout portalName="Provider Portal" navItems={navItems}>
      {isRoot ? <ProviderDashboard /> : <Outlet />}
    </PortalLayout>
  );
}
