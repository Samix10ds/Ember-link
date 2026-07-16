import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import LinksManager from '../components/dashboard/LinksManager';
import ThemeCustomizer from '../components/dashboard/ThemeCustomizer';
import MusicSettings from '../components/dashboard/MusicSettings';
import RPCSettings from '../components/dashboard/RPCSettings';
import PremiumPanel from '../components/dashboard/PremiumPanel';
import ThemePicker from '../components/dashboard/ThemePicker';

const TABS = [
  { id: 'links',   label: 'Link',        emoji: '🔗' },
  { id: 'theme',   label: 'Tema',        emoji: '🎨' },
  { id: 'music',   label: 'Musica',      emoji: '🎵' },
  { id: 'rpc',     label: 'RPC Discord', emoji: '🎮' },
  { id: 'premium', label: 'Premium',     emoji: '⭐' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('links');
  const { profile, refreshProfile } = useAuth();
  const { theme } = useTheme();
  const d = theme.dashboard;
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: d.bg }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: d.accent, borderTopColor: 'transparent' }} />
        <p style={{ color: d.textMuted }} className="text-sm">Caricamento profilo...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen transition-all duration-500" style={{ background: d.gradient }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: d.border, background: d.surface + 'cc', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="animate-slide-in">
          <h1 className="font-display font-bold text-lg flex items-center gap-2">
            <span className="animate-float inline-block">🔥</span>
            <span style={{ color: d.text }}>Ember Link</span>
          </h1>
          <a href={`/${profile.username}`} target="_blank" rel="noreferrer"
            className="text-sm font-mono hover:underline transition-opacity hover:opacity-70"
            style={{ color: d.accent }}>
            /{profile.username} ↗
          </a>
        </div>
        <button onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-70"
          style={{ color: d.textMuted }}>
          Esci
        </button>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar nav */}
        <nav className="md:w-60 border-b md:border-b-0 md:border-r flex md:flex-col overflow-x-auto md:overflow-visible md:sticky md:top-[65px] md:h-[calc(100vh-65px)]"
          style={{ borderColor: d.border, background: d.surface + '88' }}>
          <div className="md:p-3 flex md:flex-col gap-1 w-full">
            <ThemePicker />
            {TABS.map((tab, i) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap transition-all duration-200 font-medium text-sm"
                style={{
                  background: activeTab === tab.id ? d.accent + '22' : 'transparent',
                  color: activeTab === tab.id ? d.accent : d.textMuted,
                  borderLeft: activeTab === tab.id ? `3px solid ${d.accent}` : '3px solid transparent',
                  animationDelay: `${i * 0.05}s`,
                }}>
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 max-w-2xl" key={activeTab}>
          <div className="tab-content">
            {activeTab === 'links'   && <LinksManager profile={profile} theme={d} />}
            {activeTab === 'theme'   && <ThemeCustomizer profile={profile} onUpdate={refreshProfile} theme={d} />}
            {activeTab === 'music'   && <MusicSettings profile={profile} theme={d} />}
            {activeTab === 'rpc'     && <RPCSettings profile={profile} onUpdate={refreshProfile} theme={d} />}
            {activeTab === 'premium' && <PremiumPanel profile={profile} onUpdate={refreshProfile} theme={d} />}
          </div>
        </main>
      </div>
    </div>
  );
}
