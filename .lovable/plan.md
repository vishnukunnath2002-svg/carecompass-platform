

# CYLO Healthcare Marketplace Platform — Implementation Plan

## Overview
A multi-tenant healthcare marketplace with 3 interconnected modules (Homecare Manpower, Medical E-Commerce, Medical Store Connect), 8 web portals, role-based auth, and admin configurability. Built as a responsive SaaS-style web app with Lovable Cloud (Supabase) backend.

---

## Phase 1: Foundation & Public Website

### 1.1 Public Landing Website
- Hero section with platform overview and 3-module explanation
- "Browse Providers" section with sample cards (nurses, caregivers, etc.)
- "Browse Products" section with medical product cards
- "Nearby Stores" section
- Registration entry points for all 5 business types + patients
- Login page with **demo account quick-login tiles** (Super Admin, Agency, Nurse, Vendor, Store, Hospital, Customer)
- About & Contact pages
- Clean, white-mode, futuristic SaaS design with soft shadows, rounded cards, elegant spacing

### 1.2 Authentication & Role System
- Email/password login with Supabase Auth
- Role-based routing (Super Admin → admin dashboard, Patient → patient portal, etc.)
- Demo accounts seeded with realistic data and one-click login cards
- Forgot/reset password flow
- User roles table with proper RLS security (not on profiles table)
- Account approval states for business portals (pending → approved → active)

### 1.3 Database Schema (Lovable Cloud)
Core tables including: tenants, users, user_roles, profiles (patient, caregiver, agency, vendor, store, hospital), addresses, service_categories, specialization_tags, bookings, products, orders, store_orders, prescriptions, wallet_transactions, notifications, platform_config, feature_flags, commission_rules, reviews, disputes, audit_logs — all with tenant_id scoping where applicable and RLS policies.

### 1.4 Multi-Step Registration Forms
All 6 registration flows with validation:
- **Patient/Family**: Account → Patient Profile → Address → Family Sharing
- **Homecare Agency**: Business Identity → Service Profile → Compliance Docs → Tenant Setup
- **Individual Provider**: Choose Type → Personal → Professional → Verification Upload → Work Setup
- **Medical Vendor**: Company → Compliance → Payout → Go Live
- **Medical Store**: Store Profile → Documents → Operations → Inventory Starter
- **Hospital**: Institution → Account Type → Commercial Setup

---

## Phase 2: All Portal Dashboards & Navigation

### 2.1 Super Admin Portal
- Full sidebar dashboard with: Tenants, Users, Onboarding Queue, Service Config, Categories & Tags, Commission Rules, Feature Flags, Promo Codes, Bookings Monitor, Orders Monitor, Store Orders, Disputes, Payouts, Analytics, Content Manager, Notification Templates
- Create/edit/suspend tenants
- Approve/reject business registrations
- Configure module visibility per tenant
- Sub-roles: Super Admin, Admin Manager, Verification Officer, Finance Admin, Support Agent, Content Manager

### 2.2 Patient/Family Portal
- Dashboard with active bookings, orders, store orders
- Patient profile management (multiple patients per account)
- Provider search & booking flow with filters (specialization, gender, language, rating, price)
- Product browsing & cart/checkout
- Nearby store discovery & medicine ordering
- Health record view, wallet, notifications, invoices, reviews

### 2.3 Homecare Agency Portal
- Agency dashboard with KPIs
- Staff/caregiver onboarding & management
- Verification tracking
- Service catalogue & pricing
- Booking management & scheduling calendar
- Customer management, health logs, payouts, reports

### 2.4 Individual Provider Portal
- Profile & skills management
- Document upload & verification status
- Availability calendar
- Booking inbox (accept/reject)
- Vitals logging & service notes
- Earnings & payout history

### 2.5 Vendor Portal
- Company profile & catalogue management
- Inventory & pricing controls
- Order management & dispatch
- RFQ participation
- Returns/disputes handling
- Payout reports & analytics

### 2.6 Medical Store Portal
- Store profile with catchment area & operating hours
- Inventory management
- Prescription validation workflow
- Order accept/reject/dispatch flow
- Analytics & payouts

### 2.7 Hospital Portal
- Institutional dashboard
- Bulk product ordering
- RFQ submission & quote comparison
- PO generation & order history
- Discharge caregiver booking
- Invoice downloads

---

## Phase 3: Core Workflows (End-to-End)

### 3.1 Care Booking Flow
Patient searches → filters by specialization → views provider profile → configures booking (schedule, patient condition, address) → payment simulation → booking confirmed → provider sees & accepts → status updates → vitals logging → completion → invoice → review

### 3.2 Product Purchase Flow
Browse → product detail → add to cart → checkout → order confirmed → vendor fulfills → shipment tracking → delivery → return/dispute option

### 3.3 Medical Store Order Flow
Discover nearby stores → store detail → add items → prescription upload if needed → checkout → store accepts → dispatch → delivery → review

### 3.4 Cross-Module Connections
- Booking confirmation shows product recommendations based on patient condition
- Out-of-stock products suggest nearby verified stores (admin-toggleable)
- Uploaded prescriptions stored in patient health record
- Shared wallet across all modules
- Shared notification center

---

## Phase 4: Seed Data & Demo Experience

### Demo Tenants & Data
- **CYLO Main Agency** with 5 caregivers/nurses on roster
- **HealthFirst Agency** (second agency)
- **Nurse Priya** (independent specialized nurse)
- **BabyCare Anita** (independent baby care provider)
- **MedSupply India** (medical vendor with 20+ products)
- **Apollo Pharmacy - Kochi** (medical store with inventory)
- **City Hospital** (hospital account)
- **3 Patient/Family accounts** with booking and order history
- Active bookings, orders, store orders, reviews, disputes, notifications, invoices, and wallet transactions

---

## Design Direction
- White-mode, minimal, futuristic SaaS aesthetic
- Shadcn UI components with soft shadows, rounded cards, clean typography
- Responsive across desktop, tablet, and mobile
- Sidebar navigation for all portals
- Professional healthcare-tech color palette
- Polished auth page with demo login tiles as colored cards

