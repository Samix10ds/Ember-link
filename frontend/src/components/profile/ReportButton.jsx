import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';

const REASONS = [
  'Contenuto inappropriato',
  'Spam o pubblicità',
  'Impersonificazione',
  'Truffe o phishing',
  'Altro',
];

export default function ReportButton({ reportedUserId, theme, accent }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Devi essere loggato per segnalare.'); setLoading(false); return; }
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason, details,
    });
    setSent(true);
    setLoading(false);
  }

  const modal = open && createPortal(
    <div onClick={() => !sent && setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: '#16161a', border: '1px solid #27272e',
          borderRadius: 16, padding: 24, width: '100%', maxWidth: 380,
        }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>Segnalazione inviata</p>
            <p style={{ color: '#71717a', fontSize: 13 }}>Verrà esaminata dal team di moderazione.</p>
            <button onClick={() => { setOpen(false); setSent(false); }}
              style={{
                marginTop: 16, padding: '8px 20px', borderRadius: 10,
                background: accent, color: '#000', fontWeight: 600,
                border: 'none', cursor: 'pointer',
              }}>
              Chiudi
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 16 }}>Segnala profilo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {REASONS.map(r => (
                <button key={r} type="button" onClick={() => setReason(r)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                    background: reason === r ? accent + '22' : '#1e1e23',
                    border: `1.5px solid ${reason === r ? accent : '#27272e'}`,
                    color: reason === r ? accent : '#a1a1aa',
                    cursor: 'pointer', fontSize: 13,
                  }}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={details} onChange={e => setDetails(e.target.value)}
              placeholder="Dettagli aggiuntivi (opzionale)"
              rows={3} style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: '#1e1e23', border: '1px solid #27272e',
                color: '#fff', fontSize: 13, resize: 'none', outline: 'none',
                boxSizing: 'border-box',
              }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => setOpen(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  background: '#1e1e23', border: '1px solid #27272e',
                  color: '#a1a1aa', cursor: 'pointer',
                }}>
                Annulla
              </button>
              <button type="submit" disabled={!reason || loading}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  background: '#ef444422', border: '1.5px solid #ef4444',
                  color: '#ef4444', fontWeight: 600, cursor: 'pointer',
                  opacity: !reason || loading ? 0.5 : 1,
                }}>
                {loading ? 'Invio...' : 'Segnala'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', borderRadius: 8, padding: '4px 10px',
          fontSize: 12, cursor: 'pointer',
        }}>
        🚩 Segnala
      </button>
      {modal}
    </>
  );
}
