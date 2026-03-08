import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

export default function CommissionRules() {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('commission_rules').select('*').order('name').then(({ data }) => {
      if (data) setRules(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Commission Rules</h2>
        <p className="text-sm text-muted-foreground">Manage platform commission rates for bookings and orders.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {rules.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No commission rules configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Flat Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                    <TableCell>{r.percentage}%</TableCell>
                    <TableCell>₹{Number(r.flat_fee || 0).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={r.is_active ? 'default' : 'secondary'}>{r.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
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
