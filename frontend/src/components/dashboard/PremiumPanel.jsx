import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PremiumPanel({ profile, theme: d, onUpdate }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function redeemCode(e) {
    e.preventDefault();
    setLoading(true); setMessage('');
    const token = await getToken();
    const res = await fetch('/api/redeem-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(res.ok ? '✅ Premium attivato!' : `❌ ${data.error}`);
    if (res.ok) onUpdate();
  }

  async function payWithBitcoin() {
    setLoading(true); setMessage('');
    const token = await getToken();
    const res = await fetch('/api/create-btcpay-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount: '5', currency: 'EUR' }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.checkoutLink) window.location.href = data.checkoutLink;
    else setMessage(`❌ ${data.error || 'Errore BTCPay. Configurarlo prima (vedi README).'}`);
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">Premium</h2>

      <div className={`p-4 rounded-xl border mb-6 ${profile.is_premium ? 'border-brand bg-brand/10' : 'border-line bg-surface'}`}>
        <p className="font-medium">{profile.is_premium ? '⭐ Sei Premium' : 'Account gratuito'}</p>
        {profile.is_premium && profile.premium_expires_at && (
          <p className="text-sm text-zinc-400">Scade il {new Date(profile.premium_expires_at).toLocaleDateString('it-IT')}</p>
        )}
        {profile.is_premium && !profile.premium_expires_at && (
          <p className="text-sm text-zinc-400">Premium a vita</p>
        )}
      </div>

      {message && <p className="mb-4 text-sm">{message}</p>}

      <div className="space-y-4">
        <form onSubmit={redeemCode} className="bg-surface p-4 rounded-xl border border-line">
          <p className="font-medium mb-2">Hai un codice?</p>
          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="CODICE"
              className="flex-1 px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand uppercase font-mono" />
            <button type="submit" disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-black font-semibold disabled:opacity-50">
              Riscatta
            </button>
          </div>
        </form>

        <div className="bg-surface p-4 rounded-xl border border-line">
          <p className="font-medium mb-1">Paga con Bitcoin ₿</p>
          <p className="text-sm text-zinc-500 mb-3">5€/mese · richiede BTCPay configurato (vedi README)</p>
          <button onClick={payWithBitcoin} disabled={loading}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 font-semibold disabled:opacity-50">
            Paga con Bitcoin
          </button>
        </div>
      </div>
    </div>
  );
}
