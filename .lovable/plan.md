

## Phase 1: Remove Hospital Module

Remove all Hospital Portal references from the platform while keeping all other modules intact.

### Files to Edit

**1. `frontend/src/App.tsx`**
- Remove hospital imports (lines 17, 24, 117-125)
- Remove `/register/hospital` route (line 150)
- Remove `/hospital` route block (lines 253-263)
- Remove `/t/:slug/hospital/*` route block (lines 319-328)

**2. `frontend/src/pages/Auth.tsx`**
- Remove `Hospital` icon import (line 9)
- Remove Hospital demo account from `demoAccounts` array (line 20)
- Remove Hospital registration option from the register tab (line 143)

**3. `frontend/src/pages/register/RegisterSelect.tsx`**
- Remove `Hospital` icon import and the hospital registration type entry (line 12)

**4. `frontend/src/services/authService.ts`**
- Remove `hospital_admin`, `hospital_procurement`, `hospital_discharge`, `hospital_nursing` role-to-path mappings (lines 164-165)

**5. `frontend/src/components/registration/FeatureTour.tsx`**
- Remove the "Hospital RFQs" feature tour slide (lines 88-91)

**6. `frontend/src/pages/admin/ModulesPage.tsx`**
- Remove "Hospital procurement integration" from Module 2 features and update audience text to remove "& Hospitals" (lines 29-30)

**7. `frontend/src/pages/shared/SubscriptionRenewal.tsx`**
- Remove `hospital` from the portal redirect map (line 133)

### Files NOT Deleted (kept on disk, just unreferenced)
All files under `frontend/src/pages/hospital/` and `frontend/src/pages/register/HospitalRegistration.tsx` will remain on disk but won't be imported or routed anywhere.

### No database changes needed
Hospital tables (`hospital_rfqs`, `purchase_orders`, etc.) stay in the database — they just won't be accessible from the UI.

