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
import { CalendarOff, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

interface LeaveRequest {
  id: string;
  provider_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

export default function LeaveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState<{ id: string; provider_type: string; qualification: string | null }[]>([]);
  const [form, setForm] = useState({ provider_id: '', leave_type: 'casual', start_date: '', end_date: '', reason: '' });

  const fetchLeaves = async (tid: string) => {
    const { data } = await supabase.from('leave_requests').select('*').eq('tenant_id', tid).order('created_at', { ascending: false });
    setLeaves((data as LeaveRequest[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (!roleData?.tenant_id) { setLoading(false); return; }
      setTenantId(roleData.tenant_id);
      const [, { data: staff }] = await Promise.all([
        fetchLeaves(roleData.tenant_id),
        supabase.from('caregiver_profiles').select('id, provider_type, qualification').eq('tenant_id', roleData.tenant_id),
      ]);
      setStaffList(staff || []);
      setLoading(false);
    };
    init();
  }, [user]);

  const handleSubmit = async () => {
    if (!tenantId || !form.provider_id || !form.start_date || !form.end_date) return;
    const { error } = await supabase.from('leave_requests').insert({
      tenant_id: tenantId,
      provider_id: form.provider_id,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Leave request created' });
      setDialogOpen(false);
      setForm({ provider_id: '', leave_type: 'casual', start_date: '', end_date: '', reason: '' });
      fetchLeaves(tenantId);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!tenantId) return;
    const { error } = await supabase.from('leave_requests').update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Leave ${status}` });
      fetchLeaves(tenantId);
    }
  };

  const pending = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Leave Management</h2>
          <p className="text-sm text-muted-foreground">Manage staff leave requests and approvals.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0"><Plus className="mr-2 h-4 w-4" /> New Leave Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Leave Request</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <Select value={form.provider_id} onValueChange={v => setForm({ ...form, provider_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {staffList.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.provider_type} — {s.qualification || 'N/A'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={form.leave_type} onValueChange={v => setForm({ ...form, leave_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="earned">Earned</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
              <Button onClick={handleSubmit} className="w-full gradient-primary border-0">Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending" value={pending} icon={Clock} />
        <StatCard title="Approved" value={approved} icon={CheckCircle} />
        <StatCard title="Total Requests" value={leaves.length} icon={CalendarOff} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : leaves.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leave requests yet.</TableCell></TableRow>
              ) : leaves.map(l => {
                const staff = staffList.find(s => s.id === l.provider_id);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{staff ? `${staff.provider_type}` : l.provider_id.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{l.leave_type}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(l.start_date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="text-sm">{new Date(l.end_date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">{l.reason || '—'}</TableCell>
                    <TableCell><Badge className={statusColors[l.status] + ' capitalize'}>{l.status}</Badge></TableCell>
                    <TableCell>
                      {l.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-success h-7 px-2" onClick={() => updateStatus(l.id, 'approved')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive h-7 px-2" onClick={() => updateStatus(l.id, 'rejected')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
