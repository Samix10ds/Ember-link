import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RPCBadge({ discordId, userId, accent, theme }) {
  const [presence, setPresence] = useState(null);
  const [rpcSettings, setRpcSettings] = useState(null);

  useEffect(() => {
    load();
    const channel = supabase.channel(`presence-${discordId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'discord_presence', filter: `discord_id=eq.${discordId}` },
        payload => setPresence(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [discordId]);

  async function load() {
    const { data: p } = await supabase.from('discord_presence').select('*').eq('discord_id', discordId).maybeSingle();
    setPresence(p);
    const { data: s } = await supabase.from('rpc_settings').select('*').eq('user_id', userId).maybeSingle();
    setRpcSettings(s);
  }

  if (rpcSettings?.mode === 'off') return null;

  if (rpcSettings?.mode === 'custom') return (
    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs animate-fade-in"
      style={{
        background: accent + '18',
        border: `1px solid ${accent}40`,
        color: theme.text,
        backdropFilter: 'blur(8px)',
      }}>
      {rpcSettings.custom_icon || '✨'} {rpcSettings.custom_text || 'Online'}
    </div>
  );

  if (!presence) return null;

  const STATUS_COLORS = { online: '#22c55e', idle: '#f59e0b', dnd: '#ef4444', offline: '#71717a' };
  const spotify = presence.spotify;
  const game = presence.activities?.find(a => a.type === 0);

  return (
    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs animate-fade-in"
      style={{
        background: accent + '18',
        border: `1px solid ${accent}40`,
        color: theme.text,
        backdropFilter: 'blur(8px)',
      }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: STATUS_COLORS[presence.status] || '#71717a', boxShadow: `0 0 6px ${STATUS_COLORS[presence.status]}` }} />
      {spotify ? `🎧 ${spotify.song} — ${spotify.artist}`
        : game ? `🎮 ${game.name}`
        : <span className="capitalize">{presence.status}</span>}
    </div>
  );
}
