// Genera un nuovo codice premium (solo tuo uso personale, protetto da ADMIN_SECRET)
// POST /api/generate-code  body: { grants, maxUses, adminSecret }
//
// Come usarlo dal terminale:
// curl -X POST https://ember-link.vercel.app/api/generate-code \
//   -H "Content-Type: application/json" \
//   -d '{"grants":"premium_30d","maxUses":1,"adminSecret":"IL_TUO_ADMIN_SECRET"}'

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { grants = 'premium_30d', maxUses = 1, adminSecret } = req.body;

  if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Non autorizzato' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const code = randomBytes(4).toString('hex').toUpperCase();
  await supabase.from('discount_codes').insert({ code, grants, max_uses: maxUses });
  return res.json({ code });
}
