import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminBadges() {
  const [username, setUsername] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [emoji, setEmoji] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#e8a33d');
  const [userBadges, setUserBadges] = useState([]);
  const [message, setMessage] = useState('');

  async function searchUser(e) {
    e.preventDefault();
    const { data } = await supabase.from('profiles').select('id, username, display_name').eq('username', username.toLowerCase()).maybeSingle();
    if (!data) { setMessage('Utente non trovato.'); setTargetUser(null); return; }
    setTargetUser(data);
    setMessage('');
    loadBadges(data.id);
  }

  async function loadBadges(userId) {
    const { data } = await supabase.from('badges').select('*').eq('user_id', userId);
    setUserBadges(data || []);
  }

  async function assignBadge(e) {
    e.preventDefault();
    if (!targetUser || !emoji || !label) return;
    await supabase.from('badges').insert({
      user_id: targetUser.id, emoji, label, color, is_system: false,
    });
    setEmoji(''); setLabel(''); setColor('#e8a33d');
    setMessage('Badge assegnato!');
    loadBadges(targetUser.id);
  }

  async function removeBadge(id) {
    await supabase.from('badges').delete().eq('id', id);
    loadBadges(targetUser.id);
  }

  const inputStyle = {
    padding: '8px 12px', borderRadius: 10,
    background: '#1e1e23', border: '1px solid #27272e',
    color: '#fff', fontSize: 13, outline: 'none',
  };

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>🏅 Assegna badge</h2>

      <form onSubmit={searchUser} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="Username utente..." style={{ ...inputStyle, flex: 1 }} />
        <button type="submit"
          style={{ padding: '8px 16px', borderRadius: 10, background: '#e8a33d', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          Cerca
        </button>
      </form>

      {message && <p style={{ color: '#34d399', fontSize: 13, marginBottom: 12 }}>{message}</p>}

      {targetUser && (
        <div>
          <p style={{ color: '#a1a1aa', marginBottom: 12 }}>Utente: <strong style={{ color: '#fff' }}>@{targetUser.username}</strong></p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {userBadges.map(b => (
              <span key={b.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: b.color + '22', border: `1.5px solid ${b.color}55`, color: b.color,
              }}>
                {b.emoji} {b.label}
                <button onClick={() => removeBadge(b.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: b.color, fontSize: 14 }}>×</button>
              </span>
            ))}
            {userBadges.length === 0 && <p style={{ color: '#71717a', fontSize: 13 }}>Nessun badge.</p>}
          </div>

          <form onSubmit={assignBadge} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🎯" style={{ ...inputStyle, width: 60 }} maxLength={2} />
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Testo badge" style={{ ...inputStyle, flex: 1, minWidth: 120 }} maxLength={20} />
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: 40, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
            <button type="submit"
              style={{ padding: '8px 16px', borderRadius: 10, background: '#e8a33d', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Assegna
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
