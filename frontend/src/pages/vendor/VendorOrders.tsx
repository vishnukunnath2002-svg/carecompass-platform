import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Truck, Package, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | null;
  payment_status: string | null;
  tracking_number: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  processing: 'bg-info/10 text-info',
  shipped: 'bg-accent/10 text-accent',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const nextStatus: Record<string, { status: string; label: string; icon: any }> = {
  confirmed: { status: 'processing', label: 'Start Processing', icon: Package },
  processing: { status: 'shipped', label: 'Mark Shipped', icon: Truck },
  shipped: { status: 'delivered', label: 'Mark Delivered', icon: CheckCircle },
};

export default function VendorOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    if (!user) return;
    const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
    if (roleData?.tenant_id) {
      const { data } = await supabase.from('orders').select('*').eq('tenant_id', roleData.tenant_id).order('created_at', { ascending: false });
      setOrders((data as Order[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === 'shipped') updateData.tracking_number = `TRK-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    else { toast({ title: `Order ${status}` }); fetchOrders(); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Orders</h2>
          <p className="text-sm text-muted-foreground">Manage incoming product orders.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">
                  <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" /><p className="mt-2 text-muted-foreground">No orders.</p>
                </TableCell></TableRow>
              ) : filtered.map((o) => {
                const next = nextStatus[o.status];
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-foreground">{o.order_number}</TableCell>
                    <TableCell><Badge className={statusColors[o.status || 'pending'] + ' capitalize'}>{o.status}</Badge></TableCell>
                    <TableCell className="font-medium">{o.total_amount ? `₹${o.total_amount.toLocaleString('en-IN')}` : '—'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize text-xs">{o.payment_status || 'pending'}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{o.tracking_number || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(o.created_at).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      {next && (
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, next.status)}>
                          <next.icon className="mr-1.5 h-3.5 w-3.5" /> {next.label}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
