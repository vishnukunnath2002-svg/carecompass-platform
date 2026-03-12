import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User, Eye, Star } from 'lucide-react';
import BookingDetailDialog from '@/components/care/BookingDetailDialog';
import ReviewForm from '@/components/care/ReviewForm';

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
  notes: string | null;
  created_at: string;
  provider_id: string | null;
  agency_service_id: string | null;
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const fetchBookings = () => {
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
  };

  // Check which bookings already have reviews
  useEffect(() => {
    if (!user) return;
    supabase.from('reviews').select('target_id').eq('user_id', user.id).eq('target_type', 'agency_service').then(({ data }) => {
      if (data) setReviewedIds(new Set(data.map(r => r.target_id)));
    });
  }, [user]);

  useEffect(() => { fetchBookings(); }, [user]);

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
            <div key={b.id}>
              <Card className="border shadow-card hover:shadow-elevated transition-all cursor-pointer" onClick={() => setSelectedBooking(b)}>
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {b.total_amount && (
                        <div className="font-display font-semibold text-foreground">₹{b.total_amount.toLocaleString('en-IN')}</div>
                      )}
                      <div className="text-xs text-muted-foreground capitalize">{b.payment_status}</div>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Show review prompt for completed bookings with an agency_service_id */}
              {b.status === 'completed' && b.agency_service_id && !reviewedIds.has(b.agency_service_id) && (
                <div className="mt-2 ml-4">
                  {reviewingBookingId === b.id ? (
                    <ReviewForm
                      targetId={b.agency_service_id}
                      targetType="agency_service"
                      onComplete={() => {
                        setReviewingBookingId(null);
                        setReviewedIds(prev => new Set([...prev, b.agency_service_id!]));
                      }}
                    />
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setReviewingBookingId(b.id)}>
                      <Star className="h-3.5 w-3.5 mr-1.5 text-warning" /> Rate this service
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BookingDetailDialog booking={selectedBooking} open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)} onUpdate={fetchBookings} />
    </div>
  );
}
