import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS = {
  online: 'bg-emerald-500', idle: 'bg-amber-400',
  dnd: 'bg-red-500', offline: 'bg-zinc-500',
};

export default function RPCBadge({ discordId, userId }) {
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
    <div className="mt-3 inline-flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-2 rounded-full text-xs">
      {rpcSettings.custom_icon || '✨'} {rpcSettings.custom_text || 'Online'}
    </div>
  );

  if (!presence) return null;

  const spotify = presence.spotify;
  const game = presence.activities?.find(a => a.type === 0);

  return (
    <div className="mt-3 inline-flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-2 rounded-full text-xs">
      <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[presence.status] || 'bg-zinc-500'}`} />
      {spotify ? `🎧 ${spotify.song} — ${spotify.artist}`
        : game ? `🎮 In gioco: ${game.name}`
        : <span className="capitalize">{presence.status}</span>}
    </div>
  );
}
