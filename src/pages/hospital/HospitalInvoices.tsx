import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';

export default function HospitalInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('invoices').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setInvoices(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Invoices</h2>
        <p className="text-sm text-muted-foreground">Hospital billing and invoice management.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2" />No invoices found.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Total</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                    <TableCell><Badge variant="outline">{inv.type}</Badge></TableCell>
                    <TableCell>₹{Number(inv.amount).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{Number(inv.total).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(inv.created_at), 'dd MMM yyyy')}</TableCell>
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
