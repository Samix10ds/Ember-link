import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeButton({ username }) {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}/${username}`;

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full bg-white/10 backdrop-blur text-sm hover:bg-white/20 transition">
        📱 QR Code
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white p-6 rounded-2xl" onClick={e => e.stopPropagation()}>
            <QRCodeSVG value={url} size={220} />
            <p className="text-black text-xs text-center mt-2 font-mono">{url}</p>
          </div>
        </div>
      )}
    </>
  );
}
