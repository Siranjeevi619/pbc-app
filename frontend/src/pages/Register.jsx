import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthHero from '../components/AuthHero';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'auditor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthHero
        eyebrow="Get started"
        title="Built for audit teams and their clients."
        lead="One shared register for auditors, engagement partners and the clients they chase — each seeing exactly what they need."
        points={['Role-based access from day one', 'Sample selection with a real algorithm', 'A recorded reason for every withheld item']}
      />
      <div className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-kicker">New account</div>
          <h2>Register</h2>
          {error && <div className="error-text">{error}</div>}
          <label className="field">
            <span>Name</span>
            <input value={form.name} onChange={e => update('name', e.target.value)} required autoFocus />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
          </label>
          <label className="field">
            <span>Role</span>
            <select value={form.role} onChange={e => update('role', e.target.value)}>
              <option value="auditor">Auditor</option>
              <option value="partner">Engagement Partner</option>
              <option value="admin">Admin</option>
              <option value="client">Client Contact</option>
            </select>
          </label>
          {form.role === 'client' && (
            <div className="field-hint">Use the same email your auditor added you with.</div>
          )}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
