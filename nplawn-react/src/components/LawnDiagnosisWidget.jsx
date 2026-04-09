import { Link } from 'react-router-dom';

/**
 * Compact "Not sure what you need?" teaser widget.
 * Embedded in BuyNow Step 2 and GetQuote above the form.
 *
 * @param {'buynow'|'quote'} back  — where to return the user after diagnosis
 */
export default function LawnDiagnosisWidget({ back = 'buynow' }) {
  return (
    <div className="mb-5 rounded-2xl border border-np-accent/30 bg-np-surface p-4 flex gap-4 items-start">
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-np-accent/15 flex items-center justify-center mt-0.5">
        <svg className="w-5 h-5 stroke-np-accent fill-none stroke-[1.8]" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          <path strokeLinecap="round" d="M11 8v6M8 11h6"/>
        </svg>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-np-dark text-sm mb-0.5">Not sure which plan you need?</p>
        <p className="text-np-muted text-xs leading-relaxed">
          Describe your lawn problem and get an AI-powered recommendation in seconds.
        </p>
      </div>

      {/* CTA */}
      <Link
        to={`/lawn-diagnosis?back=${back}`}
        className="flex-shrink-0 self-center text-xs font-semibold text-np-accent border border-np-accent/40 rounded-full px-3 py-1.5 hover:bg-np-accent hover:text-np-dark transition-all whitespace-nowrap no-underline"
      >
        Try Diagnosis →
      </Link>
    </div>
  );
}
