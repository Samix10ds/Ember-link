import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const MAX_BADGES_FREE = 1;
const MAX_BADGES_PREMIUM = 3;

export default function BadgeEditor({ theme: d }) {
  const { profile } = useAuth();
  const [badges, setBadges] = useState([]);
  const [emoji, setEmoji] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#e8a33d');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const maxBadges = profile?.is_premium ? MAX_BADGES_PREMIUM : MAX_BADGES_FREE;

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('badges')
      .select('*').eq('user_id', profile.id).eq('is_system', false).order('created_at');
    setBadges(data || []);
  }

  async function addBadge(e) {
    e.preventDefault();
    setError('');
    if (!emoji || !label) { setError('Emoji e testo sono obbligatori.'); return; }
    if (badges.length >= maxBadges) {
      setError(`Hai raggiunto il limite di ${maxBadges} badge. ${!profile.is_premium ? 'Passa a Premium per aggiungerne fino a 3.' : ''}`);
      return;
    }
    setSaving(true);
    await supabase.from('badges').insert({
      user_id: profile.id, emoji, label, color, is_system: false,
    });
    setEmoji(''); setLabel(''); setColor('#e8a33d');
    setSaving(false);
    load();
  }

  async function deleteBadge(id) {
    await supabase.from('badges').delete().eq('id', id);
    load();
  }

  const inputStyle = {
    background: d.surfaceHover, border: `1px solid ${d.border}`,
    color: d.text, borderRadius: 10, padding: '8px 12px', outline: 'none',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-sm" style={{ color: d.text }}>
          Badge personalizzati ({badges.length}/{maxBadges})
        </p>
        {!profile?.is_premium && (
          <span className="text-xs px-2 py-1 rounded-full"
            style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44' }}>
            Premium → 3 badge
          </span>
        )}
      </div>

      {error && <p className="text-xs mb-3" style={{ color: '#f87171' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {badges.map(badge => (
          <div key={badge.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: badge.color + '22', border: `1.5px solid ${badge.color}55`, color: badge.color,
          }}>
            {badge.emoji} {badge.label}
            <button onClick={() => deleteBadge(badge.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: badge.color, fontSize: 14, lineHeight: 1 }}>
              ×
            </button>
          </div>
        ))}
        {badges.length === 0 && (
          <p className="text-xs" style={{ color: d.textMuted }}>Nessun badge ancora.</p>
        )}
      </div>

      {badges.length < maxBadges && (
        <form onSubmit={addBadge} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={emoji} onChange={e => setEmoji(e.target.value)}
            placeholder="🎮" style={{ ...inputStyle, width: 60 }} maxLength={2} />
          <input value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Testo badge" style={{ ...inputStyle, flex: 1, minWidth: 120 }} maxLength={20} />
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            style={{ width: 40, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
          <button type="submit" disabled={saving}
            style={{
              background: d.accent, color: '#000', borderRadius: 10,
              padding: '8px 16px', fontWeight: 600, fontSize: 13,
              border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1,
            }}>
            + Aggiungi
          </button>
        </form>
      )}
    </div>
  );
}
