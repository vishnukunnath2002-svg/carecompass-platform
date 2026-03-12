import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const statusColor: Record<string, string> = { pending: 'secondary', confirmed: 'default', shipped: 'default', delivered: 'default', cancelled: 'destructive' };

export default function ProductOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      if (data) setOrders(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Product Orders</h2>
        <p className="text-sm text-muted-foreground">All vendor product orders across the platform.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                    <TableCell><Badge variant={(statusColor[o.status] as any) || 'outline'}>{o.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{o.payment_status}</Badge></TableCell>
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
