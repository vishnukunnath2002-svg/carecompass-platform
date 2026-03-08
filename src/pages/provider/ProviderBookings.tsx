import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock, User, CheckCircle, XCircle, Play, Square } from 'lucide-react';

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  shift_type: string | null;
  service_type: string | null;
  total_amount: number | null;
  notes: string | null;
  patient_condition: string | null;
  patient_profile_id: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  active: 'bg-success/10 text-success',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function ProviderBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status } as any)
      .eq('id', bookingId);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Booking ${status}` });
      fetchBookings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Bookings</h2>
        <p className="text-sm text-muted-foreground">View and manage your assigned care bookings.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-20 p-6" /></Card>)}</div>
      ) : bookings.length === 0 ? (
        <Card className="border">
          <CardContent className="flex flex-col items-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-display font-semibold text-foreground">No bookings assigned</p>
            <p className="mt-1 text-sm text-muted-foreground">Bookings will appear here once assigned by your agency or patients.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="border shadow-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-foreground">{b.booking_number}</span>
                      <Badge className={statusColors[b.status || 'pending'] + ' capitalize'}>{b.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {b.start_date && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {new Date(b.start_date).toLocaleDateString('en-IN')}{b.end_date && ` — ${new Date(b.end_date).toLocaleDateString('en-IN')}`}</span>}
                      {b.shift_type && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.shift_type}</span>}
                      {b.service_type && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {b.service_type}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {b.total_amount && <div className="font-display font-semibold text-foreground">₹{b.total_amount.toLocaleString('en-IN')}</div>}
                  </div>
                </div>

                {b.patient_condition && (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-medium text-foreground">Condition:</span> {b.patient_condition}
                  </p>
                )}

                {b.notes && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Notes:</span> {b.notes}
                  </p>
                )}

                {/* Action Buttons based on status */}
                <div className="flex gap-2 pt-1">
                  {b.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, 'cancelled')}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
                      </Button>
                    </>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <Button size="sm" className="gradient-primary border-0" onClick={() => updateStatus(b.id, b.status === 'pending' ? 'confirmed' : 'active')}>
                      {b.status === 'pending' ? <><CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept</> : <><Play className="mr-1.5 h-3.5 w-3.5" /> Start Service</>}
                    </Button>
                  )}
                  {b.status === 'active' && (
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground border-0" onClick={() => updateStatus(b.id, 'completed')}>
                      <Square className="mr-1.5 h-3.5 w-3.5" /> Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
