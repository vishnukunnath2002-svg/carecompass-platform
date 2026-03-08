import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
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

// Patient pages
import FindCare from "./pages/patient/FindCare";
import MyBookings from "./pages/patient/MyBookings";
import CreateBooking from "./pages/patient/CreateBooking";
import ShopProducts from "./pages/patient/ShopProducts";
import NearbyStores from "./pages/patient/NearbyStores";
import HealthRecords from "./pages/patient/HealthRecords";
import PatientProfiles from "./pages/patient/PatientProfiles";
import WalletPage from "./pages/patient/WalletPage";
import InvoicesPage from "./pages/patient/InvoicesPage";
import ReviewsPage from "./pages/patient/ReviewsPage";
import NotificationsPage from "./pages/patient/NotificationsPage";
import MyProfile from "./pages/patient/MyProfile";
import CheckoutPage from "./pages/patient/CheckoutPage";
import MyOrders from "./pages/patient/MyOrders";

// Admin pages
import TenantsPage from "./pages/admin/TenantsPage";
import UsersPage from "./pages/admin/UsersPage";
import BookingsMonitor from "./pages/admin/BookingsMonitor";
import OnboardingQueue from "./pages/admin/OnboardingQueue";
import CategoriesPage from "./pages/admin/CategoriesPage";
import FeatureFlags from "./pages/admin/FeatureFlags";
import CommissionRules from "./pages/admin/CommissionRules";
import PromoCodes from "./pages/admin/PromoCodes";
import ProductOrders from "./pages/admin/ProductOrders";
import StoreOrdersAdmin from "./pages/admin/StoreOrdersAdmin";
import DisputesPage from "./pages/admin/DisputesPage";
import PayoutsPage from "./pages/admin/PayoutsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import ContentManager from "./pages/admin/ContentManager";
import NotificationTemplates from "./pages/admin/NotificationTemplates";
import ModulesPage from "./pages/admin/ModulesPage";
import SubscriptionPlansPage from "./pages/admin/SubscriptionPlansPage";

// Agency pages
import StaffManagement from "./pages/agency/StaffManagement";
import AgencyBookings from "./pages/agency/AgencyBookings";
import StaffOnboarding from "./pages/agency/StaffOnboarding";
import VerificationTracking from "./pages/agency/VerificationTracking";
import ServiceCatalogue from "./pages/agency/ServiceCatalogue";
import PricingManagement from "./pages/agency/PricingManagement";
import HealthLogs from "./pages/agency/HealthLogs";
import AgencyReviews from "./pages/agency/AgencyReviews";
import AgencyPayouts from "./pages/agency/AgencyPayouts";
import AgencyReports from "./pages/agency/AgencyReports";
import AgencySettings from "./pages/agency/AgencySettings";
import AgencyEquipment from "./pages/agency/AgencyEquipment";
import AgencyInventory from "./pages/agency/AgencyInventory";
import PharmacyPartnerships from "./pages/agency/PharmacyPartnerships";
import PatientReferrals from "./pages/agency/PatientReferrals";

// Provider pages
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderDocuments from "./pages/provider/ProviderDocuments";
import VerificationStatus from "./pages/provider/VerificationStatus";
import Availability from "./pages/provider/Availability";
import VitalsNotes from "./pages/provider/VitalsNotes";
import Training from "./pages/provider/Training";
import Earnings from "./pages/provider/Earnings";
import ProviderReviews from "./pages/provider/ProviderReviews";

// Vendor pages
import VendorCatalogue from "./pages/vendor/VendorCatalogue";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorInventory from "./pages/vendor/VendorInventory";
import VendorPricing from "./pages/vendor/VendorPricing";
import VendorDispatch from "./pages/vendor/VendorDispatch";
import VendorReturns from "./pages/vendor/VendorReturns";
import VendorRFQ from "./pages/vendor/VendorRFQ";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorPayouts from "./pages/vendor/VendorPayouts";
import VendorSettings from "./pages/vendor/VendorSettings";

// Store pages
import StoreInventoryPage from "./pages/store/StoreInventoryPage";
import StoreOrdersPage from "./pages/store/StoreOrdersPage";
import StoreProfile from "./pages/store/StoreProfile";
import CatchmentArea from "./pages/store/CatchmentArea";
import OperatingHours from "./pages/store/OperatingHours";
import StorePrescriptions from "./pages/store/StorePrescriptions";
import StoreDispatch from "./pages/store/StoreDispatch";
import StoreAnalytics from "./pages/store/StoreAnalytics";
import StorePayouts from "./pages/store/StorePayouts";
import StoreSettings from "./pages/store/StoreSettings";

