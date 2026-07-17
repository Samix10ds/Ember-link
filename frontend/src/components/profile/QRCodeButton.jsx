import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeButton({ username, accent, theme }) {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}/${username}`;

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
        style={{
          background: accent + '18',
          border: `1px solid ${accent}40`,
          color: theme.text,
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => { e.target.style.background = accent + '30'; e.target.style.transform = 'scale(1.04)'; }}
        onMouseLeave={e => { e.target.style.background = accent + '18'; e.target.style.transform = 'scale(1)'; }}
      >
        📱 QR Code
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setOpen(false)}>
          <div className="p-6 rounded-2xl text-center animate-fade-up flex flex-col items-center"
            style={{ background: '#fff', width: 260 }}
            onClick={e => e.stopPropagation()}>
            <QRCodeSVG value={url} size={200} fgColor="#111" bgColor="#fff" />
            <p className="text-black text-xs mt-3 font-mono break-all">{url}</p>
            <button onClick={() => setOpen(false)}
              className="mt-3 text-xs text-zinc-400 hover:text-zinc-600">chiudi</button>
          </div>
        </div>
      )}
    </>
  );
}
