import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('disputes').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setDisputes(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Disputes</h2>
        <p className="text-sm text-muted-foreground">Manage and resolve customer disputes.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {disputes.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No disputes found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.subject}</TableCell>
                    <TableCell><Badge variant="outline">{d.dispute_type}</Badge></TableCell>
                    <TableCell><Badge variant={d.status === 'resolved' ? 'default' : d.status === 'open' ? 'destructive' : 'secondary'}>{d.status}</Badge></TableCell>
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
