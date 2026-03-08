import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useTenantSubscription } from '@/hooks/useTenantSubscription';
import { Plus, Pencil, Trash2, Star, Users, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgencyService {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  service_type: string;
  price_hourly: number | null;
  price_daily: number | null;
  price_weekly: number | null;
  conditions_served: string[];
  equipment_suggestions: string[];
  assigned_staff: string[];
  is_active: boolean;
  rating: number | null;
  review_count: number | null;
  created_at: string;
}

interface StaffProfile {
  id: string;
  provider_type: string;
  qualification: string | null;
  user_id: string;
}

interface ProductOption {
  id: string;
  name: string;
  brand: string | null;
  price: number;
}

const serviceTypes = [
  { value: 'nurse', label: 'Home Nurse' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'companion', label: 'Companion' },
  { value: 'nanny', label: 'Baby Care / Nanny' },
  { value: 'helper', label: 'Helper' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
];

const typeLabel = (t: string) => serviceTypes.find(s => s.value === t)?.label || t;

export default function ServiceCatalogue() {
  const { tenant } = useTenantSubscription();
  const { toast } = useToast();
  const [services, setServices] = useState<AgencyService[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<AgencyService | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '', description: '', service_type: 'nurse',
    price_hourly: '', price_daily: '', price_weekly: '',
    conditions_served: '', assigned_staff: [] as string[],
    equipment_suggestions: [] as string[], is_active: true,
  });

  const resetForm = () => setForm({
    name: '', description: '', service_type: 'nurse',
    price_hourly: '', price_daily: '', price_weekly: '',
    conditions_served: '', assigned_staff: [], equipment_suggestions: [], is_active: true,
  });

  const fetchServices = async () => {
    if (!tenant) return;
    const { data } = await supabase.from('agency_services').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false });
    setServices((data as AgencyService[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!tenant) return;
    // Fetch services, staff, and products in parallel
    Promise.all([
      supabase.from('agency_services').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }),
      supabase.from('caregiver_profiles').select('id, provider_type, qualification, user_id').eq('tenant_id', tenant.id),
      supabase.from('products').select('id, name, brand, price').eq('is_active', true).limit(100),
    ]).then(([sRes, stRes, prRes]) => {
      setServices((sRes.data as AgencyService[]) || []);
      setStaff((stRes.data as StaffProfile[]) || []);
      setProducts((prRes.data as ProductOption[]) || []);
      setLoading(false);
    });
  }, [tenant]);

  const openCreate = () => { resetForm(); setEditingService(null); setDialogOpen(true); };

  const openEdit = (s: AgencyService) => {
    setEditingService(s);
    setForm({
      name: s.name, description: s.description || '', service_type: s.service_type,
      price_hourly: s.price_hourly?.toString() || '', price_daily: s.price_daily?.toString() || '',
      price_weekly: s.price_weekly?.toString() || '',
      conditions_served: s.conditions_served?.join(', ') || '',
      assigned_staff: s.assigned_staff || [], equipment_suggestions: s.equipment_suggestions || [],
      is_active: s.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!tenant || !form.name || !form.service_type) return;
    const payload = {
      tenant_id: tenant.id,
      name: form.name,
      description: form.description || null,
      service_type: form.service_type,
      price_hourly: form.price_hourly ? parseFloat(form.price_hourly) : null,
      price_daily: form.price_daily ? parseFloat(form.price_daily) : null,
      price_weekly: form.price_weekly ? parseFloat(form.price_weekly) : null,
      conditions_served: form.conditions_served.split(',').map(s => s.trim()).filter(Boolean),
      equipment_suggestions: form.equipment_suggestions,
      assigned_staff: form.assigned_staff,
      is_active: form.is_active,
    };

    let error;
    if (editingService) {
      ({ error } = await supabase.from('agency_services').update(payload as any).eq('id', editingService.id));
    } else {
      ({ error } = await supabase.from('agency_services').insert(payload as any));
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingService ? 'Service updated' : 'Service created' });
      setDialogOpen(false);
      fetchServices();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('agency_services').delete().eq('id', id);
    toast({ title: 'Service deleted' });
    fetchServices();
  };

  const toggleStaff = (id: string) => {
    setForm(f => ({
      ...f,
      assigned_staff: f.assigned_staff.includes(id) ? f.assigned_staff.filter(s => s !== id) : [...f.assigned_staff, id],
    }));
  };

  const toggleEquipment = (id: string) => {
    setForm(f => ({
      ...f,
      equipment_suggestions: f.equipment_suggestions.includes(id) ? f.equipment_suggestions.filter(s => s !== id) : [...f.equipment_suggestions, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Service Catalogue</h2>
          <p className="text-sm text-muted-foreground">Create and manage services offered by your agency.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Service</Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-40 p-6" /></Card>)}
        </div>
      ) : services.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No services yet. Create your first service to get started.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(s => (
            <Card key={s.id} className="hover:shadow-elevated transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-primary/20">{typeLabel(s.service_type)}</Badge>
                  <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <h3 className="font-display font-semibold text-foreground">{s.name}</h3>
                {s.description && <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>}

                <div className="flex flex-wrap gap-2 text-sm">
                  {s.price_hourly && <span className="font-medium text-foreground">₹{s.price_hourly}/hr</span>}
                  {s.price_daily && <span className="font-medium text-foreground">₹{s.price_daily}/day</span>}
                  {s.price_weekly && <span className="font-medium text-foreground">₹{s.price_weekly}/wk</span>}
                </div>

                {s.conditions_served?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.conditions_served.slice(0, 3).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {s.assigned_staff?.length || 0} staff</span>
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {s.equipment_suggestions?.length || 0} products</span>
                  {(s.rating ?? 0) > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" /> {s.rating}</span>}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Create Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Post-Surgery Home Nursing" />
              </div>
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={form.service_type} onValueChange={v => setForm(f => ({ ...f, service_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the service..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Hourly Rate (₹)</Label><Input type="number" value={form.price_hourly} onChange={e => setForm(f => ({ ...f, price_hourly: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Daily Rate (₹)</Label><Input type="number" value={form.price_daily} onChange={e => setForm(f => ({ ...f, price_daily: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Weekly Rate (₹)</Label><Input type="number" value={form.price_weekly} onChange={e => setForm(f => ({ ...f, price_weekly: e.target.value }))} /></div>
            </div>

            <div className="space-y-2">
              <Label>Conditions Served</Label>
              <Input value={form.conditions_served} onChange={e => setForm(f => ({ ...f, conditions_served: e.target.value }))} placeholder="Cardiac, Post-Surgery, Neuro (comma separated)" />
            </div>

            {/* Staff Assignment */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Assign Staff ({form.assigned_staff.length} selected)
              </Label>
              {staff.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {staff.map(s => (
                    <div key={s.id} onClick={() => toggleStaff(s.id)}
                      className={`cursor-pointer rounded-lg border p-2 text-sm transition-all ${form.assigned_staff.includes(s.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                      <span className="font-medium">{typeLabel(s.provider_type)}</span>
                      {s.qualification && <span className="text-muted-foreground ml-1">· {s.qualification}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  <Users className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/50" />
                  No staff registered yet. Add care providers in <span className="font-medium text-foreground">Staff Management</span> to assign them to services.
                </div>
              )}
            </div>

            {/* Equipment Suggestions */}
            {products.length > 0 && (
              <div className="space-y-2">
                <Label>Suggested Equipment ({form.equipment_suggestions.length} selected)</Label>
                <div className="grid gap-2 sm:grid-cols-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {products.map(p => (
                    <div key={p.id} onClick={() => toggleEquipment(p.id)}
                      className={`cursor-pointer rounded-lg border p-2 text-sm transition-all ${form.equipment_suggestions.includes(p.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground ml-1">₹{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="gradient-primary border-0" onClick={handleSave}>{editingService ? 'Update' : 'Create'} Service</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
