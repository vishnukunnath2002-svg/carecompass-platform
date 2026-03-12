import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function BulkOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Bulk Orders</h2>
        <p className="text-sm text-muted-foreground">Track all purchase orders and bulk procurement.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No bulk orders placed yet.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono">{o.po_number}</TableCell>
                    <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                    <TableCell className="font-semibold">₹{Number(o.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(o.created_at), 'dd MMM yyyy')}</TableCell>
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
