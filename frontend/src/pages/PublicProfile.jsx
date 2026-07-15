import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LinkCard from '../components/profile/LinkCard';
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
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      <p className="text-zinc-400 font-mono">@{username} non esiste.</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">Caricamento...</div>
  );

  const pageStyle = {
    background: profile.background_url
      ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${profile.background_url}) center/cover fixed`
      : profile.background_color || '#09090b',
    fontFamily: profile.font_family || 'Inter',
    minHeight: '100vh',
  };

  return (
    <div style={pageStyle} className="text-white">
      <div className="max-w-md mx-auto px-4 py-14">
        <div className="flex flex-col items-center text-center mb-8">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt={profile.username}
              className="w-24 h-24 rounded-full object-cover mb-4"
              style={{ boxShadow: `0 0 0 3px ${profile.accent_color || '#e8a33d'}, 0 0 28px -6px ${profile.accent_color || '#e8a33d'}` }} />
          )}
          <h1 className="font-display text-xl font-bold">{profile.display_name || profile.username}</h1>
          <p className="text-zinc-300 text-sm mt-1 font-mono">@{profile.username}</p>
          {profile.bio && <p className="text-zinc-200 text-sm mt-3 max-w-xs">{profile.bio}</p>}
          {profile.discord_id && <RPCBadge discordId={profile.discord_id} userId={profile.id} />}
        </div>

        <div className={profile.layout_style === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
          {links.map(link => (
            <LinkCard key={link.id} link={link} accentColor={profile.accent_color} onClick={() => handleLinkClick(link)} />
          ))}
          {links.length === 0 && <p className="text-zinc-400 text-sm text-center">Nessun link ancora.</p>}
        </div>

        <div className="flex justify-center mt-8">
          <QRCodeButton username={profile.username} />
        </div>

        {musicSettings && <MusicPlayer settings={musicSettings} />}

        <p className="text-center text-xs text-zinc-500 mt-10 font-mono">
          fatto con 🔥 ember link
        </p>
      </div>
    </div>
  );
}
