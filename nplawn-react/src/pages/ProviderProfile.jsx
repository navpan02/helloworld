import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ZIP_TO_CITY, DEMO_PROVIDERS, normalize } from '../utils/providers';

function Stars({ rating, size = 'md' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 24 24" className={`${cls} ${
          i <= full       ? 'fill-yellow-400 stroke-yellow-400' :
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
    <span className={`inline-flex items-center text-xs font-semibold border px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function PortfolioPlaceholder() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-[4/3] rounded-xl bg-np-surface border border-np-border flex flex-col items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-np-border stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span className="text-np-border text-xs">Photo coming soon</span>
        </div>
      ))}
    </div>
  );
}

function PortfolioGrid({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((item, i) => {
        const src = typeof item === 'string' ? item : item?.url;
        const caption = typeof item === 'object' ? item?.caption : null;
        return (
          <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-np-border group">
            <img src={src} alt={caption || `Portfolio photo ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            {caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                {caption}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-np-surface rounded-xl border border-np-border">
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-np-accent stroke-[1.5] mb-2" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
      <span className="text-np-dark font-extrabold text-xl">{value}</span>
      <span className="text-np-muted text-xs mt-0.5">{label}</span>
    </div>
  );
}

export default function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);

      if (!providerId) { setNotFound(true); setLoading(false); return; }

      // Demo provider — fast local lookup
      if (String(providerId).startsWith('demo-')) {
        const found = DEMO_PROVIDERS.find(p => p.id === providerId);
        setProvider(found || null);
        setNotFound(!found);
        setLoading(false);
        return;
      }

      // Real provider — fetch all and match by id OR email.
      // This handles tables that use email as PK (no UUID id column),
      // UUID-based tables, and URL-encoded email addresses (%40 → @).
      const decoded = decodeURIComponent(providerId);
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*');

      if (!error && data?.length) {
        const found = data.find(p =>
          (p.id   != null && (p.id    === providerId || p.id    === decoded)) ||
          (p.email != null && (p.email === providerId || p.email === decoded))
        );
        if (found) {
          setProvider(normalize(found));
          setLoading(false);
          return;
        }
      }

      // No match in Supabase — nothing to show
      setNotFound(true);
      setLoading(false);
    })();
  }, [providerId]);

  if (loading) {
    return (
      <div className="px-[8%] py-20 max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-np-surface rounded w-32 mb-8"/>
        <div className="flex gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-np-surface flex-shrink-0"/>
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-7 bg-np-surface rounded w-2/3"/>
            <div className="h-4 bg-np-surface rounded w-1/3"/>
            <div className="h-4 bg-np-surface rounded w-1/2"/>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-np-surface rounded-xl"/>)}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-np-surface rounded"/>)}
        </div>
      </div>
    );
  }

  if (notFound || !provider) {
    return (
      <div className="px-[8%] py-28 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-np-surface flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-np-muted stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <h2 className="font-bold text-np-dark text-xl mb-2">Provider not found</h2>
        <p className="text-np-muted text-sm mb-6">This provider profile may have been removed or the link is incorrect.</p>
        <Link to="/discover" className="btn-primary px-6 py-2.5 text-sm">Browse All Providers</Link>
      </div>
    );
  }

  const p = provider;
  const initials = p.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const primaryCity = p.serviceAreas.length > 0 && ZIP_TO_CITY[p.serviceAreas[0]]
    ? ZIP_TO_CITY[p.serviceAreas[0]]
    : p.address.split(',')[0];

  // Unique cities served
  const uniqueCities = [...new Set(
    p.serviceAreas.map(z => ZIP_TO_CITY[z]).filter(Boolean)
  )];

  return (
    <>
      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-np-border px-[8%] py-3">
        <nav className="text-xs text-np-muted flex items-center gap-1.5 max-w-5xl mx-auto">
          <Link to="/discover" className="hover:text-np-dark transition-colors">Find Providers</Link>
          <span>/</span>
          <span className="text-np-dark font-medium truncate">{p.name}</span>
        </nav>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-np-dark px-[8%] py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-np-lite/80 to-np-accent flex items-center justify-center text-np-dark font-extrabold text-2xl flex-shrink-0 shadow-lg">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-white font-extrabold text-2xl md:text-3xl">{p.name}</h1>
                {p.badge && <Badge label={p.badge}/>}
                {p.available && (
                  <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-900/40 border border-emerald-700/40 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                    Available
                  </span>
                )}
              </div>

              <p className="text-white/60 text-sm flex items-center gap-1.5 mb-3">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {primaryCity}{p.address.includes(',') ? ', ' + p.address.split(',').slice(1).join(',').trim() : ''}
              </p>

              {/* Rating */}
              {p.avgRating > 0 ? (
                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={p.avgRating} size="lg"/>
                  <span className="text-white font-bold text-lg">{p.avgRating.toFixed(1)}</span>
                  <span className="text-white/50 text-sm">({p.reviewCount} {p.reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : (
                <p className="text-white/40 text-sm italic mb-4">No reviews yet — be the first to request a quote!</p>
              )}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <Link to="/quote"
                  className="btn-primary px-6 py-2.5 text-sm font-bold">
                  Request a Quote
                </Link>
                {p.phone && (
                  <a href={`tel:${p.phone}`}
                    className="flex items-center gap-2 border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors no-underline">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.95a16 16 0 0 0 6.29 6.29l1.31-1.31a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <section className="px-[8%] py-8 bg-np-surface border-b border-np-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem
            icon={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
            label="Years in Business"
            value={p.yearsInBusiness > 0 ? `${p.yearsInBusiness}+` : 'New'}
          />
          <StatItem
            icon={<><polyline points="20 6 9 17 4 12"/></>}
            label="Jobs Completed"
            value={p.totalJobs > 0 ? `${p.totalJobs}+` : '—'}
          />
          <StatItem
            icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>}
            label="Team Size"
            value={p.teamSize > 1 ? p.teamSize : '1'}
          />
          <StatItem
            icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
            label="Areas Served"
            value={uniqueCities.length > 0 ? uniqueCities.length : p.serviceAreas.length || '—'}
          />
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────── */}
      <section className="px-[8%] py-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">

          {/* Left column: About + Portfolio */}
          <div className="md:col-span-2 space-y-10">

            {/* About */}
            {p.description && (
              <div>
                <h2 className="text-np-dark font-bold text-lg mb-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-np-accent stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  About {p.name}
                </h2>
                <p className="text-np-muted leading-relaxed text-sm">{p.description}</p>
              </div>
            )}

            {/* Services Offered */}
            {p.services.length > 0 && (
              <div>
                <h2 className="text-np-dark font-bold text-lg mb-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-np-accent stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  Services Offered
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.services.map(s => (
                    <span key={s}
                      className="flex items-center gap-1.5 text-sm bg-np-surface text-np-dark border border-np-border px-3.5 py-1.5 rounded-full font-medium">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-np-accent stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            <div>
              <h2 className="text-np-dark font-bold text-lg mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-np-accent stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Portfolio
              </h2>
              {p.portfolio.length > 0
                ? <PortfolioGrid items={p.portfolio}/>
                : (
                  <div>
                    <PortfolioPlaceholder/>
                    <p className="text-np-muted text-xs text-center mt-3 italic">
                      Portfolio photos coming soon — contact this provider to request work samples.
                    </p>
                  </div>
                )
              }
            </div>

          </div>

          {/* Right column: sidebar info */}
          <div className="space-y-6">

            {/* Quick CTA card */}
            <div className="bg-np-dark rounded-2xl p-6 text-center">
              <p className="text-np-lite font-bold text-xs tracking-widest uppercase mb-1">Ready to get started?</p>
              <h3 className="text-white font-bold text-lg mb-2">Request a Free Quote</h3>
              <p className="text-white/55 text-xs mb-4">No commitment — get a price estimate from {p.name.split(' ')[0]}.</p>
              <Link to="/quote" className="btn-primary w-full block text-center text-sm py-2.5">
                Get a Quote
              </Link>
            </div>

            {/* Service areas */}
            {(p.serviceAreas.length > 0 || p.address) && (
              <div className="bg-white border border-np-border rounded-2xl p-5">
                <h3 className="text-np-dark font-bold text-sm mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-np-accent stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Service Areas
                </h3>
                {uniqueCities.length > 0 ? (
                  <div className="space-y-1.5">
                    {uniqueCities.map(city => (
                      <div key={city} className="flex items-center gap-2 text-sm text-np-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-np-accent flex-shrink-0"/>
                        {city}, IL
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-np-muted text-sm">{p.address}</p>
                )}
                {p.serviceAreas.length > 0 && (
                  <p className="text-np-border text-xs mt-3">
                    ZIP codes: {p.serviceAreas.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Equipment / Fleet */}
            {p.equipment && (
              <div className="bg-white border border-np-border rounded-2xl p-5">
                <h3 className="text-np-dark font-bold text-sm mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-np-accent stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                  </svg>
                  Equipment & Fleet
                </h3>
                <p className="text-np-muted text-sm leading-relaxed">{p.equipment}</p>
              </div>
            )}

            {/* License */}
            {p.licenseNumber && (
              <div className="bg-white border border-np-border rounded-2xl p-5">
                <h3 className="text-np-dark font-bold text-sm mb-2 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-np-accent stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  License
                </h3>
                <p className="text-np-muted text-xs font-mono">{p.licenseNumber}</p>
              </div>
            )}

            {/* Back link */}
            <Link to="/discover"
              className="flex items-center gap-2 text-np-muted text-sm hover:text-np-dark transition-colors no-underline">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to all providers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
