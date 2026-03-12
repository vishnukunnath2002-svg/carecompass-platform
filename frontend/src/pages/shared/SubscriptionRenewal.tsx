import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantSubscription } from '@/hooks/useTenantSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, AlertTriangle, ArrowLeft, CalendarDays, Building2 } from 'lucide-react';
import PaymentSimulation from '@/components/care/PaymentSimulation';
import { useToast } from '@/hooks/use-toast';
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

const moduleLabels: Record<string, string> = {
  homecare: 'Homecare',
  ecommerce: 'E-Commerce',
  store_connect: 'Store Connect',
};

export default function SubscriptionRenewal() {
  const { user } = useAuth();
  const { subscription, tenant, isExpired, daysRemaining } = useTenantSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [step, setStep] = useState<'select' | 'payment' | 'done'>('select');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setPlans((data as Plan[]) || []);
        // Pre-select current plan
        if (subscription?.plan_id) {
          setSelectedPlanId(subscription.plan_id);
        }
        setLoading(false);
      });
  }, [subscription?.plan_id]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const amount = selectedPlan
    ? billing === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly
    : 0;

  const handlePaymentComplete = async (method?: string) => {
    if (!tenant || !selectedPlanId || !user) return;
    setProcessing(true);

    try {
      const now = new Date();
      const expiresAt = new Date(now);
      if (billing === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      // Create new subscription record
      const { error: subError } = await supabase.from('tenant_subscriptions').insert({
        tenant_id: tenant.id,
        plan_id: selectedPlanId,
        status: 'active',
        is_trial: false,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (subError) throw subError;

      // Mark old subscription as expired if exists
      if (subscription?.id) {
        await supabase
          .from('tenant_subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id);
      }

      // Update tenant modules based on new plan
      if (selectedPlan?.modules_included) {
        await supabase
          .from('tenants')
          .update({ modules_enabled: JSON.stringify(selectedPlan.modules_included), status: 'active' })
          .eq('id', tenant.id);
      }

      // Create invoice record
      await supabase.from('invoices').insert({
        user_id: user.id,
        reference_id: tenant.id,
        type: 'subscription_renewal',
        amount,
        tax: Math.round(amount * 0.18),
        total: Math.round(amount * 1.18),
      });

      setStep('done');
      toast({ title: 'Subscription renewed!', description: `Your ${selectedPlan?.name} plan is now active.` });
    } catch (err: any) {
      toast({ title: 'Renewal failed', description: err.message, variant: 'destructive' });
    }
    setProcessing(false);
  };

  const getPortalPath = () => {
    if (!tenant) return '/';
    const typeMap: Record<string, string> = {
      agency: '/agency',
      vendor: '/vendor',
      medical_store: '/store',
      
      provider: '/provider',
    };
    return typeMap[tenant.type] || '/';
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full border shadow-elevated">
          <CardContent className="flex flex-col items-center py-12">
            <div className="rounded-full bg-success/10 p-5 mb-4">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Subscription Renewed</h2>
            <p className="text-muted-foreground mt-2 text-center">
              Your <strong>{selectedPlan?.name}</strong> plan is active until{' '}
              {new Date(Date.now() + (billing === 'monthly' ? 30 : 365) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
            <Button className="mt-6 gradient-primary border-0" onClick={() => navigate(getPortalPath())}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'payment' && selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <h2 className="font-display text-xl font-bold text-foreground">Renew Subscription</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedPlan.name} — {billing === 'monthly' ? 'Monthly' : 'Yearly'} billing
            </p>
          </div>
          <PaymentSimulation
            amount={Math.round(amount * 1.18)}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setStep('select')}
            loading={processing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Renew Your Subscription</h1>
            <p className="text-sm text-muted-foreground">Choose a plan to continue using the platform</p>
          </div>
        </div>

        {/* Current status */}
        {tenant && (
          <Card className="border shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{tenant.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {subscription && (
                    <Badge className={isExpired ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>
                      {isExpired ? 'Expired' : subscription.status}
                    </Badge>
                  )}
                  {subscription?.plan_name && (
                    <span className="text-xs text-muted-foreground">Current: {subscription.plan_name}</span>
                  )}
                  {subscription?.expires_at && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {isExpired ? 'Expired' : `${daysRemaining}d left`} — {new Date(subscription.expires_at).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              {isExpired && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">Action Required</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setBilling('monthly')}
            className={cn(
              'rounded-full px-5 py-2.5 text-sm font-medium transition-all',
              billing === 'monthly' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={cn(
              'rounded-full px-5 py-2.5 text-sm font-medium transition-all',
              billing === 'yearly' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'
            )}
          >
            Yearly <Badge className="ml-1 bg-success/10 text-success text-[10px]">Save 20%</Badge>
          </button>
        </div>

        {/* Plans grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading plans...</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.price_monthly : plan.price_yearly;
              const isSelected = selectedPlanId === plan.id;
              const isCurrent = subscription?.plan_id === plan.id;
              const features = Array.isArray(plan.features) ? plan.features : [];

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-elevated relative',
                    isSelected ? 'border-primary ring-2 ring-primary shadow-elevated' : 'border hover:border-primary/50'
                  )}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary/10 text-primary">Current Plan</Badge>
                    </div>
                  )}
                  {plan.is_free_trial && !isCurrent && (
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
                    {plan.modules_included && plan.modules_included.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {plan.modules_included.map((m) => (
                          <Badge key={m} variant="outline" className="text-[10px]">
                            {moduleLabels[m] || m}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-center gap-4 mb-4 text-xs text-muted-foreground">
                      {plan.max_users && <span>{plan.max_users} users</span>}
                      {plan.max_listings && <span>{plan.max_listings} listings</span>}
                    </div>
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
                      ) : isCurrent ? 'Renew This Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Proceed button */}
        {selectedPlanId && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gradient-primary border-0 px-12"
              onClick={() => setStep('payment')}
            >
              Proceed to Payment — ₹{Math.round(amount * 1.18).toLocaleString('en-IN')} (incl. GST)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
