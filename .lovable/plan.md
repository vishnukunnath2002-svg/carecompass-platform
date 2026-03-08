

## Plan: Modular Subscription System, Agency Feature Portals, E-Commerce Landing Page & Cross-Module Referrals

This is a large, multi-faceted request. Here is the plan broken into clear work areas.

---

### 1. Admin: Separate Modules & Subscription Plans Sections

**Current state**: `ModulesSubscriptions.tsx` combines both in one page.

**Changes**:
- Split into two distinct sections/pages: **Modules Management** (`/admin/modules`) and **Subscription Plans** (`/admin/plans`)
- Modules page: read-only cards describing the 3 core modules with stats
- Plans page: full CRUD table with the existing create/edit dialog
- In the plan creation dialog, replace single-module select with a **multi-select checkbox group** so admin can assign one or multiple modules to a plan (e.g., "All-in-One" plan includes all 3)
- Update `subscription_plans.module` column to support comma-separated or change to a `modules` JSONB array

**DB migration**: Rename `module` column to `modules` (text array) on `subscription_plans`, or add a `modules_included` JSONB column.

---

### 2. Auto Tenant Creation on Plan Purchase

**Changes**:
- Create a new page `/register/business-subscribe` (or enhance existing registration flows) where agencies/vendors select a plan
- On plan purchase/activation, automatically create a `tenants` row with `brand_name` as subdomain identifier, set `modules_enabled` from the plan's assigned modules
- Create `tenant_subscriptions` record linking tenant to plan
- The agency/vendor portal sidebar dynamically shows/hides nav items based on `modules_enabled` from their tenant record

---

### 3. Agency Portal: Module-Aware Feature Sections

**Current state**: Agency portal has static nav items for staff, bookings, reviews, etc.

**Changes based on modules**:

**Module 1 (Manpower Marketplace) features** -- already partially built:
- Bookings management with staff allocation (assign provider to booking)
- Staff tracking dashboard with verification status
- Reviews management
- These exist but need tenant-scoped data fetching improvements

**Module 2 (Medical E-Commerce) -- NEW for agencies**:
- New page: `/agency/equipment` -- Browse & purchase equipment from vendors
- Shows products listed by vendors, with cart & order flow
- New page: `/agency/inventory` -- Track purchased equipment
- Order history and shipment tracking

**Module 3 (Medical Store Connect) -- NEW for agencies**:
- New page: `/agency/partnerships` -- Create/manage pharmacy partnerships
- Browse nearby verified pharmacies, send partnership requests
- Partnership tracking table: status (pending/active/terminated), referral count, created date
- New page: `/agency/referrals` -- View patient-to-pharmacy referral history

**DB migration**:
- Create `pharmacy_partnerships` table: `id, agency_tenant_id, store_tenant_id, status, created_at, updated_at`
- Create `pharmacy_referrals` table: `id, partnership_id, booking_id, patient_id, agency_tenant_id, store_tenant_id, reason, created_at`
- RLS: agency can manage own partnerships/referrals, stores can view their partnerships

**Portal nav**: Conditionally render nav items based on `tenant.modules_enabled`

---

### 4. Cross-Module Suggestion Logic

**When a patient books via an agency**:
- Agency can suggest equipment based on patient condition (already partially built in `CreateBooking.tsx`)
- If equipment is out of stock AND agency has Module 3 unlocked, suggest partnered pharmacies
- Record this as a `pharmacy_referral` entry

**Implementation**:
- Update booking confirmation flow to check agency's `modules_enabled`
- Add referral recording logic when pharmacy is suggested

---

### 5. Landing Page: E-Commerce Style Browsing

**Current state**: Landing page has hero, service types, module descriptions, and CTA sections.

**Changes**:
- Add **"Browse Services"** section: query all agencies' service catalogues, show cards with agency name, service type, pricing, rating -- like Flipkart product listings
- Add **"Shop Medical Equipment"** section: query all active products, show grid with images, price, rating, add-to-cart
- Add **"Nearby Pharmacies"** section: list verified stores
- Each card links to detail/booking flow (requires login for actual booking)
- Search bar at top for unified search across services, products, and stores

**Files**: Update `src/pages/Index.tsx` with new sections that fetch from `caregiver_profiles`, `products`, and `medical_store_profiles`

---

### 6. Database Migrations Summary

```sql
-- 1. Update subscription_plans to support multiple modules
ALTER TABLE subscription_plans ADD COLUMN modules_included text[] DEFAULT '{}';
-- Migrate existing data
UPDATE subscription_plans SET modules_included = ARRAY[module];

-- 2. Pharmacy partnerships
CREATE TABLE pharmacy_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_tenant_id uuid NOT NULL,
  store_tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_tenant_id, store_tenant_id)
);
ALTER TABLE pharmacy_partnerships ENABLE ROW LEVEL SECURITY;

-- 3. Pharmacy referrals
CREATE TABLE pharmacy_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid REFERENCES pharmacy_partnerships(id),
  booking_id uuid,
  patient_user_id uuid,
  agency_tenant_id uuid NOT NULL,
  store_tenant_id uuid NOT NULL,
  reason text,
  status text DEFAULT 'referred',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pharmacy_referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for both tables
```

---

### 7. Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Rewrite | `src/pages/admin/ModulesSubscriptions.tsx` | Split into Modules + Plans sections, multi-module assignment |
| Create | `src/pages/agency/AgencyEquipment.tsx` | Browse & purchase vendor equipment |
| Create | `src/pages/agency/AgencyInventory.tsx` | Track purchased equipment |
| Create | `src/pages/agency/PharmacyPartnerships.tsx` | Manage pharmacy partnerships |
| Create | `src/pages/agency/PatientReferrals.tsx` | View referral history |
| Edit | `src/pages/agency/AgencyPortal.tsx` | Add conditional nav items based on modules_enabled |
| Edit | `src/pages/Index.tsx` | Add browsable services, products, pharmacies sections |
| Edit | `src/App.tsx` | Register new agency routes |
| Edit | `src/pages/patient/CreateBooking.tsx` | Cross-module pharmacy suggestion logic |
| Migration | `supabase/migrations/` | New tables + column additions |

---

### Execution Order

1. DB migration (new tables, column additions)
2. Admin Modules & Plans page split with multi-module support
3. Agency portal: conditional nav + Module 2 equipment pages
4. Agency portal: Module 3 partnership & referral pages
5. Cross-module referral logic in booking flow
6. Landing page e-commerce browsing sections

