import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { THEME_LIST } from '../../lib/themes';

const FONTS = ['Inter', 'Poppins', 'Roboto Mono', 'Playfair Display'];
const LAYOUTS = [{ id: 'stacked', label: '≡ Lista' }, { id: 'grid', label: '⊞ Griglia' }];

export default function ThemeCustomizer({ profile, onUpdate, theme: d }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [accentColor, setAccentColor] = useState(profile.accent_color || '#e8a33d');
  const [bgColor, setBgColor] = useState(profile.background_color || '#09090b');
  const [font, setFont] = useState(profile.font_family || 'Inter');
  const [layout, setLayout] = useState(profile.layout_style || 'stacked');
  const [selectedTheme, setSelectedTheme] = useState(profile.theme_id || 'dark');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName, bio,
      accent_color: accentColor, background_color: bgColor,
      font_family: font, layout_style: layout, theme_id: selectedTheme,
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
      setError(`Errore upload: ${uploadError.message} — Hai creato il bucket "${bucket}" pubblico su Supabase?`);
      setUploading(false); return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    await supabase.from('profiles').update({ [column]: data.publicUrl }).eq('id', profile.id);
    onUpdate();
    setUploading(false);
  }

  const inputStyle = {
    background: d.surfaceHover,
    border: `1px solid ${d.border}`,
    color: d.text,
    borderRadius: '10px',
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: d.text }}>🎨 Personalizza profilo</h2>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>
          {error}
        </div>
      )}

      {/* Preset tema profilo */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: d.surface, border: `1px solid ${d.border}` }}>
        <p className="text-sm font-medium mb-3" style={{ color: d.text }}>Tema del profilo pubblico</p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_LIST.map(t => (
            <button key={t.id} onClick={() => setSelectedTheme(t.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: selectedTheme === t.id ? t.profile.accent + '22' : d.surfaceHover,
                border: `1.5px solid ${selectedTheme === t.id ? t.profile.accent : d.border}`,
                color: selectedTheme === t.id ? t.profile.accent : d.textMuted,
                transform: selectedTheme === t.id ? 'scale(1.04)' : 'scale(1)',
              }}>
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Upload avatar / sfondo */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Avatar', bucket: 'avatars', column: 'avatar_url', uploading: uploadingAvatar, setUploading: setUploadingAvatar, accept: 'image/*', preview: profile.avatar_url, round: true },
          { label: 'Sfondo', bucket: 'backgrounds', column: 'background_url', uploading: uploadingBg, setUploading: setUploadingBg, accept: 'image/*', preview: profile.background_url },
        ].map(({ label, bucket, column, uploading, setUploading, accept, preview, round }) => (
          <div key={label} className="p-3 rounded-xl" style={{ background: d.surface, border: `1px solid ${d.border}` }}>
            <p className="text-xs mb-2 font-medium" style={{ color: d.textMuted }}>{label}</p>
            {preview && <img src={preview} alt="" className={`mb-2 object-cover ${round ? 'w-12 h-12 rounded-full' : 'w-full h-12 rounded-lg'}`} />}
            <input type="file" accept={accept} disabled={uploading}
              onChange={e => e.target.files[0] && uploadFile(e.target.files[0], bucket, column, setUploading)}
              className="text-xs w-full" style={{ color: d.textMuted }} />
            {uploading && <p className="text-xs mt-1" style={{ color: d.accent }}>Caricamento...</p>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: d.textMuted }}>Nome visualizzato</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = d.accent}
            onBlur={e => e.target.style.borderColor = d.border} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: d.textMuted }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={e => e.target.style.borderColor = d.accent}
            onBlur={e => e.target.style.borderColor = d.border} />
        </div>

        {/* Colori custom (sovrascrivono il tema) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: d.textMuted }}>Colore principale custom</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'none' }} />
              <span className="text-xs font-mono" style={{ color: d.textMuted }}>{accentColor}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: d.textMuted }}>Colore sfondo custom</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: 'none' }} />
              <span className="text-xs font-mono" style={{ color: d.textMuted }}>{bgColor}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: d.textMuted }}>Font</label>
          <select value={font} onChange={e => setFont(e.target.value)} style={inputStyle}>
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: d.textMuted }}>Layout link</label>
          <div className="flex gap-2">
            {LAYOUTS.map(l => (
              <button key={l.id} type="button" onClick={() => setLayout(l.id)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: layout === l.id ? d.accent + '22' : d.surfaceHover,
                  border: `1.5px solid ${layout === l.id ? d.accent : d.border}`,
                  color: layout === l.id ? d.accent : d.textMuted,
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl font-semibold transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${d.accent}, ${d.accent}cc)`,
            color: '#000',
            boxShadow: `0 4px 16px ${d.accent}33`,
            opacity: saving ? 0.7 : 1,
          }}>
          {saving ? 'Salvo...' : 'Salva modifiche'}
        </button>
      </form>
    </div>
  );
}
