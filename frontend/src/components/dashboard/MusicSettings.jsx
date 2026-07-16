import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function MusicSettings({ profile, theme: d }) {
  const [settings, setSettings] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('music_settings').select('*').eq('user_id', profile.id).maybeSingle();
    setSettings(data);
    setExternalUrl(data?.external_url || '');
  }

  async function uploadAudio(file) {
    setError('');
    if (file.size > 50 * 1024 * 1024) { setError('File troppo grande, massimo 50MB.'); return; }
    setUploading(true);
    const path = `${profile.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('audio').upload(path, file, { upsert: true });
    if (uploadError) { setError(`Errore upload: ${uploadError.message}`); setUploading(false); return; }
    const { data } = supabase.storage.from('audio').getPublicUrl(path);
    await supabase.from('music_settings').upsert({ user_id: profile.id, source_type: 'upload', file_url: data.publicUrl });
    setUploading(false);
    load();
  }

  async function saveExternalUrl(e) {
    e.preventDefault();
    await supabase.from('music_settings').upsert({ user_id: profile.id, source_type: 'url', external_url: externalUrl });
    load();
  }

  async function removeMusic() {
    await supabase.from('music_settings').delete().eq('user_id', profile.id);
    load();
  }

  function connectSpotify() {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirect = `${window.location.origin}/api/spotify-callback`;
    const scope = 'user-read-private user-top-read';
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(scope)}&state=${profile.id}`;
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-1">Musica di sottofondo</h2>
      <p className="text-sm text-zinc-500 mb-6">Scegli una fonte: carica un file, collega Spotify o incolla un link.</p>

      {settings && (
        <div className="bg-surface p-3 rounded-lg mb-4 border border-line flex items-center justify-between">
          <p className="text-sm">Attivo: <span className="text-brand font-mono">{settings.source_type}</span></p>
          <button onClick={removeMusic} className="text-red-400 text-sm hover:text-red-300">Rimuovi</button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="space-y-4">
        <div className="bg-surface p-4 rounded-xl border border-line">
          <p className="font-medium mb-2">Carica file audio (max 50MB)</p>
          <input type="file" accept="audio/*" disabled={uploading}
            onChange={e => e.target.files[0] && uploadAudio(e.target.files[0])}
            className="text-sm text-zinc-400" />
          {uploading && <p className="text-xs text-zinc-500 mt-1">Caricamento...</p>}
        </div>

        <div className="bg-surface p-4 rounded-xl border border-line">
          <p className="font-medium mb-1">Collega Spotify</p>
          <p className="text-xs text-zinc-500 mb-3">Richiede VITE_SPOTIFY_CLIENT_ID nel .env (vedi README).</p>
          <button onClick={connectSpotify}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold">
            Connetti Spotify
          </button>
        </div>

        <form onSubmit={saveExternalUrl} className="bg-surface p-4 rounded-xl border border-line">
          <p className="font-medium mb-2">Oppure incolla un link (YouTube, mp3 diretto...)</p>
          <input type="url" placeholder="https://..." value={externalUrl}
            onChange={e => setExternalUrl(e.target.value)}
            className="w-full mb-2 px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" />
          <button type="submit"
            className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-black text-sm font-semibold">
            Salva link
          </button>
        </form>
      </div>
    </div>
  );
}
