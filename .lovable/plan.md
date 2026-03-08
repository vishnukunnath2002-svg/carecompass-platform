

## Plan: Agency Services, Razorpay Payments, Ratings, Landing Page Reorder, and Location-Based Pharmacies

This is a large set of interconnected features. Here's the implementation plan broken into phases.

---

### 1. Database Changes (Migration)

Create a new `agency_services` table for agency-created services:

```sql
CREATE TABLE agency_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL, -- nurse, caregiver, etc.
  price_hourly NUMERIC,
  price_daily NUMERIC,
  price_weekly NUMERIC,
  conditions_served TEXT[], -- cardiac, post-surgery, etc.
  equipment_suggestions UUID[], -- product IDs for cross-sell
  assigned_staff UUID[], -- caregiver_profile IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agency_services ENABLE ROW LEVEL SECURITY;

-- Agency owners manage their own services
CREATE POLICY "Agency manage own services" ON agency_services FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = agency_services.tenant_id AND tenants.owner_user_id = auth.uid()));

-- Public can view active services
CREATE POLICY "Public view active services" ON agency_services FOR SELECT TO anon, authenticated
USING (is_active = true);

ALTER PUBLICATION supabase_realtime ADD TABLE agency_services;
```

Also add a `service_id` column to the `bookings` table:

```sql
ALTER TABLE bookings ADD COLUMN agency_service_id UUID REFERENCES agency_services(id);
```

---

### 2. Razorpay Integration (Test Mode)

- **Secret**: Store Razorpay test key as a secret (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- **Edge Function** `create-razorpay-order`: Creates a Razorpay order using the API, returns `order_id` to the frontend.
- **Frontend**: Load Razorpay checkout.js script, open the Razorpay modal with the order ID. On success, verify payment.
- **Integration Points**:
  - Registration plan purchase (PlanSelector): After selecting a plan, user pays via Razorpay before proceeding.
  - Booking payment: Replace `PaymentSimulation` with real Razorpay flow.

---

### 3. Agency Service Catalogue (CRUD)

Update `src/pages/agency/ServiceCatalogue.tsx`:
- Add "Create Service" dialog with fields: name, description, service_type, hourly/daily/weekly rates, conditions_served, equipment_suggestions (product picker), assigned staff (from agency's caregiver_profiles).
- List services with edit/delete capability.
- Filter by active/inactive status.

---

### 4. Landing Page Changes

**Reorder sections in `src/pages/Index.tsx`**:
- Move `BrowseServicesSection`, `ShopProductsSection`, `NearbyPharmaciesSection` ABOVE the "One Platform, Three Powerful Modules" section (currently lines 218-224 go before line 156).

**Update `BrowseServicesSection`** to fetch from `agency_services` instead of (or in addition to) `caregiver_profiles`, showing agency-created services with pricing and booking links.

**Add search/filter** to each Browse section:
- Services: search by name, condition, type; filter by service_type.
- Products: search by name, brand; filter by category.
- Pharmacies: search by name; sort by distance using geolocation.

---

### 5. Location-Based Nearby Pharmacies

- Use browser `navigator.geolocation.getCurrentPosition()` to get user's lat/lng.
- Query `medical_store_profiles` and calculate distance using the Haversine formula in JS (stores already have `lat`/`lng` columns).
- Sort pharmacies by distance, display distance badge on each card.
- Apply same logic in `NearbyStores` patient page.

---

### 6. Booking with Equipment Suggestions

Update `CreateBooking.tsx`:
- When a patient books an `agency_service`, fetch its `equipment_suggestions` (product IDs) and `conditions_served`.
- Show recommended equipment during booking (not just after confirmation) based on the service's linked products.
- Keep the existing condition-based recommendation as fallback.

---

### 7. Post-Service Rating & Reviews

- After a booking reaches `completed` status, show a "Rate this service" prompt in `MyBookings`.
- Create a review form (rating 1-5, title, comment) that inserts into the `reviews` table with `target_type = 'agency_service'` and `target_id = agency_service_id`.
- Display aggregated ratings on agency services in the catalogue and landing page.
- Update `AgencyReviews` to show service-level reviews alongside agency reviews.

---

### Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Create `agency_services` table, add `agency_service_id` to bookings |
| `supabase/functions/create-razorpay-order/index.ts` | New edge function for Razorpay order creation |
| `src/pages/agency/ServiceCatalogue.tsx` | Full CRUD for agency services with staff assignment |
| `src/pages/Index.tsx` | Reorder sections, add search/filter to browse sections |
| `src/components/landing/BrowseSections.tsx` | Fetch agency_services, add search, add geolocation for pharmacies |
| `src/components/registration/PlanSelector.tsx` | Add Razorpay payment flow after plan selection |
| `src/pages/register/AgencyRegistration.tsx` | Integrate Razorpay payment step |
| `src/components/care/PaymentSimulation.tsx` | Replace with Razorpay or keep as fallback |
| `src/pages/patient/CreateBooking.tsx` | Support booking agency_services with equipment suggestions |
| `src/pages/patient/MyBookings.tsx` | Add post-service review prompt |
| `src/pages/patient/FindCare.tsx` | Add agency_services listing with search/filter |
| `src/pages/patient/NearbyStores.tsx` | Add geolocation-based sorting |
| `src/pages/agency/AgencyReviews.tsx` | Show service-level reviews |
| `index.html` | Add Razorpay checkout.js script tag |

---

### Razorpay Secrets Needed

Before implementation, I'll need you to provide:
- **Razorpay Test Key ID** (starts with `rzp_test_`)
- **Razorpay Test Key Secret**

These will be stored securely and used only in backend functions.

