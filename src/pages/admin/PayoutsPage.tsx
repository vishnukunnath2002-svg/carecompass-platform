import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('payouts').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPayouts(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Payouts</h2>
        <p className="text-sm text-muted-foreground">Manage payouts to agencies, providers, vendors, and stores.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No payouts found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                    <TableCell className="font-semibold">₹{Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{p.processed_at ? format(new Date(p.processed_at), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(p.created_at), 'dd MMM yyyy')}</TableCell>
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
