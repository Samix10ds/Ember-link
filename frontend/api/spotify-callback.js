// Callback OAuth Spotify — scambia il code per i token e li salva su Supabase
// GET /api/spotify-callback?code=...&state=<userId>

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, state: userId } = req.query;
  if (!code || !userId) return res.status(400).send('Parametri mancanti');

  const params = new URLSearchParams({
    grant_type: 'authorization_code', code,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify-callback`,
  });

  const authHeader = Buffer.from(`${process.env.VITE_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${authHeader}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) return res.status(400).json(tokenData);

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  await supabase.from('spotify_tokens').upsert({
    user_id: userId,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
  });

  return res.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?spotify=connected`);
}
