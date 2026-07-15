import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const FONTS = ['Inter', 'Poppins', 'Roboto Mono', 'Playfair Display'];
const LAYOUTS = [{ id: 'stacked', label: 'Lista' }, { id: 'grid', label: 'Griglia' }];

export default function ThemeCustomizer({ profile, onUpdate }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [accentColor, setAccentColor] = useState(profile.accent_color || '#e8a33d');
  const [bgColor, setBgColor] = useState(profile.background_color || '#09090b');
  const [font, setFont] = useState(profile.font_family || 'Inter');
  const [layout, setLayout] = useState(profile.layout_style || 'stacked');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName, bio,
      accent_color: accentColor, background_color: bgColor,
      font_family: font, layout_style: layout,
    }).eq('id', profile.id);
    setSaving(false);
    onUpdate();
  }

  async function uploadFile(file, bucket, column, setUploading) {
    setError('');
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (uploadError) {
      setError(`Errore upload: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    await supabase.from('profiles').update({ [column]: data.publicUrl }).eq('id', profile.id);
    onUpdate();
    setUploading(false);
  }

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">Personalizza profilo</h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-zinc-400 block mb-2">Avatar</label>
          {profile.avatar_url && <img src={profile.avatar_url} className="w-16 h-16 rounded-full mb-2 object-cover" alt="" />}
          <input type="file" accept="image/*" disabled={uploadingAvatar}
            onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'avatars', 'avatar_url', setUploadingAvatar)}
            className="text-sm text-zinc-400" />
        </div>
        <div>
          <label className="text-sm text-zinc-400 block mb-2">Sfondo</label>
          {profile.background_url && <img src={profile.background_url} className="w-full h-16 rounded mb-2 object-cover" alt="" />}
          <input type="file" accept="image/*" disabled={uploadingBg}
            onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'backgrounds', 'background_url', setUploadingBg)}
            className="text-sm text-zinc-400" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Nome visualizzato</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Colore principale</label>
            <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Colore sfondo</label>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Font</label>
          <select value={font} onChange={e => setFont(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand">
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Layout link</label>
          <div className="flex gap-2">
            {LAYOUTS.map(l => (
              <button key={l.id} type="button" onClick={() => setLayout(l.id)}
                className={`px-4 py-2 rounded-lg text-sm ${layout === l.id ? 'bg-brand text-black font-semibold' : 'bg-surface-hover text-zinc-400'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-black font-semibold disabled:opacity-50">
          {saving ? 'Salvo...' : 'Salva modifiche'}
        </button>
      </form>
    </div>
  );
}
