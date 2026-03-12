import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Truck, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | null;
  created_at: string;
  tracking_number: string | null;
  payment_status: string | null;
}

export default function AgencyInventory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setOrders(data as Order[]);
      setLoading(false);
    });
  }, [user]);

  const statusIcon = (s: string) => {
    if (s === 'delivered') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (s === 'shipped') return <Truck className="h-4 w-4 text-blue-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  const pending = orders.filter(o => o.status === 'pending').length;
  const shipped = orders.filter(o => o.status === 'shipped').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Equipment Inventory</h2>
        <p className="text-sm text-muted-foreground">Track your equipment orders and shipments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending" value={pending} icon={Clock} subtitle="Awaiting shipment" />
        <StatCard title="In Transit" value={shipped} icon={Truck} subtitle="On the way" />
        <StatCard title="Delivered" value={delivered} icon={CheckCircle} subtitle="Received" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No equipment orders yet. Browse equipment to place your first order.</p></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.order_number}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>₹{(o.total_amount ?? 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{o.payment_status || 'pending'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(o.status || 'pending')}
                        <span className="text-sm capitalize">{o.status || 'pending'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{o.tracking_number || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
