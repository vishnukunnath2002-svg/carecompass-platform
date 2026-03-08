import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck } from 'lucide-react';

interface PO {
  id: string;
  po_number: string;
  status: string | null;
  total_amount: number | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  issued: 'bg-info/10 text-info',
  accepted: 'bg-success/10 text-success',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function HospitalPOs() {
  const { user } = useAuth();
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (roleData?.tenant_id) {
        const { data } = await supabase.from('purchase_orders').select('*').eq('hospital_tenant_id', roleData.tenant_id).order('created_at', { ascending: false });
        setPos((data as PO[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Purchase Orders</h2>
        <p className="text-sm text-muted-foreground">Track and manage purchase orders.</p>
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : pos.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">
                  <Truck className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No purchase orders yet.</p>
                </TableCell></TableRow>
              ) : pos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium font-mono text-foreground">{p.po_number}</TableCell>
                  <TableCell><Badge className={statusColors[p.status || 'issued'] + ' capitalize'}>{p.status}</Badge></TableCell>
                  <TableCell className="text-foreground font-medium">{p.total_amount ? `₹${p.total_amount.toLocaleString('en-IN')}` : '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
