import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSeasonalRecommendation } from '../utils/seasonalRecs';

const STORAGE_KEY = 'nplawn_zip';

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
 * SeasonalBanner — permanent, non-dismissible seasonal lawn care recommendation.
 *
 * Props (mutually exclusive — nominatimAddress takes priority):
 *   nominatimAddress {object|null|undefined}
 *     - object : Nominatim address object `{ state, postcode, ... }` from BuyNow.
 *                Uses state name as the region signal (reliable for all search types).
 *     - null   : address step not yet completed — hide the banner.
 *     - undefined (omitted) : falls through to zipCode / localStorage.
 *
 *   zipCode {string|undefined}
 *     - string  : explicit zip (Landing, Order, GetQuote).
 *     - undefined (omitted) : falls back to localStorage `nplawn_zip`.
 */
export default function SeasonalBanner({ nominatimAddress, zipCode }) {
  const [rec, setRec] = useState(null);

  useEffect(() => {
    // BuyNow path: nominatimAddress is always provided (object when selected, null when not)
    if (nominatimAddress !== undefined) {
      setRec(nominatimAddress ? getSeasonalRecommendation(nominatimAddress) : null);
      return;
    }
    // Zip / localStorage path: Landing, Order, GetQuote
    const zip = zipCode !== undefined ? zipCode : localStorage.getItem(STORAGE_KEY);
    setRec(zip ? getSeasonalRecommendation(zip) : null);
  }, [nominatimAddress, zipCode]);

  if (!rec) return null;

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
      </div>
    </div>
  );
}
