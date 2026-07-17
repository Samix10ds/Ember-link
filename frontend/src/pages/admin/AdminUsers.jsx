import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { isOwner } from '../../lib/roles';

export default function AdminUsers({ profile }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, is_premium, is_banned, created_at')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function setRole(userId, role) {
    if (!isOwner(profile)) return;
    await supabase.from('profiles').update({ role }).eq('id', userId);
    load();
  }

  async function toggleBan(user) {
    const newBanned = !user.is_banned;
    const reason = newBanned ? prompt('Motivo del ban:') : null;
    if (newBanned && !reason) return;
    await supabase.from('profiles').update({
      is_banned: newBanned,
      banned_reason: reason || null,
      banned_by: newBanned ? profile.id : null,
    }).eq('id', user.id);
    load();
  }

  async function togglePremium(user) {
    await supabase.from('profiles').update({ is_premium: !user.is_premium }).eq('id', user.id);
    load();
  }

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_COLORS = { owner: '#f59e0b', admin: '#818cf8', user: '#71717a' };

  if (loading) return <p style={{ color: '#71717a' }}>Caricamento...</p>;

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>👥 Utenti ({users.length})</h2>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Cerca username..."
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 16,
          background: '#1e1e23', border: '1px solid #27272e', color: '#fff', outline: 'none',
          boxSizing: 'border-box',
        }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(u => (
          <div key={u.id} style={{
            padding: '12px 16px', borderRadius: 12,
            background: u.is_banned ? '#f8717108' : '#16161a',
            border: `1px solid ${u.is_banned ? '#f8717133' : '#27272e'}`,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>@{u.username}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, padding: '1px 8px', borderRadius: 999,
                  background: ROLE_COLORS[u.role] + '22', color: ROLE_COLORS[u.role],
                  border: `1px solid ${ROLE_COLORS[u.role]}44`,
                }}>
                  {u.role}
                </span>
                {u.is_premium && (
                  <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: '#fbbf2422', color: '#fbbf24', border: '1px solid #fbbf2444' }}>
                    premium
                  </span>
                )}
                {u.is_banned && (
                  <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: '#f8717122', color: '#f87171', border: '1px solid #f8717144' }}>
                    bannato
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {/* Solo owner può cambiare ruoli */}
              {isOwner(profile) && u.id !== profile.id && (
                <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
                  style={{
                    padding: '5px 8px', borderRadius: 8, fontSize: 12,
                    background: '#1e1e23', border: '1px solid #27272e', color: '#a1a1aa', cursor: 'pointer',
                  }}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              )}

              <button onClick={() => togglePremium(u)}
                style={{
                  padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  background: u.is_premium ? '#fbbf2422' : '#1e1e23',
                  border: `1px solid ${u.is_premium ? '#fbbf2444' : '#27272e'}`,
                  color: u.is_premium ? '#fbbf24' : '#a1a1aa',
                }}>
                {u.is_premium ? '⭐ Revoca' : '⭐ Premium'}
              </button>

              {u.id !== profile.id && (
                <button onClick={() => toggleBan(u)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    background: u.is_banned ? '#34d39922' : '#f8717122',
                    border: `1px solid ${u.is_banned ? '#34d39944' : '#f8717144'}`,
                    color: u.is_banned ? '#34d399' : '#f87171',
                  }}>
                  {u.is_banned ? 'Sbanna' : 'Banna'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
