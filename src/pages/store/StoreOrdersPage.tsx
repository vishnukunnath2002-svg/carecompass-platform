import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag } from 'lucide-react';

interface StoreOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | null;
  payment_status: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  ready: 'bg-info/10 text-info',
  dispatched: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function StoreOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (roleData?.tenant_id) {
        const { data: storeData } = await supabase.from('medical_store_profiles').select('id').eq('tenant_id', roleData.tenant_id).limit(1).single();
        if (storeData) {
          const { data } = await supabase.from('store_orders').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
          setOrders((data as StoreOrder[]) || []);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Orders</h2>
        <p className="text-sm text-muted-foreground">Manage incoming store orders.</p>
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
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">
                  <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No store orders yet.</p>
                </TableCell></TableRow>
              ) : orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-foreground">{o.order_number}</TableCell>
                  <TableCell><Badge className={statusColors[o.status || 'pending'] + ' capitalize'}>{o.status}</Badge></TableCell>
                  <TableCell className="text-foreground font-medium">{o.total_amount ? `₹${o.total_amount.toLocaleString('en-IN')}` : '—'}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize text-xs">{o.payment_status || 'pending'}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(o.created_at).toLocaleDateString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
