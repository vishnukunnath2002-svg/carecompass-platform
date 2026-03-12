import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Handshake, Plus, Store, MapPin, Star } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

interface StoreProfile {
  id: string;
  store_name: string;
  owner_name: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  delivery_available: boolean | null;
  tenant_id: string;
}

interface Partnership {
  id: string;
  agency_tenant_id: string;
  store_tenant_id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function PharmacyPartnerships() {
  const { user } = useAuth();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreProfile | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      // Get agency tenant
      const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_user_id', user.id).eq('type', 'agency').single();
      if (!tenant) { setLoading(false); return; }
      setTenantId(tenant.id);

      const [partRes, storeRes] = await Promise.all([
        supabase.from('pharmacy_partnerships').select('*').eq('agency_tenant_id', tenant.id).order('created_at', { ascending: false }),
        supabase.from('medical_store_profiles').select('*').eq('verification_status', 'approved'),
      ]);
      if (partRes.data) setPartnerships(partRes.data as Partnership[]);
      if (storeRes.data) setStores(storeRes.data as StoreProfile[]);
      setLoading(false);
    };
    init();
  }, [user]);

  const partneredStoreIds = partnerships.map(p => p.store_tenant_id);
  const availableStores = stores.filter(s => !partneredStoreIds.includes(s.tenant_id));

  const storeMap = Object.fromEntries(stores.map(s => [s.tenant_id, s]));

  const sendRequest = async () => {
    if (!selectedStore || !tenantId) return;
    const { error } = await supabase.from('pharmacy_partnerships').insert({
      agency_tenant_id: tenantId,
      store_tenant_id: selectedStore.tenant_id,
      status: 'pending',
      notes: notes || null,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Partnership request sent');
    setDialogOpen(false);
    setNotes('');
    // Refresh
    const { data } = await supabase.from('pharmacy_partnerships').select('*').eq('agency_tenant_id', tenantId).order('created_at', { ascending: false });
    if (data) setPartnerships(data as Partnership[]);
  };

  const active = partnerships.filter(p => p.status === 'active').length;
  const pending = partnerships.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Pharmacy Partnerships</h2>
          <p className="text-sm text-muted-foreground">Partner with nearby pharmacies to offer last-mile medicine delivery to your patients.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2" disabled={availableStores.length === 0}>
          <Plus className="h-4 w-4" /> New Partnership
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active Partnerships" value={active} icon={Handshake} subtitle="Currently active" />
        <StatCard title="Pending Requests" value={pending} icon={Store} subtitle="Awaiting approval" />
        <StatCard title="Available Stores" value={availableStores.length} icon={MapPin} subtitle="Ready to partner" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : partnerships.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No partnerships yet. Send a request to a nearby pharmacy to get started.</p></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Partnership Tracker</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerships.map(p => {
                  const store = storeMap[p.store_tenant_id];
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{store?.store_name || 'Unknown Store'}</span>
                          {store?.rating && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" />{store.rating}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'active' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-48 truncate">{p.notes || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Partnership Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Partnership Request</DialogTitle>
            <DialogDescription>Select a verified pharmacy to partner with.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableStores.map(s => (
                <div key={s.id} onClick={() => setSelectedStore(s)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${selectedStore?.id === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{s.store_name}</p>
                      {s.owner_name && <p className="text-xs text-muted-foreground">{s.owner_name}</p>}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {s.rating && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" />{s.rating}</span>}
                      {s.delivery_available && <Badge variant="outline" className="text-xs mt-1">Delivery</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why you'd like to partner…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendRequest} disabled={!selectedStore}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
