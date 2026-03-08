import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

export default function VerificationTracking() {
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('caregiver_profiles').select('*, profiles!caregiver_profiles_user_id_fkey(full_name)').order('created_at', { ascending: false }).then(({ data }) => {
      // Fallback if join fails
      if (data) setProviders(data);
    });
    // Simple fallback
    supabase.from('caregiver_profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setProviders(data);
    });
  }, []);

  const statusVariant = (s: string) => s === 'approved' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Verification Tracking</h2>
        <p className="text-sm text-muted-foreground">Track document and identity verification for your staff.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {providers.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No providers found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Type</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Registration #</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="capitalize">{p.provider_type?.replace('_', ' ')}</TableCell>
                    <TableCell>{p.qualification || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{p.registration_number || '—'}</TableCell>
                    <TableCell><Badge variant={statusVariant(p.verification_status)}>{p.verification_status}</Badge></TableCell>
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
