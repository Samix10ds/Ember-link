import { useRef, useState } from 'react';

export default function MusicPlayer({ settings }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  }

  if ((settings.source_type === 'upload' && settings.file_url) ||
      (settings.source_type === 'url' && settings.external_url && !settings.external_url.includes('youtube'))) {
    const src = settings.source_type === 'upload' ? settings.file_url : settings.external_url;
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <audio ref={audioRef} src={src} loop />
        <button onClick={toggle}
          className="w-12 h-12 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-xl">
          {playing ? '⏸' : '▶️'}
        </button>
      </div>
    );
  }

  if (settings.source_type === 'spotify' && settings.spotify_track_id) return (
    <div className="mt-6 rounded-xl overflow-hidden">
      <iframe title="spotify" src={`https://open.spotify.com/embed/track/${settings.spotify_track_id}`}
        width="100%" height="80" frameBorder="0" allow="encrypted-media" />
    </div>
  );

  if (settings.source_type === 'url' && settings.external_url?.includes('youtube')) {
    const videoId = settings.external_url.split(/v=|youtu\.be\//)[1]?.split('&')[0];
    return (
      <div className="mt-6 aspect-video rounded-xl overflow-hidden">
        <iframe title="youtube" src={`https://www.youtube.com/embed/${videoId}`}
          width="100%" height="100%" frameBorder="0" allow="autoplay" />
      </div>
    );
  }

  return null;
}
