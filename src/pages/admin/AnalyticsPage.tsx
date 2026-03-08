import { useEffect, useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, CalendarDays, ShoppingCart, Building2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ tenants: 0, bookings: 0, orders: 0, users: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('tenants').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]).then(([t, b, o, u]) => {
      setStats({
        tenants: t.count || 0,
        bookings: b.count || 0,
        orders: o.count || 0,
        users: u.count || 0,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Platform-wide metrics and insights.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.users} icon={Users} />
        <StatCard title="Total Tenants" value={stats.tenants} icon={Building2} />
        <StatCard title="Total Bookings" value={stats.bookings} icon={CalendarDays} />
        <StatCard title="Total Orders" value={stats.orders} icon={ShoppingCart} />
      </div>
      <Card>
        <CardHeader><CardTitle>Revenue Trends</CardTitle></CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          Charts and detailed analytics will be available as transaction data grows.
        </CardContent>
      </Card>
    </div>
  );
}
