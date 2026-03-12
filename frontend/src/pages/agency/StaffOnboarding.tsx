import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, FileText, Upload } from 'lucide-react';

const steps = [
  { title: 'Profile Submission', desc: 'Personal details and qualifications', icon: FileText, status: 'complete' },
  { title: 'Document Upload', desc: 'ID, certificates, registration proof', icon: Upload, status: 'complete' },
  { title: 'Background Verification', desc: 'Identity and criminal record check', icon: CheckCircle, status: 'in_progress' },
  { title: 'Training & Assessment', desc: 'Platform training and skill test', icon: Clock, status: 'pending' },
];

export default function StaffOnboarding() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Staff Onboarding</h2>
        <p className="text-sm text-muted-foreground">Track and manage the onboarding pipeline for new staff.</p>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.status === 'complete' ? 'bg-success/10' : s.status === 'in_progress' ? 'bg-warning/10' : 'bg-muted'}`}>
                <s.icon className={`h-5 w-5 ${s.status === 'complete' ? 'text-success' : s.status === 'in_progress' ? 'text-warning' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
              <Badge variant={s.status === 'complete' ? 'default' : s.status === 'in_progress' ? 'secondary' : 'outline'}>
                {s.status === 'complete' ? 'Done' : s.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
