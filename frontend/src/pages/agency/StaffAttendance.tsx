import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Plus, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

interface AttendanceRecord {
  id: string;
  provider_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  hours_worked: number | null;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  present: 'bg-success/10 text-success',
  absent: 'bg-destructive/10 text-destructive',
  half_day: 'bg-warning/10 text-warning',
  on_leave: 'bg-info/10 text-info',
  holiday: 'bg-muted text-muted-foreground',
};

export default function StaffAttendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ provider_id: '', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '', check_out: '', notes: '' });
  const [staffList, setStaffList] = useState<{ id: string; provider_type: string; qualification: string | null }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (!roleData?.tenant_id) { setLoading(false); return; }
      setTenantId(roleData.tenant_id);

      const [{ data: attendance }, { data: staff }] = await Promise.all([
        supabase.from('staff_attendance').select('*').eq('tenant_id', roleData.tenant_id).order('date', { ascending: false }).limit(100),
        supabase.from('caregiver_profiles').select('id, provider_type, qualification').eq('tenant_id', roleData.tenant_id),
      ]);
      setRecords((attendance as AttendanceRecord[]) || []);
      setStaffList(staff || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSubmit = async () => {
    if (!tenantId || !form.provider_id || !form.date) return;
    const { error } = await supabase.from('staff_attendance').insert({
      tenant_id: tenantId,
      provider_id: form.provider_id,
      date: form.date,
      status: form.status,
      check_in: form.check_in ? new Date(`${form.date}T${form.check_in}`).toISOString() : null,
      check_out: form.check_out ? new Date(`${form.date}T${form.check_out}`).toISOString() : null,
      notes: form.notes || null,
      marked_by: user?.id,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Attendance marked' });
      setDialogOpen(false);
      setForm({ provider_id: '', date: new Date().toISOString().split('T')[0], status: 'present', check_in: '', check_out: '', notes: '' });
      // Refresh
      const { data } = await supabase.from('staff_attendance').select('*').eq('tenant_id', tenantId).order('date', { ascending: false }).limit(100);
      setRecords((data as AttendanceRecord[]) || []);
    }
  };

  const todayRecords = records.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const presentToday = todayRecords.filter(r => r.status === 'present' || r.status === 'half_day').length;
  const absentToday = todayRecords.filter(r => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Attendance</h2>
          <p className="text-sm text-muted-foreground">Track daily staff attendance and work hours.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0"><Plus className="mr-2 h-4 w-4" /> Mark Attendance</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <Select value={form.provider_id} onValueChange={(v) => setForm({ ...form, provider_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {staffList.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.provider_type} — {s.qualification || 'N/A'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Check In</Label><Input type="time" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} /></div>
                <div className="space-y-2"><Label>Check Out</Label><Input type="time" value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSubmit} className="w-full gradient-primary border-0">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Present Today" value={presentToday} icon={CheckCircle} />
        <StatCard title="Absent Today" value={absentToday} icon={XCircle} />
        <StatCard title="Total Staff" value={staffList.length} icon={CalendarDays} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by date..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : records.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No attendance records yet.</TableCell></TableRow>
              ) : records.filter(r => !searchTerm || r.date.includes(searchTerm)).map(r => {
                const staff = staffList.find(s => s.id === r.provider_id);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{new Date(r.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="text-muted-foreground">{staff ? `${staff.provider_type} — ${staff.qualification || ''}` : r.provider_id.slice(0, 8)}</TableCell>
                    <TableCell><Badge className={statusColors[r.status] + ' capitalize'}>{r.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.check_in ? new Date(r.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.check_out ? new Date(r.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">{r.notes || '—'}</TableCell>
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
