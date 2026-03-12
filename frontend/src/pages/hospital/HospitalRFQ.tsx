import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RFQ {
  id: string;
  rfq_number: string;
  title: string;
  status: string | null;
  deadline: string | null;
  items: any;
  created_at: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
  awarded: 'bg-info/10 text-info',
};

export default function HospitalRFQ() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchRFQs = async () => {
    if (!user) return;
    const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
    if (roleData?.tenant_id) {
      const { data } = await supabase.from('hospital_rfqs').select('*').eq('hospital_tenant_id', roleData.tenant_id).order('created_at', { ascending: false });
      setRfqs((data as RFQ[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRFQs(); }, [user]);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
    if (roleData?.tenant_id) {
      const { error } = await supabase.from('hospital_rfqs').insert({
        hospital_tenant_id: roleData.tenant_id,
        title,
        description,
        deadline: deadline || null,
        created_by: user.id,
        status: 'open',
        items: [],
      });
      if (error) {
        toast({ title: 'Failed to create RFQ', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'RFQ created successfully!' });
        setDialogOpen(false);
        setTitle(''); setDescription(''); setDeadline('');
        fetchRFQs();
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">RFQ Submission</h2>
          <p className="text-sm text-muted-foreground">Create and manage Requests for Quotation.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New RFQ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New RFQ</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateRFQ} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monthly Medical Supplies" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your requirements..." />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create RFQ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : rfqs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No RFQs yet. Create your first one.</p>
                </TableCell></TableRow>
              ) : rfqs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium font-mono text-foreground">{r.rfq_number}</TableCell>
                  <TableCell className="text-foreground">{r.title}</TableCell>
                  <TableCell><Badge className={statusColors[r.status || 'open'] + ' capitalize'}>{r.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.deadline ? new Date(r.deadline).toLocaleDateString('en-IN') : '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
