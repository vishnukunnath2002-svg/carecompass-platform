import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export default function HealthLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('vitals_logs').select('*').order('recorded_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setLogs(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Health Logs</h2>
        <p className="text-sm text-muted-foreground">Vitals recorded by your staff during visits.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><Activity className="h-8 w-8 mx-auto mb-2" />No vitals logs recorded yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead>Pulse</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead>SpO2</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">{format(new Date(l.recorded_at), 'dd MMM, hh:mm a')}</TableCell>
                    <TableCell>{l.blood_pressure_systolic && l.blood_pressure_diastolic ? `${l.blood_pressure_systolic}/${l.blood_pressure_diastolic}` : '—'}</TableCell>
                    <TableCell>{l.pulse_rate || '—'}</TableCell>
                    <TableCell>{l.temperature ? `${l.temperature}°F` : '—'}</TableCell>
                    <TableCell>{l.oxygen_saturation ? `${l.oxygen_saturation}%` : '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{l.notes || '—'}</TableCell>
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
