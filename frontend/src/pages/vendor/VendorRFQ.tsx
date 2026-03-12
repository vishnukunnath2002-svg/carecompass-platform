import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function VendorRFQ() {
  const [rfqs, setRfqs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('hospital_rfqs').select('*').eq('status', 'open').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setRfqs(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">RFQ</h2>
        <p className="text-sm text-muted-foreground">Open requests for quotation from hospitals.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {rfqs.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No open RFQs.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>RFQ #</TableHead><TableHead>Title</TableHead><TableHead>Deadline</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {rfqs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono">{r.rfq_number}</TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-muted-foreground">{r.deadline ? format(new Date(r.deadline), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant="default">{r.status}</Badge></TableCell>
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
