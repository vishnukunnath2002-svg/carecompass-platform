import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays } from 'lucide-react';

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  service_type: string | null;
  shift_type: string | null;
  start_date: string | null;
  end_date: string | null;
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

export default function AgencyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (roleData?.tenant_id) {
        const { data } = await supabase.from('bookings').select('*').eq('tenant_id', roleData.tenant_id).order('created_at', { ascending: false });
        setBookings((data as Booking[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Booking Management</h2>
        <p className="text-sm text-muted-foreground">View and manage all agency bookings.</p>
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : bookings.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">
                  <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No bookings yet.</p>
                </TableCell></TableRow>
              ) : bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-foreground">{b.booking_number}</TableCell>
                  <TableCell><Badge className={statusColors[b.status || 'pending'] + ' capitalize'}>{b.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{b.service_type || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{b.shift_type || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {b.start_date ? new Date(b.start_date).toLocaleDateString('en-IN') : '—'}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {b.total_amount ? `₹${b.total_amount.toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
