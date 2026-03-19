import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const STATUS_CONFIG = {
  pending:   { label: 'Invited',    color: 'bg-gray-100 text-gray-600' },
  signed_up: { label: 'Signed Up',  color: 'bg-blue-100 text-blue-700' },
  credited:  { label: 'Credited',   color: 'bg-green-100 text-green-700' },
};

function generateCode(name) {
  const base = name?.split(' ')[0]?.toUpperCase().slice(0, 4) ?? 'USER';
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${rand}`;
}

export default function Referral() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [code, setCode]           = useState('');
  const [email, setEmail]         = useState('');
  const [sending, setSending]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('referrals').select('*').eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReferrals(data ?? []);
        // derive referral code from existing records or generate
        if (data?.length > 0) {
          setCode(data[0].referral_code);
        } else {
          setCode(generateCode(user.name));
        }
        setLoading(false);
      });
  }, [user?.id]);

  const copyLink = () => {
    const link = `${window.location.origin}/NP02/signup?ref=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    const { data } = await supabase.from('referrals').insert({
      referrer_id: user.id,
      referral_email: email.trim().toLowerCase(),
      referral_code: code,
      status: 'pending',
      credit_amount: 20.00,
    }).select().single();
    if (data) setReferrals(prev => [data, ...prev]);
    setEmail('');
    setSuccess(`Invite sent to ${email}`);
    setTimeout(() => setSuccess(''), 4000);
    setSending(false);
  };

  const creditedCount = referrals.filter(r => r.status === 'credited').length;
  const totalCredit   = referrals.filter(r => r.status === 'credited')
    .reduce((s, r) => s + parseFloat(r.credit_amount ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Referral Program</span>
        </div>

        {/* Hero card */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-7 text-white mb-7">
          <div className="text-3xl mb-2">🎁</div>
          <h1 className="text-2xl font-bold mb-1">Give $20, Get $20</h1>
          <p className="text-white/80 text-sm">
            For every friend who signs up and completes their first service, you both get a $20 credit.
            There's no limit — earn as many as you want!
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Invites Sent',   value: referrals.length },
              { label: 'Signed Up',      value: referrals.filter(r => r.status !== 'pending').length },
              { label: 'Credits Earned', value: `$${totalCredit.toFixed(0)}` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Your referral code */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="text-sm font-semibold text-gray-700 mb-2">Your Referral Code</div>
          <div className="flex gap-3 items-center">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg font-bold text-gray-800 tracking-widest text-center">
              {code}
            </div>
            <button onClick={copyLink}
              className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                copied ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Share this link: <span className="text-green-600 font-mono">...nplawn.com/signup?ref={code}</span>
          </p>
        </div>

        {/* Send by email */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-7">
          <div className="text-sm font-semibold text-gray-700 mb-3">Invite by Email</div>
          {success && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-3">
              ✓ {success}
            </div>
          )}
          <form onSubmit={sendInvite} className="flex gap-3">
            <input type="email" required placeholder="friend@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <button type="submit" disabled={sending}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </form>
        </div>

        {/* Referral history */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">Referral History</h2>
        {loading ? (
          <p className="text-gray-500 text-sm py-6 text-center">Loading…</p>
        ) : referrals.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-500">
            No referrals yet. Invite a friend to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map(ref => {
              const cfg = STATUS_CONFIG[ref.status] ?? STATUS_CONFIG.pending;
              return (
                <div key={ref.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{ref.referral_email}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ref.status === 'credited' && (
                      <span className="text-sm font-semibold text-green-700">+${parseFloat(ref.credit_amount).toFixed(0)}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6 text-center">
          Credits are applied after your friend completes their first paid service. Credits have no expiry date.
        </p>
      </div>
    </div>
  );
}
