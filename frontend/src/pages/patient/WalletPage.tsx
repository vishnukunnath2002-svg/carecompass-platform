import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function WalletPage() {
  const { user } = useAuth();
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setTxns(data);
    });
  }, [user]);

  const balance = txns.length > 0 ? txns[0].balance_after ?? 0 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Wallet</h2>
        <p className="text-sm text-muted-foreground">Your wallet balance and transaction history.</p>
      </div>
      <Card className="gradient-primary text-primary-foreground">
        <CardContent className="flex items-center gap-4 py-8">
          <Wallet className="h-10 w-10" />
          <div>
            <p className="text-sm opacity-80">Current Balance</p>
            <p className="font-display text-3xl font-bold">₹{Number(balance).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent>
          {txns.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {txns.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {t.type === 'credit' ? (
                      <ArrowDownLeft className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{t.description || t.source}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                  </div>
                  <Badge variant={t.type === 'credit' ? 'default' : 'destructive'}>
                    {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
