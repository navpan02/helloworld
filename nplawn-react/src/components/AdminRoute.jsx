import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// All emails that should always be treated as admin regardless of DB role
const ADMIN_EMAILS = ['admin@admin.com', 'navpan@gmail.com'];

/**
 * Wraps a route so only authenticated admins can access it.
 * - Not logged in  → redirect to /login
 * - Logged in, not admin → redirect to /
 * - Admin → render children
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // wait for session hydration

  if (!user) return <Navigate to="/login" replace />;

  // Accept role set in public.users table OR any known admin email
  const isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(user.email?.toLowerCase());
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
