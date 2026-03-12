import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, UserCheck, FileText } from 'lucide-react';

const workflow = [
  { step: 'Discharge Summary', desc: 'Doctor prepares discharge notes', icon: FileText, status: 'complete' },
  { step: 'Care Plan', desc: 'Post-discharge care plan created', icon: CheckCircle, status: 'complete' },
  { step: 'Provider Assignment', desc: 'Home nurse assigned for follow-up', icon: UserCheck, status: 'in_progress' },
  { step: 'Family Coordination', desc: 'Family briefed on care protocol', icon: Clock, status: 'pending' },
];

export default function DischargeCare() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Discharge Care</h2>
        <p className="text-sm text-muted-foreground">Coordinate post-discharge homecare for patients.</p>
      </div>
      <div className="space-y-3">
        {workflow.map((w, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${w.status === 'complete' ? 'bg-success/10' : w.status === 'in_progress' ? 'bg-warning/10' : 'bg-muted'}`}>
                <w.icon className={`h-5 w-5 ${w.status === 'complete' ? 'text-success' : w.status === 'in_progress' ? 'text-warning' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{w.step}</p>
                <p className="text-sm text-muted-foreground">{w.desc}</p>
              </div>
              <Badge variant={w.status === 'complete' ? 'default' : w.status === 'in_progress' ? 'secondary' : 'outline'}>
                {w.status === 'complete' ? 'Done' : w.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
