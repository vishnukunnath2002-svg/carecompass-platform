import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: any;
  modules_included: string[] | null;
  is_free_trial: boolean;
  trial_days: number | null;
  max_users: number | null;
  max_listings: number | null;
}

interface PlanSelectorProps {
  selectedPlanId: string | null;
  onSelect: (planId: string) => void;
  module?: string;
}

const moduleLabels: Record<string, string> = {
  homecare: 'Homecare',
  ecommerce: 'E-Commerce',
  store_connect: 'Store Connect',
};

export default function PlanSelector({ selectedPlanId, onSelect, module }: PlanSelectorProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setPlans((data as Plan[]) || []);
        setLoading(false);
      });
  }, []);

  const filteredPlans = module
    ? plans.filter((p) => p.modules_included?.includes(module) || (p.modules_included?.length || 0) === 0)
    : plans;

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading plans...</div>
    );
  }

  if (filteredPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No subscription plans available at the moment.</p>
        <p className="text-sm text-muted-foreground mt-1">Please contact support for registration assistance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling('monthly')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-all',
            billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('yearly')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-all',
            billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
        >
          Yearly <Badge className="ml-1 bg-success/10 text-success text-[10px]">Save 20%</Badge>
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => {
          const price = billing === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const isSelected = selectedPlanId === plan.id;
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <Card
              key={plan.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-elevated relative',
                isSelected ? 'border-primary ring-2 ring-primary shadow-elevated' : 'border hover:border-primary/50'
              )}
              onClick={() => onSelect(plan.id)}
            >
              {plan.is_free_trial && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-warning text-warning-foreground">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {plan.trial_days}-day free trial
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 pt-8">
                <div className="text-center mb-4">
                  <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                  {plan.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                  )}
                </div>

                <div className="text-center mb-4">
                  <span className="font-display text-3xl font-bold text-foreground">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-muted-foreground">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                </div>

                {/* Modules included */}
                {plan.modules_included && plan.modules_included.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {plan.modules_included.map((m) => (
                      <Badge key={m} variant="outline" className="text-[10px]">
                        {moduleLabels[m] || m}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Limits */}
                <div className="flex justify-center gap-4 mb-4 text-xs text-muted-foreground">
                  {plan.max_users && <span>{plan.max_users} users</span>}
                  {plan.max_listings && <span>{plan.max_listings} listings</span>}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {features.slice(0, 5).map((f: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-success mt-0.5" />
                      <span className="text-foreground">{typeof f === 'string' ? f : f.name || f.label || JSON.stringify(f)}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn('w-full', isSelected ? 'gradient-primary border-0' : '')}
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {isSelected ? (
                    <><Check className="mr-2 h-4 w-4" /> Selected</>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
