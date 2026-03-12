import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, TrendingUp, Star } from 'lucide-react';

export default function VendorAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Your store performance metrics.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Products" value={24} icon={Package} />
        <StatCard title="Orders" value={156} icon={ShoppingCart} />
        <StatCard title="Revenue" value="₹4.8L" icon={TrendingUp} />
        <StatCard title="Rating" value="4.6" icon={Star} />
      </div>
      <Card>
        <CardHeader><CardTitle>Sales Trends</CardTitle></CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">Charts will populate as order data grows.</CardContent>
      </Card>
    </div>
  );
}
