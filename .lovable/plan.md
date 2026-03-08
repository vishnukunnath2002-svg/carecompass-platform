

## Plan: Registration Guide Tour, Plan-Based Tenant Provisioning, Admin Tenant CRUD & Subscription Tracking

### Important Constraint: Database Separation

You requested super admin data in a separate database from tenant data. With a single backend instance, **physical database separation is not possible**. Instead, we will implement **logical separation** using:
- RLS policies that already isolate tenant data per `tenant_id`
- Super admin tables (like `platform_config`, `audit_logs`, `subscription_plans`) are already admin-only
- All tenant-scoped tables already filter by `tenant_id`

This achieves the same data isolation goal within our architecture.

---

### 1. Guided Feature Tour on Registration Pages

**What**: Before the registration form begins, show an interactive feature showcase specific to each role (Agency, Provider, Vendor, Store). Each slide highlights what the platform offers them.

**Files to create/edit**:
- Create `src/components/registration/FeatureTour.tsx` -- A carousel/stepper component with role-specific slides:
  - **Agency**: Module 1 (Manpower booking, staff management, reviews), Module 2 (Equipment procurement), Module 3 (Pharmacy partnerships)
  - **Provider/Nurse**: Profile visibility, booking management, earnings, verification badges
  - **Vendor**: Product catalogue, order management, hospital RFQs, analytics
  - **Store**: Inventory management, prescription fulfillment, catchment delivery, agency partnerships
- Each tour ends with a "Get Started" CTA that transitions to the registration form
- Edit all 4 registration pages (`AgencyRegistration.tsx`, `ProviderRegistration.tsx`, `VendorRegistration.tsx`, `StoreRegistration.tsx`) to show tour before form

---

### 2. Subscription Plan Selection Step in Registration

**What**: Add a new step to Agency, Vendor, Store, and Provider registration flows where users pick a subscription plan before completing registration.

**Changes**:
- Create `src/components/registration/PlanSelector.tsx` -- Fetches active `subscription_plans` and displays cards with pricing, features, trial badge. User selects one.
- Add a "Choose Plan" step to each registration `steps` array (inserted after Tour, before form step 1)
- Store selected `plan_id` in form state, passed along during submission

---

### 3. Auto-Tenant Creation on Registration Submit

**What**: When a non-patient user submits registration with a selected plan, automatically create a tenant and subscription.

**DB migration**:
```sql
-- Add domain_slug to tenants for unique tenant URLs
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain_slug text UNIQUE;
```

**Implementation**:
- Create edge function `supabase/functions/provision-tenant/index.ts`:
  - Accepts: `user_id`, `plan_id`, `tenant_name`, `tenant_type`, `domain_slug`, `form_data`
  - Creates `tenants` row with `domain_slug`, `owner_user_id`, `modules_enabled` from plan's `modules_included`
  - Creates `tenant_subscriptions` row with plan, calculates `expires_at` based on plan billing
  - Creates `user_roles` row for the owner
  - Returns tenant details
- Update each registration page's `handleSubmit` to call this edge function after `signUp`

---

### 4. Enhanced Admin Tenant Management (Full CRUD)

**What**: Upgrade `TenantsPage.tsx` so super admin can:
- **View** all tenants with subscription status, plan name, expiry date
- **Create** a tenant manually (with form: name, type, domain_slug, owner email/password, plan assignment)
- **Edit** tenant details and status (activate/suspend)
- **Track subscriptions**: Show plan name, start date, expiry, status (active/trial/expired)
- **Expire subscriptions**: Button to manually expire or extend a tenant's subscription

**Files**:
- Rewrite `src/pages/admin/TenantsPage.tsx` with:
  - Expanded table columns: Plan, Subscription Status, Expires At, Modules
  - "Create Tenant" dialog with manual user creation via edge function
  - "Edit" and "Manage Subscription" actions per row
  - Status toggle (active/suspended) and subscription extend/expire buttons
- The "Create Tenant" flow calls the same `provision-tenant` edge function with admin-provided credentials

---

### 5. Tenant-Scoped Login & Domain Routing

**What**: After registration, tenants access their portal via `/t/<domain_slug>` routes. The login page at `/auth` detects the user's tenant and redirects accordingly.

**Implementation**:
- Add route `/t/:slug` in `App.tsx` that loads tenant context and renders the appropriate portal
- On login, the existing `getRedirectPath` function already routes by role -- extend it to include `/t/<slug>` prefix when tenant has a `domain_slug`
- Store `tenant_slug` in auth context for portal components to consume

---

### 6. Subscription Expiry Tracking

**What**: Add expiry logic so the platform respects subscription validity.

**Implementation**:
- Create `src/hooks/useTenantSubscription.ts` -- Hook that fetches current tenant's subscription status and checks if expired
- In portal layouts, check subscription status; if expired, show a banner: "Your subscription has expired. Contact admin to renew."
- Admin dashboard shows expired/expiring-soon tenants in a summary card

---

### Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/registration/FeatureTour.tsx` | Role-specific feature showcase carousel |
| Create | `src/components/registration/PlanSelector.tsx` | Plan selection cards during registration |
| Create | `supabase/functions/provision-tenant/index.ts` | Auto-create tenant + subscription + roles |
| Create | `src/hooks/useTenantSubscription.ts` | Subscription status hook with expiry check |
| Rewrite | `src/pages/admin/TenantsPage.tsx` | Full CRUD with subscription tracking |
| Edit | `src/pages/register/AgencyRegistration.tsx` | Add tour + plan selection steps |
| Edit | `src/pages/register/ProviderRegistration.tsx` | Add tour + plan selection steps |
| Edit | `src/pages/register/VendorRegistration.tsx` | Add tour + plan selection steps |
| Edit | `src/pages/register/StoreRegistration.tsx` | Add tour + plan selection steps |
| Edit | `src/App.tsx` | Add `/t/:slug` tenant routes |
| Edit | `src/contexts/AuthContext.tsx` | Add tenant slug to context |
| Migration | `supabase/migrations/` | Add `domain_slug` column |

### Execution Order

1. DB migration (add `domain_slug`)
2. Feature tour component + plan selector component
3. Update all 4 registration pages with tour + plan step
4. Create `provision-tenant` edge function
5. Wire registration submit to provision-tenant
6. Rewrite admin TenantsPage with full CRUD + subscription tracking
7. Add tenant-scoped routing and subscription expiry hooks

