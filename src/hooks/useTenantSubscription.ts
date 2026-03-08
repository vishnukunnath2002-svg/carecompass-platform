import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  is_trial: boolean;
  started_at: string;
  expires_at: string | null;
  plan_name?: string;
  modules_included?: string[];
  max_users?: number | null;
  max_listings?: number | null;
}

interface TenantInfo {
  id: string;
  name: string;
  domain_slug: string | null;
  status: string;
  type: string;
  modules_enabled: any;
}

export function useTenantSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      // 1. Get tenant
      let tenantInfo: TenantInfo | null = null;

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

      if (tenantData) {
        tenantInfo = tenantData as any;
      } else {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .not('tenant_id', 'is', null)
          .limit(1);

        if (roleData && roleData.length > 0 && roleData[0].tenant_id) {
          const { data: t } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', roleData[0].tenant_id)
            .single();
          if (t) tenantInfo = t as any;
        }
      }

      setTenant(tenantInfo);

      if (!tenantInfo) {
        setLoading(false);
        return;
      }

      // 2. Get active subscription with plan details
      const { data: subData } = await supabase
        .from('tenant_subscriptions')
        .select('*, subscription_plans(name, modules_included, max_users, max_listings)')
        .eq('tenant_id', tenantInfo.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subData && subData.length > 0) {
        const sub = subData[0];
        const plan = (sub as any).subscription_plans;
        const subInfo: TenantSubscription = {
          id: sub.id,
          tenant_id: sub.tenant_id,
          plan_id: sub.plan_id,
          status: sub.status,
          is_trial: sub.is_trial,
          started_at: sub.started_at,
          expires_at: sub.expires_at,
          plan_name: plan?.name,
          modules_included: plan?.modules_included || [],
          max_users: plan?.max_users,
          max_listings: plan?.max_listings,
        };
        setSubscription(subInfo);

        if (sub.expires_at) {
          const expiry = new Date(sub.expires_at);
          const now = new Date();
          setIsExpired(expiry < now);
          setDaysRemaining(Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  return { subscription, tenant, loading, isExpired, daysRemaining };
}
