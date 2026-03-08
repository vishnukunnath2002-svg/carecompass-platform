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

  // ── 1. DEMO USERS ──
  const demoUsers = [
    { email: "admin@cylo.demo", password: "demo1234", full_name: "Admin User", roles: ["super_admin"] },
    { email: "agency@cylo.demo", password: "demo1234", full_name: "Arjun Menon", roles: ["agency_admin"] },
    { email: "nurse@cylo.demo", password: "demo1234", full_name: "Nurse Priya", roles: ["provider"] },
    { email: "anita@cylo.demo", password: "demo1234", full_name: "BabyCare Anita", roles: ["provider"] },
    { email: "vendor@cylo.demo", password: "demo1234", full_name: "Suresh Gupta", roles: ["vendor_admin"] },
    { email: "store@cylo.demo", password: "demo1234", full_name: "Pharmacy Owner", roles: ["store_admin"] },
    { email: "hospital@cylo.demo", password: "demo1234", full_name: "Dr. Rajan Nair", roles: ["hospital_admin"] },
    { email: "patient@cylo.demo", password: "demo1234", full_name: "Rajesh Kumar", roles: ["patient"] },
    { email: "patient2@cylo.demo", password: "demo1234", full_name: "Meera Sharma", roles: ["patient"] },
    { email: "patient3@cylo.demo", password: "demo1234", full_name: "Deepak Patel", roles: ["patient"] },
    // Extra agency staff for CYLO
    { email: "nurse2@cylo.demo", password: "demo1234", full_name: "Suja Thomas", roles: ["provider"] },
    { email: "nurse3@cylo.demo", password: "demo1234", full_name: "Anil Varghese", roles: ["provider"] },
    { email: "nurse4@cylo.demo", password: "demo1234", full_name: "Lakshmi Nair", roles: ["provider"] },
    { email: "nurse5@cylo.demo", password: "demo1234", full_name: "Divya Menon", roles: ["provider"] },
    // HealthFirst Agency
    { email: "agency2@cylo.demo", password: "demo1234", full_name: "HealthFirst Admin", roles: ["agency_admin"] },
  ];

  const userIds: Record<string, string> = {};
  const { data: existingUsersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
  const existingMap = new Map((existingUsersData?.users || []).map((u: any) => [u.email, u.id]));

  for (const u of demoUsers) {
    if (existingMap.has(u.email)) {
      userIds[u.email] = existingMap.get(u.email)!;
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email, password: u.password, email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (error) continue;
      userIds[u.email] = data.user.id;
    }
    for (const role of u.roles) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userIds[u.email], role },
        { onConflict: "user_id,role" }
      );
    }
  }

  // ── 2. TENANTS ──
  const upsertTenant = async (data: any) => {
    const { data: existing } = await supabaseAdmin.from("tenants").select("id").eq("name", data.name).limit(1).single();
    if (existing) return existing;
    const { data: created } = await supabaseAdmin.from("tenants").insert(data).select().single();
    return created;
  };

  const cyloAgency = await upsertTenant({
    name: "CYLO Healthcare Agency", type: "agency", status: "active",
    owner_user_id: userIds["agency@cylo.demo"], contact_email: "agency@cylo.demo",
    brand_name: "CYLO Care", city: "Kochi", state: "Kerala", pincode: "682001",
  });

  const healthFirst = await upsertTenant({
    name: "HealthFirst Agency", type: "agency", status: "active",
    owner_user_id: userIds["agency2@cylo.demo"], contact_email: "agency2@cylo.demo",
    brand_name: "HealthFirst", city: "Bangalore", state: "Karnataka", pincode: "560001",
  });

  const medSupply = await upsertTenant({
    name: "MedSupply India", type: "vendor", status: "active",
    owner_user_id: userIds["vendor@cylo.demo"], contact_email: "vendor@cylo.demo",
    brand_name: "MedSupply", city: "Mumbai", state: "Maharashtra", pincode: "400001",
    gst_number: "27AABCU9603R1ZM",
  });

  const apolloStore = await upsertTenant({
    name: "Apollo Pharmacy - Kochi", type: "medical_store", status: "active",
    owner_user_id: userIds["store@cylo.demo"], contact_email: "store@cylo.demo",
    city: "Kochi", state: "Kerala", pincode: "682016",
  });

  const cityHospital = await upsertTenant({
    name: "City Hospital", type: "hospital", status: "active",
    owner_user_id: userIds["hospital@cylo.demo"], contact_email: "hospital@cylo.demo",
    city: "Kochi", state: "Kerala", pincode: "682011",
  });

  // Independent providers get their own tenants
  const priyaTenant = await upsertTenant({
    name: "Nurse Priya - Independent", type: "agency", status: "active",
    owner_user_id: userIds["nurse@cylo.demo"], contact_email: "nurse@cylo.demo",
    city: "Kochi", state: "Kerala",
  });

  const anitaTenant = await upsertTenant({
    name: "BabyCare Anita - Independent", type: "agency", status: "active",
    owner_user_id: userIds["anita@cylo.demo"], contact_email: "anita@cylo.demo",
    city: "Kochi", state: "Kerala",
  });

  // Update user_roles with tenant_ids
  const roleTenantMap: Record<string, any> = {
    "agency@cylo.demo": cyloAgency, "agency2@cylo.demo": healthFirst,
    "vendor@cylo.demo": medSupply, "store@cylo.demo": apolloStore,
    "hospital@cylo.demo": cityHospital, "nurse@cylo.demo": priyaTenant,
    "anita@cylo.demo": anitaTenant,
    "nurse2@cylo.demo": cyloAgency, "nurse3@cylo.demo": cyloAgency,
    "nurse4@cylo.demo": cyloAgency, "nurse5@cylo.demo": cyloAgency,
  };
  for (const [email, tenant] of Object.entries(roleTenantMap)) {
    if (tenant && userIds[email]) {
      await supabaseAdmin.from("user_roles").update({ tenant_id: tenant.id }).eq("user_id", userIds[email]);
    }
  }

  // ── 3. CAREGIVER PROFILES ──
  const caregivers = [
    { email: "nurse@cylo.demo", type: "nurse", tenant: priyaTenant, qual: "BSc Nursing", exp: 7, specs: ["Post-surgical care", "Wound care", "Diabetes management", "IV therapy"], rate: 400, daily: 2800, bio: "Specialized home nurse with ICU experience. Expert in post-operative care and chronic disease management.", rating: 4.9, reviews: 52 },
    { email: "anita@cylo.demo", type: "nanny", tenant: anitaTenant, qual: "Child Care Certification", exp: 4, specs: ["Newborn care", "Infant feeding", "Sleep training"], rate: 300, daily: 2000, bio: "Certified baby care specialist with expertise in newborn handling and infant nutrition.", rating: 4.8, reviews: 34 },
    { email: "nurse2@cylo.demo", type: "nurse", tenant: cyloAgency, qual: "GNM Nursing", exp: 5, specs: ["Elder care", "Medication management", "Vital monitoring"], rate: 350, daily: 2500, bio: "Compassionate GNM nurse experienced in geriatric and palliative home care.", rating: 4.7, reviews: 41 },
    { email: "nurse3@cylo.demo", type: "caregiver", tenant: cyloAgency, qual: "Caregiver Training", exp: 3, specs: ["Companion care", "Mobility assistance", "Personal hygiene"], rate: 250, daily: 1800, bio: "Trained caregiver with focus on companion care for elderly patients.", rating: 4.6, reviews: 28 },
    { email: "nurse4@cylo.demo", type: "nurse", tenant: cyloAgency, qual: "BSc Nursing", exp: 8, specs: ["Palliative care", "Pain management", "Wound dressing"], rate: 450, daily: 3200, bio: "Senior nurse specialized in palliative and end-of-life home care.", rating: 4.9, reviews: 67 },
    { email: "nurse5@cylo.demo", type: "physiotherapist", tenant: cyloAgency, qual: "BPT", exp: 6, specs: ["Post-fracture rehab", "Stroke recovery", "Geriatric physiotherapy"], rate: 500, daily: 3500, bio: "Licensed physiotherapist providing in-home rehabilitation services.", rating: 4.8, reviews: 45 },
  ];

  for (const c of caregivers) {
    if (!userIds[c.email]) continue;
    await supabaseAdmin.from("caregiver_profiles").upsert({
      user_id: userIds[c.email], provider_type: c.type, tenant_id: c.tenant?.id,
      verification_status: "approved", qualification: c.qual, years_experience: c.exp,
      languages: ["English", "Hindi", "Malayalam"], specializations: c.specs,
      hourly_rate: c.rate, daily_rate: c.daily, weekly_rate: c.daily * 6,
      bio: c.bio, is_available: true, rating: c.rating, review_count: c.reviews,
      skills: c.specs,
    }, { onConflict: "user_id" });
  }

  // ── 4. SERVICE CATEGORIES ──
  const serviceCategories = [
    { name: "Home Nursing", slug: "home-nursing", icon: "Stethoscope", sort_order: 1, description: "Professional nursing care at home" },
    { name: "Elder Care", slug: "elder-care", icon: "Heart", sort_order: 2, description: "Comprehensive elderly care services" },
    { name: "Baby & Child Care", slug: "baby-child-care", icon: "Baby", sort_order: 3, description: "Newborn and child care specialists" },
    { name: "Post-Surgery Care", slug: "post-surgery-care", icon: "Activity", sort_order: 4, description: "Recovery assistance after surgery" },
    { name: "Palliative Care", slug: "palliative-care", icon: "Heart", sort_order: 5, description: "Comfort-focused end-of-life care" },
    { name: "Companion Care", slug: "companion-care", icon: "Users", sort_order: 6, description: "Social companionship and daily assistance" },
    { name: "Physiotherapy", slug: "physiotherapy", icon: "Activity", sort_order: 7, description: "In-home physical rehabilitation" },
  ];
  for (const cat of serviceCategories) {
    await supabaseAdmin.from("service_categories").upsert(cat, { onConflict: "slug" });
  }

  // ── 5. PRODUCT CATEGORIES & PRODUCTS ──
  const productCategories = [
    { name: "Medical Equipment", slug: "medical-equipment", sort_order: 1 },
    { name: "Surgical Supplies", slug: "surgical-supplies", sort_order: 2 },
    { name: "Patient Care", slug: "patient-care", sort_order: 3 },
    { name: "Diagnostics", slug: "diagnostics", sort_order: 4 },
    { name: "Mobility Aids", slug: "mobility-aids", sort_order: 5 },
    { name: "Respiratory", slug: "respiratory", sort_order: 6 },
    { name: "Wound Care", slug: "wound-care", sort_order: 7 },
  ];
  const catIds: Record<string, string> = {};
  for (const cat of productCategories) {
    const { data: existing } = await supabaseAdmin.from("product_categories").select("id").eq("slug", cat.slug).limit(1).single();
    if (existing) { catIds[cat.slug] = existing.id; continue; }
    const { data: created } = await supabaseAdmin.from("product_categories").insert(cat).select().single();
    if (created) catIds[cat.slug] = created.id;
  }

  if (medSupply) {
    const products = [
      { name: "Pulse Oximeter", price: 1200, mrp: 1800, sku: "PO-001", brand: "HealthMate", stock_quantity: 50, category_slug: "diagnostics", description: "Fingertip pulse oximeter with OLED display" },
      { name: "Digital BP Monitor", price: 2200, mrp: 3000, sku: "BP-001", brand: "OmniMed", stock_quantity: 30, category_slug: "diagnostics", description: "Automatic digital blood pressure monitor" },
      { name: "Wheelchair - Standard", price: 8500, mrp: 12000, sku: "WC-001", brand: "MobiCare", stock_quantity: 10, category_slug: "mobility-aids", description: "Foldable standard wheelchair with cushioned seat" },
      { name: "Hospital Bed - Manual", price: 25000, mrp: 35000, sku: "HB-001", brand: "CareBed", stock_quantity: 5, category_slug: "patient-care", description: "2-crank manual hospital bed with side rails" },
      { name: "Nebulizer Machine", price: 1800, mrp: 2500, sku: "NB-001", brand: "BreathEasy", stock_quantity: 25, category_slug: "respiratory", description: "Compressor nebulizer for respiratory therapy" },
      { name: "Surgical Gloves (Box/100)", price: 450, mrp: 600, sku: "SG-001", brand: "SafeHands", stock_quantity: 200, category_slug: "surgical-supplies", description: "Latex-free surgical gloves, powder-free" },
      { name: "Digital Thermometer", price: 250, mrp: 400, sku: "DT-001", brand: "ThermoScan", stock_quantity: 100, category_slug: "diagnostics", description: "Fast-read digital thermometer with fever alert" },
      { name: "Glucometer Kit", price: 1500, mrp: 2200, sku: "GL-001", brand: "SugarCheck", stock_quantity: 40, category_slug: "diagnostics", description: "Blood glucose monitoring kit with 50 strips" },
      { name: "Oxygen Concentrator 5L", price: 45000, mrp: 55000, sku: "OC-001", brand: "OxyFlow", stock_quantity: 8, category_slug: "respiratory", description: "5L/min portable oxygen concentrator" },
      { name: "Walker - Foldable", price: 2800, mrp: 3800, sku: "WK-001", brand: "MobiCare", stock_quantity: 20, category_slug: "mobility-aids", description: "Lightweight aluminum foldable walker" },
      { name: "Compression Stockings", price: 800, mrp: 1200, sku: "CS-001", brand: "VeinCare", stock_quantity: 60, category_slug: "patient-care", description: "Medical-grade compression stockings (pair)" },
      { name: "Surgical Masks (Box/50)", price: 300, mrp: 450, sku: "SM-001", brand: "SafeShield", stock_quantity: 300, category_slug: "surgical-supplies", description: "3-ply surgical face masks" },
      { name: "Wound Dressing Kit", price: 350, mrp: 500, sku: "WD-001", brand: "HealFast", stock_quantity: 80, category_slug: "wound-care", description: "Complete wound dressing kit with antiseptic" },
      { name: "Adult Diapers (Pack/10)", price: 550, mrp: 700, sku: "AD-001", brand: "ComfortDry", stock_quantity: 150, category_slug: "patient-care", description: "Absorbent adult diapers, size L" },
      { name: "Crepe Bandage 6\" (Pack/12)", price: 280, mrp: 400, sku: "CB-001", brand: "FlexWrap", stock_quantity: 120, category_slug: "wound-care", description: "Elastic crepe bandage for support wrapping" },
      { name: "Bed Pan - Stainless Steel", price: 650, mrp: 900, sku: "BPN-001", brand: "MedEssentials", stock_quantity: 35, category_slug: "patient-care", description: "Stainless steel bed pan, hygienic design" },
      { name: "Suction Machine Portable", price: 8500, mrp: 11000, sku: "SUC-001", brand: "MedVac", stock_quantity: 12, category_slug: "medical-equipment", description: "Portable suction machine for airway clearance" },
      { name: "Stethoscope - Dual Head", price: 900, mrp: 1400, sku: "STH-001", brand: "MedListen", stock_quantity: 45, category_slug: "diagnostics", description: "Dual-head stethoscope for clinical use" },
      { name: "IV Stand - Adjustable", price: 1800, mrp: 2500, sku: "IV-001", brand: "MedEssentials", stock_quantity: 18, category_slug: "medical-equipment", description: "Height-adjustable stainless steel IV stand" },
      { name: "Air Mattress - Anti-Bedsore", price: 3500, mrp: 5000, sku: "AM-001", brand: "CareBed", stock_quantity: 15, category_slug: "patient-care", description: "Alternating pressure air mattress to prevent bedsores" },
      { name: "Cervical Collar", price: 450, mrp: 650, sku: "CC-001", brand: "SpineGuard", stock_quantity: 25, category_slug: "patient-care", description: "Adjustable soft cervical collar for neck support" },
      { name: "Hot Water Bag", price: 200, mrp: 350, sku: "HWB-001", brand: "WarmRelief", stock_quantity: 90, category_slug: "patient-care", description: "Rubber hot water bag for pain relief" },
    ];

    for (const p of products) {
      const { data: existing } = await supabaseAdmin.from("products").select("id").eq("sku", p.sku).limit(1).single();
      if (!existing) {
        await supabaseAdmin.from("products").insert({
          name: p.name, price: p.price, mrp: p.mrp, sku: p.sku, brand: p.brand,
          stock_quantity: p.stock_quantity, tenant_id: medSupply.id, is_active: true,
          description: p.description, category_id: catIds[p.category_slug] || null,
          rating: +(3.5 + Math.random() * 1.5).toFixed(1),
          review_count: Math.floor(5 + Math.random() * 80),
        });
      }
    }
  }

  // ── 6. STORE PROFILE & INVENTORY ──
  let storeProfileId: string | null = null;
  if (apolloStore) {
    const { data: sp } = await supabaseAdmin.from("medical_store_profiles").upsert({
      tenant_id: apolloStore.id, store_name: "Apollo Pharmacy - Kochi",
      owner_name: "Pharmacy Owner", drug_licence_number: "DL-KL-2024-12345",
      gst_number: "32AABCA1234F1Z5", verification_status: "approved",
      delivery_available: true, delivery_fee: 30, minimum_order_value: 200,
      rating: 4.5, review_count: 128, lat: 9.9312, lng: 76.2673,
      operating_hours: { open: "08:00", close: "22:00" }, catchment_radius_km: 5,
      catchment_pincodes: ["682001", "682011", "682016", "682017", "682020"],
    }, { onConflict: "tenant_id" }).select().single();
    storeProfileId = sp?.id || null;

    if (storeProfileId) {
      const storeItems = [
        { product_name: "Paracetamol 500mg (Strip/10)", price: 25, stock_quantity: 500, category: "OTC", brand: "Calpol" },
        { product_name: "Dolo 650 (Strip/15)", price: 35, stock_quantity: 300, category: "OTC", brand: "Dolo" },
        { product_name: "ORS Sachets (Pack/5)", price: 45, stock_quantity: 200, category: "OTC", brand: "Electral" },
        { product_name: "Betadine Solution 100ml", price: 120, stock_quantity: 80, category: "First Aid", brand: "Betadine" },
        { product_name: "Band-Aid (Box/100)", price: 180, stock_quantity: 60, category: "First Aid", brand: "Johnson & Johnson" },
        { product_name: "Metformin 500mg (Strip/10)", price: 45, stock_quantity: 150, category: "Prescription", is_prescription_required: true, brand: "Glycomet" },
        { product_name: "Atorvastatin 10mg (Strip/10)", price: 85, stock_quantity: 120, category: "Prescription", is_prescription_required: true, brand: "Atorva" },
        { product_name: "Omeprazole 20mg (Strip/10)", price: 55, stock_quantity: 200, category: "OTC", brand: "Omez" },
        { product_name: "Cetirizine 10mg (Strip/10)", price: 30, stock_quantity: 250, category: "OTC", brand: "Cetzine" },
        { product_name: "Vitamin D3 60K (Strip/4)", price: 120, stock_quantity: 180, category: "Supplements", brand: "D-Rise" },
        { product_name: "Cotton Roll 500g", price: 90, stock_quantity: 100, category: "First Aid", brand: "Absocot" },
        { product_name: "Digital Thermometer", price: 200, stock_quantity: 40, category: "Devices", brand: "Dr. Morepen" },
      ];
      for (const item of storeItems) {
        const { data: existing } = await supabaseAdmin.from("store_inventory").select("id").eq("product_name", item.product_name).eq("store_id", storeProfileId).limit(1).single();
        if (!existing) await supabaseAdmin.from("store_inventory").insert({ ...item, store_id: storeProfileId, is_active: true });
      }
    }
  }

  // ── 7. HOSPITAL PROFILE ──
  if (cityHospital) {
    await supabaseAdmin.from("hospital_profiles").upsert({
      tenant_id: cityHospital.id, hospital_name: "City Hospital",
      contact_person_name: "Dr. Rajan Nair", contact_person_role: "Medical Director",
      procurement_enabled: true, discharge_coordination: true, nursing_manager: true,
      billing_address: "MG Road, Ernakulam, Kochi - 682011",
      accounts_email: "accounts@cityhospital.demo",
    }, { onConflict: "tenant_id" });
  }

  // ── 8. PATIENT DATA (profiles, addresses) ──
  const patientEmails = ["patient@cylo.demo", "patient2@cylo.demo", "patient3@cylo.demo"];
  const patientData = [
    { name: "Rajesh Kumar", patients: [
      { patient_name: "Rajesh Kumar (Self)", age: 58, gender: "male", blood_group: "O+", medical_conditions: ["Diabetes Type 2", "Hypertension"], current_medications: ["Metformin 500mg", "Amlodipine 5mg"] },
      { patient_name: "Kamala Kumar (Mother)", age: 82, gender: "female", blood_group: "B+", medical_conditions: ["Arthritis", "Post-hip replacement"], current_medications: ["Calcium supplements"] },
    ], address: { address_line1: "42, MG Road, Panampilly Nagar", city: "Kochi", state: "Kerala", pincode: "682036" } },
    { name: "Meera Sharma", patients: [
      { patient_name: "Baby Arya (Daughter)", age: 0, gender: "female", blood_group: "A+", special_care_notes: "Newborn - 3 weeks old, premature birth" },
    ], address: { address_line1: "15, Skyline Apartments, Kakkanad", city: "Kochi", state: "Kerala", pincode: "682030" } },
    { name: "Deepak Patel", patients: [
      { patient_name: "Deepak Patel (Self)", age: 45, gender: "male", blood_group: "AB+", medical_conditions: ["Post-knee surgery"], special_care_notes: "Needs physiotherapy 3x/week" },
    ], address: { address_line1: "8, Green Valley, Edappally", city: "Kochi", state: "Kerala", pincode: "682024" } },
  ];

  const patientProfileIds: Record<string, string> = {};
  const addressIds: Record<string, string> = {};

  for (let i = 0; i < patientEmails.length; i++) {
    const uid = userIds[patientEmails[i]];
    if (!uid) continue;
    const pd = patientData[i];

    // Address
    const { data: existAddr } = await supabaseAdmin.from("addresses").select("id").eq("user_id", uid).limit(1).single();
    if (!existAddr) {
      const { data: addr } = await supabaseAdmin.from("addresses").insert({ user_id: uid, ...pd.address, label: "Home", is_default: true }).select().single();
      if (addr) addressIds[patientEmails[i]] = addr.id;
    } else {
      addressIds[patientEmails[i]] = existAddr.id;
    }

    // Patient profiles
    for (const pp of pd.patients) {
      const { data: existPp } = await supabaseAdmin.from("patient_profiles").select("id").eq("user_id", uid).eq("patient_name", pp.patient_name).limit(1).single();
      if (!existPp) {
        const { data: created } = await supabaseAdmin.from("patient_profiles").insert({ user_id: uid, ...pp }).select().single();
        if (created) patientProfileIds[`${patientEmails[i]}_0`] = created.id;
      } else {
        patientProfileIds[`${patientEmails[i]}_0`] = existPp.id;
      }
    }
  }

  // ── 9. BOOKINGS ──
  const bookingsExist = await supabaseAdmin.from("bookings").select("id").limit(1).single();
  if (!bookingsExist.data) {
    const bookings = [
      { customer: "patient@cylo.demo", provider: "nurse@cylo.demo", tenant: priyaTenant, status: "active", shift: "12hr", service: "home-nursing", condition: "Diabetes management and wound dressing", days_ago: 3, days_dur: 7, amount: 2800 },
      { customer: "patient@cylo.demo", provider: "nurse4@cylo.demo", tenant: cyloAgency, status: "completed", shift: "8hr", service: "elder-care", condition: "Post-hip replacement recovery", days_ago: 30, days_dur: 14, amount: 2500 },
      { customer: "patient2@cylo.demo", provider: "anita@cylo.demo", tenant: anitaTenant, status: "confirmed", shift: "24hr", service: "baby-child-care", condition: "Newborn care for premature baby", days_ago: 0, days_dur: 30, amount: 2000 },
      { customer: "patient3@cylo.demo", provider: "nurse5@cylo.demo", tenant: cyloAgency, status: "active", shift: "8hr", service: "physiotherapy", condition: "Post-knee surgery rehabilitation", days_ago: 5, days_dur: 21, amount: 3500 },
      { customer: "patient@cylo.demo", provider: "nurse2@cylo.demo", tenant: cyloAgency, status: "pending", shift: "8hr", service: "home-nursing", condition: "Routine health checkup for elderly", days_ago: -2, days_dur: 1, amount: 2500 },
    ];

    for (const b of bookings) {
      const cid = userIds[b.customer];
      const pid = userIds[b.provider];
      if (!cid || !pid) continue;
      const start = new Date(); start.setDate(start.getDate() - b.days_ago);
      const end = new Date(start); end.setDate(end.getDate() + b.days_dur);

      await supabaseAdmin.from("bookings").insert({
        customer_id: cid, provider_id: pid, tenant_id: b.tenant?.id,
        status: b.status, shift_type: b.shift, service_type: b.service,
        patient_condition: b.condition, total_amount: b.amount * b.days_dur,
        start_date: start.toISOString().split("T")[0],
        end_date: end.toISOString().split("T")[0],
        payment_status: b.status === "pending" ? "pending" : "paid",
        address_id: addressIds[b.customer] || null,
      });
    }
  }

  // ── 10. ORDERS (vendor) ──
  const ordersExist = await supabaseAdmin.from("orders").select("id").limit(1).single();
  if (!ordersExist.data && medSupply) {
    const { data: prods } = await supabaseAdmin.from("products").select("id, price").eq("tenant_id", medSupply.id).limit(5);
    if (prods && prods.length > 0) {
      const orderData = [
        { customer: "patient@cylo.demo", status: "delivered", payment: "paid", tracking: "TRK-847291", days_ago: 15 },
        { customer: "patient@cylo.demo", status: "shipped", payment: "paid", tracking: "TRK-592034", days_ago: 3 },
        { customer: "patient3@cylo.demo", status: "confirmed", payment: "paid", tracking: null, days_ago: 1 },
      ];

      for (const od of orderData) {
        const cid = userIds[od.customer];
        if (!cid) continue;
        const prod = prods[Math.floor(Math.random() * prods.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        const subtotal = prod.price * qty;
        const tax = Math.round(subtotal * 0.18);

        const { data: order } = await supabaseAdmin.from("orders").insert({
          customer_id: cid, tenant_id: medSupply.id, subtotal, tax,
          total_amount: subtotal + tax, payment_status: od.payment,
          payment_method: "upi", status: od.status, tracking_number: od.tracking,
        }).select().single();

        if (order) {
          await supabaseAdmin.from("order_items").insert({
            order_id: order.id, product_id: prod.id, quantity: qty,
            unit_price: prod.price, total_price: prod.price * qty,
          });
          await supabaseAdmin.from("invoices").insert({
            user_id: cid, reference_id: order.id, type: "product_order",
            amount: subtotal, tax, total: subtotal + tax,
          });
        }
      }
    }
  }

  // ── 11. STORE ORDERS ──
  const storeOrdersExist = await supabaseAdmin.from("store_orders").select("id").limit(1).single();
  if (!storeOrdersExist.data && storeProfileId) {
    const storeOrderData = [
      { customer: "patient@cylo.demo", status: "delivered", days_ago: 10 },
      { customer: "patient2@cylo.demo", status: "confirmed", days_ago: 1 },
    ];

    for (const so of storeOrderData) {
      const cid = userIds[so.customer];
      if (!cid) continue;
      const subtotal = 200 + Math.floor(Math.random() * 500);

      const { data: order } = await supabaseAdmin.from("store_orders").insert({
        customer_id: cid, store_id: storeProfileId, subtotal,
        total_amount: subtotal, payment_status: "paid", status: so.status,
      }).select().single();

      if (order) {
        await supabaseAdmin.from("store_order_items").insert({
          store_order_id: order.id, product_name: "Paracetamol 500mg (Strip/10)",
          quantity: 3, unit_price: 25, total_price: 75,
        });
      }
    }
  }

  // ── 12. REVIEWS ──
  const reviewsExist = await supabaseAdmin.from("reviews").select("id").limit(1).single();
  if (!reviewsExist.data) {
    const reviews = [
      { user: "patient@cylo.demo", target_type: "provider", rating: 5, comment: "Nurse Priya is incredibly professional. She managed my mother's wound care perfectly." },
      { user: "patient@cylo.demo", target_type: "provider", rating: 5, comment: "Excellent elder care. Very patient and caring." },
      { user: "patient3@cylo.demo", target_type: "provider", rating: 4, comment: "Good physiotherapy sessions. Seeing improvement in mobility." },
      { user: "patient2@cylo.demo", target_type: "store", rating: 5, comment: "Fast delivery and genuine medicines. Recommended!" },
    ];

    // Get provider profile IDs for reviews
    const { data: providerProfiles } = await supabaseAdmin.from("caregiver_profiles").select("id").limit(3);
    for (let i = 0; i < reviews.length; i++) {
      const r = reviews[i];
      const uid = userIds[r.user];
      if (!uid) continue;
      let targetId = storeProfileId || "";
      if (r.target_type === "provider" && providerProfiles && providerProfiles[i]) {
        targetId = providerProfiles[i].id;
      }
      if (!targetId) continue;
      await supabaseAdmin.from("reviews").insert({
        user_id: uid, target_id: targetId, target_type: r.target_type,
        rating: r.rating, comment: r.comment, is_verified: true,
      });
    }
  }

  // ── 13. NOTIFICATIONS ──
  const notifsExist = await supabaseAdmin.from("notifications").select("id").limit(1).single();
  if (!notifsExist.data) {
    const notifs = [
      { user: "patient@cylo.demo", title: "Booking Active", message: "Your home nursing booking with Nurse Priya is now active.", type: "booking", link: "/patient/bookings" },
      { user: "patient@cylo.demo", title: "Order Shipped", message: "Your order has been shipped! Tracking: TRK-592034", type: "order", link: "/patient/orders" },
      { user: "patient@cylo.demo", title: "Invoice Ready", message: "Invoice for your recent booking is ready to view.", type: "invoice", link: "/patient/invoices" },
      { user: "patient2@cylo.demo", title: "Booking Confirmed", message: "Your baby care booking with BabyCare Anita has been confirmed.", type: "booking", link: "/patient/bookings" },
      { user: "nurse@cylo.demo", title: "New Booking", message: "You have a new booking for diabetes management care.", type: "booking", link: "/provider/bookings" },
      { user: "vendor@cylo.demo", title: "New Order", message: "You have received a new product order.", type: "order", link: "/vendor/orders" },
      { user: "store@cylo.demo", title: "New Store Order", message: "A new order has been placed at your store.", type: "order", link: "/store/orders" },
    ];
    for (const n of notifs) {
      const uid = userIds[n.user];
      if (!uid) continue;
      await supabaseAdmin.from("notifications").insert({ user_id: uid, ...n, user: undefined });
    }
  }

  // ── 14. WALLET TRANSACTIONS ──
  const walletExist = await supabaseAdmin.from("wallet_transactions").select("id").limit(1).single();
  if (!walletExist.data) {
    const uid = userIds["patient@cylo.demo"];
    if (uid) {
      const txns = [
        { type: "credit", source: "topup", amount: 5000, description: "Wallet top-up via UPI", balance_after: 5000 },
        { type: "debit", source: "booking", amount: 2800, description: "Payment for home nursing booking", balance_after: 2200 },
        { type: "credit", source: "refund", amount: 250, description: "Refund for cancelled store order", balance_after: 2450 },
      ];
      for (const t of txns) {
        await supabaseAdmin.from("wallet_transactions").insert({ user_id: uid, ...t });
      }
    }
  }

  // ── 15. DISPUTES ──
  const disputesExist = await supabaseAdmin.from("disputes").select("id").limit(1).single();
  if (!disputesExist.data) {
    const uid = userIds["patient@cylo.demo"];
    const { data: someOrder } = await supabaseAdmin.from("orders").select("id").limit(1).single();
    if (uid && someOrder) {
      await supabaseAdmin.from("disputes").insert({
        user_id: uid, reference_id: someOrder.id, dispute_type: "quality",
        subject: "Received damaged pulse oximeter",
        description: "The display screen has a crack. Product was working but display is partially visible.",
        status: "open",
      });
    }
  }

  // ── 16. SPECIALIZATION TAGS ──
  const specsExist = await supabaseAdmin.from("specialization_tags").select("id").limit(1).single();
  if (!specsExist.data) {
    const tags = [
      { name: "Post-Surgical Care", category: "nursing" },
      { name: "Wound Care", category: "nursing" },
      { name: "Diabetes Management", category: "nursing" },
      { name: "IV Therapy", category: "nursing" },
      { name: "Elder Care", category: "caregiving" },
      { name: "Companion Care", category: "caregiving" },
      { name: "Newborn Care", category: "baby-care" },
      { name: "Sleep Training", category: "baby-care" },
      { name: "Palliative Care", category: "nursing" },
      { name: "Physiotherapy", category: "therapy" },
      { name: "Stroke Recovery", category: "therapy" },
      { name: "Pain Management", category: "nursing" },
    ];
    for (const tag of tags) {
      await supabaseAdmin.from("specialization_tags").insert({ ...tag, is_active: true });
    }
  }

  // ── 17. COMMISSION RULES ──
  const commExist = await supabaseAdmin.from("commission_rules").select("id").limit(1).single();
  if (!commExist.data) {
    await supabaseAdmin.from("commission_rules").insert([
      { name: "Standard Booking Commission", type: "booking", percentage: 15, flat_fee: 0, is_active: true },
      { name: "Product Order Commission", type: "product_order", percentage: 8, flat_fee: 0, is_active: true },
      { name: "Store Order Commission", type: "store_order", percentage: 5, flat_fee: 10, is_active: true },
    ]);
  }

  // ── 18. PROMO CODES ──
  const promoExist = await supabaseAdmin.from("promo_codes").select("id").limit(1).single();
  if (!promoExist.data) {
    await supabaseAdmin.from("promo_codes").insert([
      { code: "WELCOME20", discount_type: "percentage", discount_value: 20, max_discount: 500, min_order_value: 1000, description: "20% off on first booking", applicable_modules: ["booking"], is_active: true },
      { code: "FLAT100", discount_type: "flat", discount_value: 100, min_order_value: 500, description: "₹100 off on orders above ₹500", applicable_modules: ["product_order", "store_order"], is_active: true },
    ]);
  }

  // ── 19. FEATURE FLAGS ──
  const flagsExist = await supabaseAdmin.from("feature_flags").select("id").limit(1).single();
  if (!flagsExist.data) {
    await supabaseAdmin.from("feature_flags").insert([
      { name: "store_recommendations", description: "Show nearby store suggestions for out-of-stock products", is_enabled: true },
      { name: "wallet_payments", description: "Enable wallet-based payments across modules", is_enabled: true },
      { name: "discharge_care", description: "Hospital discharge-to-homecare coordination", is_enabled: true },
      { name: "product_recommendations", description: "Show product suggestions based on patient condition", is_enabled: true },
    ]);
  }

  return new Response(JSON.stringify({ success: true, message: "Demo data seeded successfully" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
