import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const demoUsers = [
    { email: "admin@cylo.demo", password: "demo1234", full_name: "Admin User", roles: ["super_admin"] },
    { email: "agency@cylo.demo", password: "demo1234", full_name: "Agency Manager", roles: ["agency_admin"] },
    { email: "nurse@cylo.demo", password: "demo1234", full_name: "Nurse Priya", roles: ["provider"] },
    { email: "vendor@cylo.demo", password: "demo1234", full_name: "Vendor Admin", roles: ["vendor_admin"] },
    { email: "store@cylo.demo", password: "demo1234", full_name: "Store Owner", roles: ["store_admin"] },
    { email: "hospital@cylo.demo", password: "demo1234", full_name: "Hospital Admin", roles: ["hospital_admin"] },
    { email: "patient@cylo.demo", password: "demo1234", full_name: "Rajesh Kumar", roles: ["patient"] },
  ];

  const results = [];

  for (const u of demoUsers) {
    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((x: any) => x.email === u.email);

    let userId: string;
    if (existing) {
      userId = existing.id;
      results.push({ email: u.email, status: "exists", userId });
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (error) {
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }
      userId = data.user.id;
      results.push({ email: u.email, status: "created", userId });
    }

    // Upsert roles
    for (const role of u.roles) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role },
        { onConflict: "user_id,role" }
      );
    }
  }

  // Seed tenants
  const { data: agencyUser } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "agency_admin").limit(1).single();
  const { data: vendorUser } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "vendor_admin").limit(1).single();
  const { data: storeUser } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "store_admin").limit(1).single();
  const { data: hospitalUser } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "hospital_admin").limit(1).single();
  const { data: nurseUser } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "provider").limit(1).single();

  // Agency tenant
  const { data: agencyTenant } = await supabaseAdmin.from("tenants").upsert({
    name: "CYLO Healthcare Agency",
    type: "agency",
    status: "active",
    owner_user_id: agencyUser?.user_id,
    contact_email: "agency@cylo.demo",
    city: "Kochi",
    state: "Kerala",
  }, { onConflict: "id" }).select().single();

  // Vendor tenant
  const { data: vendorTenant } = await supabaseAdmin.from("tenants").upsert({
    name: "MedSupply India",
    type: "vendor",
    status: "active",
    owner_user_id: vendorUser?.user_id,
    contact_email: "vendor@cylo.demo",
    city: "Mumbai",
    state: "Maharashtra",
  }, { onConflict: "id" }).select().single();

  // Store tenant
  const { data: storeTenant } = await supabaseAdmin.from("tenants").upsert({
    name: "Apollo Pharmacy - Kochi",
    type: "medical_store",
    status: "active",
    owner_user_id: storeUser?.user_id,
    contact_email: "store@cylo.demo",
    city: "Kochi",
    state: "Kerala",
  }, { onConflict: "id" }).select().single();

  // Hospital tenant
  const { data: hospitalTenant } = await supabaseAdmin.from("tenants").upsert({
    name: "City Hospital",
    type: "hospital",
    status: "active",
    owner_user_id: hospitalUser?.user_id,
    contact_email: "hospital@cylo.demo",
    city: "Kochi",
    state: "Kerala",
  }, { onConflict: "id" }).select().single();

  // Update user_roles with tenant_ids
  if (agencyTenant) await supabaseAdmin.from("user_roles").update({ tenant_id: agencyTenant.id }).eq("user_id", agencyUser?.user_id);
  if (vendorTenant) await supabaseAdmin.from("user_roles").update({ tenant_id: vendorTenant.id }).eq("user_id", vendorUser?.user_id);
  if (storeTenant) await supabaseAdmin.from("user_roles").update({ tenant_id: storeTenant.id }).eq("user_id", storeUser?.user_id);
  if (hospitalTenant) await supabaseAdmin.from("user_roles").update({ tenant_id: hospitalTenant.id }).eq("user_id", hospitalUser?.user_id);

  // Seed caregiver profile for nurse
  if (nurseUser && agencyTenant) {
    await supabaseAdmin.from("caregiver_profiles").upsert({
      user_id: nurseUser.user_id,
      provider_type: "nurse",
      tenant_id: agencyTenant.id,
      verification_status: "approved",
      qualification: "GNM Nursing",
      years_experience: 5,
      languages: ["English", "Hindi", "Malayalam"],
      specializations: ["Post-surgical care", "Wound care", "Diabetes management"],
      hourly_rate: 350,
      daily_rate: 2500,
      weekly_rate: 15000,
      bio: "Experienced GNM nurse with 5 years of home healthcare experience.",
      is_available: true,
      rating: 4.9,
      review_count: 52,
    }, { onConflict: "user_id" });
  }

  // Seed service categories
  const serviceCategories = [
    { name: "Home Nursing", slug: "home-nursing", icon: "Stethoscope", sort_order: 1 },
    { name: "Elder Care", slug: "elder-care", icon: "Heart", sort_order: 2 },
    { name: "Baby & Child Care", slug: "baby-child-care", icon: "Baby", sort_order: 3 },
    { name: "Post-Surgery Care", slug: "post-surgery-care", icon: "Activity", sort_order: 4 },
    { name: "Palliative Care", slug: "palliative-care", icon: "Heart", sort_order: 5 },
    { name: "Companion Care", slug: "companion-care", icon: "Users", sort_order: 6 },
  ];
  for (const cat of serviceCategories) {
    await supabaseAdmin.from("service_categories").upsert(cat, { onConflict: "slug" });
  }

  // Seed product categories
  const productCategories = [
    { name: "Medical Equipment", slug: "medical-equipment", sort_order: 1 },
    { name: "Surgical Supplies", slug: "surgical-supplies", sort_order: 2 },
    { name: "Patient Care", slug: "patient-care", sort_order: 3 },
    { name: "Diagnostics", slug: "diagnostics", sort_order: 4 },
    { name: "Mobility Aids", slug: "mobility-aids", sort_order: 5 },
  ];
  for (const cat of productCategories) {
    await supabaseAdmin.from("product_categories").upsert(cat, { onConflict: "slug" });
  }

  // Seed products for vendor
  if (vendorTenant) {
    const products = [
      { name: "Pulse Oximeter", price: 1200, mrp: 1800, sku: "PO-001", brand: "HealthMate", stock_quantity: 50, tenant_id: vendorTenant.id, is_active: true },
      { name: "Digital BP Monitor", price: 2200, mrp: 3000, sku: "BP-001", brand: "OmniMed", stock_quantity: 30, tenant_id: vendorTenant.id, is_active: true },
      { name: "Wheelchair - Standard", price: 8500, mrp: 12000, sku: "WC-001", brand: "MobiCare", stock_quantity: 10, tenant_id: vendorTenant.id, is_active: true },
      { name: "Hospital Bed - Manual", price: 25000, mrp: 35000, sku: "HB-001", brand: "CareBed", stock_quantity: 5, tenant_id: vendorTenant.id, is_active: true },
      { name: "Nebulizer Machine", price: 1800, mrp: 2500, sku: "NB-001", brand: "BreathEasy", stock_quantity: 25, tenant_id: vendorTenant.id, is_active: true },
      { name: "Surgical Gloves (Box/100)", price: 450, mrp: 600, sku: "SG-001", brand: "SafeHands", stock_quantity: 200, tenant_id: vendorTenant.id, is_active: true },
    ];
    for (const p of products) {
      const { data: existing } = await supabaseAdmin.from("products").select("id").eq("sku", p.sku).limit(1).single();
      if (!existing) await supabaseAdmin.from("products").insert(p);
    }
  }

  // Seed store inventory
  if (storeTenant) {
    const { data: storeProfile } = await supabaseAdmin.from("medical_store_profiles").upsert({
      tenant_id: storeTenant.id,
      store_name: "Apollo Pharmacy - Kochi",
      owner_name: "Store Owner",
      drug_licence_number: "DL-KL-2024-12345",
      verification_status: "approved",
      delivery_available: true,
      delivery_fee: 30,
      minimum_order_value: 200,
      rating: 4.5,
      review_count: 128,
      operating_hours: { open: "08:00", close: "22:00" },
      catchment_radius_km: 5,
    }, { onConflict: "tenant_id" }).select().single();

    if (storeProfile) {
      const storeItems = [
        { product_name: "Paracetamol 500mg (Strip/10)", price: 25, stock_quantity: 500, category: "OTC", store_id: storeProfile.id },
        { product_name: "Dolo 650 (Strip/15)", price: 35, stock_quantity: 300, category: "OTC", store_id: storeProfile.id },
        { product_name: "ORS Sachets (Pack/5)", price: 45, stock_quantity: 200, category: "OTC", store_id: storeProfile.id },
        { product_name: "Betadine Solution 100ml", price: 120, stock_quantity: 80, category: "First Aid", store_id: storeProfile.id },
        { product_name: "Band-Aid (Box/100)", price: 180, stock_quantity: 60, category: "First Aid", store_id: storeProfile.id },
        { product_name: "Metformin 500mg (Strip/10)", price: 45, stock_quantity: 150, category: "Prescription", is_prescription_required: true, store_id: storeProfile.id },
      ];
      for (const item of storeItems) {
        const { data: existing } = await supabaseAdmin.from("store_inventory").select("id").eq("product_name", item.product_name).eq("store_id", storeProfile.id).limit(1).single();
        if (!existing) await supabaseAdmin.from("store_inventory").insert(item);
      }
    }
  }

  // Seed hospital profile
  if (hospitalTenant) {
    await supabaseAdmin.from("hospital_profiles").upsert({
      tenant_id: hospitalTenant.id,
      hospital_name: "City Hospital",
      contact_person_name: "Hospital Admin",
      procurement_enabled: true,
      discharge_coordination: true,
    }, { onConflict: "tenant_id" });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
