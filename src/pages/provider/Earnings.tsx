import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Wallet, TrendingUp, Clock } from 'lucide-react';

export default function Earnings() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('payouts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPayouts(data);
    });
  }, [user]);

  const total = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const pending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Earnings</h2>
        <p className="text-sm text-muted-foreground">Track your earnings and payout history.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Earned" value={`₹${total.toLocaleString()}`} icon={TrendingUp} />
        <StatCard title="Pending" value={`₹${pending.toLocaleString()}`} icon={Clock} />
        <StatCard title="Payouts" value={payouts.length} icon={Wallet} />
      </div>
      <Card>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No earnings yet.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold">₹{Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
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
