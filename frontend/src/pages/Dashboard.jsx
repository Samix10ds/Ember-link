import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import LinksManager from '../components/dashboard/LinksManager';
import ThemeCustomizer from '../components/dashboard/ThemeCustomizer';
import MusicSettings from '../components/dashboard/MusicSettings';
import RPCSettings from '../components/dashboard/RPCSettings';
import PremiumPanel from '../components/dashboard/PremiumPanel';

const TABS = [
  { id: 'links', label: 'Link', dot: 'bg-brand' },
  { id: 'theme', label: 'Tema', dot: 'bg-pink-400' },
  { id: 'music', label: 'Musica', dot: 'bg-emerald-400' },
  { id: 'rpc', label: 'RPC Discord', dot: 'bg-indigo-400' },
  { id: 'premium', label: 'Premium', dot: 'bg-amber-300' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('links');
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      Caricamento profilo...
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-lg">🔥 Ember Link</h1>
          <a href={`/${profile.username}`} target="_blank" rel="noreferrer"
            className="text-sm text-brand hover:underline font-mono">
            /{profile.username} ↗
          </a>
        </div>
        <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-white">Esci</button>
      </header>

      <div className="flex flex-col md:flex-row">
        <nav className="md:w-56 border-b md:border-b-0 md:border-r border-line flex md:flex-col overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-left whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-surface text-white border-b-2 md:border-b-0 md:border-l-2 border-brand'
                  : 'text-zinc-400 hover:text-white'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tab.dot} ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-6 max-w-2xl">
          {activeTab === 'links'   && <LinksManager profile={profile} />}
          {activeTab === 'theme'   && <ThemeCustomizer profile={profile} onUpdate={refreshProfile} />}
          {activeTab === 'music'   && <MusicSettings profile={profile} />}
          {activeTab === 'rpc'     && <RPCSettings profile={profile} onUpdate={refreshProfile} />}
          {activeTab === 'premium' && <PremiumPanel profile={profile} onUpdate={refreshProfile} />}
        </main>
      </div>
    </div>
  );
}
