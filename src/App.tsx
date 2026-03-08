import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RegisterSelect from "./pages/register/RegisterSelect";
import PatientRegistration from "./pages/register/PatientRegistration";
import AgencyRegistration from "./pages/register/AgencyRegistration";
import ProviderRegistration from "./pages/register/ProviderRegistration";
import VendorRegistration from "./pages/register/VendorRegistration";
import StoreRegistration from "./pages/register/StoreRegistration";
import HospitalRegistration from "./pages/register/HospitalRegistration";
import AdminPortal from "./pages/admin/AdminPortal";
import PatientPortal from "./pages/patient/PatientPortal";
import AgencyPortal from "./pages/agency/AgencyPortal";
import ProviderPortal from "./pages/provider/ProviderPortal";
import VendorPortal from "./pages/vendor/VendorPortal";
import StorePortal from "./pages/store/StorePortal";
import HospitalPortal from "./pages/hospital/HospitalPortal";
import PlaceholderPage from "./pages/shared/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Registration */}
            <Route path="/register" element={<RegisterSelect />} />
            <Route path="/register/patient" element={<PatientRegistration />} />
            <Route path="/register/agency" element={<AgencyRegistration />} />
            <Route path="/register/provider" element={<ProviderRegistration />} />
            <Route path="/register/vendor" element={<VendorRegistration />} />
            <Route path="/register/store" element={<StoreRegistration />} />
            <Route path="/register/hospital" element={<HospitalRegistration />} />

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminPortal />}>
              <Route path="tenants" element={<PlaceholderPage title="Tenant Management" />} />
              <Route path="users" element={<PlaceholderPage title="User Management" />} />
              <Route path="onboarding" element={<PlaceholderPage title="Onboarding Queue" />} />
              <Route path="categories" element={<PlaceholderPage title="Categories & Tags" />} />
              <Route path="features" element={<PlaceholderPage title="Feature Flags" />} />
              <Route path="commissions" element={<PlaceholderPage title="Commission Rules" />} />
              <Route path="promos" element={<PlaceholderPage title="Promo Codes" />} />
              <Route path="bookings" element={<PlaceholderPage title="Bookings Monitor" />} />
              <Route path="orders" element={<PlaceholderPage title="Product Orders" />} />
              <Route path="store-orders" element={<PlaceholderPage title="Store Orders" />} />
              <Route path="disputes" element={<PlaceholderPage title="Disputes" />} />
              <Route path="payouts" element={<PlaceholderPage title="Payouts" />} />
              <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
              <Route path="content" element={<PlaceholderPage title="Content Manager" />} />
              <Route path="notifications" element={<PlaceholderPage title="Notification Templates" />} />
            </Route>

            {/* Patient Portal */}
            <Route path="/patient" element={<PatientPortal />}>
              <Route path="find-care" element={<PlaceholderPage title="Find Care" />} />
              <Route path="bookings" element={<PlaceholderPage title="My Bookings" />} />
              <Route path="shop" element={<PlaceholderPage title="Shop Products" />} />
              <Route path="stores" element={<PlaceholderPage title="Nearby Stores" />} />
              <Route path="health" element={<PlaceholderPage title="Health Records" />} />
              <Route path="profiles" element={<PlaceholderPage title="Patient Profiles" />} />
              <Route path="wallet" element={<PlaceholderPage title="Wallet" />} />
              <Route path="invoices" element={<PlaceholderPage title="Invoices" />} />
              <Route path="reviews" element={<PlaceholderPage title="Reviews" />} />
              <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
              <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
            </Route>

            {/* Agency Portal */}
            <Route path="/agency" element={<AgencyPortal />}>
              <Route path="staff" element={<PlaceholderPage title="Staff Management" />} />
              <Route path="onboarding" element={<PlaceholderPage title="Staff Onboarding" />} />
              <Route path="verification" element={<PlaceholderPage title="Verification Tracking" />} />
              <Route path="bookings" element={<PlaceholderPage title="Booking Management" />} />
              <Route path="services" element={<PlaceholderPage title="Service Catalogue" />} />
              <Route path="pricing" element={<PlaceholderPage title="Pricing Management" />} />
              <Route path="health-logs" element={<PlaceholderPage title="Health Logs" />} />
              <Route path="reviews" element={<PlaceholderPage title="Reviews" />} />
              <Route path="payouts" element={<PlaceholderPage title="Payouts" />} />
              <Route path="reports" element={<PlaceholderPage title="Reports" />} />
              <Route path="settings" element={<PlaceholderPage title="Agency Settings" />} />
            </Route>

            {/* Provider Portal */}
            <Route path="/provider" element={<ProviderPortal />}>
              <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
              <Route path="documents" element={<PlaceholderPage title="Documents" />} />
              <Route path="verification" element={<PlaceholderPage title="Verification Status" />} />
              <Route path="availability" element={<PlaceholderPage title="Availability" />} />
              <Route path="bookings" element={<PlaceholderPage title="My Bookings" />} />
              <Route path="vitals" element={<PlaceholderPage title="Vitals & Notes" />} />
              <Route path="training" element={<PlaceholderPage title="Training" />} />
              <Route path="earnings" element={<PlaceholderPage title="Earnings" />} />
              <Route path="reviews" element={<PlaceholderPage title="Reviews" />} />
            </Route>

            {/* Vendor Portal */}
            <Route path="/vendor" element={<VendorPortal />}>
              <Route path="catalogue" element={<PlaceholderPage title="Product Catalogue" />} />
              <Route path="inventory" element={<PlaceholderPage title="Inventory" />} />
              <Route path="pricing" element={<PlaceholderPage title="Pricing" />} />
              <Route path="orders" element={<PlaceholderPage title="Orders" />} />
              <Route path="dispatch" element={<PlaceholderPage title="Dispatch" />} />
              <Route path="returns" element={<PlaceholderPage title="Returns & Disputes" />} />
              <Route path="rfq" element={<PlaceholderPage title="RFQ" />} />
              <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
              <Route path="payouts" element={<PlaceholderPage title="Payouts" />} />
              <Route path="settings" element={<PlaceholderPage title="Vendor Settings" />} />
            </Route>

            {/* Store Portal */}
            <Route path="/store" element={<StorePortal />}>
              <Route path="profile" element={<PlaceholderPage title="Store Profile" />} />
              <Route path="catchment" element={<PlaceholderPage title="Catchment Area" />} />
              <Route path="inventory" element={<PlaceholderPage title="Inventory" />} />
              <Route path="hours" element={<PlaceholderPage title="Operating Hours" />} />
              <Route path="prescriptions" element={<PlaceholderPage title="Prescriptions" />} />
              <Route path="orders" element={<PlaceholderPage title="Orders" />} />
              <Route path="dispatch" element={<PlaceholderPage title="Dispatch" />} />
              <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
              <Route path="payouts" element={<PlaceholderPage title="Payouts" />} />
              <Route path="settings" element={<PlaceholderPage title="Store Settings" />} />
            </Route>

            {/* Hospital Portal */}
            <Route path="/hospital" element={<HospitalPortal />}>
              <Route path="orders" element={<PlaceholderPage title="Bulk Orders" />} />
              <Route path="rfq" element={<PlaceholderPage title="RFQ Submission" />} />
              <Route path="quotes" element={<PlaceholderPage title="Quote Comparison" />} />
              <Route path="po" element={<PlaceholderPage title="Purchase Orders" />} />
              <Route path="discharge" element={<PlaceholderPage title="Discharge Care" />} />
              <Route path="invoices" element={<PlaceholderPage title="Invoices" />} />
              <Route path="users" element={<PlaceholderPage title="User Management" />} />
              <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
