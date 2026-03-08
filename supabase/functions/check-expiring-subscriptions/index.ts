import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find active/trial subscriptions expiring within 7 days
    const { data: expiringSubs, error: subError } = await supabase
      .from('tenant_subscriptions')
      .select('id, tenant_id, plan_id, status, expires_at, subscription_plans(name)')
      .in('status', ['active', 'trial'])
      .not('expires_at', 'is', null)
      .lte('expires_at', sevenDaysFromNow.toISOString())
      .gte('expires_at', now.toISOString());

    if (subError) {
      throw new Error(`Query error: ${subError.message}`);
    }

    if (!expiringSubs || expiringSubs.length === 0) {
      return new Response(JSON.stringify({ message: 'No expiring subscriptions found', count: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tenantIds = expiringSubs.map((s: any) => s.tenant_id);

    // Get tenant details with owner user IDs
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name, owner_user_id, contact_email')
      .in('id', tenantIds);

    const tenantMap = new Map((tenants || []).map((t: any) => [t.id, t]));

    let notifiedCount = 0;
    const results: any[] = [];

    for (const sub of expiringSubs) {
      const tenant = tenantMap.get(sub.tenant_id);
      if (!tenant || !tenant.owner_user_id) continue;

      const expiresAt = new Date(sub.expires_at!);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const planName = (sub as any).subscription_plans?.name || 'your plan';

      // Check if we already sent a notification for this subscription today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', tenant.owner_user_id)
        .eq('type', 'subscription_expiry')
        .gte('created_at', todayStart.toISOString())
        .limit(1);

      if (existing && existing.length > 0) {
        results.push({ tenant: tenant.name, status: 'already_notified_today' });
        continue;
      }

      // Create in-app notification
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: tenant.owner_user_id,
        title: `Subscription expiring in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        message: `Your ${planName} subscription for ${tenant.name} expires on ${expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Renew now to avoid service interruption.`,
        type: 'subscription_expiry',
        link: '/renew',
      });

      if (notifError) {
        results.push({ tenant: tenant.name, status: 'notification_failed', error: notifError.message });
        continue;
      }

      // Log for audit
      await supabase.from('audit_logs').insert({
        action: 'subscription_expiry_notification',
        entity_type: 'tenant_subscription',
        entity_id: sub.id,
        user_id: tenant.owner_user_id,
        new_data: {
          tenant_name: tenant.name,
          plan_name: planName,
          days_remaining: daysLeft,
          expires_at: sub.expires_at,
          contact_email: tenant.contact_email,
        },
      });

      notifiedCount++;
      results.push({
        tenant: tenant.name,
        email: tenant.contact_email,
        days_left: daysLeft,
        status: 'notified',
      });
    }

    // Also check for already-expired subscriptions to auto-update status
    const { data: justExpired } = await supabase
      .from('tenant_subscriptions')
      .select('id, tenant_id')
      .in('status', ['active', 'trial'])
      .not('expires_at', 'is', null)
      .lt('expires_at', now.toISOString());

    let expiredCount = 0;
    if (justExpired && justExpired.length > 0) {
      for (const sub of justExpired) {
        await supabase
          .from('tenant_subscriptions')
          .update({ status: 'expired' })
          .eq('id', sub.id);
        expiredCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${expiringSubs.length} expiring subscriptions`,
        notified: notifiedCount,
        auto_expired: expiredCount,
        details: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Expiry check error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
