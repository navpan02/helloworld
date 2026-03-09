import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CATEGORY_LIST, ZIP_TO_CITY, DEMO_PROVIDERS, normalize } from '../utils/providers';

// ── Category SVG icon children (renders inside <svg viewBox="0 0 24 24">) ──
const ICON = {
  'Lawn Mowing':          <><path d="M3 17c1-2 3-3 5-3s4 1 5 3"/><path d="M11 17c1-2 3-3 5-3s4 1 5 3"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="7" y1="14" x2="7" y2="10"/><line x1="17" y1="14" x2="17" y2="10"/></>,
  'Landscaping & Design': <><path d="M12 22v-9"/><path d="M12 13C10 9 7 6 4 5c0 5 3 8 8 8z"/><path d="M12 13C14 9 17 6 20 5c0 5-3 8-8 8z"/></>,
  'Tree Trimming':        <><path d="M12 22v-8"/><path d="M8 14l-4-6h3L5 4h14l-2 4h3l-4 6z"/><line x1="9" y1="9" x2="15" y2="9"/></>,
  'Hedge Trimming':       <><rect x="3" y="11" width="18" height="5" rx="1"/><line x1="6" y1="11" x2="6" y2="7"/><line x1="10" y1="11" x2="10" y2="6"/><line x1="14" y1="11" x2="14" y2="7"/><line x1="18" y1="11" x2="18" y2="8"/></>,
  'Leaf Removal':         <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></>,
  'Sod Installation':     <><rect x="3" y="15" width="18" height="5" rx="1"/><path d="M6 15c0-3 1-5 6-5s6 2 6 5"/></>,
  'Mulching':             <><ellipse cx="12" cy="17" rx="9" ry="3"/><path d="M3 17v-5c0-2 4-4 9-4s9 2 9 4v5"/></>,
  'Brush Clearing':       <><line x1="3" y1="21" x2="21" y2="3"/><path d="M4 20l6-5M14 9l5-6"/></>,
  'Stump Grinding':       <><circle cx="12" cy="14" r="5"/><path d="M12 9V5"/><path d="M9 6l3-3 3 3"/><line x1="3" y1="21" x2="21" y2="21"/></>,
  'Irrigation':           <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>,
};

// ── Sub-components ──────────────────────────────────────────────────────────

