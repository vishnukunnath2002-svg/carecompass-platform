import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Pill, MapPin, Check, Users, Store, Zap } from 'lucide-react';

const MODULES = [
  {
    key: 'manpower_marketplace',
    name: 'Manpower Marketplace',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    label: 'Module 1',
    description: 'Book background-verified home nurses, caregivers, maids, bystanders, companions, baby care assistants, and on-call doctors.',
    features: ['Background-verified providers', 'Real-time booking & scheduling', 'Vitals & health logging', 'Multi-shift support (hourly/daily/weekly)', 'Provider ratings & reviews', 'GPS-based provider matching'],
    audience: 'Homecare Agencies & Individual Providers',
  },
  {
    key: 'medical_ecommerce',
    name: 'Medical E-Commerce',
    icon: Pill,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Module 2',
    description: 'Buy and sell medical consumables, surgical packs, PPE, homecare products, monitoring devices, mobility equipment, and respiratory devices.',
    features: ['Product catalogue management', 'Bulk & MOQ ordering', 'RFQ & quote comparison', 'Order tracking & dispatch', 'Inventory & pricing management'],
    audience: 'Medical Vendors',
  },
  {
    key: 'store_connect',
    name: 'Medical Store Connect',
    icon: MapPin,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    label: 'Module 3',
    description: 'Connect registered local pharmacies into the platform for last-mile medicine and supply delivery including prescription fulfilment.',
    features: ['Pharmacy onboarding & verification', 'Catchment area & pincode mapping', 'Prescription upload & verification', 'Inventory sync & stock alerts', 'Last-mile delivery tracking', 'Operating hours management'],
    audience: 'Medical Stores & Pharmacies',
  },
];

export default function ModulesPage() {
  const [planCounts, setPlanCounts] = useState<Record<string, number>>({});
  const [subCounts, setSubCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetch = async () => {
      const [plansRes, subsRes] = await Promise.all([
        supabase.from('subscription_plans').select('module, id'),
        supabase.from('tenant_subscriptions').select('plan_id'),
      ]);
      if (plansRes.data) {
        const counts: Record<string, number> = {};
        const planModuleMap: Record<string, string> = {};
        plansRes.data.forEach((p: any) => {
          counts[p.module] = (counts[p.module] || 0) + 1;
          planModuleMap[p.id] = p.module;
        });
        setPlanCounts(counts);

        if (subsRes.data) {
          const sc: Record<string, number> = {};
          subsRes.data.forEach((s: any) => {
            const mod = planModuleMap[s.plan_id];
            if (mod) sc[mod] = (sc[mod] || 0) + 1;
          });
          setSubCounts(sc);
        }
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Platform Modules</h2>
        <p className="text-sm text-muted-foreground">The 3 core modules powering the CYLO healthcare marketplace.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card key={mod.key} className={`border-2 ${mod.border} hover:shadow-lg transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${mod.bg}`}>
                    <Icon className={`h-7 w-7 ${mod.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{mod.name}</CardTitle>
                    <CardDescription className="text-xs">{mod.audience}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
                <div className="space-y-2">
                  {mod.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className={`h-4 w-4 ${mod.color} shrink-0`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{planCounts[mod.key] || 0}</span> plans · <span className="font-semibold text-foreground">{subCounts[mod.key] || 0}</span> subscribers
                </div>
                <Badge variant="outline" className={mod.color}>{mod.label}</Badge>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Location Services Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" />Location Services</CardTitle>
          <CardDescription>All entities store geo-coordinates for proximity-based features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Patients', desc: 'Addresses with lat/lng for nearby provider matching', icon: Users },
              { label: 'Agencies', desc: 'Tenant location for service area mapping', icon: Heart },
              { label: 'Providers', desc: 'Individual lat/lng + travel radius for assignment', icon: Zap },
              { label: 'Medical Stores', desc: 'Store coordinates + catchment pincodes & radius', icon: Store },
            ].map(item => (
              <div key={item.label} className="flex gap-3 rounded-lg border p-3">
                <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
