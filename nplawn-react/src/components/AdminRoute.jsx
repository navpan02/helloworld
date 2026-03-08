import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
