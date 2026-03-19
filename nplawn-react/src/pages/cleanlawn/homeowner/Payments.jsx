import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const BRAND_ICON = {
  Visa: '💳',
  Mastercard: '💳',
  Amex: '💳',
  Discover: '💳',
};

const BRAND_COLOR = {
  Visa: 'text-blue-700',
  Mastercard: 'text-orange-600',
  Amex: 'text-blue-500',
  Discover: 'text-orange-500',
};

export default function Payments() {
  const { user } = useAuth();
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showAdd, setShowAdd]   = useState(false);
  const [newCard, setNewCard]   = useState({ card_last4: '', card_brand: 'Visa', card_exp_month: '', card_exp_year: '' });

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('saved_payment_methods')
      .select('*').eq('homeowner_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => { setCards(data ?? []); setLoading(false); });
  }, [user?.id]);

  const toggleAutopay = async (card) => {
    const updated = { autopay_enabled: !card.autopay_enabled };
    await supabase.from('saved_payment_methods').update(updated).eq('id', card.id);
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, ...updated } : c));
  };

  const setDefault = async (card) => {
    await supabase.from('saved_payment_methods')
      .update({ is_default: false }).eq('homeowner_id', user.id);
    await supabase.from('saved_payment_methods')
      .update({ is_default: true }).eq('id', card.id);
    setCards(prev => prev.map(c => ({ ...c, is_default: c.id === card.id })));
  };

  const removeCard = async (id) => {
    if (!confirm('Remove this payment method?')) return;
    await supabase.from('saved_payment_methods').delete().eq('id', id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const addCard = async (e) => {
    e.preventDefault();
    if (newCard.card_last4.length !== 4) return;
    setSaving(true);
    const payload = {
      homeowner_id: user.id,
      card_last4: newCard.card_last4,
      card_brand: newCard.card_brand,
      card_exp_month: parseInt(newCard.card_exp_month),
      card_exp_year: parseInt(newCard.card_exp_year),
      is_default: cards.length === 0,
    };
    const { data } = await supabase.from('saved_payment_methods').insert(payload).select().single();
    if (data) setCards(prev => [...prev, data]);
    setShowAdd(false);
    setNewCard({ card_last4: '', card_brand: 'Visa', card_exp_month: '', card_exp_year: '' });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Payment Methods</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payment Methods</h1>
            <p className="text-sm text-gray-500">Manage saved cards and auto-pay settings.</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Add Card
          </button>
        </div>

        {/* Add card form */}
        {showAdd && (
          <form onSubmit={addCard} className="bg-white rounded-xl border border-green-200 shadow-sm p-5 mb-5">
            <h3 className="font-semibold text-gray-800 mb-4">Add New Card</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Card Brand</label>
                <select value={newCard.card_brand}
                  onChange={e => setNewCard(p => ({ ...p, card_brand: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  {['Visa','Mastercard','Amex','Discover'].map(b => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Last 4 Digits</label>
                <input type="text" maxLength={4} placeholder="4242"
                  value={newCard.card_last4}
                  onChange={e => setNewCard(p => ({ ...p, card_last4: e.target.value.replace(/\D/g,'') }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Exp Month</label>
                <input type="number" min={1} max={12} placeholder="MM"
                  value={newCard.card_exp_month}
                  onChange={e => setNewCard(p => ({ ...p, card_exp_month: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Exp Year</label>
                <input type="number" min={2025} max={2040} placeholder="YYYY"
                  value={newCard.card_exp_year}
                  onChange={e => setNewCard(p => ({ ...p, card_exp_year: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Card'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm py-10 text-center">Loading…</p>
        ) : cards.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-gray-500 mb-2">No saved payment methods.</p>
            <p className="text-sm text-gray-400">Add a card to enable quick pay and auto-pay.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map(card => (
              <div key={card.id} className={`bg-white rounded-xl border shadow-sm p-5 ${card.is_default ? 'border-green-300' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">💳</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${BRAND_COLOR[card.card_brand] ?? 'text-gray-800'}`}>
                          {card.card_brand}
                        </span>
                        <span className="text-gray-600 text-sm">•••• {card.card_last4}</span>
                        {card.is_default && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Expires {card.card_exp_month?.toString().padStart(2,'0')}/{card.card_exp_year}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Auto-pay toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Auto-pay</span>
                      <button onClick={() => toggleAutopay(card)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                          card.autopay_enabled ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                          card.autopay_enabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                  {!card.is_default && (
                    <button onClick={() => setDefault(card)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium">
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => removeCard(card.id)}
                    className="text-sm text-red-500 hover:text-red-600 font-medium">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auto-pay info */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-700">
          <strong>Auto-pay:</strong> When enabled, invoices are automatically charged to your default card on the due date. You'll receive an email receipt after each payment.
        </div>
      </div>
    </div>
  );
}
