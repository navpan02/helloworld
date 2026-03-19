import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
