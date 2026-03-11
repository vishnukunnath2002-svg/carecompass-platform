import { useEffect, useState } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import ProfileCompletion from '@/components/provider/ProfileCompletion';
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [caregiver, setCaregiver] = useState<any>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { data: c }, { data: bookings }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('caregiver_profiles').select('verification_status, rating, review_count').eq('user_id', user.id).single(),
        supabase.from('bookings').select('id').eq('provider_id', user.id).in('status', ['confirmed', 'in_progress']),
      ]);
      setProfile(p);
      setCaregiver(c);
      setBookingCount(bookings?.length ?? 0);
      setLoading(false);
    };
    load();
  }, [user]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Provider';
  const verificationLabel = caregiver?.verification_status === 'approved' ? 'Verified' : caregiver?.verification_status === 'rejected' ? 'Rejected' : 'Pending';
  const verificationSub = caregiver?.verification_status === 'approved' ? 'All documents approved' : 'Complete your profile & documents';
  const rating = caregiver?.rating ?? 0;
  const reviewCount = caregiver?.review_count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Welcome, {loading ? '...' : displayName} 👩‍⚕️
        </h2>
        <p className="text-sm text-muted-foreground">Your bookings, earnings, and profile at a glance.</p>
      </div>
      <ProfileCompletion />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Bookings" value={bookingCount} subtitle={bookingCount === 0 ? 'No active bookings' : `${bookingCount} active`} icon={CalendarDays} />
        <StatCard title="Verification" value={verificationLabel} subtitle={verificationSub} icon={CheckCircle} />
        <StatCard title="Rating" value={rating > 0 ? rating.toFixed(1) : '—'} subtitle={reviewCount > 0 ? `${reviewCount} reviews` : 'No reviews yet'} icon={Star} />
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
