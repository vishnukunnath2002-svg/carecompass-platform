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

    const body = await req.json();
    const {
      user_id,
      plan_id,
      tenant_name,
      tenant_type,
      domain_slug,
      contact_email,
      contact_phone,
      city,
      state,
      pincode,
      gst_number,
      registration_number,
      // For admin-created tenants
      owner_email,
      owner_password,
      owner_name,
    } = body;

    let finalUserId = user_id;

    // If admin is creating a tenant with new credentials
    if (owner_email && owner_password && !user_id) {
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email: owner_email,
        password: owner_password,
        email_confirm: true,
        user_metadata: { full_name: owner_name || owner_email, registration_type: tenant_type },
      });
      if (userError) {
        return new Response(JSON.stringify({ error: userError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      finalUserId = newUser.user.id;
    }

    if (!finalUserId) {
      return new Response(JSON.stringify({ error: 'user_id or owner credentials required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch plan details
    let modulesEnabled = ['homecare', 'ecommerce', 'store_connect'];
    let trialDays = 0;
    let isFreeTrial = false;

    if (plan_id) {
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', plan_id)
        .single();

      if (plan) {
        modulesEnabled = plan.modules_included || [plan.module];
        trialDays = plan.trial_days || 0;
        isFreeTrial = plan.is_free_trial || false;
      }
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: tenant_name,
        type: tenant_type,
        status: 'active',
        owner_user_id: finalUserId,
        domain_slug: domain_slug || tenant_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50),
        contact_email,
        contact_phone,
        city,
        state,
        pincode,
        gst_number,
        registration_number,
        modules_enabled: JSON.stringify(modulesEnabled),
      })
      .select()
      .single();

    if (tenantError) {
      return new Response(JSON.stringify({ error: tenantError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create subscription if plan selected
    if (plan_id) {
      const now = new Date();
      const expiresAt = new Date(now);
      if (isFreeTrial) {
        expiresAt.setDate(expiresAt.getDate() + (trialDays || 14));
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Default 1 year
      }

      await supabase.from('tenant_subscriptions').insert({
        tenant_id: tenant.id,
        plan_id,
        status: isFreeTrial ? 'trial' : 'active',
        is_trial: isFreeTrial,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }

    // Assign role based on tenant type
    const roleMap: Record<string, string> = {
      agency: 'agency_admin',
      vendor: 'vendor_admin',
      medical_store: 'store_admin',
      hospital: 'hospital_admin',
      provider: 'provider',
    };

    const role = roleMap[tenant_type] || 'patient';

    await supabase.from('user_roles').insert({
      user_id: finalUserId,
      role,
      tenant_id: tenant.id,
    });

    return new Response(JSON.stringify({ tenant, role }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
