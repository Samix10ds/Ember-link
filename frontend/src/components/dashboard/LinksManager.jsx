import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LinksManager({ profile, theme: d }) {
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
    let ogData = {};
    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      if (res.ok) ogData = await res.json();
    } catch {}
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

  const inputStyle = {
    background: d.surfaceHover, border: `1px solid ${d.border}`,
    color: d.text, borderRadius: '10px', padding: '10px 14px', width: '100%', outline: 'none',
  };

  if (loading) return <div className="flex justify-center py-8">
    <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: d.accent, borderTopColor: 'transparent' }} />
  </div>;

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: d.text }}>🔗 I tuoi link</h2>

      <form onSubmit={addLink} className="p-4 rounded-xl mb-6 space-y-2"
        style={{ background: d.surface, border: `1px solid ${d.border}` }}>
        <input type="text" placeholder="Titolo (es. Il mio Discord)" value={title}
          onChange={e => setTitle(e.target.value)} style={inputStyle}
          onFocus={e => e.target.style.borderColor = d.accent}
          onBlur={e => e.target.style.borderColor = d.border} />
        <input type="url" placeholder="https://..." value={url}
          onChange={e => setUrl(e.target.value)} style={inputStyle}
          onFocus={e => e.target.style.borderColor = d.accent}
          onBlur={e => e.target.style.borderColor = d.border} />
        <button type="submit" disabled={saving}
          className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${d.accent}, ${d.accent}cc)`,
            color: '#000', boxShadow: `0 4px 16px ${d.accent}33`,
            opacity: saving ? 0.7 : 1,
          }}>
          {saving ? 'Aggiungo...' : '+ Aggiungi link'}
        </button>
      </form>

      <div className="space-y-2">
        {links.map((link, i) => (
          <div key={link.id}
            className={`p-3 rounded-xl flex items-center gap-3 transition-all duration-200 animate-fade-up stagger-${Math.min(i+1,8)}`}
            style={{
              background: d.surface,
              border: `1px solid ${link.is_active ? d.border : d.border + '55'}`,
              opacity: link.is_active ? 1 : 0.5,
            }}>
            {link.og_image && <img src={link.og_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm" style={{ color: d.text }}>{link.title}</p>
              <p className="text-xs truncate" style={{ color: d.textMuted }}>{link.url} · {link.clicks} click</p>
            </div>
            <button onClick={() => move(i, -1)} className="px-1 transition-opacity hover:opacity-100 opacity-40" style={{ color: d.accent }}>↑</button>
            <button onClick={() => move(i, 1)} className="px-1 transition-opacity hover:opacity-100 opacity-40" style={{ color: d.accent }}>↓</button>
            <button onClick={() => toggleActive(link.id, link.is_active)}
              className="text-xs px-2 py-1 rounded-lg transition-all"
              style={{ color: d.textMuted, background: d.surfaceHover }}>
              {link.is_active ? 'Nascondi' : 'Mostra'}
            </button>
            <button onClick={() => deleteLink(link.id)}
              className="px-2 transition-opacity hover:opacity-100 opacity-60"
              style={{ color: '#f87171' }}>✕</button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: d.textMuted }}>Nessun link. Aggiungine uno sopra.</p>
        )}
      </div>
    </div>
  );
}
