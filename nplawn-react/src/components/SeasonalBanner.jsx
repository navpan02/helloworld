import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSeasonalRecommendation } from '../utils/seasonalRecs';

const STORAGE_KEY = 'nplawn_zip';
const DISMISS_KEY = 'nplawn_banner_dismissed';

const SEASON_ICONS = {
  Spring: (
    <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
  ),
  Summer: (
    <>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </>
  ),
  Fall: (
    <>
      <path d="M6 3v18M6 3l6 6M6 3l-3 6"/>
      <path d="M18 6v15M18 6l3 6M18 6l-3 6"/>
    </>
  ),
  Winter: (
    <>
      <path d="M2 12h20M12 2v20"/>
      <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
    </>
  ),
};

/**
 * SeasonalBanner — shows a seasonal lawn care recommendation based on zip code.
 *
 * Props:
 *   zipCode {string} — optional override (e.g. from a form already on the page).
 *                      Falls back to localStorage if not provided.
 */
export default function SeasonalBanner({ zipCode }) {
  const [rec, setRec] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check session-level dismiss
    if (sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      return;
    }

    const zip = zipCode || localStorage.getItem(STORAGE_KEY);
    if (!zip) return;

    const result = getSeasonalRecommendation(zip);
    setRec(result);
  }, [zipCode]);

  if (!rec || dismissed) return null;

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  return (
    <div className="seasonal-banner">
      <div className="seasonal-banner-inner">
        <div className="seasonal-banner-icon">
          <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-np-dark fill-none stroke-[1.5]">
            {SEASON_ICONS[rec.season]}
          </svg>
        </div>
        <div className="seasonal-banner-body">
          <p className="seasonal-banner-heading">{rec.heading}</p>
          <p className="seasonal-banner-summary">{rec.summary}</p>
          <div className="seasonal-banner-pills">
            {rec.treatments.map(t => (
              <Link key={t.to + t.label} to={t.to} className="seasonal-pill">
                {t.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="seasonal-banner-close"
          aria-label="Dismiss recommendation"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
