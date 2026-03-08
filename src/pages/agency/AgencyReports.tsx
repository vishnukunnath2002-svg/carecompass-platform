import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, TrendingUp, Star } from 'lucide-react';

export default function AgencyReports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground">Agency performance reports and summaries.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Staff" value={12} icon={Users} />
        <StatCard title="This Month Bookings" value={48} icon={CalendarDays} />
        <StatCard title="Revenue" value="₹1.2L" icon={TrendingUp} />
        <StatCard title="Avg Rating" value="4.7" icon={Star} />
      </div>
      <Card>
        <CardHeader><CardTitle>Monthly Summary</CardTitle></CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Detailed reports with charts will populate as booking data grows.
        </CardContent>
      </Card>
    </div>
  );
}
