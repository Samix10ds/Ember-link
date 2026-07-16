import { useRef, useState } from 'react';

export default function MusicPlayer({ settings, accent }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  }

  const src = settings.source_type === 'upload' ? settings.file_url
    : settings.source_type === 'url' && !settings.external_url?.includes('youtube') ? settings.external_url
    : null;

  if (src) return (
    <div className="fixed bottom-5 right-5 z-40 animate-fade-in">
      <audio ref={audioRef} src={src} loop />
      <button onClick={toggle}
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200"
        style={{
          background: accent + '22',
          border: `1.5px solid ${accent}60`,
          backdropFilter: 'blur(12px)',
          boxShadow: `0 4px 20px ${accent}33`,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {playing ? '⏸' : '▶️'}
      </button>
    </div>
  );

  if (settings.source_type === 'spotify' && settings.spotify_track_id) return (
    <div className="mt-6 rounded-2xl overflow-hidden animate-fade-up">
      <iframe title="spotify" src={`https://open.spotify.com/embed/track/${settings.spotify_track_id}`}
        width="100%" height="80" frameBorder="0" allow="encrypted-media" />
    </div>
  );

  if (settings.source_type === 'url' && settings.external_url?.includes('youtube')) {
    const videoId = settings.external_url.split(/v=|youtu\.be\//)[1]?.split('&')[0];
    return (
      <div className="mt-6 aspect-video rounded-2xl overflow-hidden animate-fade-up">
        <iframe title="youtube" src={`https://www.youtube.com/embed/${videoId}`}
          width="100%" height="100%" frameBorder="0" allow="autoplay" />
      </div>
    );
  }

  return null;
}
