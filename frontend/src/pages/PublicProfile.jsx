import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import RPCBadge from '../components/profile/RPCBadge';
import MusicPlayer from '../components/profile/MusicPlayer';
import QRCodeButton from '../components/profile/QRCodeButton';

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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#555', fontFamily: 'monospace' }}>@{username} non esiste.</p>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #e8a33d', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const themeKey = profile.theme_id || 'dark';
  const theme = (THEMES[themeKey] || THEMES.dark).profile;
  const accent = (profile.accent_color && profile.accent_color !== '#e8a33d')
    ? profile.accent_color : theme.accent;

  const bg = profile.background_url
    ? `url(${profile.background_url}) center/cover fixed`
    : (profile.background_color && profile.background_color !== '#09090b')
    ? profile.background_color
    : theme.bg;

  const s = {
    page: {
      minHeight: '100vh',
      background: bg,
      fontFamily: profile.font_family || 'Inter',
      color: theme.text,
      position: 'relative',
    },
    overlay: {
      position: 'fixed', inset: 0,
      background: profile.background_url ? 'rgba(0,0,0,0.55)' : 'none',
      pointerEvents: 'none', zIndex: 0,
    },
    inner: {
      maxWidth: 600,
      margin: '0 auto',
      padding: '48px 20px 80px',
      position: 'relative', zIndex: 1,
    },
    // Header card
    headerCard: {
      borderRadius: 16,
      padding: '28px 24px',
      marginBottom: 16,
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      backdropFilter: 'blur(16px)',
      display: 'flex',
      gap: 20,
      alignItems: 'flex-start',
    },
    avatar: {
      width: 80, height: 80,
      borderRadius: '50%',
      objectFit: 'cover',
      flexShrink: 0,
      boxShadow: `0 0 0 3px ${accent}, 0 0 20px ${accent}44`,
      animation: 'pulse-glow 3s ease-in-out infinite',
    },
    avatarPlaceholder: {
      width: 80, height: 80,
      borderRadius: '50%',
      flexShrink: 0,
      background: accent + '22',
      border: `2px solid ${accent}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 28, fontWeight: 700,
      boxShadow: `0 0 20px ${accent}44`,
      color: theme.text,
    },
    nameBlock: { flex: 1, minWidth: 0 },
    name: { fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.2 },
    handle: { fontSize: 13, color: theme.textMuted, fontFamily: 'monospace', margin: '4px 0 8px' },
    bio: { fontSize: 13, color: theme.textMuted, lineHeight: 1.5, margin: '6px 0 0' },

    // Section card
    sectionCard: {
      borderRadius: 14,
      padding: '16px 20px',
      marginBottom: 12,
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      backdropFilter: 'blur(16px)',
    },
    sectionTitle: {
      fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: theme.textMuted,
      marginBottom: 12,
    },

    // Link row (guns.lol style — compact, icon-like)
    linkRow: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 10,
      cursor: 'pointer', transition: 'all 0.18s',
      border: `1px solid transparent`,
      background: 'transparent',
      width: '100%', textAlign: 'left',
      color: theme.text,
    },
    linkIcon: {
      width: 36, height: 36, borderRadius: 8,
      objectFit: 'cover', flexShrink: 0,
      background: accent + '22',
    },
    linkIconPlaceholder: {
      width: 36, height: 36, borderRadius: 8,
      background: accent + '18',
      border: `1px solid ${accent}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: 16,
    },
    linkText: { flex: 1, minWidth: 0 },
    linkTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
    linkDesc: { fontSize: 12, color: theme.textMuted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    linkArrow: { fontSize: 14, color: accent, flexShrink: 0 },

    footer: {
      textAlign: 'center', fontSize: 11,
      fontFamily: 'monospace', color: theme.textMuted + '66',
      marginTop: 32,
    },
  };

  return (
    <div style={s.page}>
      {profile.background_url && <div style={s.overlay} />}

      <div style={s.inner}>
        {/* Header */}
        <div style={s.headerCard} className="animate-fade-up">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.username} style={s.avatar} />
            : <div style={s.avatarPlaceholder}>{(profile.display_name || profile.username)?.[0]?.toUpperCase()}</div>
          }
          <div style={s.nameBlock}>
            <h1 style={s.name}>{profile.display_name || profile.username}</h1>
            <p style={s.handle}>@{profile.username}</p>
            {profile.discord_id && (
              <RPCBadge discordId={profile.discord_id} userId={profile.id} accent={accent} theme={theme} />
            )}
            {profile.bio && <p style={s.bio}>{profile.bio}</p>}
          </div>
          <QRCodeButton username={profile.username} accent={accent} theme={theme} compact />
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div style={s.sectionCard} className="animate-fade-up">
            <p style={s.sectionTitle}>Link</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {links.map((link, i) => (
                <LinkRow key={link.id} link={link} accent={accent} theme={theme} s={s} index={i} onClick={() => handleLinkClick(link)} />
              ))}
            </div>
          </div>
        )}

        {musicSettings && <MusicPlayer settings={musicSettings} accent={accent} />}

        <p style={s.footer}>fatto con 🔥 ember link</p>
      </div>
    </div>
  );
}

function LinkRow({ link, accent, theme, s, index, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.linkRow,
        background: hovered ? accent + '12' : 'transparent',
        border: `1px solid ${hovered ? accent + '40' : 'transparent'}`,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        animationDelay: `${index * 0.06}s`,
      }}
      className="animate-fade-up"
    >
      {link.og_image
        ? <img src={link.og_image} alt="" style={s.linkIcon} />
        : <div style={s.linkIconPlaceholder}>🔗</div>
      }
      <div style={s.linkText}>
        <p style={s.linkTitle}>{link.title}</p>
        {link.og_description && <p style={s.linkDesc}>{link.og_description}</p>}
      </div>
      <span style={{ ...s.linkArrow, transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.18s' }}>→</span>
    </button>
  );
}
