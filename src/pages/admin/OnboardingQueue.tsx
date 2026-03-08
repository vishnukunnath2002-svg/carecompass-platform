import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function OnboardingQueue() {
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('tenants').select('*').eq('status', 'pending').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setTenants(data);
    });
  }, []);

  const updateStatus = async (id: string, status: 'active' | 'suspended') => {
    await supabase.from('tenants').update({ status }).eq('id', id);
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Onboarding Queue</h2>
        <p className="text-sm text-muted-foreground">Review and approve pending tenant registrations.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {tenants.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No pending registrations.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.contact_email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(t.created_at), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => updateStatus(t.id, 'active')}><CheckCircle className="mr-1 h-4 w-4" />Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(t.id, 'suspended')}><XCircle className="mr-1 h-4 w-4" />Reject</Button>
                    </TableCell>
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
