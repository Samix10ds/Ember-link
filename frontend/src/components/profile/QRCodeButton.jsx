import { useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeButton({ username, accent, theme, compact }) {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}/${username}`;

  const modal = open && createPortal(
    <div onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16,
          padding: 24, textAlign: 'center',
          width: 260,
        }}>
        <QRCodeSVG value={url} size={200} fgColor="#111" bgColor="#fff" />
        <p style={{ color: '#333', fontSize: 11, marginTop: 10, fontFamily: 'monospace', wordBreak: 'break-all' }}>{url}</p>
        <button onClick={() => setOpen(false)}
          style={{ marginTop: 10, fontSize: 12, color: '#999', cursor: 'pointer', background: 'none', border: 'none' }}>
          chiudi
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{
          background: accent + '18',
          border: `1px solid ${accent}40`,
          color: theme.text,
          borderRadius: compact ? 10 : 999,
          padding: compact ? '6px 10px' : '10px 20px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
        📱 QR
      </button>
      {modal}
    </>
  );
}