import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, FileText, TrendingUp, Users } from 'lucide-react';

export default function HospitalAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Hospital procurement and care coordination metrics.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active RFQs" value={3} icon={FileText} />
        <StatCard title="Purchase Orders" value={12} icon={ShoppingCart} />
        <StatCard title="Spend This Month" value="₹8.5L" icon={TrendingUp} />
        <StatCard title="Discharge Cases" value={24} icon={Users} />
      </div>
      <Card>
        <CardHeader><CardTitle>Procurement Trends</CardTitle></CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">Charts will populate as procurement data grows.</CardContent>
      </Card>
    </div>
  );
}
