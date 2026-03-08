import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, XCircle, Shield } from 'lucide-react';

export default function VerificationStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('pending');

  useEffect(() => {
    if (!user) return;
    supabase.from('caregiver_profiles').select('verification_status').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setStatus(data.verification_status || 'pending');
    });
  }, [user]);

  const icon = status === 'approved' ? <CheckCircle className="h-12 w-12 text-success" /> : status === 'rejected' ? <XCircle className="h-12 w-12 text-destructive" /> : <Clock className="h-12 w-12 text-warning" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Verification Status</h2>
        <p className="text-sm text-muted-foreground">Your current verification and compliance status.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          {icon}
          <Badge variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'} className="text-lg px-4 py-1">
            {status === 'approved' ? 'Fully Verified' : status === 'rejected' ? 'Verification Rejected' : 'Verification Pending'}
          </Badge>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {status === 'approved' ? 'All your documents have been verified. You can accept bookings.' : status === 'rejected' ? 'Some documents were rejected. Please re-upload corrected documents.' : 'Your documents are being reviewed. This usually takes 24-48 hours.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
