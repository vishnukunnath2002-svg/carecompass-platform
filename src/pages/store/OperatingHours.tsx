import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';

const schedule = [
  { day: 'Monday', open: '09:00', close: '21:00', active: true },
  { day: 'Tuesday', open: '09:00', close: '21:00', active: true },
  { day: 'Wednesday', open: '09:00', close: '21:00', active: true },
  { day: 'Thursday', open: '09:00', close: '21:00', active: true },
  { day: 'Friday', open: '09:00', close: '21:00', active: true },
  { day: 'Saturday', open: '10:00', close: '20:00', active: true },
  { day: 'Sunday', open: '10:00', close: '14:00', active: false },
];

export default function OperatingHours() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Operating Hours</h2>
        <p className="text-sm text-muted-foreground">Set your store's working hours.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Weekly Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {schedule.map((s) => (
            <div key={s.day} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="font-medium text-sm w-24">{s.day}</span>
              <span className="text-sm text-muted-foreground">{s.active ? `${s.open} — ${s.close}` : 'Closed'}</span>
              <Switch defaultChecked={s.active} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
