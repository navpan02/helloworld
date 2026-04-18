import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortalSession } from '../../lib/portalAuth';

export default function PortalAuthGuard({ portal, children }) {
  const navigate = useNavigate();
  const session = getPortalSession(portal);

  useEffect(() => {
    if (!session) {
      navigate(`/rp-${portal}/login`, { replace: true });
    }
  }, [session, portal, navigate]);

  if (!session) return null;
  return children(session);
}
