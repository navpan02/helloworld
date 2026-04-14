import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Layout      from './components/Layout';
import AdminRoute  from './components/AdminRoute';
import RequireAuth from './components/RequireAuth';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Landing          from './pages/Landing';
import CleanLawn        from './pages/CleanLawn';
import About            from './pages/About';
import Contact          from './pages/Contact';
import Blog             from './pages/Blog';
import Login            from './pages/Login';
import Signup           from './pages/Signup';
import Order            from './pages/Order';
import BuyNow           from './pages/BuyNow';
import Account          from './pages/Account';
import AdminDashboard   from './pages/AdminDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderSignup   from './pages/provider/ProviderSignup';
import FAQ              from './pages/FAQ';
import GetQuote         from './pages/GetQuote';
import QuoteThanks      from './pages/QuoteThanks';
import GrassGuide       from './pages/GrassGuide';
import HowItWorks       from './pages/HowItWorks';
import LawnDiagnosis    from './pages/LawnDiagnosis';
import ProviderLanding    from './pages/ProviderLanding';
import ServiceDiscovery  from './pages/ServiceDiscovery';
import ProviderProfile   from './pages/ProviderProfile';
import RoutePlanner      from './pages/RoutePlanner';
import RouteView         from './pages/RouteView';

// Service pages — NPLawn core
import Mowing           from './pages/services/Mowing';
import TreeTrimming     from './pages/services/TreeTrimming';
import TreeShrubs       from './pages/services/TreeShrubs';
import AerationSeeding  from './pages/services/AerationSeeding';
import LandscapeDesign  from './pages/services/LandscapeDesign';
import LawnCare         from './pages/services/LawnCare';

// CleanLawn homeowner portal pages
import HomeownerDashboard  from './pages/cleanlawn/homeowner/Dashboard';
import HomeownerProfile    from './pages/cleanlawn/homeowner/Profile';
import HomeownerProperties from './pages/cleanlawn/homeowner/Properties';
import Discover            from './pages/cleanlawn/homeowner/Discover';
import QuoteRequest        from './pages/cleanlawn/homeowner/QuoteRequest';
import Quotes              from './pages/cleanlawn/homeowner/Quotes';
import Jobs                from './pages/cleanlawn/homeowner/Jobs';
import Schedule            from './pages/cleanlawn/homeowner/Schedule';
import Messages            from './pages/cleanlawn/homeowner/Messages';
import Billing             from './pages/cleanlawn/homeowner/Billing';
import Payments            from './pages/cleanlawn/homeowner/Payments';
import Feedback            from './pages/cleanlawn/homeowner/Feedback';
import ProviderNotes       from './pages/cleanlawn/homeowner/ProviderNotes';
import ManagePlan          from './pages/cleanlawn/homeowner/ManagePlan';
import NotificationPrefs   from './pages/cleanlawn/homeowner/NotificationPrefs';
import Referral            from './pages/cleanlawn/homeowner/Referral';

// CleanLawn service pages
import HedgeTrimming    from './pages/cleanlawn/HedgeTrimming';
import LeafRemoval      from './pages/cleanlawn/LeafRemoval';
import SodInstallation  from './pages/cleanlawn/SodInstallation';
import Mulching         from './pages/cleanlawn/Mulching';
import BrushClearing    from './pages/cleanlawn/BrushClearing';
import StumpGrinding    from './pages/cleanlawn/StumpGrinding';
import SnowRemoval      from './pages/cleanlawn/SnowRemoval';
import IrrigationSystem from './pages/cleanlawn/IrrigationSystem';
import LandscapingDesign from './pages/cleanlawn/LandscapingDesign';

