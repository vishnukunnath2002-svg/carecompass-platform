import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Wallet } from 'lucide-react';

export default function AgencyPayouts() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('payouts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPayouts(data);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Payouts</h2>
        <p className="text-sm text-muted-foreground">Track your agency's payout history.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><Wallet className="h-8 w-8 mx-auto mb-2" />No payouts found.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.type}</TableCell>
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
