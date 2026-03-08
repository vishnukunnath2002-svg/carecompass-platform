import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User } from 'lucide-react';

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  shift_type: string | null;
  service_type: string | null;
  total_amount: number | null;
  payment_status: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  active: 'bg-success/10 text-success',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse"><CardContent className="h-24 p-6" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">My Bookings</h2>
          <p className="text-sm text-muted-foreground">Track and manage your care bookings.</p>
        </div>
        <Button onClick={() => window.location.href = '/patient/find-care'}>Book Care</Button>
      </div>

      {bookings.length === 0 ? (
        <Card className="border">
          <CardContent className="flex flex-col items-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-display font-semibold text-foreground">No bookings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Find verified care providers and book your first session.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/patient/find-care'}>Find Care</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="border shadow-card">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-foreground">{b.booking_number}</span>
                    <Badge className={statusColors[b.status || 'pending'] + ' capitalize'}>{b.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {b.start_date && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" /> {new Date(b.start_date).toLocaleDateString('en-IN')}
                      </span>
                    )}
                    {b.shift_type && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {b.shift_type}
                      </span>
                    )}
                    {b.service_type && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> {b.service_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {b.total_amount && (
                    <div className="font-display font-semibold text-foreground">₹{b.total_amount.toLocaleString('en-IN')}</div>
                  )}
                  <div className="text-xs text-muted-foreground capitalize">{b.payment_status}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
