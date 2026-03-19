import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const PLANS = [
  {
    name: 'Basic',
    price: 99,
    frequency: 'biweekly',
    badge: null,
    color: 'border-gray-200',
    headerColor: 'bg-gray-50',
    services: [
      'Bi-Weekly Lawn Mowing & Edging',
      'Seasonal Leaf Removal (1x)',
      'Email Support',
    ],
    not_included: [
      'Hedge Trimming',
      'Aeration & Overseeding',
      'Priority Scheduling',
    ],
  },
  {
    name: 'Standard',
    price: 199,
    frequency: 'weekly',
    badge: 'Most Popular',
    color: 'border-green-400',
    headerColor: 'bg-green-600',
    services: [
      'Weekly Lawn Mowing & Edging',
      'Monthly Hedge Trimming',
      'Seasonal Aeration (2x)',
      'Seasonal Leaf Removal (2x)',
      'Email + SMS Support',
    ],
    not_included: [
      'Snow Removal',
      'Irrigation Service',
    ],
  },
  {
    name: 'Premium',
    price: 349,
    frequency: 'weekly',
    badge: 'All-Inclusive',
    color: 'border-yellow-400',
    headerColor: 'bg-yellow-500',
    services: [
      'Weekly Mowing, Edging & Trimming',
      'Bi-Monthly Hedge Trimming',
      'Seasonal Aeration & Overseeding (2x)',
      'Full Seasonal Leaf Removal',
      'Snow Removal (up to 10 visits)',
      'Annual Irrigation Check',
      'Dedicated Account Manager',
      'Priority Same-Week Scheduling',
    ],
    not_included: [],
  },
];

export default function ManagePlan() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [changing, setChanging]       = useState(null);
  const [success, setSuccess]         = useState('');

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('service_plans').select('*').eq('homeowner_id', user.id)
      .eq('status', 'active').maybeSingle()
      .then(({ data }) => { setCurrentPlan(data); setLoading(false); });
  }, [user?.id]);

  const changePlan = async (plan) => {
    if (plan.name === currentPlan?.plan_name) return;
    setChanging(plan.name);

    if (currentPlan) {
      await supabase.from('service_plans').update({ status: 'cancelled' }).eq('id', currentPlan.id);
    }

    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    nextBilling.setDate(1);

    const { data } = await supabase.from('service_plans').insert({
      homeowner_id: user.id,
      plan_name: plan.name,
      price_per_month: plan.price,
      frequency: plan.frequency,
      services_included: plan.services,
      status: 'active',
      next_billing_date: nextBilling.toISOString().slice(0, 10),
    }).select().single();

    if (data) {
      setCurrentPlan(data);
      setSuccess(`Successfully switched to the ${plan.name} plan!`);
      setTimeout(() => setSuccess(''), 4000);
    }
    setChanging(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Manage Plan</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Manage Your Plan</h1>
        <p className="text-sm text-gray-500 mb-6">Upgrade or downgrade at any time. Changes take effect on your next billing cycle.</p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 text-sm font-medium">
            ✓ {success}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm py-10 text-center">Loading…</p>
        ) : (
          <>
            {currentPlan && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Plan</div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xl font-bold text-gray-800">{currentPlan.plan_name}</span>
                    <span className="text-sm text-gray-500 ml-2">· ${currentPlan.price_per_month}/mo</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Next billing: {currentPlan.next_billing_date
                      ? new Date(currentPlan.next_billing_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </div>
                </div>
                {currentPlan.services_included?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentPlan.services_included.map(s => (
                      <span key={s} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map(plan => {
                const isActive = currentPlan?.plan_name === plan.name;
                const isLoading = changing === plan.name;
                return (
                  <div key={plan.name}
                    className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-shadow hover:shadow-md ${plan.color} ${isActive ? 'ring-2 ring-green-400' : ''}`}>
                    {/* Header */}
                    <div className={`${plan.headerColor} p-5 ${plan.name !== 'Basic' ? 'text-white' : 'text-gray-800'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg">{plan.name}</div>
                          <div className={`text-2xl font-extrabold mt-1`}>${plan.price}<span className="text-sm font-normal opacity-80">/mo</span></div>
                        </div>
                        {plan.badge && (
                          <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full font-medium">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 opacity-80 capitalize`}>{plan.frequency} visits</div>
                    </div>

                    {/* Services */}
                    <div className="p-5">
                      <ul className="space-y-2 mb-4">
                        {plan.services.map(s => (
                          <li key={s} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-green-500 mt-0.5 shrink-0">✓</span> {s}
                          </li>
                        ))}
                        {plan.not_included.map(s => (
                          <li key={s} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="mt-0.5 shrink-0">✗</span> {s}
                          </li>
                        ))}
                      </ul>

                      {isActive ? (
                        <div className="w-full text-center py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-lg">
                          ✓ Current Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => changePlan(plan)}
                          disabled={!!changing}
                          className="w-full py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-800 hover:bg-gray-900 text-white disabled:opacity-60">
                          {isLoading ? 'Switching…' : currentPlan
                            ? (PLANS.findIndex(p => p.name === plan.name) > PLANS.findIndex(p => p.name === currentPlan.plan_name) ? 'Upgrade' : 'Downgrade')
                            : 'Select Plan'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              No cancellation fees. Downgrade takes effect at the end of your current billing period.
              <Link to="/CleanLawn/homeowner/billing" className="text-green-600 hover:underline ml-1">View billing history →</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
