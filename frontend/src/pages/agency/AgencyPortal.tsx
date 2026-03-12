import { useEffect, useState } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantSubscription } from '@/hooks/useTenantSubscription';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard, Users, ClipboardCheck, CalendarDays, Tag, DollarSign,
  Settings, BarChart3, Star, UserPlus, Wallet, Heart, ShoppingBag, Package,
  Handshake, ArrowRightLeft, ClipboardList
} from 'lucide-react';

// Basic items accessible to ALL plans
const BASIC_MODULES = [null]; // null module = always visible

interface NavItem {
  title: string;
  url: string;
  icon: any;
  module: string | null;
}

function getBaseNavItems(basePath: string): NavItem[] {
  return [
    { title: 'Dashboard', url: basePath, icon: LayoutDashboard, module: null },
    { title: 'Staff / Providers', url: `${basePath}/staff`, icon: Users, module: 'homecare' },
    { title: 'Onboarding', url: `${basePath}/onboarding`, icon: UserPlus, module: 'homecare' },
    { title: 'Verification', url: `${basePath}/verification`, icon: ClipboardCheck, module: 'homecare' },
    { title: 'Bookings', url: `${basePath}/bookings`, icon: CalendarDays, module: 'homecare' },
    { title: 'Service Catalogue', url: `${basePath}/services`, icon: Tag, module: 'homecare' },
    { title: 'Pricing', url: `${basePath}/pricing`, icon: DollarSign, module: 'homecare' },
    { title: 'Health Logs', url: `${basePath}/health-logs`, icon: Heart, module: 'homecare' },
    { title: 'Browse Equipment', url: `${basePath}/equipment`, icon: ShoppingBag, module: 'ecommerce' },
    { title: 'Equipment Orders', url: `${basePath}/inventory`, icon: Package, module: 'ecommerce' },
    { title: 'Pharmacy Partners', url: `${basePath}/partnerships`, icon: Handshake, module: 'store_connect' },
    { title: 'Patient Referrals', url: `${basePath}/referrals`, icon: ArrowRightLeft, module: 'store_connect' },
    { title: 'Service Requests', url: `${basePath}/service-requests`, icon: ClipboardList, module: null },
    { title: 'Reviews', url: `${basePath}/reviews`, icon: Star, module: null },
    { title: 'Payouts', url: `${basePath}/payouts`, icon: Wallet, module: null },
    { title: 'Reports', url: `${basePath}/reports`, icon: BarChart3, module: null },
    { title: 'Settings', url: `${basePath}/settings`, icon: Settings, module: null },
  ];
}

function AgencyDashboard({ subscription, isExpired, daysRemaining }: {
  subscription: any;
  isExpired: boolean;
  daysRemaining: number | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Agency Dashboard</h2>
          <p className="text-sm text-muted-foreground">Manage your team, bookings, and operations.</p>
        </div>
        {subscription && (
          <Badge variant="outline" className="text-xs gap-1">
            <Crown className="h-3 w-3" />
            {subscription.plan_name || 'Active Plan'}
            {subscription.is_trial && ' (Trial)'}
          </Badge>
        )}
      </div>

      {isExpired && (
        <Alert variant="destructive">
          <AlertDescription>
            Your subscription has expired. Some features are restricted. Please renew to regain full access.
          </AlertDescription>
        </Alert>
      )}

      {!isExpired && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
        <Alert>
          <AlertDescription>
            Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Renew soon to avoid interruption.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Staff" value={24} subtitle="3 pending verification" icon={Users} />
        <StatCard title="Active Bookings" value={18} subtitle="5 starting today" icon={CalendarDays} />
        <StatCard title="Monthly Revenue" value="₹3.8L" subtitle="+22% vs last month" icon={Wallet} />
        <StatCard title="Avg Rating" value="4.7" subtitle="Based on 286 reviews" icon={Star} />
      </div>
    </div>
  );
}

export default function AgencyPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { slug } = useParams();
  const basePath = slug ? `/t/${slug}/agency` : '/agency';
  const isRoot = location.pathname === basePath || location.pathname === `${basePath}/`;
  const { subscription, tenant, loading, isExpired, daysRemaining } = useTenantSubscription();

  // Global real-time listener for new service requests
  useEffect(() => {
    if (!user) return;

    const setupRealtime = async () => {
      const { data: agencyTenant } = await supabase.from('tenants')
        .select('id').eq('owner_user_id', user.id).eq('type', 'agency').single();
      if (!agencyTenant) return;

      const channel = supabase
        .channel('agency-portal-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'service_requests',
            filter: `tenant_id=eq.${agencyTenant.id}`,
          },
          (payload: any) => {
            const isOnRequestsPage = window.location.pathname.includes('/service-requests');
            if (!isOnRequestsPage) {
              toast({
                title: '🔔 New Service Request',
                description: `${payload.new.patient_name} requested ${payload.new.service_type} service`,
                action: undefined,
              });
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    const cleanup = setupRealtime();
    return () => { cleanup.then(fn => fn?.()); };
  }, [user, toast]);

  // Determine which modules this agency can access based on their plan
  const planModules = subscription?.modules_included || [];
  // Map plan module keys to nav module keys
  // Plan stores: manpower_marketplace, medical_ecommerce, store_connect
  // Nav uses: homecare, ecommerce, store_connect
  const moduleKeyMap: Record<string, string> = {
    manpower_marketplace: 'homecare',
    medical_ecommerce: 'ecommerce',
    store_connect: 'store_connect',
    homecare: 'homecare',
    ecommerce: 'ecommerce',
  };

  const enabledModules = planModules.map((m: string) => moduleKeyMap[m] || m);

  // If no subscription at all, show only basic items
  const allNavItems = getBaseNavItems(basePath);
  const navItems = allNavItems.filter(item => {
    if (item.module === null) return true; // basic items always visible
    if (isExpired) return false; // hide module items when expired
    return enabledModules.includes(item.module);
  });

  return (
    <PortalLayout portalName="Agency Portal" navItems={navItems}>
      {isRoot ? (
        <AgencyDashboard
          subscription={subscription}
          isExpired={isExpired}
          daysRemaining={daysRemaining}
        />
      ) : (
        <Outlet />
      )}
    </PortalLayout>
  );
}
