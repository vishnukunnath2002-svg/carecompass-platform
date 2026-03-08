import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export default function VitalsNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('vitals_logs').select('*').eq('provider_id', user.id).order('recorded_at', { ascending: false }).limit(20).then(({ data }) => {
      if (data) setLogs(data);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Vitals & Notes</h2>
        <p className="text-sm text-muted-foreground">Record and review patient vitals during visits.</p>
      </div>
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
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{format(new Date(l.recorded_at), 'dd MMM, hh:mm a')}</TableCell>
                    <TableCell>{l.blood_pressure_systolic ? `${l.blood_pressure_systolic}/${l.blood_pressure_diastolic}` : '—'}</TableCell>
                    <TableCell>{l.pulse_rate || '—'}</TableCell>
                    <TableCell>{l.temperature ? `${l.temperature}°F` : '—'}</TableCell>
                    <TableCell>{l.oxygen_saturation ? `${l.oxygen_saturation}%` : '—'}</TableCell>
                    <TableCell>{l.blood_sugar || '—'}</TableCell>
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
