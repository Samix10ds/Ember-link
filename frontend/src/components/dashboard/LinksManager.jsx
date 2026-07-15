import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LinksManager({ profile }) {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadLinks(); }, []);

  async function loadLinks() {
    const { data } = await supabase.from('links').select('*').eq('user_id', profile.id).order('position');
    setLinks(data || []);
    setLoading(false);
  }

  async function addLink(e) {
    e.preventDefault();
    if (!title || !url) return;
    setSaving(true);

    // Chiama la Vercel Function per la preview OG
    let ogData = {};
    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      if (res.ok) ogData = await res.json();
    } catch { /* se fallisce va bene lo stesso */ }

    await supabase.from('links').insert({
      user_id: profile.id, title, url, position: links.length,
      og_title: ogData.title || null,
      og_description: ogData.description || null,
      og_image: ogData.image || null,
    });

    setTitle(''); setUrl('');
    setSaving(false);
    loadLinks();
  }

  async function deleteLink(id) {
    await supabase.from('links').delete().eq('id', id);
    loadLinks();
  }

  async function toggleActive(id, current) {
    await supabase.from('links').update({ is_active: !current }).eq('id', id);
    loadLinks();
  }

  async function move(index, direction) {
    const arr = [...links];
    const target = index + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setLinks(arr);
    await Promise.all(arr.map((l, i) => supabase.from('links').update({ position: i }).eq('id', l.id)));
  }

  if (loading) return <p className="text-zinc-400">Caricamento...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">I tuoi link</h2>

      <form onSubmit={addLink} className="bg-surface p-4 rounded-xl mb-6 border border-line space-y-2">
        <input type="text" placeholder="Titolo (es. Il mio Discord)" value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" />
        <input type="url" placeholder="https://..." value={url}
          onChange={e => setUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" />
        <button type="submit" disabled={saving}
          className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-black font-semibold disabled:opacity-50">
          {saving ? 'Aggiungo...' : '+ Aggiungi link'}
        </button>
      </form>

      <div className="space-y-2">
        {links.map((link, i) => (
          <div key={link.id}
            className={`p-3 rounded-lg border flex items-center gap-3 ${link.is_active ? 'border-line bg-surface' : 'border-line/50 bg-surface/40 opacity-50'}`}>
            {link.og_image && <img src={link.og_image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{link.title}</p>
              <p className="text-xs text-zinc-500 truncate">{link.url} · {link.clicks} click</p>
            </div>
            <button onClick={() => move(i, -1)} className="text-zinc-500 hover:text-white px-1">↑</button>
            <button onClick={() => move(i, 1)} className="text-zinc-500 hover:text-white px-1">↓</button>
            <button onClick={() => toggleActive(link.id, link.is_active)} className="text-xs text-zinc-400 hover:text-white px-2">
              {link.is_active ? 'Nascondi' : 'Mostra'}
            </button>
            <button onClick={() => deleteLink(link.id)} className="text-red-400 hover:text-red-300 px-2">✕</button>
          </div>
        ))}
        {links.length === 0 && <p className="text-zinc-500 text-sm">Nessun link. Aggiungine uno sopra.</p>}
      </div>
    </div>
  );
}
