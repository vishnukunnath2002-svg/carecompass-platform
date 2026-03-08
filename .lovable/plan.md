

## Plan: Provider Registration & Documents Improvements

### Changes Summary

**7 items to address:**

1. **Remove subscription plan step** from provider registration (step 0)
2. **Add "Other" provider type** option
3. **Languages → multi-select dropdown** with a static list of major Indian languages (no external API needed — avoids API key complexity)
4. **Pincode auto-fill** for city/state across all registration forms (India Post API: `https://api.postalpincode.in/pincode/{pincode}` — free, no key needed)
5. **Preferred job locations → multi-select dropdown** with major Indian cities
6. **Remove "Police Verification Certificate No." field**; add **Confirm Password** field
7. **Documents page → functional file upload** using storage bucket + real DB records

---

### 1. Provider Registration (`src/pages/register/ProviderRegistration.tsx`)

- Remove step 0 ("Choose Plan") and `PlanSelector`. Pass `planId: null` to provision-tenant.
- Steps become: Provider Type → Personal Details → Professional Details → Verification → Work Setup (5 steps).
- Add `{ value: 'other', label: 'Other' }` to `providerTypes` array.
- Replace languages text input with a multi-select dropdown (checkboxes in a popover) containing: English, Hindi, Malayalam, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, Urdu, Odia, Assamese.
- Replace "Preferred Working Areas" text input with a multi-select dropdown of major Indian cities.
- Add `confirmPassword` field next to password; validate match before proceeding.
- Remove `policeVerification` field from step 3 (Verification).

### 2. Pincode Auto-Fill Hook (`src/hooks/usePincodeAutoFill.ts`)

New reusable hook:
```
function usePincodeAutoFill(pincode: string) → { city, state, district, loading }
```
- Calls `https://api.postalpincode.in/pincode/${pincode}` when pincode is 6 digits.
- Returns city (from `Block` or `Division`), state, district.
- Debounced to avoid excessive calls.

### 3. Apply Pincode Auto-Fill to All Registration Forms

Update these files to use the hook, auto-populating city/state on pincode entry:
- `ProviderRegistration.tsx`
- `AgencyRegistration.tsx`
- `PatientRegistration.tsx`
- `HospitalRegistration.tsx`
- `StoreRegistration.tsx`

### 4. Multi-Select Component (`src/components/ui/multi-select.tsx`)

A reusable multi-select dropdown component (popover with checkboxes) used for languages and preferred locations.

### 5. Documents Upload (`src/pages/provider/ProviderDocuments.tsx`)

- Create a `provider-documents` storage bucket (public: false) via migration.
- Rewrite `ProviderDocuments` to:
  - Fetch existing documents from `caregiver_profiles.documents` JSONB field (already exists).
  - Allow file upload via `<input type="file">` → upload to `provider-documents/{user_id}/{doc_type}`.
  - Update `caregiver_profiles.documents` with the file URL and status.
  - Show upload status per document type (uploaded/pending/not_uploaded).
- Add RLS policy on storage bucket for authenticated users to manage their own files.

### 6. Database Migration

```sql
-- Create storage bucket for provider documents
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-documents', 'provider-documents', false);

-- RLS: users upload/read own files
CREATE POLICY "Users manage own provider docs"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'provider-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'provider-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 7. Files Changed

| File | Action |
|------|--------|
| `src/hooks/usePincodeAutoFill.ts` | Create — reusable pincode→city/state hook |
| `src/components/ui/multi-select.tsx` | Create — multi-select dropdown component |
| `src/pages/register/ProviderRegistration.tsx` | Edit — remove plan step, add Other type, multi-selects, confirm password, remove police verification |
| `src/pages/register/AgencyRegistration.tsx` | Edit — add pincode auto-fill |
| `src/pages/register/PatientRegistration.tsx` | Edit — add pincode auto-fill |
| `src/pages/register/HospitalRegistration.tsx` | Edit — add pincode auto-fill |
| `src/pages/register/StoreRegistration.tsx` | Edit — add pincode auto-fill |
| `src/pages/provider/ProviderDocuments.tsx` | Rewrite — real file upload with storage |
| Migration SQL | Create storage bucket + RLS |

