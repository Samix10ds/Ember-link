import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const MODES = [
  { id: 'auto', label: 'Automatica', desc: 'Mostra gioco/Spotify dal vivo via Discord' },
  { id: 'custom', label: 'Personalizzata', desc: 'Un testo fisso a tua scelta' },
  { id: 'off', label: 'Disattiva', desc: 'Nessun badge sul profilo' },
];

export default function RPCSettings({ profile, theme: d, onUpdate }) {
  const [discordId, setDiscordId] = useState(profile.discord_id || '');
  const [mode, setMode] = useState('auto');
  const [customText, setCustomText] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('rpc_settings').select('*').eq('user_id', profile.id).maybeSingle();
    if (data) { setMode(data.mode || 'auto'); setCustomText(data.custom_text || ''); setCustomIcon(data.custom_icon || ''); }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({ discord_id: discordId.trim() }).eq('id', profile.id);
    await supabase.from('rpc_settings').upsert({
      user_id: profile.id, enabled: mode !== 'off',
      mode, custom_text: customText, custom_icon: customIcon,
    });
    setSaving(false);
    onUpdate();
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">RPC Discord</h2>

      <div className="bg-surface p-4 rounded-xl border border-line mb-6 text-sm text-zinc-400 space-y-2">
        <p className="text-white font-medium">Come funziona</p>
        <p>Il bot (su Fly.io) sta connesso 24/7 a Discord. Quando cambi gioco/canzone, il bot lo scrive su Supabase e il tuo profilo si aggiorna in tempo reale senza ricaricare la pagina.</p>
        <p className="text-zinc-500">Per funzionare, tu e chi visita il profilo dovete essere in un server Discord dove è presente il bot.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Il tuo Discord User ID</label>
          <p className="text-xs text-zinc-500 mb-2">Discord → Impostazioni → Avanzate → attiva "Modalità sviluppatore" → click destro sul tuo nome → Copia ID utente</p>
          <input type="text" placeholder="123456789012345678" value={discordId}
            onChange={e => setDiscordId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand font-mono" />
        </div>

        <div>
          <label className="text-sm text-zinc-400 block mb-2">Modalità</label>
          <div className="space-y-2">
            {MODES.map(m => (
              <button key={m.id} type="button" onClick={() => setMode(m.id)}
                className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 ${mode === m.id ? 'bg-brand/20 border border-brand text-white' : 'bg-surface-hover text-zinc-400 border border-transparent'}`}>
                <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${mode === m.id ? 'border-brand bg-brand' : 'border-zinc-500'}`} />
                <div>
                  <p className="font-medium text-sm">{m.label}</p>
                  <p className="text-xs text-zinc-500">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {mode === 'custom' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Emoji</label>
              <input value={customIcon} onChange={e => setCustomIcon(e.target.value)} placeholder="🎨"
                className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-zinc-400 block mb-1">Testo</label>
              <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Sto codando..."
                className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-black font-semibold disabled:opacity-50">
          {saving ? 'Salvo...' : 'Salva'}
        </button>
      </form>
    </div>
  );
}