function CatIcon({ label }) {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]"
      strokeLinecap="round" strokeLinejoin="round">
      {ICON[label] || <circle cx="12" cy="12" r="9"/>}
    </svg>
  );
}

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${
          i <= full ? 'fill-yellow-400 stroke-yellow-400' :
          i === full + 1 && half ? 'fill-yellow-200 stroke-yellow-400' :
          'fill-none stroke-np-border'
        }`} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function Badge({ label }) {
  const colors = {
    'Top Rated':          'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Licensed & Insured': 'bg-blue-50 text-blue-700 border-blue-200',
    'Certified Arborist': 'bg-green-50 text-green-700 border-green-200',
    'Fast Response':      'bg-orange-50 text-orange-700 border-orange-200',
    'Eco-Friendly':       'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const cls = colors[label] || 'bg-np-surface text-np-muted border-np-border';
  return (
    <span className={`inline-block text-xs font-semibold border px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function ProviderCard({ p }) {
  const initials = p.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const city = (p.serviceAreas.length > 0 && ZIP_TO_CITY[p.serviceAreas[0]])
    ? ZIP_TO_CITY[p.serviceAreas[0]]
    : p.address.split(',')[0];

  return (
    <div className="bg-white rounded-2xl border border-np-border shadow-sm hover:shadow-np hover:-translate-y-0.5 transition-all flex flex-col">
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex gap-3 items-start mb-3">
          <div className="w-11 h-11 rounded-xl bg-np-dark flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-np-dark text-sm leading-tight truncate">{p.name}</h3>
            <p className="text-np-muted text-xs mt-0.5 flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {city}
            </p>
          </div>
          {p.badge && <Badge label={p.badge}/>}
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-1.5 mb-3">
          {p.avgRating > 0 ? (
            <>
              <Stars rating={p.avgRating}/>
              <span className="text-np-dark text-xs font-bold">{p.avgRating.toFixed(1)}</span>
              <span className="text-np-muted text-xs">({p.reviewCount})</span>
            </>
          ) : (
            <span className="text-np-muted text-xs italic">New provider</span>
          )}
          {p.available && (
            <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
              Available
            </span>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-np-muted">
          {p.yearsInBusiness > 0 && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {p.yearsInBusiness} yrs exp
            </span>
          )}
          {p.totalJobs > 0 && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {p.totalJobs}+ jobs
            </span>
          )}
          {p.teamSize > 1 && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {p.teamSize}-person crew
            </span>
          )}
        </div>

        {/* Description */}
        {p.description && (
          <p className="text-np-muted text-xs leading-relaxed mb-3 line-clamp-2">{p.description}</p>
        )}

        {/* Service tags */}
        <div className="flex flex-wrap gap-1.5">
          {p.services.slice(0, 3).map(s => (
            <span key={s} className="text-xs bg-np-surface text-np-muted border border-np-border px-2.5 py-0.5 rounded-full">{s}</span>
          ))}
          {p.services.length > 3 && (
            <span className="text-xs text-np-muted px-1.5 py-0.5">+{p.services.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 pb-4 pt-3 border-t border-np-border flex gap-2">
        <Link to={`/discover/providers/${p.id}`}
          className="flex-1 text-center text-sm font-semibold border border-np-accent text-np-accent py-2 rounded-xl hover:bg-np-surface transition-colors no-underline">
          View Profile
        </Link>
        <Link to="/quote"
          className="flex-1 text-center text-sm font-bold bg-np-accent text-np-dark py-2 rounded-xl hover:bg-np-lite transition-colors no-underline">
          Get Quote
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-np-border p-5 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-np-surface flex-shrink-0"/>
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-np-surface rounded w-3/4"/>
          <div className="h-3 bg-np-surface rounded w-1/2"/>
        </div>
      </div>
      <div className="h-3 bg-np-surface rounded w-2/5 mb-3"/>
      <div className="flex gap-3 mb-3">
        <div className="h-3 bg-np-surface rounded w-16"/>
        <div className="h-3 bg-np-surface rounded w-14"/>
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-3 bg-np-surface rounded"/>
        <div className="h-3 bg-np-surface rounded w-4/5"/>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-np-surface rounded-full w-20"/>
        <div className="h-6 bg-np-surface rounded-full w-24"/>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ServiceDiscovery() {
  const [params] = useSearchParams();

  const [providers, setProviders]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [zipInput, setZipInput]       = useState(params.get('zip') || '');
  const [activeZip, setActiveZip]     = useState(params.get('zip') || '');
  const [selectedCat, setSelectedCat] = useState(params.get('category') || '');
  const [minRating, setMinRating]     = useState(0);
  const [minYears, setMinYears]       = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy]           = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch providers once on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('provider_profiles').select('*');
      setProviders(!error && data?.length ? data.map(normalize) : DEMO_PROVIDERS);
      setLoading(false);
    })();
  }, []);

  // Compute filtered + sorted list
  const results = useMemo(() => {
    let list = [...providers];

    // ZIP filter
    if (activeZip) {
      const city = ZIP_TO_CITY[activeZip];
      list = list.filter(p =>
        p.serviceAreas.includes(activeZip) ||
        (city && p.address.toLowerCase().includes(city.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCat) {
      const cat = CATEGORY_LIST.find(c => c.label === selectedCat);
      const key = cat?.match || selectedCat.toLowerCase();
      list = list.filter(p =>
        p.services.some(s => s.toLowerCase().includes(key))
      );
    }

    // Rating filter (skip providers with no reviews when rating filter is active)
    if (minRating > 0) {
      list = list.filter(p => p.avgRating >= minRating);
    }

    // Availability filter
    if (onlyAvailable) {
      list = list.filter(p => p.available);
    }

    // Years in business
    if (minYears > 0) {
      list = list.filter(p => p.yearsInBusiness >= minYears);
    }

    // Sort
    if (sortBy === 'rating') {
      list.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === 'experience') {
      list.sort((a, b) => b.yearsInBusiness - a.yearsInBusiness);
    } else if (sortBy === 'distance') {
      // Providers servicing the searched ZIP come first, rest sorted by rating
      if (activeZip) {
        list.sort((a, b) => {
          const aHas = a.serviceAreas.includes(activeZip) ? 0 : 1;
          const bHas = b.serviceAreas.includes(activeZip) ? 0 : 1;
          return aHas - bHas || b.avgRating - a.avgRating;
        });
      } else {
        list.sort((a, b) => b.avgRating - a.avgRating);
      }
    }

    return list;
  }, [providers, activeZip, selectedCat, minRating, onlyAvailable, minYears, sortBy]);

  const activeFilterCount = [
    selectedCat,
    minRating > 0,
    onlyAvailable,
    minYears > 0,
  ].filter(Boolean).length;

  function clearAll() {
    setActiveZip(''); setZipInput('');
    setSelectedCat(''); setMinRating(0);
    setOnlyAvailable(false); setMinYears(0);
    setSortBy('rating');
  }

  return (
    <>
      {/* ── Hero / Search ────────────────────────────────────────── */}
      <section className="bg-np-dark px-[8%] py-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-2">CleanLawn Marketplace</p>
          <h1 className="text-white font-extrabold text-3xl md:text-4xl leading-tight mb-3">
            Find Local Lawn Care Professionals
          </h1>
          <p className="text-white/60 text-sm mb-8">
            Browse vetted, insured providers across Chicagoland. Filter by service, location, and rating.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fill-none stroke-white/40 stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                value={zipInput}
                onChange={e => setZipInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setActiveZip(zipInput.trim()); }}
                placeholder="ZIP code or city (e.g. 60540, Naperville)"
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 outline-none focus:border-np-accent focus:bg-white/15 transition-all"
              />
            </div>
            <button
              onClick={() => setActiveZip(zipInput.trim())}
              className="bg-np-accent text-np-dark font-bold text-sm px-6 py-3 rounded-xl hover:bg-np-lite transition-all whitespace-nowrap">
              Search Providers
            </button>
          </div>

          {activeZip && (
            <p className="text-white/50 text-xs mt-2.5 flex items-center gap-1">
              {ZIP_TO_CITY[activeZip]
                ? <>Showing providers in <strong className="text-np-lite mx-0.5">{ZIP_TO_CITY[activeZip]}</strong> ({activeZip})</>
                : <>Showing providers for ZIP <strong className="text-np-lite mx-0.5">{activeZip}</strong></>
              }
              <button onClick={() => { setActiveZip(''); setZipInput(''); }}
                className="ml-1.5 text-white/40 hover:text-white/80 underline">
                Clear
              </button>
            </p>
          )}
        </div>
      </section>

      {/* ── Category pills ───────────────────────────────────────── */}
      <div className="bg-white border-b border-np-border sticky top-16 z-30">
        <div className="px-[8%] py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedCat('')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                !selectedCat
                  ? 'bg-np-dark text-white border-np-dark'
                  : 'bg-white text-np-muted border-np-border hover:border-np-dark hover:text-np-dark'
              }`}>
              All Services
            </button>
            {CATEGORY_LIST.map(cat => (
              <button key={cat.label}
                onClick={() => setSelectedCat(prev => prev === cat.label ? '' : cat.label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                  selectedCat === cat.label
                    ? 'bg-np-accent text-np-dark border-np-accent'
                    : 'bg-white text-np-muted border-np-border hover:border-np-accent hover:text-np-dark'
                }`}>
                <CatIcon label={cat.label}/>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results section ─────────────────────────────────────── */}
      <section className="px-[8%] py-10 bg-np-surface min-h-[60vh]">
        <div className="max-w-7xl mx-auto">

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <p className="text-sm text-np-muted font-medium">
              {loading
                ? 'Loading providers…'
                : <><strong className="text-np-dark">{results.length}</strong> provider{results.length !== 1 ? 's' : ''} found</>
              }
            </p>
            <div className="flex-1"/>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-np-muted uppercase tracking-wide">Sort:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-np-border rounded-lg px-3 py-1.5 bg-white text-np-dark outline-none focus:border-np-accent cursor-pointer">
                <option value="rating">Best Rating</option>
                <option value="reviews">Most Reviews</option>
                <option value="distance">Closest Match</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 text-sm border rounded-lg px-3.5 py-1.5 font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-np-accent bg-np-accent/10 text-np-accent'
                  : 'border-np-border bg-white text-np-muted hover:border-np-dark hover:text-np-dark'
              }`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.5]" strokeLinecap="round">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
                <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
                <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
                <line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div className="bg-white border border-np-border rounded-2xl p-5 mb-6">
              <div className="flex flex-wrap gap-8">

                {/* Min rating */}
                <div>
                  <label className="block text-xs font-bold text-np-muted uppercase tracking-wide mb-2">Minimum Rating</label>
                  <div className="flex gap-2 flex-wrap">
                    {[[0,'Any'],[3,'3★ +'],[4,'4★ +'],[4.5,'4.5★ +']].map(([val, lbl]) => (
                      <button key={lbl} onClick={() => setMinRating(val)}
                        className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                          minRating === val
                            ? 'bg-np-accent text-np-dark border-np-accent'
                            : 'bg-white text-np-muted border-np-border hover:border-np-accent'
                        }`}>{lbl}</button>
                    ))}
                  </div>
                </div>

                {/* Years in business */}
                <div>
                  <label className="block text-xs font-bold text-np-muted uppercase tracking-wide mb-2">Years in Business</label>
                  <div className="flex gap-2 flex-wrap">
                    {[[0,'Any'],[1,'1+'],[3,'3+'],[5,'5+'],[10,'10+']].map(([val, lbl]) => (
                      <button key={lbl} onClick={() => setMinYears(val)}
                        className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                          minYears === val
                            ? 'bg-np-accent text-np-dark border-np-accent'
                            : 'bg-white text-np-muted border-np-border hover:border-np-accent'
                        }`}>{lbl}</button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-xs font-bold text-np-muted uppercase tracking-wide mb-2">Availability</label>
                  <button
                    onClick={() => setOnlyAvailable(v => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                      onlyAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-np-muted border-np-border hover:border-np-accent'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-emerald-500' : 'bg-np-border'}`}/>
                    Available Now Only
                  </button>
                </div>

                {/* Price range — coming soon */}
                <div>
                  <label className="block text-xs font-bold text-np-muted uppercase tracking-wide mb-2">
                    Price Range <span className="text-np-border font-normal ml-1">(coming soon)</span>
                  </label>
                  <div className="flex gap-2">
                    {['$','$$','$$$'].map(t => (
                      <button key={t} disabled
                        className="px-3 py-1.5 text-xs rounded-lg border border-np-border text-np-border cursor-not-allowed">{t}</button>
                    ))}
                  </div>
                </div>

                <button onClick={() => { setMinRating(0); setMinYears(0); setOnlyAvailable(false); setSortBy('rating'); }}
                  className="self-end text-xs text-np-muted hover:text-np-dark underline ml-auto">
                  Reset filters
                </button>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-xs text-np-muted">Active filters:</span>
              {selectedCat && (
                <span className="flex items-center gap-1.5 text-xs bg-np-accent/15 text-np-dark border border-np-accent/30 px-3 py-1 rounded-full font-medium">
                  <CatIcon label={selectedCat}/>{selectedCat}
                  <button onClick={() => setSelectedCat('')} className="ml-0.5 text-np-muted hover:text-np-dark">×</button>
                </span>
              )}
              {minRating > 0 && (
                <span className="flex items-center gap-1.5 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full font-medium">
                  {minRating}★+
                  <button onClick={() => setMinRating(0)} className="ml-0.5 text-yellow-400 hover:text-yellow-700">×</button>
                </span>
              )}
              {onlyAvailable && (
                <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-medium">
                  Available Now
                  <button onClick={() => setOnlyAvailable(false)} className="ml-0.5 text-emerald-400 hover:text-emerald-700">×</button>
                </span>
              )}
              {minYears > 0 && (
                <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                  {minYears}+ yrs
                  <button onClick={() => setMinYears(0)} className="ml-0.5 text-blue-400 hover:text-blue-700">×</button>
                </span>
              )}
              <button onClick={clearAll} className="text-xs text-np-muted hover:text-np-dark underline ml-1">Clear all</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i}/>)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-np-border">
              <div className="w-16 h-16 rounded-full bg-np-surface flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-np-muted stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3 className="font-bold text-np-dark text-lg mb-1">No providers match your filters</h3>
              <p className="text-np-muted text-sm mb-6 max-w-sm mx-auto">
                Try broadening your search — clear the ZIP code, choose a different category, or remove rating/year filters.
              </p>
              <button onClick={clearAll} className="btn-primary px-6 py-2.5 text-sm">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map(p => <ProviderCard key={p.id} p={p}/>)}
            </div>
          )}

          {/* CTA for providers */}
          {!loading && (
            <div className="mt-12 bg-np-dark rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="flex-1">
                <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-1">For Lawn Care Professionals</p>
                <h3 className="text-white text-xl font-bold mb-1">Want to be listed here?</h3>
                <p className="text-white/55 text-sm">Join the CleanLawn network — free to sign up, no monthly fees.</p>
              </div>
              <Link to="/providers" className="btn-primary px-7 py-3 whitespace-nowrap flex-shrink-0">
                Become a Provider →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
