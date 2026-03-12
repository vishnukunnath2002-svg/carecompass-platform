import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Truck } from 'lucide-react';

export default function StoreDispatch() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchDispatch = async () => {
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (!roleData?.tenant_id) return;
      const { data: storeData } = await supabase.from('medical_store_profiles').select('id').eq('tenant_id', roleData.tenant_id).limit(1).single();
      if (!storeData) return;
      const { data } = await supabase.from('store_orders').select('*').eq('store_id', storeData.id).in('status', ['confirmed', 'dispatched']).order('created_at', { ascending: false });
      if (data) setOrders(data);
    };
    fetchDispatch();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Dispatch</h2>
        <p className="text-sm text-muted-foreground">Track and manage store order deliveries.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><Truck className="h-8 w-8 mx-auto mb-2" />No orders to dispatch.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono">{o.order_number}</TableCell>
                    <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                    <TableCell>₹{Number(o.total_amount || 0).toLocaleString()}</TableCell>
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
