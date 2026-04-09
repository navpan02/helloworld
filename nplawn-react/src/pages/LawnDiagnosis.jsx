import { useState, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Map Claude's recommended_plan label → BuyNow ?plan= query param
const PLAN_PARAM = { GrassBasic: 'basic', GrassPro: 'pro', GrassNatural: 'natural' };

// Urgency → pill colour
const URGENCY_STYLE = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-green-50 text-green-700 border-green-200',
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Generate a lightweight anonymous session ID
function getSessionId() {
  const key = 'nplawn_diag_session';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function LawnDiagnosis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const back = searchParams.get('back') || 'buynow'; // 'buynow' | 'quote'

  const [symptoms, setSymptoms] = useState('');
  const [photo, setPhoto] = useState(null);       // { file, previewUrl, base64, mediaType }
  const [photoError, setPhotoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);     // DiagnosisResult | null
  const [apiError, setApiError] = useState('');
  const fileInputRef = useRef(null);

  // ── Photo handling ─────────────────────────────────────────────────────────
  const handleFileChange = useCallback((file) => {
    setPhotoError('');
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setPhotoError('Image must be under 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Strip the data URL prefix to get raw base64
      const base64 = dataUrl.split(',')[1];
      setPhoto({
        file,
        previewUrl: dataUrl,
        base64,
        mediaType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e) => handleFileChange(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files?.[0]);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Diagnosis request ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim() && !photo) return;

    setLoading(true);
    setResult(null);
    setApiError('');

    try {
      const { data, error } = await supabase.functions.invoke('lawn-diagnose', {
        body: {
          symptoms_text: symptoms.trim() || null,
          image_base64:  photo?.base64 ?? null,
          image_media_type: photo?.mediaType ?? null,
          session_id:    getSessionId(),
        },
      });

      if (error) throw new Error(error.message || 'Diagnosis service unavailable');
      if (data?.error) throw new Error(data.error);

      const diagnosis = data;

      // Low confidence → redirect to quote form with symptoms pre-filled
      if (diagnosis.confidence === 'low') {
        const notes = symptoms.trim()
          ? encodeURIComponent(`AI Diagnosis (low confidence): ${symptoms.trim()}`)
          : '';
        navigate(`/quote${notes ? `?notes=${notes}` : ''}`);
        return;
      }

      setResult(diagnosis);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Back navigation after diagnosis ───────────────────────────────────────
  const backLink = result?.recommended_plan && PLAN_PARAM[result.recommended_plan]
    ? `/buy-now?plan=${PLAN_PARAM[result.recommended_plan]}`
    : back === 'quote' ? '/quote' : '/buy-now';

  const backLabel = result?.recommended_plan && back === 'buynow'
    ? `Return to Buy Now — ${result.recommended_plan} pre-selected →`
    : back === 'quote'
      ? 'Continue to Quote Form →'
      : 'Return to Buy Now →';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-np-surface">
      {/* Header */}
      <div className="bg-np-dark text-white px-[5%] py-12 text-center">
        <div className="page-hero-badge">AI Lawn Diagnosis</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Not Sure What Your Lawn Needs?</h1>
        <p className="text-white/60 max-w-xl mx-auto">
          Describe your lawn problem — or upload a photo — and get an AI-powered treatment recommendation in seconds.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-[5%] py-10">

        {/* Input form — hidden once result is shown */}
        {!result && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-np-border shadow-np p-8 space-y-6">

            {/* Symptoms text */}
            <div>
              <label className="block text-sm font-semibold text-np-dark mb-2">
                Describe the problem *
              </label>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                rows={4}
                placeholder='e.g. "Brown circular patches near the fence, appeared after rain. Grass pulls up easily at the edges."'
                className="w-full px-4 py-3 text-sm rounded-xl border border-np-border outline-none focus:border-np-accent focus:ring-2 focus:ring-np-accent/20 resize-none transition-all"
                maxLength={800}
              />
              <p className="mt-1 text-xs text-np-muted text-right">{symptoms.length}/800</p>
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-sm font-semibold text-np-dark mb-2">
                Attach a photo <span className="font-normal text-np-muted">(optional, improves accuracy)</span>
              </label>

              {!photo ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-np-border rounded-xl p-8 text-center cursor-pointer hover:border-np-accent/50 hover:bg-np-surface transition-all"
                >
                  <svg className="w-8 h-8 stroke-np-muted fill-none stroke-[1.5] mx-auto mb-3" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm text-np-muted">
                    <span className="font-semibold text-np-accent">Click to upload</span> or drag &amp; drop
                  </p>
                  <p className="text-xs text-np-muted mt-1">JPG · PNG · WebP · max 10 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-np-border">
                  <img src={photo.previewUrl} alt="Lawn photo preview" className="w-full max-h-56 object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-3 py-1.5 truncate">
                    {photo.file.name} · {(photo.file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              )}

              {photoError && <p className="mt-2 text-xs text-red-600">{photoError}</p>}
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!symptoms.trim() && !photo)}
              className="w-full btn-primary py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analysing your lawn…
                </span>
              ) : 'Analyse My Lawn →'}
            </button>

            <p className="text-xs text-np-muted text-center">
              No login required. Analysis typically completes in under 5 seconds.
            </p>
          </form>
        )}

        {/* Result card */}
        {result && (
          <div className="space-y-5">

            {/* Diagnosis header */}
            <div className="bg-white rounded-2xl border border-np-border shadow-np p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-np-accent/15 flex items-center justify-center">
                  <svg className="w-6 h-6 stroke-np-accent fill-none stroke-[1.8]" viewBox="0 0 24 24">
                    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
                  </svg>
                </div>
                <div>
                  <div className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2 border ${
                    result.confidence === 'high'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {result.confidence === 'high' ? 'High Confidence' : 'Medium Confidence'}
                  </div>
                  <h2 className="text-np-dark text-xl font-extrabold">{result.diagnosis}</h2>
                </div>
              </div>

              <p className="text-np-muted text-sm leading-relaxed mb-6">{result.explanation}</p>

              {/* Medium confidence note */}
              {result.confidence === 'medium' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
                  This is a likely diagnosis — we recommend a professional visit to confirm before treatment.
                </div>
              )}

              {/* Recommended plan */}
              {result.recommended_plan && (
                <div className="bg-np-surface rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 stroke-np-accent fill-none stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <p className="text-sm text-np-dark">
                    <span className="font-semibold">Recommended plan: </span>{result.recommended_plan}
                  </p>
                </div>
              )}

              {/* Treatment pills */}
              <div>
                <p className="text-xs font-bold text-np-muted uppercase tracking-wider mb-3">Recommended Services</p>
                <div className="flex flex-col gap-2">
                  {result.treatments.map((t, i) => (
                    <Link
                      key={i}
                      to={t.route}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium no-underline transition-all hover:shadow-sm ${URGENCY_STYLE[t.urgency] || URGENCY_STYLE.medium}`}
                    >
                      <span>{t.name}</span>
                      <span className="flex items-center gap-1.5 text-xs opacity-70">
                        {t.urgency} priority
                        <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-white rounded-xl border border-np-border px-5 py-4 flex gap-3">
              <svg className="w-4 h-4 flex-shrink-0 stroke-np-muted fill-none stroke-2 mt-0.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-xs text-np-muted leading-relaxed">
                <strong className="text-np-dark">Advisory only.</strong> AI lawn diagnosis is not a substitute for professional assessment. Results are based on common Midwest lawn conditions and general turfgrass science. Contact us for a definitive diagnosis.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={backLink} className="btn-primary text-center py-3.5 flex-1 no-underline">
                {backLabel}
              </Link>
              <button
                onClick={() => { setResult(null); setSymptoms(''); removePhoto(); }}
                className="btn-outline py-3.5 flex-1"
              >
                ← Diagnose Another Problem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
