import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function VendorReturns() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('disputes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setDisputes(data);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Returns & Disputes</h2>
        <p className="text-sm text-muted-foreground">Manage return requests and disputes.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {disputes.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No returns or disputes found.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {disputes.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.subject}</TableCell>
                    <TableCell><Badge variant="outline">{d.dispute_type}</Badge></TableCell>
                    <TableCell><Badge variant={d.status === 'resolved' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(d.created_at), 'dd MMM yyyy')}</TableCell>
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