// Blog posts
import AerateGuide              from './pages/blog/AerateGuide';
import OrganicFertilizers       from './pages/blog/OrganicFertilizers';
import TreeTrimmingSigns        from './pages/blog/TreeTrimmingSigns';
import LowMaintenanceLandscape  from './pages/blog/LowMaintenanceLandscape';
import OneThirdRule             from './pages/blog/OneThirdRule';
import MidwestShrubs            from './pages/blog/MidwestShrubs';
import WinterPrepGuide              from './pages/blog/WinterPrepGuide';
import BestGrassTypes               from './pages/blog/BestGrassTypes';
import MentalBenefitsGreenLawn      from './pages/blog/MentalBenefitsGreenLawn';
import FamilyOutdoorSpace           from './pages/blog/FamilyOutdoorSpace';
import CleanLawnMarketplaceGuide    from './pages/blog/CleanLawnMarketplaceGuide';
import SpringCareGuide              from './pages/blog/SpringCareGuide';

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* ── Always-public routes ── */}
        <Route path="/login"              element={<Login />} />
        <Route path="/signup"             element={<Signup />} />
        {/* Agent route view: token-gated, no login required */}
        <Route path="/route-view/:token"  element={<Layout noFooter><RouteView /></Layout>} />

        {/* ── All other routes require authentication ── */}
        <Route element={<RequireAuth />}>

          {/* Core marketing */}
          <Route path="/"                   element={<Layout><Landing /></Layout>} />
          <Route path="/about"              element={<Layout><About /></Layout>} />
          <Route path="/contact"            element={<Layout><Contact /></Layout>} />
          <Route path="/blog"               element={<Layout><Blog /></Layout>} />
          <Route path="/faq"                element={<Layout><FAQ /></Layout>} />
          <Route path="/grass-guide"        element={<Layout><GrassGuide /></Layout>} />
          <Route path="/how-it-works"       element={<Layout><HowItWorks /></Layout>} />
          <Route path="/providers"          element={<Layout><ProviderLanding /></Layout>} />
          <Route path="/discover"           element={<Layout><ServiceDiscovery /></Layout>} />
          <Route path="/discover/providers/:providerId" element={<Layout><ProviderProfile /></Layout>} />
          <Route path="/account"            element={<Layout><Account /></Layout>} />
          <Route path="/tree-trimming"      element={<Layout><TreeTrimming /></Layout>} />
          <Route path="/tree-shrubs"        element={<Layout><TreeShrubs /></Layout>} />
          <Route path="/landscape-design"   element={<Layout><LandscapeDesign /></Layout>} />
          <Route path="/lawn-care"          element={<Layout><LawnCare /></Layout>} />

          {/* CleanLawn marketplace */}
          <Route path="/CleanLawn"                    element={<Layout><CleanLawn /></Layout>} />
          <Route path="/CleanLawn/mowing"             element={<Layout><Mowing /></Layout>} />
          <Route path="/CleanLawn/tree-trimming"      element={<Layout><TreeTrimming /></Layout>} />
          <Route path="/CleanLawn/hedge-trimming"     element={<Layout><HedgeTrimming /></Layout>} />
          <Route path="/CleanLawn/aeration-seeding"   element={<Layout><AerationSeeding /></Layout>} />
          <Route path="/CleanLawn/leaf-removal"       element={<Layout><LeafRemoval /></Layout>} />
          <Route path="/CleanLawn/sod-installation"   element={<Layout><SodInstallation /></Layout>} />
          <Route path="/CleanLawn/mulching"           element={<Layout><Mulching /></Layout>} />
          <Route path="/CleanLawn/brush-clearing"     element={<Layout><BrushClearing /></Layout>} />
          <Route path="/CleanLawn/stump-grinding"     element={<Layout><StumpGrinding /></Layout>} />
          <Route path="/CleanLawn/snow-removal"       element={<Layout><SnowRemoval /></Layout>} />
          <Route path="/CleanLawn/irrigation"         element={<Layout><IrrigationSystem /></Layout>} />
          <Route path="/CleanLawn/landscaping-design" element={<Layout><LandscapingDesign /></Layout>} />

          {/* Blog posts */}
          <Route path="/blog/aerate-guide"              element={<Layout><AerateGuide /></Layout>} />
          <Route path="/blog/organic-fertilizers"       element={<Layout><OrganicFertilizers /></Layout>} />
          <Route path="/blog/tree-trimming-signs"       element={<Layout><TreeTrimmingSigns /></Layout>} />
          <Route path="/blog/low-maintenance-landscape" element={<Layout><LowMaintenanceLandscape /></Layout>} />
          <Route path="/blog/one-third-rule"            element={<Layout><OneThirdRule /></Layout>} />
          <Route path="/blog/midwest-shrubs"            element={<Layout><MidwestShrubs /></Layout>} />
          <Route path="/blog/winter-prep-guide"         element={<Layout><WinterPrepGuide /></Layout>} />
          <Route path="/blog/best-grass-types"          element={<Layout><BestGrassTypes /></Layout>} />
          <Route path="/blog/mental-benefits-green-lawn" element={<Layout><MentalBenefitsGreenLawn /></Layout>} />
          <Route path="/blog/family-outdoor-space"      element={<Layout><FamilyOutdoorSpace /></Layout>} />
          <Route path="/blog/cleanlawn-marketplace-guide" element={<Layout><CleanLawnMarketplaceGuide /></Layout>} />
          <Route path="/blog/spring-care-guide"         element={<Layout><SpringCareGuide /></Layout>} />

          {/* AI Lawn Diagnosis */}
          <Route path="/lawn-diagnosis" element={<Layout><LawnDiagnosis /></Layout>} />

          {/* Quote lead form */}
          <Route path="/quote"        element={<Layout><GetQuote /></Layout>} />
          <Route path="/quote/thanks" element={<Layout><QuoteThanks /></Layout>} />

          {/* Order / purchase */}
          <Route path="/order"    element={<Layout noFooter><Order /></Layout>} />
          <Route path="/buy-now"  element={<Layout noFooter><BuyNow /></Layout>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Homeowner portal */}
          <Route path="/CleanLawn/homeowner"                  element={<Layout><HomeownerDashboard /></Layout>} />
          <Route path="/CleanLawn/homeowner/profile"          element={<Layout><HomeownerProfile /></Layout>} />
          <Route path="/CleanLawn/homeowner/properties"       element={<Layout><HomeownerProperties /></Layout>} />
          <Route path="/CleanLawn/homeowner/discover"         element={<Layout><Discover /></Layout>} />
          <Route path="/CleanLawn/homeowner/quote-request"    element={<Layout><QuoteRequest /></Layout>} />
          <Route path="/CleanLawn/homeowner/quotes"           element={<Layout><Quotes /></Layout>} />
          <Route path="/CleanLawn/homeowner/jobs"             element={<Layout><Jobs /></Layout>} />
          <Route path="/CleanLawn/homeowner/schedule"         element={<Layout><Schedule /></Layout>} />
          <Route path="/CleanLawn/homeowner/messages"         element={<Layout><Messages /></Layout>} />
          <Route path="/CleanLawn/homeowner/billing"          element={<Layout><Billing /></Layout>} />
          <Route path="/CleanLawn/homeowner/payments"         element={<Layout><Payments /></Layout>} />
          <Route path="/CleanLawn/homeowner/feedback"         element={<Layout><Feedback /></Layout>} />
          <Route path="/CleanLawn/homeowner/notes"            element={<Layout><ProviderNotes /></Layout>} />
          <Route path="/CleanLawn/homeowner/plan"             element={<Layout><ManagePlan /></Layout>} />
          <Route path="/CleanLawn/homeowner/notifications"    element={<Layout><NotificationPrefs /></Layout>} />
          <Route path="/CleanLawn/homeowner/referral"         element={<Layout><Referral /></Layout>} />

          {/* Provider portal */}
          <Route path="/CleanLawn/provider"        element={<ProviderDashboard />} />
          <Route path="/CleanLawn/provider/signup" element={<ProviderSignup />} />

          {/* Route Planner — admin only (AdminRoute checks role on top of RequireAuth) */}
          <Route path="/route-planner" element={<AdminRoute><Layout><RoutePlanner /></Layout></AdminRoute>} />

          {/* Redirects from old paths */}
          <Route path="/mowing"           element={<Navigate to="/CleanLawn/mowing" replace />} />
          <Route path="/aeration-seeding" element={<Navigate to="/CleanLawn/aeration-seeding" replace />} />
          <Route path="/provider"         element={<Navigate to="/CleanLawn/provider" replace />} />
          <Route path="/provider/signup"  element={<Navigate to="/CleanLawn/provider/signup" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/NP02">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
