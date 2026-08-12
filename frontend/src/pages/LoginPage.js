import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>💼</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sign in to your JobTracker account</p>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 14 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)' }}>Forgot password?</Link>
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Sign in'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Create one</Link>
            </p>
          </div>
        </div>

        {/* <div className="card" style={{ marginTop: 12, padding: '12px 16px' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>DEMO CREDENTIALS</p>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <div><strong>Admin:</strong> admin@jobtracker.com / admin123</div>
            <div><strong>User:</strong> ali@example.com / user123</div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;