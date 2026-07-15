import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 3) {
      setError('Username troppo corto (min 3 caratteri, solo lettere/numeri/underscore).');
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase.from('profiles').select('id').eq('username', clean).maybeSingle();
    if (existing) { setError('Username già in uso.'); setLoading(false); return; }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, username: clean, display_name: clean });
    }

    setLoading(false);
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface p-8 rounded-2xl border border-line">
        <h1 className="font-display text-2xl font-bold text-white mb-6">Crea account</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 px-4 py-3 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand font-mono" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-3 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" required />
        <input type="password" placeholder="Password (min 6 caratteri)" value={password} onChange={e => setPassword(e.target.value)}
          minLength={6} className="w-full mb-4 px-4 py-3 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" required />
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg bg-brand hover:bg-brand-dark text-black font-semibold transition disabled:opacity-50">
          {loading ? 'Creazione...' : 'Registrati'}
        </button>
        <p className="text-zinc-400 text-sm mt-4 text-center">
          Hai già un account? <Link to="/login" className="text-brand hover:underline">Accedi</Link>
        </p>
      </form>
    </div>
  );
}
