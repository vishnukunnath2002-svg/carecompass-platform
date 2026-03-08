import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle } from 'lucide-react';

const modules = [
  { name: 'Platform Orientation', desc: 'How CYLO works', progress: 100, completed: true },
  { name: 'Patient Safety Protocols', desc: 'Emergency procedures & safety', progress: 100, completed: true },
  { name: 'Vitals Recording Training', desc: 'How to log vitals correctly', progress: 75, completed: false },
  { name: 'Communication Skills', desc: 'Patient & family interaction', progress: 30, completed: false },
  { name: 'Infection Control', desc: 'Hygiene and PPE guidelines', progress: 0, completed: false },
];

export default function Training() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Training</h2>
        <p className="text-sm text-muted-foreground">Complete training modules to improve your skills and profile.</p>
      </div>
      <div className="space-y-3">
        {modules.map((m) => (
          <Card key={m.name}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.completed ? 'bg-success/10' : 'bg-primary/10'}`}>
                {m.completed ? <CheckCircle className="h-5 w-5 text-success" /> : <BookOpen className="h-5 w-5 text-primary" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{m.name}</p>
                  {m.completed && <Badge variant="default">Completed</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
                {!m.completed && <Progress value={m.progress} className="mt-2 h-1.5" />}
              </div>
              <span className="text-sm font-mono text-muted-foreground">{m.progress}%</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
