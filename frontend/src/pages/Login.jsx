import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { THEME_LIST, THEMES } from '../lib/themes';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 4 + 3,
}));

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [themeId, setThemeId] = useState('dark');
  const navigate = useNavigate();

  const theme = THEMES[themeId].profile;

  useEffect(() => {
    const saved = localStorage.getItem('ember-theme') || 'dark';
    setThemeId(saved);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('Email o password errati.');
    else navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-all duration-700"
      style={{ background: theme.gradient }}>

      {/* Particelle di sfondo */}
      {PARTICLES.map(p => (
        <div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: theme.accent,
            opacity: 0.25,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 3}px ${theme.accent}`,
          }} />
      ))}

      {/* Glow blob sfondo */}
      <div className="absolute w-96 h-96 rounded-full pointer-events-none animate-gradient"
        style={{
          background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
          top: '20%', left: '30%', filter: 'blur(40px)',
        }} />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl animate-float inline-block">🔥</span>
          <h1 className="font-display text-3xl font-bold mt-2" style={{ color: theme.text }}>
            Ember Link
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Il tuo profilo, le tue regole</p>
        </div>

        {/* Theme picker */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {THEME_LIST.map(t => (
            <button key={t.id} onClick={() => { setThemeId(t.id); localStorage.setItem('ember-theme', t.id); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: themeId === t.id ? t.profile.accent + '33' : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${themeId === t.id ? t.profile.accent : 'rgba(255,255,255,0.1)'}`,
                color: themeId === t.id ? t.profile.accent : theme.textMuted,
                transform: themeId === t.id ? 'scale(1.08)' : 'scale(1)',
              }}>
              {t.emoji} {t.name}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl backdrop-blur-xl"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: `0 8px 40px ${theme.accent}18`,
          }}>
          <h2 className="font-display text-xl font-bold mb-6" style={{ color: theme.text }}>Accedi</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm animate-fade-in"
              style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              required className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.text,
              }}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.cardBorder}
            />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              required className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.text,
              }}
              onFocus={e => e.target.style.borderColor = theme.accent}
              onBlur={e => e.target.style.borderColor = theme.cardBorder}
            />
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-2"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
                color: '#000',
                boxShadow: `0 4px 20px ${theme.accent}44`,
                transform: loading ? 'scale(0.98)' : 'scale(1)',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Accesso...
                </span>
              ) : 'Accedi'}
            </button>
          </form>

          <p className="text-sm mt-5 text-center" style={{ color: theme.textMuted }}>
            Non hai un account?{' '}
            <Link to="/register" className="font-medium hover:underline transition-opacity"
              style={{ color: theme.accent }}>
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
