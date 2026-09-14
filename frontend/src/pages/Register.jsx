import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'auditor', contactId: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'registration failed');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="error-text">{error}</div>}
        <input placeholder="Name" value={form.name} onChange={e => update('name', e.target.value)} required />
        <input type="email" placeholder="Email" value={form.email} onChange={e => update('email', e.target.value)} required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} required />
        <select value={form.role} onChange={e => update('role', e.target.value)}>
          <option value="auditor">Auditor</option>
          <option value="partner">Engagement Partner</option>
          <option value="admin">Admin</option>
          <option value="client">Client Contact</option>
        </select>
        {form.role === 'client' && (
          <input placeholder="Contact ID (given by your auditor)" value={form.contactId} onChange={e => update('contactId', e.target.value)} required />
        )}
        <button type="submit">Register</button>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
