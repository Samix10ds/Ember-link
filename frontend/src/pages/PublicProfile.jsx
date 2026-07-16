import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import LinkCard from '../components/profile/LinkCard';
import RPCBadge from '../components/profile/RPCBadge';
import MusicPlayer from '../components/profile/MusicPlayer';
import QRCodeButton from '../components/profile/QRCodeButton';

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 3 + 1, delay: Math.random() * 5, duration: Math.random() * 5 + 4,
}));

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [musicSettings, setMusicSettings] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { load(); }, [username]);

  async function load() {
    const { data: p } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
    if (!p) { setNotFound(true); return; }
    setProfile(p);

    const { data: l } = await supabase.from('links').select('*')
      .eq('user_id', p.id).eq('is_active', true).order('position');
    setLinks(l || []);

    const { data: m } = await supabase.from('music_settings').select('*').eq('user_id', p.id).maybeSingle();
    setMusicSettings(m);
  }

  async function handleLinkClick(link) {
    supabase.from('links').update({ clicks: link.clicks + 1 }).eq('id', link.id).then(() => {});
    window.open(link.url, '_blank', 'noopener,noreferrer');
  }

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
      <p className="font-mono text-zinc-400">@{username} non esiste.</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#e8a33d', borderTopColor: 'transparent' }} />
    </div>
  );

  // Usa il tema salvato nel profilo, fallback dark
  const themeKey = profile.theme_id || 'dark';
  const theme = (THEMES[themeKey] || THEMES.dark).profile;

  // Se l'utente ha impostato colori custom, sovrascrivono il tema
  const accent = profile.accent_color || theme.accent;
  const bgStyle = profile.background_url
    ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${profile.background_url}) center/cover fixed`
    : profile.background_color || theme.gradient;

  return (
    <div className="min-h-screen text-white relative overflow-hidden transition-all duration-700"
      style={{ background: bgStyle, fontFamily: profile.font_family || 'Inter' }}>

      {/* Particelle */}
      {!profile.background_url && PARTICLES.map(p => (
        <div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: accent, opacity: 0.2,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 4}px ${accent}`,
          }} />
      ))}

      {/* Glow blob */}
      {!profile.background_url && (
        <div className="absolute pointer-events-none"
          style={{
            width: 400, height: 400, borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
            top: '10%', left: '50%', transform: 'translateX(-50%)',
            filter: 'blur(40px)',
          }} />
      )}

      <div className="max-w-md mx-auto px-4 py-14 relative z-10">
        {/* Avatar + info */}
        <div className="flex flex-col items-center text-center mb-10 animate-fade-up">
          {profile.avatar_url ? (
            <div className="relative mb-4">
              <img src={profile.avatar_url} alt={profile.username}
                className="w-24 h-24 rounded-full object-cover avatar-glow"
                style={{ '--accent': accent, boxShadow: `0 0 0 3px ${accent}, 0 0 32px -4px ${accent}` }} />
              <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 0 3px ${accent}`, animation: 'pulse-glow 3s ease-in-out infinite' }} />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl mb-4 font-bold avatar-glow"
              style={{ background: accent + '22', border: `2px solid ${accent}`, boxShadow: `0 0 24px ${accent}44` }}>
              {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
            </div>
          )}
          <h1 className="font-display text-2xl font-bold" style={{ color: theme.text }}>
            {profile.display_name || profile.username}
          </h1>
          <p className="font-mono text-sm mt-1" style={{ color: theme.textMuted }}>@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm mt-3 max-w-xs leading-relaxed" style={{ color: theme.textMuted }}>{profile.bio}</p>
          )}
          {profile.discord_id && (
            <RPCBadge discordId={profile.discord_id} userId={profile.id} accent={accent} theme={theme} />
          )}
        </div>

        {/* Links */}
        <div className={profile.layout_style === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
          {links.map((link, i) => (
            <div key={link.id}
              className={`animate-fade-up stagger-${Math.min(i + 1, 8)}`}>
              <LinkCard link={link} accent={accent} theme={theme} onClick={() => handleLinkClick(link)} />
            </div>
          ))}
          {links.length === 0 && (
            <p className="text-center text-sm animate-fade-in" style={{ color: theme.textMuted }}>
              Nessun link ancora.
            </p>
          )}
        </div>

        {/* QR + footer */}
        <div className="flex justify-center mt-10 animate-fade-up">
          <QRCodeButton username={profile.username} accent={accent} theme={theme} />
        </div>

        {musicSettings && <MusicPlayer settings={musicSettings} accent={accent} />}

        <p className="text-center text-xs mt-12 font-mono animate-fade-in"
          style={{ color: theme.textMuted + '88' }}>
          fatto con 🔥 ember link
        </p>
      </div>
    </div>
  );
}
