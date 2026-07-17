import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import { getSystemBadge } from '../lib/roles';
import RPCBadge from '../components/profile/RPCBadge';
import MusicPlayer from '../components/profile/MusicPlayer';
import QRCodeButton from '../components/profile/QRCodeButton';
import ReportButton from '../components/profile/ReportButton';
import BadgeList from '../components/badges/BadgeList';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [badges, setBadges] = useState([]);
  const [musicSettings, setMusicSettings] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { load(); }, [username]);

  async function load() {
    const { data: p } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
    if (!p) { setNotFound(true); return; }
    if (p.is_banned) { setNotFound(true); return; }
    setProfile(p);

    const [linksRes, badgesRes, musicRes] = await Promise.all([
      supabase.from('links').select('*').eq('user_id', p.id).eq('is_active', true).order('position'),
      supabase.from('badges').select('*').eq('user_id', p.id).order('created_at'),
      supabase.from('music_settings').select('*').eq('user_id', p.id).maybeSingle(),
    ]);
    setLinks(linksRes.data || []);
    setBadges(badgesRes.data || []);
    setMusicSettings(musicRes.data);
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
  const accent = (profile.accent_color && profile.accent_color !== '#e8a33d') ? profile.accent_color : theme.accent;
  const bg = profile.background_url
    ? `url(${profile.background_url}) center/cover fixed`
    : (profile.background_color && profile.background_color !== '#09090b') ? profile.background_color : theme.bg;

  const s = {
    page: { minHeight: '100vh', background: bg, fontFamily: profile.font_family || 'Inter', color: theme.text, position: 'relative' },
    overlay: { position: 'fixed', inset: 0, background: profile.background_url ? 'rgba(0,0,0,0.55)' : 'none', pointerEvents: 'none', zIndex: 0 },
    inner: { maxWidth: 600, margin: '0 auto', padding: '48px 20px 80px', position: 'relative', zIndex: 1 },
    headerCard: { borderRadius: 16, padding: '24px 20px', marginBottom: 12, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(16px)', display: 'flex', gap: 16, alignItems: 'flex-start' },
    avatar: { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: `0 0 0 3px ${accent}, 0 0 20px ${accent}44` },
    avatarPlaceholder: { width: 72, height: 72, borderRadius: '50%', flexShrink: 0, background: accent + '22', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: theme.text },
    nameBlock: { flex: 1, minWidth: 0 },
    name: { fontSize: 20, fontWeight: 700, margin: 0 },
    handle: { fontSize: 12, color: theme.textMuted, fontFamily: 'monospace', margin: '3px 0 0' },
    bio: { fontSize: 13, color: theme.textMuted, lineHeight: 1.5, margin: '8px 0 0' },
    sectionCard: { borderRadius: 14, padding: '16px 20px', marginBottom: 12, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(16px)' },
    sectionTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textMuted, marginBottom: 12 },
    linkRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.18s', border: '1px solid transparent', background: 'transparent', width: '100%', textAlign: 'left', color: theme.text },
    linkIconPlaceholder: { width: 36, height: 36, borderRadius: 8, background: accent + '18', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 },
    footer: { textAlign: 'center', fontSize: 11, fontFamily: 'monospace', color: theme.textMuted + '66', marginTop: 32 },
  };

  return (
    <div style={s.page}>
      {profile.background_url && <div style={s.overlay} />}
      <div style={s.inner}>
        <div style={s.headerCard} className="animate-fade-up">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.username} style={s.avatar} />
            : <div style={s.avatarPlaceholder}>{(profile.display_name || profile.username)?.[0]?.toUpperCase()}</div>
          }
          <div style={s.nameBlock}>
            <h1 style={s.name}>{profile.display_name || profile.username}</h1>
            <p style={s.handle}>@{profile.username}</p>
            <BadgeList profile={profile} badges={badges} size="sm" />
            {profile.discord_id && <RPCBadge discordId={profile.discord_id} userId={profile.id} accent={accent} theme={theme} />}
            {profile.bio && <p style={s.bio}>{profile.bio}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <QRCodeButton username={profile.username} accent={accent} theme={theme} compact />
            <ReportButton reportedUserId={profile.id} theme={theme} accent={accent} />
          </div>
        </div>

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
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        ...s.linkRow,
        background: hovered ? accent + '12' : 'transparent',
        border: `1px solid ${hovered ? accent + '40' : 'transparent'}`,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}>
      {link.og_image
        ? <img src={link.og_image} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={s.linkIconPlaceholder}>🔗</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: theme.text }}>{link.title}</p>
        {link.og_description && <p style={{ fontSize: 12, color: theme.textMuted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.og_description}</p>}
      </div>
      <span style={{ color: accent, transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.18s', flexShrink: 0 }}>→</span>
    </button>
  );
}
