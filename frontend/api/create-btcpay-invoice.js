// Crea una fattura BTCPay e restituisce il link di checkout
// POST /api/create-btcpay-invoice  body: { amount, currency }

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non autenticato' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Sessione non valida' });

  if (!process.env.BTCPAY_HOST) {
    return res.status(500).json({ error: 'BTCPay non configurato. Vedi README.' });
  }

  const { amount = '5', currency = 'EUR' } = req.body;

  const response = await fetch(`${process.env.BTCPAY_HOST}/api/v1/stores/${process.env.BTCPAY_STORE_ID}/invoices`, {
    method: 'POST',
    headers: { Authorization: `token ${process.env.BTCPAY_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount, currency,
      metadata: { userId: user.id },
      checkout: { redirectURL: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=pending` },
    }),
  });

  const invoice = await response.json();
  return res.json({ checkoutLink: invoice.checkoutLink });
}
