import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';

const pricingTiers = [
  { service: 'General Nursing', hourly: 250, daily: 1800, weekly: 10500 },
  { service: 'ICU-trained Nurse', hourly: 400, daily: 3000, weekly: 18000 },
  { service: 'Physiotherapy', hourly: 500, daily: 3500, weekly: 21000 },
  { service: 'Elderly Care', hourly: 200, daily: 1500, weekly: 9000 },
  { service: 'Post-Surgery Care', hourly: 350, daily: 2500, weekly: 15000 },
];

export default function PricingManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Pricing Management</h2>
        <p className="text-sm text-muted-foreground">Manage service pricing tiers for your agency.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Service</th><th className="p-3 text-right">Hourly</th><th className="p-3 text-right">Daily (8hr)</th><th className="p-3 text-right">Weekly</th></tr></thead>
              <tbody>
                {pricingTiers.map((t) => (
                  <tr key={t.service} className="border-b">
                    <td className="p-3 font-medium">{t.service}</td>
                    <td className="p-3 text-right">₹{t.hourly}</td>
                    <td className="p-3 text-right">₹{t.daily.toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold">₹{t.weekly.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
