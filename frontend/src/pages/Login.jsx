import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface p-8 rounded-2xl border border-line">
        <h1 className="font-display text-2xl font-bold text-white mb-6">Accedi</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-3 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-surface-hover text-white outline-none focus:ring-2 focus:ring-brand" required />
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg bg-brand hover:bg-brand-dark text-black font-semibold transition disabled:opacity-50">
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
        <p className="text-zinc-400 text-sm mt-4 text-center">
          Non hai un account? <Link to="/register" className="text-brand hover:underline">Registrati</Link>
        </p>
      </form>
    </div>
  );
}
