

## Plan: Agency Discovery, Service Request & Review Flow

### Overview
Add a new landing page section listing all active agency tenants in visually rich cards. Clicking a card opens a detailed agency profile dialog. Patients can submit a service request to the agency. Agencies see incoming requests in a new "Service Requests" section and can confirm/reject them. After service completion, patients can review and rate the agency.

### 1. Database Changes (Migration)

**New table: `service_requests`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| patient_id | uuid NOT NULL | references auth.users |
| tenant_id | uuid NOT NULL | the agency tenant |
| patient_name | text NOT NULL | |
| patient_phone | text | |
| service_type | text NOT NULL | e.g. nurse, caregiver |
| description | text NOT NULL | patient's needs |
| preferred_start_date | date | |
| preferred_shift | text | morning/evening/night/24hr |
| patient_condition | text | |
| status | text DEFAULT 'pending' | pending → accepted → completed → rejected |
| agency_notes | text | agency response notes |
| created_at | timestamptz DEFAULT now() |
| updated_at | timestamptz DEFAULT now() |

**RLS policies:**
- Patients INSERT own requests (`auth.uid() = patient_id`)
- Patients SELECT own requests
- Agency owners SELECT/UPDATE requests for their tenant
- Admins ALL

**Also:** Add `updated_at` trigger on `service_requests`.

### 2. Landing Page — "Browse Agencies" Section

New component `BrowseAgenciesSection` in `BrowseSections.tsx`:
- Fetch active agency tenants: `tenants` where `type = 'agency'` and `status = 'active'`, joined with their `agency_services` count and average `reviews` rating
- Display in futuristic gradient cards (glass-morphism style) showing: agency name, brand_name, city/state, services count, average rating, verified badge
- Add to `Index.tsx` above "Browse Care Services"

### 3. Agency Profile Dialog

New component `AgencyProfileDialog.tsx`:
- Fetch full tenant details: name, brand_name, contact info, city, website, logo
- Fetch agency's services from `agency_services`
- Fetch reviews targeting this tenant (`reviews` where `target_type = 'agency'` and `target_id = tenant_id`)
- Display: header with logo/name, description, location, services list, reviews section, rating summary
- "Request Service" button (auth-gated — redirects to login if not authenticated)

### 4. Service Request Form

Inside `AgencyProfileDialog` or as a separate dialog:
- Form fields: service type needed (dropdown from agency's services), description of needs, patient condition, preferred start date, preferred shift type, contact phone
- On submit: insert into `service_requests` with `patient_id = auth.uid()`, `tenant_id = agency.id`
- Toast confirmation

### 5. Agency Portal — Service Requests Page

New page `src/pages/agency/ServiceRequests.tsx`:
- Fetch `service_requests` where `tenant_id` matches the agency's tenant
- Display as a table/card list: patient name, service type, description, date, status
- Actions: "Accept" (sets status to accepted, optionally creates a booking), "Reject" (sets status to rejected with notes)
- Add nav item to `AgencyPortal.tsx`

### 6. Post-Service Review

- Leverage existing `reviews` table with `target_type = 'agency'` and `target_id = tenant_id`
- After a service request is marked "completed", patient sees a "Rate Agency" prompt in their requests list or notifications
- New page/section `src/pages/patient/MyServiceRequests.tsx` showing patient's requests with status and review option
- Add route and nav link to patient portal

### 7. File Changes Summary

| File | Action |
|------|--------|
| Migration SQL | CREATE `service_requests` table + RLS + trigger |
| `src/components/landing/BrowseSections.tsx` | Add `BrowseAgenciesSection` |
| `src/pages/Index.tsx` | Import and render `BrowseAgenciesSection` |
| `src/components/care/AgencyProfileDialog.tsx` | New — full agency profile + request form |
| `src/pages/agency/ServiceRequests.tsx` | New — agency view of incoming requests |
| `src/pages/agency/AgencyPortal.tsx` | Add "Service Requests" nav item |
| `src/pages/patient/MyServiceRequests.tsx` | New — patient's requests + review |
| `src/App.tsx` | Add routes for new pages |

