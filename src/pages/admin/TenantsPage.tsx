import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Building2, CheckCircle, Clock, XCircle, Plus, Edit, CalendarDays, AlertTriangle, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';

interface Tenant {
  id: string;
  name: string;
  type: string;
  status: string;
  contact_email: string | null;
  domain_slug: string | null;
  city: string | null;
  state: string | null;
  modules_enabled: any;
  created_at: string;
  owner_user_id: string | null;
}

interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  is_trial: boolean;
  started_at: string;
  expires_at: string | null;
  plan_name?: string;
}

interface Plan {
  id: string;
  name: string;
  modules_included: string[] | null;
  trial_days: number | null;
  is_free_trial: boolean;
}

const statusConfig: Record<string, { icon: any; className: string }> = {
  active: { icon: CheckCircle, className: 'bg-success/10 text-success' },
  pending: { icon: Clock, className: 'bg-warning/10 text-warning' },
  suspended: { icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

const subStatusConfig: Record<string, string> = {
  active: 'bg-success/10 text-success',
  trial: 'bg-warning/10 text-warning',
  expired: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState({
    name: '', type: 'agency', domain_slug: '', owner_email: '', owner_password: '', owner_name: '',
    contact_email: '', contact_phone: '', plan_id: '',
  });

  const fetchData = async () => {
    const [tenantsRes, subsRes, plansRes] = await Promise.all([
      supabase.from('tenants').select('*').order('created_at', { ascending: false }),
      supabase.from('tenant_subscriptions').select('*, subscription_plans(name)').order('created_at', { ascending: false }),
      supabase.from('subscription_plans').select('id, name, modules_included, trial_days, is_free_trial').eq('is_active', true),
    ]);

    setTenants((tenantsRes.data as Tenant[]) || []);
    setPlans((plansRes.data as Plan[]) || []);

    // Map latest subscription per tenant
    const subMap: Record<string, Subscription> = {};
    (subsRes.data || []).forEach((s: any) => {
      if (!subMap[s.tenant_id]) {
        subMap[s.tenant_id] = {
          ...s,
          plan_name: s.subscription_plans?.name,
        };
      }
    });
    setSubscriptions(subMap);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = tenants.filter((t) =>
    !searchTerm ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.domain_slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { agency: 'Agency', vendor: 'Vendor', medical_store: 'Store', hospital: 'Hospital', provider: 'Provider' };
    return map[type] || type;
  };

  const handleCreateTenant = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('provision-tenant', {
        body: {
          owner_email: createForm.owner_email,
          owner_password: createForm.owner_password,
          owner_name: createForm.owner_name,
          plan_id: createForm.plan_id || undefined,
          tenant_name: createForm.name,
          tenant_type: createForm.type,
          domain_slug: createForm.domain_slug || createForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          contact_email: createForm.contact_email || createForm.owner_email,
          contact_phone: createForm.contact_phone,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Tenant created', description: `${createForm.name} has been provisioned successfully.` });
      setCreateOpen(false);
      setCreateForm({ name: '', type: 'agency', domain_slug: '', owner_email: '', owner_password: '', owner_name: '', contact_email: '', contact_phone: '', plan_id: '' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const handleStatusChange = async (tenantId: string, newStatus: string) => {
    await supabase.from('tenants').update({ status: newStatus }).eq('id', tenantId);
    toast({ title: 'Status updated' });
    fetchData();
  };

  const handleSubscriptionAction = async (tenantId: string, action: 'expire' | 'extend30' | 'extend365') => {
    const sub = subscriptions[tenantId];
    if (!sub) return;

    if (action === 'expire') {
      await supabase.from('tenant_subscriptions').update({ status: 'expired', expires_at: new Date().toISOString() }).eq('id', sub.id);
    } else {
      const days = action === 'extend30' ? 30 : 365;
      const baseDate = sub.expires_at ? new Date(sub.expires_at) : new Date();
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + days);
      await supabase.from('tenant_subscriptions').update({ status: 'active', expires_at: newExpiry.toISOString() }).eq('id', sub.id);
    }
    toast({ title: 'Subscription updated' });
    fetchData();
  };

  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const expiringSoon = Object.values(subscriptions).filter(s => {
    if (!s.expires_at) return false;
    const diff = (new Date(s.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 7;
  }).length;
  const expiredSubs = Object.values(subscriptions).filter(s => s.status === 'expired').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Tenant Management</h2>
          <p className="text-sm text-muted-foreground">Manage all agencies, vendors, stores, hospitals, and their subscriptions.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0"><Plus className="mr-2 h-4 w-4" /> Create Tenant</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Tenant</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tenant Name *</Label>
                  <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={createForm.type} onValueChange={(v) => setCreateForm({ ...createForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="medical_store">Medical Store</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Domain Slug</Label>
                <Input value={createForm.domain_slug} onChange={(e) => setCreateForm({ ...createForm, domain_slug: e.target.value })} placeholder="my-agency (auto-generated if empty)" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Owner Name *</Label>
                  <Input value={createForm.owner_name} onChange={(e) => setCreateForm({ ...createForm, owner_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Owner Email *</Label>
                  <Input type="email" value={createForm.owner_email} onChange={(e) => setCreateForm({ ...createForm, owner_email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Owner Password *</Label>
                <Input type="password" value={createForm.owner_password} onChange={(e) => setCreateForm({ ...createForm, owner_password: e.target.value })} minLength={8} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={createForm.contact_phone} onChange={(e) => setCreateForm({ ...createForm, contact_phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Assign Plan</Label>
                  <Select value={createForm.plan_id} onValueChange={(v) => setCreateForm({ ...createForm, plan_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-primary border-0" onClick={handleCreateTenant} disabled={creating || !createForm.name || !createForm.owner_email || !createForm.owner_password}>
                {creating ? 'Creating...' : 'Create Tenant & User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tenants" value={tenants.length} icon={Building2} />
        <StatCard title="Active" value={activeTenants} subtitle="Currently operating" icon={CheckCircle} />
        <StatCard title="Expiring Soon" value={expiringSoon} subtitle="Within 7 days" icon={AlertTriangle} />
        <StatCard title="Expired" value={expiredSubs} subtitle="Need renewal" icon={XCircle} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tenants..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tenants found.</TableCell></TableRow>
              ) : (
                filtered.map((t) => {
                  const sc = statusConfig[t.status] || statusConfig.pending;
                  const sub = subscriptions[t.id];
                  const isExpired = sub?.expires_at ? new Date(sub.expires_at) < new Date() : false;
                  const daysLeft = sub?.expires_at ? Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.contact_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{typeLabel(t.type)}</Badge></TableCell>
                      <TableCell><Badge className={sc.className + ' capitalize'}>{t.status}</Badge></TableCell>
                      <TableCell>
                        {sub ? (
                          <div>
                            <Badge className={subStatusConfig[isExpired ? 'expired' : sub.status] + ' capitalize'}>
                              {isExpired ? 'Expired' : sub.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">{sub.plan_name || '—'}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No plan</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sub?.expires_at ? (
                          <div>
                            <div className="text-sm text-foreground">{new Date(sub.expires_at).toLocaleDateString('en-IN')}</div>
                            {daysLeft !== null && daysLeft > 0 && (
                              <div className={`text-xs ${daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {daysLeft}d remaining
                              </div>
                            )}
                            {isExpired && <div className="text-xs text-destructive font-medium">Expired</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.domain_slug ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">/t/{t.domain_slug}</code>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {t.status === 'active' ? (
                            <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => handleStatusChange(t.id, 'suspended')}>
                              Suspend
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="text-xs text-success" onClick={() => handleStatusChange(t.id, 'active')}>
                              Activate
                            </Button>
                          )}
                          {sub && (
                            <>
                              {!isExpired ? (
                                <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => handleSubscriptionAction(t.id, 'expire')}>
                                  Expire
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" className="text-xs text-success" onClick={() => handleSubscriptionAction(t.id, 'extend30')}>
                                  +30d
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleSubscriptionAction(t.id, 'extend365')}>
                                +1yr
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
