// Riscatta un codice premium per l'utente autenticato
// POST /api/redeem-code  body: { code }

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Verifica chi è loggato tramite il token di sessione
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non autenticato' });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return res.status(401).json({ error: 'Sessione non valida' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Codice mancante' });

  const { data: codeData } = await supabase.from('discount_codes').select('*').eq('code', code).single();
  if (!codeData) return res.status(404).json({ error: 'Codice non valido' });
  if (codeData.uses >= codeData.max_uses) return res.status(400).json({ error: 'Codice esaurito' });
  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Codice scaduto' });
  }

  const expiresAt = codeData.grants === 'premium_lifetime'
    ? null
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from('profiles').update({ is_premium: true, premium_expires_at: expiresAt }).eq('id', user.id);
  await supabase.from('discount_codes').update({ uses: codeData.uses + 1 }).eq('code', code);
  await supabase.from('code_redemptions').insert({ code, user_id: user.id });

  return res.json({ success: true });
}
