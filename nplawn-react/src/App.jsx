import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';

// Pages
import Landing          from './pages/Landing';
import About            from './pages/About';
import Contact          from './pages/Contact';
import Blog             from './pages/Blog';
import Login            from './pages/Login';
import Signup           from './pages/Signup';
import Order            from './pages/Order';

// Service pages
import Mowing           from './pages/services/Mowing';
import TreeTrimming     from './pages/services/TreeTrimming';
import TreeShrubs       from './pages/services/TreeShrubs';
import AerationSeeding  from './pages/services/AerationSeeding';
import LandscapeDesign  from './pages/services/LandscapeDesign';
import LawnCare         from './pages/services/LawnCare';

// Blog posts
import AerateGuide              from './pages/blog/AerateGuide';
import OrganicFertilizers       from './pages/blog/OrganicFertilizers';
import TreeTrimmingSigns        from './pages/blog/TreeTrimmingSigns';
import LowMaintenanceLandscape  from './pages/blog/LowMaintenanceLandscape';
import OneThirdRule             from './pages/blog/OneThirdRule';
import MidwestShrubs            from './pages/blog/MidwestShrubs';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with layout */}
      <Route path="/"                   element={<Layout><Landing/></Layout>} />
      <Route path="/about"              element={<Layout><About/></Layout>} />
      <Route path="/contact"            element={<Layout><Contact/></Layout>} />
      <Route path="/blog"               element={<Layout><Blog/></Layout>} />
      <Route path="/mowing"             element={<Layout><Mowing/></Layout>} />
      <Route path="/tree-trimming"      element={<Layout><TreeTrimming/></Layout>} />
      <Route path="/tree-shrubs"        element={<Layout><TreeShrubs/></Layout>} />
      <Route path="/aeration-seeding"   element={<Layout><AerationSeeding/></Layout>} />
      <Route path="/landscape-design"   element={<Layout><LandscapeDesign/></Layout>} />
      <Route path="/lawn-care"          element={<Layout><LawnCare/></Layout>} />

      {/* Blog post routes */}
      <Route path="/blog/aerate-guide"              element={<Layout><AerateGuide/></Layout>} />
      <Route path="/blog/organic-fertilizers"       element={<Layout><OrganicFertilizers/></Layout>} />
      <Route path="/blog/tree-trimming-signs"       element={<Layout><TreeTrimmingSigns/></Layout>} />
      <Route path="/blog/low-maintenance-landscape" element={<Layout><LowMaintenanceLandscape/></Layout>} />
      <Route path="/blog/one-third-rule"            element={<Layout><OneThirdRule/></Layout>} />
      <Route path="/blog/midwest-shrubs"            element={<Layout><MidwestShrubs/></Layout>} />

      {/* Order — accessible without login, uses user info if available */}
      <Route path="/order"  element={<Layout noFooter><Order/></Layout>} />

      {/* Auth — full screen, no shared layout */}
      <Route path="/login"  element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
