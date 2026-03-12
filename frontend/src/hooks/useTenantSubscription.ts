import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import tenantService, { TenantInfo, TenantSubscription } from '@/services/tenantService';

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
      setLoading(true);
      try {
        const tenantInfo = await tenantService.getCurrentTenantInfo();
        
        if (tenantInfo) {
          setTenant(tenantInfo);
          const sub = tenantInfo.active_subscription;
          
          if (sub) {
            setSubscription(sub);
            
            if (sub.expires_at) {
              const expiry = new Date(sub.expires_at);
              const now = new Date();
              setIsExpired(expiry < now);
              setDaysRemaining(Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            } else {
              setIsExpired(false);
              setDaysRemaining(null);
            }
          } else {
            setSubscription(null);
          }
        } else {
          setTenant(null);
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching tenant subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  return { subscription, tenant, loading, isExpired, daysRemaining };
}
