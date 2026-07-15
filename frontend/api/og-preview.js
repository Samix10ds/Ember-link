// Recupera i meta tag Open Graph di un URL (titolo, immagine, descrizione)
// GET /api/og-preview?url=https://...

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Parametro url mancante' });

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EmberLinkBot/1.0)' },
    });
    const html = await response.text();

    const getMeta = (prop) => {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'),
      ];
      for (const p of patterns) {
        const match = html.match(p);
        if (match) return match[1];
      }
      return null;
    };

    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.json({
      title: getMeta('og:title') || html.match(/<title>([^<]+)<\/title>/i)?.[1] || null,
      description: getMeta('og:description'),
      image: getMeta('og:image'),
    });
  } catch {
    return res.status(500).json({ error: 'Impossibile recuperare la preview' });
  }
}
