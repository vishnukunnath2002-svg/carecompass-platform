import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function PromoCodes() {
  const [promos, setPromos] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('promo_codes').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPromos(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Promo Codes</h2>
        <p className="text-sm text-muted-foreground">Manage discount codes and promotions.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {promos.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No promo codes configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-semibold">{p.code}</TableCell>
                    <TableCell>{p.discount_type === 'percentage' ? `${p.discount_value}%` : `₹${p.discount_value}`}{p.max_discount ? ` (max ₹${p.max_discount})` : ''}</TableCell>
                    <TableCell>{p.usage_count || 0}{p.usage_limit ? `/${p.usage_limit}` : ''}</TableCell>
                    <TableCell className="text-muted-foreground">{p.valid_until ? format(new Date(p.valid_until), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
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
