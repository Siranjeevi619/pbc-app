import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthHero from '../components/AuthHero';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthHero
        eyebrow="PBC Automation"
        title="Every client request. One register."
        lead="Requirements, follow-ups and management letters — tracked automatically, so nothing depends on remembering an email thread."
        points={['Live status on every requested item', 'Automatic end-of-day client reminders', 'Draft letters generated from real register data']}
      />
      <div className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-kicker">Welcome back</div>
          <h2>Sign in</h2>
          {error && <div className="error-text">{error}</div>}
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="auth-switch">
            No account? <Link to="/register">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
