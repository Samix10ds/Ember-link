// Riceve eventi da BTCPay e attiva il premium quando una fattura viene pagata
// POST /api/btcpay-webhook  (chiamato da BTCPay, non dal frontend)
// Configura questo URL in BTCPay → Store → Webhooks, evento "Invoice Settled"

import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['btcpay-sig'];
  const computed = 'sha256=' + createHmac('sha256', process.env.BTCPAY_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (signature !== computed) return res.status(401).end();

  if (req.body.type === 'InvoiceSettled') {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const userId = req.body.metadata?.userId;
    if (userId) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('profiles').update({ is_premium: true, premium_expires_at: expiresAt }).eq('id', userId);
    }
  }
  return res.status(200).end();
}
