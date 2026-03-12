import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Store, Users } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

interface Referral {
  id: string;
  partnership_id: string | null;
  booking_id: string | null;
  patient_user_id: string | null;
  agency_tenant_id: string;
  store_tenant_id: string;
  reason: string | null;
  status: string | null;
  created_at: string;
}

export default function PatientReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_user_id', user.id).eq('type', 'agency').single();
      if (!tenant) { setLoading(false); return; }

      const { data: refs } = await supabase.from('pharmacy_referrals').select('*').eq('agency_tenant_id', tenant.id).order('created_at', { ascending: false });
      if (refs) {
        setReferrals(refs as Referral[]);
        // Fetch store names
        const storeIds = [...new Set(refs.map((r: any) => r.store_tenant_id))];
        if (storeIds.length > 0) {
          const { data: stores } = await supabase.from('medical_store_profiles').select('tenant_id, store_name').in('tenant_id', storeIds);
          if (stores) {
            const map: Record<string, string> = {};
            stores.forEach((s: any) => { map[s.tenant_id] = s.store_name; });
            setStoreNames(map);
          }
        }
      }
      setLoading(false);
    };
    init();
  }, [user]);

  const total = referrals.length;
  const referred = referrals.filter(r => r.status === 'referred').length;
  const converted = referrals.filter(r => r.status === 'converted').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Patient Referrals</h2>
        <p className="text-sm text-muted-foreground">Track patients referred to partner pharmacies for medicines and supplies.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Referrals" value={total} icon={ArrowRight} subtitle="All time" />
        <StatCard title="Pending" value={referred} icon={Users} subtitle="Awaiting conversion" />
        <StatCard title="Converted" value={converted} icon={Store} subtitle="Orders placed" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : referrals.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No referrals yet. Referrals are created when you suggest a partner pharmacy to a patient.</p></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Referral History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="font-medium">{storeNames[r.store_tenant_id] || 'Unknown'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-48 truncate">{r.reason || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'converted' ? 'default' : 'secondary'} className="capitalize">{r.status || 'referred'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
