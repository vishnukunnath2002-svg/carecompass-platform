import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import VitalsEntryForm from '@/components/care/VitalsEntryForm';

interface Booking {
  id: string;
  booking_number: string;
  patient_profile_id: string | null;
}

export default function VitalsNotes() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);

  const fetchData = async () => {
    if (!user) return;
    const [logsRes, bookingsRes] = await Promise.all([
      supabase.from('vitals_logs').select('*').eq('provider_id', user.id).order('recorded_at', { ascending: false }).limit(30),
      supabase.from('bookings').select('id, booking_number, patient_profile_id').eq('provider_id', user.id).in('status', ['active', 'confirmed']),
    ]);
    if (logsRes.data) setLogs(logsRes.data);
    if (bookingsRes.data) setActiveBookings(bookingsRes.data as Booking[]);
  };

  useEffect(() => { fetchData(); }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Vitals & Notes</h2>
        <p className="text-sm text-muted-foreground">Record and review patient vitals during visits.</p>
      </div>

      {activeBookings.length > 0 && (
        <VitalsEntryForm bookings={activeBookings} onSuccess={fetchData} />
      )}

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><Activity className="h-8 w-8 mx-auto mb-2" />No vitals recorded yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead>Pulse</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead>SpO2</TableHead>
                  <TableHead>Sugar</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(l.recorded_at), 'dd MMM, hh:mm a')}</TableCell>
                    <TableCell>{l.blood_pressure_systolic ? `${l.blood_pressure_systolic}/${l.blood_pressure_diastolic}` : '—'}</TableCell>
                    <TableCell>{l.pulse_rate || '—'}</TableCell>
                    <TableCell>{l.temperature ? `${l.temperature}°F` : '—'}</TableCell>
                    <TableCell>{l.oxygen_saturation ? `${l.oxygen_saturation}%` : '—'}</TableCell>
                    <TableCell>{l.blood_sugar || '—'}</TableCell>
                    <TableCell>{l.weight ? `${l.weight}kg` : '—'}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-muted-foreground">{l.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
