import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

export default function StoreAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Store performance and sales metrics.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Products" value={48} icon={Package} />
        <StatCard title="Orders" value={89} icon={ShoppingCart} />
        <StatCard title="Revenue" value="₹2.1L" icon={TrendingUp} />
        <StatCard title="Customers" value={234} icon={Users} />
      </div>
      <Card>
        <CardHeader><CardTitle>Sales Trends</CardTitle></CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">Charts will populate as order data grows.</CardContent>
      </Card>
    </div>
  );
}
