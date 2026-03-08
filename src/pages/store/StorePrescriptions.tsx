import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';

export default function StorePrescriptions() {
  const [rxs, setRxs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('prescriptions').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setRxs(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Prescriptions</h2>
        <p className="text-sm text-muted-foreground">Verify and manage prescription orders.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {rxs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2" />No prescriptions submitted.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Hospital</TableHead><TableHead>Date</TableHead><TableHead>Verified</TableHead></TableRow></TableHeader>
              <TableBody>
                {rxs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.doctor_name || '—'}</TableCell>
                    <TableCell>{r.hospital_name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.prescribed_date ? format(new Date(r.prescribed_date), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant={r.is_verified ? 'default' : 'secondary'}>{r.is_verified ? 'Verified' : 'Pending'}</Badge></TableCell>
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
