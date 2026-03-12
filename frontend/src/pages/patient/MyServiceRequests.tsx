import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardList, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import ReviewForm from '@/components/care/ReviewForm';

interface ServiceRequest {
  id: string;
  tenant_id: string;
  patient_name: string;
  service_type: string;
  description: string;
  preferred_start_date: string | null;
  preferred_shift: string | null;
  patient_condition: string | null;
  status: string;
  agency_notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: 'bg-warning/10 text-warning border-warning/20' },
  accepted: { icon: CheckCircle, color: 'bg-success/10 text-success border-success/20' },
  completed: { icon: CheckCircle, color: 'bg-primary/10 text-primary border-primary/20' },
  rejected: { icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function MyServiceRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; type: string } | null>(null);

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase.from('service_requests' as any)
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false }) as any;
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Service Requests</h2>
        <p className="text-sm text-muted-foreground">Track your service requests to agencies</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">You haven't submitted any service requests yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Browse agencies on the homepage and request a service.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => {
            const cfg = statusConfig[req.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <Card key={req.id} className="border shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-foreground">{req.service_type}</h3>
                        <Badge className={cfg.color} variant="outline">
                          <StatusIcon className="h-3 w-3 mr-1" /> {req.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {req.preferred_start_date && <span>Start: {req.preferred_start_date}</span>}
                        {req.preferred_shift && <span>Shift: {req.preferred_shift}</span>}
                        {req.patient_condition && <span>Condition: {req.patient_condition}</span>}
                        <span>Requested: {new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                      {req.agency_notes && (
                        <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm">
                          <span className="text-xs font-medium text-muted-foreground">Agency Response:</span>
                          <p className="text-foreground mt-0.5">{req.agency_notes}</p>
                        </div>
                      )}
                    </div>
                    {req.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => setReviewTarget({ id: req.tenant_id, type: 'agency' })}>
                        <Star className="h-3.5 w-3.5 mr-1" /> Rate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate This Agency</DialogTitle>
          </DialogHeader>
          {reviewTarget && (
            <ReviewForm targetId={reviewTarget.id} targetType={reviewTarget.type} onComplete={() => setReviewTarget(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
