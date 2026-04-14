import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Layout route that gates all child routes behind authentication.
 *
 * Usage in App.jsx:
 *   <Route element={<RequireAuth />}>
 *     <Route path="/" element={<Landing />} />
 *     ...
 *   </Route>
 *
 * Unauthenticated visitors are redirected to /login?next=<requested-path>
 * so they land back where they were trying to go after signing in.
 */
export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for session hydration (avoids flash redirect on first paint)
  if (loading) return null;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