// Hospital pages
import HospitalRFQ from "./pages/hospital/HospitalRFQ";
import HospitalPOs from "./pages/hospital/HospitalPOs";
import BulkOrders from "./pages/hospital/BulkOrders";
import QuoteComparison from "./pages/hospital/QuoteComparison";
import DischargeCare from "./pages/hospital/DischargeCare";
import HospitalInvoices from "./pages/hospital/HospitalInvoices";
import HospitalUsers from "./pages/hospital/HospitalUsers";
import HospitalAnalytics from "./pages/hospital/HospitalAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
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
              <Route path="modules" element={<ModulesPage />} />
              <Route path="plans" element={<SubscriptionPlansPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="onboarding" element={<OnboardingQueue />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="features" element={<FeatureFlags />} />
              <Route path="commissions" element={<CommissionRules />} />
              <Route path="promos" element={<PromoCodes />} />
              <Route path="bookings" element={<BookingsMonitor />} />
              <Route path="orders" element={<ProductOrders />} />
              <Route path="store-orders" element={<StoreOrdersAdmin />} />
              <Route path="disputes" element={<DisputesPage />} />
              <Route path="payouts" element={<PayoutsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="notifications" element={<NotificationTemplates />} />
            </Route>

            {/* Patient Portal */}
            <Route path="/patient" element={<PatientPortal />}>
              <Route path="find-care" element={<FindCare />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="book" element={<CreateBooking />} />
              <Route path="shop" element={<ShopProducts />} />
              <Route path="stores" element={<NearbyStores />} />
              <Route path="health" element={<HealthRecords />} />
              <Route path="profiles" element={<PatientProfiles />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<MyOrders />} />
            </Route>

            {/* Agency Portal */}
            <Route path="/agency" element={<AgencyPortal />}>
              <Route path="staff" element={<StaffManagement />} />
              <Route path="onboarding" element={<StaffOnboarding />} />
              <Route path="verification" element={<VerificationTracking />} />
              <Route path="bookings" element={<AgencyBookings />} />
              <Route path="services" element={<ServiceCatalogue />} />
              <Route path="pricing" element={<PricingManagement />} />
              <Route path="health-logs" element={<HealthLogs />} />
              <Route path="reviews" element={<AgencyReviews />} />
              <Route path="payouts" element={<AgencyPayouts />} />
              <Route path="reports" element={<AgencyReports />} />
              <Route path="settings" element={<AgencySettings />} />
            </Route>

            {/* Provider Portal */}
            <Route path="/provider" element={<ProviderPortal />}>
              <Route path="profile" element={<ProviderProfile />} />
              <Route path="documents" element={<ProviderDocuments />} />
              <Route path="verification" element={<VerificationStatus />} />
              <Route path="availability" element={<Availability />} />
              <Route path="bookings" element={<ProviderBookings />} />
              <Route path="vitals" element={<VitalsNotes />} />
              <Route path="training" element={<Training />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="reviews" element={<ProviderReviews />} />
            </Route>

            {/* Vendor Portal */}
            <Route path="/vendor" element={<VendorPortal />}>
              <Route path="catalogue" element={<VendorCatalogue />} />
              <Route path="inventory" element={<VendorInventory />} />
              <Route path="pricing" element={<VendorPricing />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="dispatch" element={<VendorDispatch />} />
              <Route path="returns" element={<VendorReturns />} />
              <Route path="rfq" element={<VendorRFQ />} />
              <Route path="analytics" element={<VendorAnalytics />} />
              <Route path="payouts" element={<VendorPayouts />} />
              <Route path="settings" element={<VendorSettings />} />
            </Route>

            {/* Store Portal */}
            <Route path="/store" element={<StorePortal />}>
              <Route path="profile" element={<StoreProfile />} />
              <Route path="catchment" element={<CatchmentArea />} />
              <Route path="inventory" element={<StoreInventoryPage />} />
              <Route path="hours" element={<OperatingHours />} />
              <Route path="prescriptions" element={<StorePrescriptions />} />
              <Route path="orders" element={<StoreOrdersPage />} />
              <Route path="dispatch" element={<StoreDispatch />} />
              <Route path="analytics" element={<StoreAnalytics />} />
              <Route path="payouts" element={<StorePayouts />} />
              <Route path="settings" element={<StoreSettings />} />
            </Route>

            {/* Hospital Portal */}
            <Route path="/hospital" element={<HospitalPortal />}>
              <Route path="orders" element={<BulkOrders />} />
              <Route path="rfq" element={<HospitalRFQ />} />
              <Route path="quotes" element={<QuoteComparison />} />
              <Route path="po" element={<HospitalPOs />} />
              <Route path="discharge" element={<DischargeCare />} />
              <Route path="invoices" element={<HospitalInvoices />} />
              <Route path="users" element={<HospitalUsers />} />
              <Route path="analytics" element={<HospitalAnalytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
