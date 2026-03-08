import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Users, ShoppingBag, Store, Plus, Pencil, Trash2, Crown, Zap, Sparkles,
  Heart, Pill, MapPin, Check
} from 'lucide-react';

const MODULES = [
  {
    key: 'manpower_marketplace',
    name: 'Manpower Marketplace',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    description: 'Book background-verified home nurses, caregivers, maids, bystanders, companions, baby care assistants, and on-call doctors.',
    features: ['Background-verified providers', 'Real-time booking & scheduling', 'Vitals & health logging', 'Multi-shift support (hourly/daily/weekly)', 'Provider ratings & reviews', 'GPS-based provider matching'],
    audience: 'Homecare Agencies & Individual Providers',
  },
  {
    key: 'medical_ecommerce',
    name: 'Medical E-Commerce',
    icon: Pill,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    description: 'Buy and sell medical consumables, surgical packs, PPE, homecare products, monitoring devices, mobility equipment, and respiratory devices.',
    features: ['Product catalogue management', 'Bulk & MOQ ordering', 'RFQ & quote comparison', 'Order tracking & dispatch', 'Hospital procurement integration', 'Inventory & pricing management'],
    audience: 'Medical Vendors & Hospitals',
  },
  {
    key: 'store_connect',
    name: 'Medical Store Connect',
    icon: MapPin,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    description: 'Connect registered local pharmacies into the platform for last-mile medicine and supply delivery including prescription fulfilment.',
    features: ['Pharmacy onboarding & verification', 'Catchment area & pincode mapping', 'Prescription upload & verification', 'Inventory sync & stock alerts', 'Last-mile delivery tracking', 'Operating hours management'],
    audience: 'Medical Stores & Pharmacies',
  },
];

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  module: string;
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

const emptyPlan = {
  name: '',
  slug: '',
  description: '',
  module: 'manpower_marketplace',
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

export default function ModulesSubscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [featureInput, setFeatureInput] = useState('');
  const [activeModule, setActiveModule] = useState('all');
  const [subCounts, setSubCounts] = useState<Record<string, number>>({});

  const fetchPlans = async () => {
    const { data } = await supabase.from('subscription_plans').select('*').order('module').order('sort_order');
    if (data) setPlans(data as any);
    setLoading(false);
  };

  const fetchSubCounts = async () => {
    const { data } = await supabase.from('tenant_subscriptions').select('plan_id, status');
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((s: any) => {
        counts[s.plan_id] = (counts[s.plan_id] || 0) + 1;
      });
      setSubCounts(counts);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchSubCounts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan);
    setFeatureInput('');
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      module: plan.module,
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
    if (!form.name || !form.slug || !form.module) {
      toast.error('Name, slug and module are required');
      return;
    }
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      module: form.module,
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
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Plan deleted');
    fetchPlans();
  };

  const filtered = activeModule === 'all' ? plans : plans.filter(p => p.module === activeModule);

  const getPlanIcon = (plan: Plan) => {
    if (plan.is_free_trial) return Sparkles;
    if (plan.price_monthly >= 5000) return Crown;
    return Zap;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Modules & Subscriptions</h2>
        <p className="text-sm text-muted-foreground">Manage the 3 core platform modules and create subscription plans for agencies, vendors, and stores.</p>
      </div>

      {/* Module Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const modulePlans = plans.filter(p => p.module === mod.key);
          const activeSubs = modulePlans.reduce((sum, p) => sum + (subCounts[p.id] || 0), 0);
          return (
            <Card key={mod.key} className={`border-2 ${mod.border} hover:shadow-lg transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mod.bg}`}>
                    <Icon className={`h-6 w-6 ${mod.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{mod.name}</CardTitle>
                    <CardDescription className="text-xs">{mod.audience}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{mod.description}</p>
                <div className="space-y-1.5">
                  {mod.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                      <Check className={`h-3.5 w-3.5 ${mod.color} shrink-0`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{modulePlans.length}</span> plans · <span className="font-semibold text-foreground">{activeSubs}</span> subscribers
                </div>
                <Badge variant="outline" className={mod.color}>{mod.key === 'manpower_marketplace' ? 'Module 1' : mod.key === 'medical_ecommerce' ? 'Module 2' : 'Module 3'}</Badge>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-foreground">Subscription Plans</h3>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        </div>

        <Tabs value={activeModule} onValueChange={setActiveModule}>
          <TabsList>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="manpower_marketplace">Manpower</TabsTrigger>
            <TabsTrigger value="medical_ecommerce">E-Commerce</TabsTrigger>
            <TabsTrigger value="store_connect">Store Connect</TabsTrigger>
          </TabsList>

          <TabsContent value={activeModule} className="mt-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading plans…</p>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No plans created yet. Click "Create Plan" to get started.</p>
              </Card>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Module</TableHead>
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
                      const mod = MODULES.find(m => m.key === plan.module);
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
                            <Badge variant="outline" className="text-xs">
                              {mod?.name || plan.module}
                            </Badge>
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
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                              {plan.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
      </div>

      {/* Location Data Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" />Location Services</CardTitle>
          <CardDescription>All entities store geo-coordinates for proximity-based features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Patients', desc: 'Addresses with lat/lng for nearby provider matching', icon: Users },
              { label: 'Agencies', desc: 'Tenant location (lat/lng) for service area mapping', icon: Heart },
              { label: 'Providers', desc: 'Individual lat/lng + travel radius for assignment', icon: Zap },
              { label: 'Medical Stores', desc: 'Store coordinates + catchment pincodes & radius', icon: Store },
            ].map(item => (
              <div key={item.label} className="flex gap-3 rounded-lg border p-3">
                <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Plan' : 'Create Subscription Plan'}</DialogTitle>
            <DialogDescription>Define pricing, features, and limits for this subscription tier.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Starter" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. manpower-starter" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={form.module} onValueChange={v => setForm(f => ({ ...f, module: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODULES.map(m => (
                    <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <p className="text-xs text-muted-foreground">Allow agencies/vendors to try this module before committing.</p>
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

            {/* Features list */}
            <div className="space-y-2">
              <Label>Plan Features</Label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add a feature…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
              </div>
              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeFeature(i)}>
                      {f} ×
                    </Badge>
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
