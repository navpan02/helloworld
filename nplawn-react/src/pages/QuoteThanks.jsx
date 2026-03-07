import { Link, useLocation } from 'react-router-dom';

export default function QuoteThanks() {
  const { state } = useLocation();
  const name = state?.name || 'there';

  return (
    <div className="min-h-screen bg-np-surface flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-np-accent/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 stroke-np-accent fill-none stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-np-dark text-3xl font-extrabold mb-3">You're all set, {name}!</h1>
        <p className="text-np-muted text-base mb-8 leading-relaxed">
          We've received your quote request and will get back to you within <strong className="text-np-dark">1 business day</strong> with a custom quote tailored to your property.
        </p>
        <Link to="/" className="btn-primary px-8 py-3 text-base">Back to Home</Link>
      </div>
    </div>
  );
}
