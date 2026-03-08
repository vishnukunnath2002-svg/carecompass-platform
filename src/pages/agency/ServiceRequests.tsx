import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { ClipboardList, CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceRequest {
  id: string;
  patient_name: string;
  patient_phone: string | null;
  service_type: string;
  description: string;
  preferred_start_date: string | null;
  preferred_shift: string | null;
  patient_condition: string | null;
  status: string;
  agency_notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  accepted: 'bg-success/10 text-success border-success/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function ServiceRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'complete' | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    if (!user) return;
    // Get tenant_id for this agency owner
    const { data: tenant } = await supabase.from('tenants')
      .select('id').eq('owner_user_id', user.id).eq('type', 'agency').single();
    if (!tenant) { setLoading(false); return; }

    const { data } = await supabase.from('service_requests' as any)
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false }) as any;
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [user]);

  // Real-time subscription for new service requests
  useEffect(() => {
    if (!user) return;

    const setupRealtime = async () => {
      const { data: tenant } = await supabase.from('tenants')
        .select('id').eq('owner_user_id', user.id).eq('type', 'agency').single();
      if (!tenant) return;

      const channel = supabase
        .channel('agency-service-requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'service_requests',
            filter: `tenant_id=eq.${tenant.id}`,
          },
          (payload) => {
            const newReq = payload.new as ServiceRequest;
            setRequests(prev => [newReq, ...prev]);
            toast({
              title: '🔔 New Service Request',
              description: `${newReq.patient_name} requested ${newReq.service_type} service`,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'service_requests',
            filter: `tenant_id=eq.${tenant.id}`,
          },
          (payload) => {
            const updated = payload.new as ServiceRequest;
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    const cleanup = setupRealtime();
    return () => { cleanup.then(fn => fn?.()); };
  }, [user]);

  const handleAction = async () => {
    if (!selectedReq || !actionType) return;
    setUpdating(true);
    const newStatus = actionType === 'accept' ? 'accepted' : actionType === 'complete' ? 'completed' : 'rejected';
    const { error } = await supabase.from('service_requests' as any)
      .update({ status: newStatus, agency_notes: notes || null } as any)
      .eq('id', selectedReq.id) as any;
    setUpdating(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Request ${newStatus}` });
      setSelectedReq(null);
      setActionType(null);
      setNotes('');
      fetchRequests();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Service Requests</h2>
        <p className="text-sm text-muted-foreground">Manage incoming service requests from patients</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" /> Incoming Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No service requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{req.patient_name}</p>
                          {req.patient_phone && <p className="text-xs text-muted-foreground">{req.patient_phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{req.service_type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-32 truncate">{req.patient_condition || '—'}</TableCell>
                      <TableCell className="text-sm">{req.preferred_start_date || '—'}</TableCell>
                      <TableCell className="text-sm capitalize">{req.preferred_shift || '—'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[req.status] || ''} variant="outline">{req.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" title="View" onClick={() => { setSelectedReq(req); setActionType(null); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" className="text-success" title="Accept" onClick={() => { setSelectedReq(req); setActionType('accept'); }}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-destructive" title="Reject" onClick={() => { setSelectedReq(req); setActionType('reject'); }}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {req.status === 'accepted' && (
                            <Button size="icon" variant="ghost" className="text-primary" title="Mark Complete" onClick={() => { setSelectedReq(req); setActionType('complete'); }}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail / Action Dialog */}
      <Dialog open={!!selectedReq} onOpenChange={(open) => { if (!open) { setSelectedReq(null); setActionType(null); setNotes(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Accept Request' : actionType === 'reject' ? 'Reject Request' : actionType === 'complete' ? 'Complete Request' : 'Request Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Patient:</span> <span className="font-medium">{selectedReq.patient_name}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedReq.patient_phone || '—'}</div>
                <div><span className="text-muted-foreground">Service:</span> {selectedReq.service_type}</div>
                <div><span className="text-muted-foreground">Shift:</span> {selectedReq.preferred_shift || '—'}</div>
                <div><span className="text-muted-foreground">Start Date:</span> {selectedReq.preferred_start_date || '—'}</div>
                <div><span className="text-muted-foreground">Condition:</span> {selectedReq.patient_condition || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1 text-foreground">{selectedReq.description}</p>
              </div>
              {selectedReq.agency_notes && (
                <div>
                  <span className="text-muted-foreground">Agency Notes:</span>
                  <p className="mt-1 text-foreground">{selectedReq.agency_notes}</p>
                </div>
              )}
              {actionType && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-sm">Notes (optional)</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add a response note..." rows={2} />
                </div>
              )}
            </div>
          )}
          {actionType && (
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionType(null); setNotes(''); }}>Cancel</Button>
              <Button onClick={handleAction} disabled={updating}
                className={actionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'gradient-primary border-0'}>
                {updating ? 'Updating...' : actionType === 'accept' ? 'Accept' : actionType === 'complete' ? 'Mark Complete' : 'Reject'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
