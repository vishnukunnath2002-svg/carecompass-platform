import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Plus, IndianRupee, FileText } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

interface PayrollRecord {
  id: string;
  provider_id: string;
  period_start: string;
  period_end: string;
  base_amount: number;
  bonus: number | null;
  deductions: number | null;
  net_amount: number;
  days_worked: number | null;
  days_absent: number | null;
  status: string;
  payment_date: string | null;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  processed: 'bg-info/10 text-info',
  paid: 'bg-success/10 text-success',
  disputed: 'bg-destructive/10 text-destructive',
};

export default function StaffPayroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState<{ id: string; provider_type: string; qualification: string | null; daily_rate: number | null }[]>([]);
  const [form, setForm] = useState({
    provider_id: '', period_start: '', period_end: '', base_amount: '', bonus: '0', deductions: '0', days_worked: '', days_absent: '0', notes: '',
  });

  const fetchPayroll = async (tid: string) => {
    const { data } = await supabase.from('staff_payroll').select('*').eq('tenant_id', tid).order('period_end', { ascending: false });
    setRecords((data as PayrollRecord[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (!roleData?.tenant_id) { setLoading(false); return; }
      setTenantId(roleData.tenant_id);
      const [, { data: staff }] = await Promise.all([
        fetchPayroll(roleData.tenant_id),
        supabase.from('caregiver_profiles').select('id, provider_type, qualification, daily_rate').eq('tenant_id', roleData.tenant_id),
      ]);
      setStaffList(staff || []);
      setLoading(false);
    };
    init();
  }, [user]);

  const netAmount = parseFloat(form.base_amount || '0') + parseFloat(form.bonus || '0') - parseFloat(form.deductions || '0');

  const handleSubmit = async () => {
    if (!tenantId || !form.provider_id || !form.period_start || !form.period_end) return;
    const { error } = await supabase.from('staff_payroll').insert({
      tenant_id: tenantId,
      provider_id: form.provider_id,
      period_start: form.period_start,
      period_end: form.period_end,
      base_amount: parseFloat(form.base_amount || '0'),
      bonus: parseFloat(form.bonus || '0'),
      deductions: parseFloat(form.deductions || '0'),
      net_amount: netAmount,
      days_worked: parseInt(form.days_worked || '0'),
      days_absent: parseInt(form.days_absent || '0'),
      notes: form.notes || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Payroll record created' });
      setDialogOpen(false);
      setForm({ provider_id: '', period_start: '', period_end: '', base_amount: '', bonus: '0', deductions: '0', days_worked: '', days_absent: '0', notes: '' });
      fetchPayroll(tenantId);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!tenantId) return;
    const updates: Record<string, any> = { status };
    if (status === 'paid') updates.payment_date = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('staff_payroll').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Payroll ${status}` });
      fetchPayroll(tenantId);
    }
  };

  const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + r.net_amount, 0);
  const totalPending = records.filter(r => r.status === 'draft' || r.status === 'processed').reduce((s, r) => s + r.net_amount, 0);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Payroll</h2>
          <p className="text-sm text-muted-foreground">Manage staff salary, bonuses, and deductions.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0"><Plus className="mr-2 h-4 w-4" /> Create Payroll</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Payroll Record</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <Select value={form.provider_id} onValueChange={v => setForm({ ...form, provider_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {staffList.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.provider_type} — {s.qualification || 'N/A'}{s.daily_rate ? ` (₹${s.daily_rate}/day)` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Period Start</Label><Input type="date" value={form.period_start} onChange={e => setForm({ ...form, period_start: e.target.value })} /></div>
                <div className="space-y-2"><Label>Period End</Label><Input type="date" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Base (₹)</Label><Input type="number" value={form.base_amount} onChange={e => setForm({ ...form, base_amount: e.target.value })} /></div>
                <div className="space-y-2"><Label>Bonus (₹)</Label><Input type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} /></div>
                <div className="space-y-2"><Label>Deductions (₹)</Label><Input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Days Worked</Label><Input type="number" value={form.days_worked} onChange={e => setForm({ ...form, days_worked: e.target.value })} /></div>
                <div className="space-y-2"><Label>Days Absent</Label><Input type="number" value={form.days_absent} onChange={e => setForm({ ...form, days_absent: e.target.value })} /></div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <span className="text-sm text-muted-foreground">Net Amount:</span>
                <span className="ml-2 font-display font-bold text-foreground text-lg">{fmt(netAmount)}</span>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSubmit} className="w-full gradient-primary border-0">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Paid" value={fmt(totalPaid)} icon={Wallet} />
        <StatCard title="Pending Payout" value={fmt(totalPending)} icon={IndianRupee} />
        <StatCard title="Records" value={records.length} icon={FileText} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : records.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payroll records yet.</TableCell></TableRow>
              ) : records.map(r => {
                const staff = staffList.find(s => s.id === r.provider_id);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{staff?.provider_type || r.provider_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm">{new Date(r.period_start).toLocaleDateString('en-IN')} – {new Date(r.period_end).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="text-sm">{fmt(r.base_amount)}</TableCell>
                    <TableCell className="font-medium">{fmt(r.net_amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.days_worked ?? 0}W / {r.days_absent ?? 0}A</TableCell>
                    <TableCell><Badge className={statusColors[r.status] + ' capitalize'}>{r.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status === 'draft' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(r.id, 'processed')}>Process</Button>
                        )}
                        {r.status === 'processed' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(r.id, 'paid')}>Mark Paid</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
