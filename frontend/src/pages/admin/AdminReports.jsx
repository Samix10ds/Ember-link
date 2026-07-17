import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS = {
  pending: '#fbbf24',
  reviewed: '#34d399',
  dismissed: '#71717a',
};

export default function AdminReports({ profile }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:reporter_id(username), reported:reported_user_id(username, is_banned)')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from('reports').update({ status, reviewed_by: profile.id }).eq('id', id);
    load();
  }

  async function banUser(userId, reportId) {
    const reason = prompt('Motivo del ban:');
    if (!reason) return;
    await supabase.from('profiles').update({
      is_banned: true, banned_reason: reason, banned_by: profile.id,
    }).eq('id', userId);
    await supabase.from('reports').update({ status: 'reviewed', reviewed_by: profile.id }).eq('id', reportId);
    load();
  }

  async function unbanUser(userId) {
    await supabase.from('profiles').update({ is_banned: false, banned_reason: null, banned_by: null }).eq('id', userId);
    load();
  }

  if (loading) return <p style={{ color: '#71717a' }}>Caricamento...</p>;

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>🚩 Segnalazioni</h2>
      {reports.length === 0 && <p style={{ color: '#71717a' }}>Nessuna segnalazione.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reports.map(r => (
          <div key={r.id} style={{
            padding: 16, borderRadius: 12,
            background: '#16161a', border: '1px solid #27272e',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600,
                    background: STATUS_COLORS[r.status] + '22', color: STATUS_COLORS[r.status],
                    border: `1px solid ${STATUS_COLORS[r.status]}44`,
                  }}>
                    {r.status}
                  </span>
                  {r.reported?.is_banned && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#f8717122', color: '#f87171', border: '1px solid #f8717144' }}>
                      BANNATO
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                  @{r.reporter?.username} → @{r.reported?.username}
                </p>
                <p style={{ fontSize: 13, color: '#a1a1aa' }}>{r.reason}</p>
                {r.details && <p style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>{r.details}</p>}
                <p style={{ fontSize: 11, color: '#52525b', marginTop: 6 }}>
                  {new Date(r.created_at).toLocaleString('it-IT')}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(r.id, 'dismissed')}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#1e1e23', border: '1px solid #27272e', color: '#a1a1aa' }}>
                      Ignora
                    </button>
                    <button onClick={() => updateStatus(r.id, 'reviewed')}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#34d39922', border: '1px solid #34d39944', color: '#34d399' }}>
                      Revisiona
                    </button>
                    {!r.reported?.is_banned && (
                      <button onClick={() => banUser(r.reported_user_id, r.id)}
                        style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#f8717122', border: '1px solid #f8717144', color: '#f87171' }}>
                        Banna
                      </button>
                    )}
                  </>
                )}
                {r.reported?.is_banned && (
                  <button onClick={() => unbanUser(r.reported_user_id)}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#fbbf2422', border: '1px solid #fbbf2444', color: '#fbbf24' }}>
                    Sbanna
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
