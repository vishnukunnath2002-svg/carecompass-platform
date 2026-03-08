import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function QuoteComparison() {
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('hospital_quotes').select('*').order('submitted_at', { ascending: false }).then(({ data }) => {
      if (data) setQuotes(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Quote Comparison</h2>
        <p className="text-sm text-muted-foreground">Compare vendor quotes for your RFQs.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {quotes.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No quotes received yet.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Total</TableHead><TableHead>Delivery</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-sm">{q.vendor_tenant_id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-semibold">₹{Number(q.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>{q.delivery_timeline || '—'}</TableCell>
                    <TableCell><Badge variant={q.status === 'accepted' ? 'default' : 'outline'}>{q.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(q.submitted_at), 'dd MMM yyyy')}</TableCell>
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
