import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Crown, Zap, Sparkles } from 'lucide-react';

const MODULES = [
  { key: 'manpower_marketplace', name: 'Manpower Marketplace' },
  { key: 'medical_ecommerce', name: 'Medical E-Commerce' },
  { key: 'store_connect', name: 'Medical Store Connect' },
];

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  module: string;
  modules_included: string[];
  price_monthly: number;
  price_yearly: number;
  is_free_trial: boolean;
  trial_days: number;
  features: string[];
  max_users: number | null;
  max_listings: number | null;
  commission_override: number | null;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  modules_included: [] as string[],
  price_monthly: 0,
  price_yearly: 0,
  is_free_trial: false,
  trial_days: 14,
  features: [] as string[],
  max_users: null as number | null,
  max_listings: null as number | null,
  commission_override: null as number | null,
  is_active: true,
  sort_order: 0,
};

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [featureInput, setFeatureInput] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [subCounts, setSubCounts] = useState<Record<string, number>>({});

  const fetchPlans = async () => {
    const { data } = await supabase.from('subscription_plans').select('*').order('sort_order');
    if (data) setPlans(data.map((p: any) => ({ ...p, modules_included: p.modules_included || [p.module] })));
    setLoading(false);
  };

  const fetchSubCounts = async () => {
    const { data } = await supabase.from('tenant_subscriptions').select('plan_id');
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((s: any) => { counts[s.plan_id] = (counts[s.plan_id] || 0) + 1; });
      setSubCounts(counts);
    }
  };

  useEffect(() => { fetchPlans(); fetchSubCounts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFeatureInput('');
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      modules_included: plan.modules_included || [plan.module],
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      is_free_trial: plan.is_free_trial,
      trial_days: plan.trial_days || 14,
      features: plan.features || [],
      max_users: plan.max_users,
      max_listings: plan.max_listings,
      commission_override: plan.commission_override,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setFeatureInput('');
    setDialogOpen(true);
  };

  const toggleModule = (key: string) => {
    setForm(f => ({
      ...f,
      modules_included: f.modules_included.includes(key)
        ? f.modules_included.filter(m => m !== key)
        : [...f.modules_included, key],
    }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm(f => ({ ...f, features: [...f.features, featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (idx: number) => {
    setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  const savePlan = async () => {
    if (!form.name || !form.slug || form.modules_included.length === 0) {
      toast.error('Name, slug and at least one module are required');
      return;
    }
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      module: form.modules_included[0],
      modules_included: form.modules_included,
      price_monthly: form.price_monthly,
      price_yearly: form.price_yearly,
      is_free_trial: form.is_free_trial,
      trial_days: form.is_free_trial ? form.trial_days : 0,
      features: form.features as any,
      max_users: form.max_users,
      max_listings: form.max_listings,
      commission_override: form.commission_override,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    if (editing) {
      const { error } = await supabase.from('subscription_plans').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Plan updated');
    } else {
      const { error } = await supabase.from('subscription_plans').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Plan created');
    }
    setDialogOpen(false);
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    if (subCounts[id]) { toast.error('Cannot delete plan with active subscribers'); return; }
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Plan deleted');
    fetchPlans();
  };

  const filtered = activeTab === 'all' ? plans : plans.filter(p => (p.modules_included || [p.module]).includes(activeTab));

  const getPlanIcon = (plan: Plan) => {
    if (plan.is_free_trial) return Sparkles;
    if (plan.price_monthly >= 5000) return Crown;
    return Zap;
  };

  const moduleNames = (mods: string[]) => mods.map(m => MODULES.find(x => x.key === m)?.name || m).join(', ');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Subscription Plans</h2>
          <p className="text-sm text-muted-foreground">Create and manage subscription plans. Assign one or multiple modules to each plan.</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Create Plan</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Plans</TabsTrigger>
          <TabsTrigger value="manpower_marketplace">Manpower</TabsTrigger>
          <TabsTrigger value="medical_ecommerce">E-Commerce</TabsTrigger>
          <TabsTrigger value="store_connect">Store Connect</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading plans…</p>
          ) : filtered.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No plans yet. Click "Create Plan" to get started.</p>
            </Card>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Monthly</TableHead>
                    <TableHead>Yearly</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((plan) => {
                    const PlanIcon = getPlanIcon(plan);
                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PlanIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{plan.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(plan.modules_included || [plan.module]).map(m => (
                              <Badge key={m} variant="outline" className="text-xs">{MODULES.find(x => x.key === m)?.name || m}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>₹{plan.price_monthly.toLocaleString()}</TableCell>
                        <TableCell>₹{plan.price_yearly.toLocaleString()}</TableCell>
                        <TableCell>
                          {plan.is_free_trial ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Free Trial ({plan.trial_days}d)</Badge>
                          ) : (
                            <Badge variant="secondary">Paid</Badge>
                          )}
                        </TableCell>
                        <TableCell>{subCounts[plan.id] || 0}</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Plan' : 'Create Subscription Plan'}</DialogTitle>
            <DialogDescription>Define pricing, features, and module access for this subscription tier.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Starter" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. agency-starter" />
              </div>
            </div>

            {/* Multi-module selection */}
            <div className="space-y-3">
              <Label>Modules Included</Label>
              <p className="text-xs text-muted-foreground">Select which modules this plan unlocks. Plans can include one or multiple modules.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {MODULES.map(m => (
                  <label key={m.key} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${form.modules_included.includes(m.key) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'}`}>
                    <Checkbox checked={form.modules_included.includes(m.key)} onCheckedChange={() => toggleModule(m.key)} />
                    <span className="text-sm font-medium">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief plan description…" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Price (₹)</Label>
                <Input type="number" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: +e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Yearly Price (₹)</Label>
                <Input type="number" value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: +e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4">
              <Switch checked={form.is_free_trial} onCheckedChange={v => setForm(f => ({ ...f, is_free_trial: v }))} />
              <div className="flex-1">
                <Label>Free Trial Plan</Label>
                <p className="text-xs text-muted-foreground">Allow agencies/vendors to try before committing.</p>
              </div>
              {form.is_free_trial && (
                <div className="space-y-1 w-28">
                  <Label className="text-xs">Trial Days</Label>
                  <Input type="number" value={form.trial_days} onChange={e => setForm(f => ({ ...f, trial_days: +e.target.value }))} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Max Users</Label>
                <Input type="number" value={form.max_users ?? ''} onChange={e => setForm(f => ({ ...f, max_users: e.target.value ? +e.target.value : null }))} placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label>Max Listings</Label>
                <Input type="number" value={form.max_listings ?? ''} onChange={e => setForm(f => ({ ...f, max_listings: e.target.value ? +e.target.value : null }))} placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label>Commission %</Label>
                <Input type="number" value={form.commission_override ?? ''} onChange={e => setForm(f => ({ ...f, commission_override: e.target.value ? +e.target.value : null }))} placeholder="Default" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plan Features</Label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add a feature…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
              </div>
              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeFeature(i)}>{f} ×</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePlan}>{editing ? 'Update Plan' : 'Create Plan'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
