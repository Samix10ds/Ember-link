import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [users, links, reports, premium] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('links').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
    ]);
    setStats({
      users: users.count || 0,
      links: links.count || 0,
      pendingReports: reports.count || 0,
      premium: premium.count || 0,
    });
  }

  const cards = stats ? [
    { label: 'Utenti totali', value: stats.users, emoji: '👥', color: '#60a5fa' },
    { label: 'Link totali', value: stats.links, emoji: '🔗', color: '#34d399' },
    { label: 'Segnalazioni pendenti', value: stats.pendingReports, emoji: '🚩', color: '#f87171' },
    { label: 'Utenti premium', value: stats.premium, emoji: '⭐', color: '#fbbf24' },
  ] : [];

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>📊 Statistiche globali</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {cards.map(card => (
          <div key={card.label} style={{
            padding: 20, borderRadius: 14,
            background: card.color + '11', border: `1px solid ${card.color}33`,
          }}>
            <p style={{ fontSize: 28, marginBottom: 4 }}>{card.emoji}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</p>
            <p style={{ fontSize: 13, color: '#71717a' }}>{card.label}</p>
          </div>
        ))}
      </div>
      {!stats && <p style={{ color: '#71717a' }}>Caricamento...</p>}
    </div>
  );
}
