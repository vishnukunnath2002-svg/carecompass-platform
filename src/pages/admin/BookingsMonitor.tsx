import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CalendarDays } from 'lucide-react';

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  service_type: string | null;
  start_date: string | null;
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

export default function BookingsMonitor() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = bookings.filter((b) =>
    !searchTerm || b.booking_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Bookings Monitor</h2>
        <p className="text-sm text-muted-foreground">Monitor all care bookings across the platform.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search bookings..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-muted-foreground">No bookings yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium text-foreground">{b.booking_number}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[b.status || 'pending'] + ' capitalize'}>{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{b.service_type || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.start_date ? new Date(b.start_date).toLocaleDateString('en-IN') : '—'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {b.total_amount ? `₹${b.total_amount.toLocaleString('en-IN')}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{b.payment_status || 'pending'}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
