import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { isAdmin, isOwner } from '../../lib/roles';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';
import AdminBadges from './AdminBadges';
import AdminStats from './AdminStats';

const TABS = [
  { id: 'stats', label: 'Statistiche', emoji: '📊' },
  { id: 'users', label: 'Utenti', emoji: '👥' },
  { id: 'reports', label: 'Segnalazioni', emoji: '🚩' },
  { id: 'badges', label: 'Badge', emoji: '🏅' },
];

export default function AdminPanel() {
  const { profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin(profile)) navigate('/dashboard');
  }, [profile, loading]);

  if (loading || !profile) return (
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #e8a33d', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!isAdmin(profile)) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fff' }}>
      <header style={{
        padding: '16px 24px', borderBottom: '1px solid #27272e',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#16161a', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 18 }}>
            {isOwner(profile) ? '👑' : '⚡'} Pannello {isOwner(profile) ? 'Owner' : 'Admin'}
          </h1>
          <p style={{ fontSize: 12, color: '#71717a', fontFamily: 'monospace' }}>@{profile.username}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding: '6px 14px', borderRadius: 8, background: '#1e1e23', border: '1px solid #27272e', color: '#a1a1aa', cursor: 'pointer', fontSize: 13 }}>
            ← Dashboard
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        <nav style={{ width: 200, borderRight: '1px solid #27272e', minHeight: 'calc(100vh - 65px)', padding: 12, background: '#16161a88' }}>
          {TABS.filter(t => t.id !== 'badges' || isOwner(profile)).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500,
                background: activeTab === tab.id ? '#e8a33d22' : 'transparent',
                border: `1.5px solid ${activeTab === tab.id ? '#e8a33d' : 'transparent'}`,
                color: activeTab === tab.id ? '#e8a33d' : '#71717a',
                cursor: 'pointer', marginBottom: 4,
              }}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </nav>

        <main style={{ flex: 1, padding: 24, maxWidth: 900 }}>
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'users' && <AdminUsers profile={profile} />}
          {activeTab === 'reports' && <AdminReports profile={profile} />}
          {activeTab === 'badges' && isOwner(profile) && <AdminBadges />}
        </main>
      </div>
    </div>
  );
}
