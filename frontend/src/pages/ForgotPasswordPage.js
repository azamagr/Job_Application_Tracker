import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');
  const [resetUrl, setResetUrl] = useState(''); // dev only

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError(''); setResetUrl('');
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setMsg(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl); // shown in dev
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, background: 'var(--primary)',
            borderRadius: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 14px', fontSize: 24
          }}>💼</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Forgot Password?</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Enter your email — we will send a reset link
          </p>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          {msg && (
            <div className="alert alert-success">
              ✅ {msg}
            </div>
          )}
          {error && (
            <div className="alert alert-danger">
              ❌ {error}
            </div>
          )}

          {/* Dev mode reset link */}
          {resetUrl && (
            <div style={{
              background: '#FAEEDA', border: '1px solid #EF9F27',
              borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 12
            }}>
              <div style={{ fontWeight: 600, color: '#633806', marginBottom: 4 }}>
                Dev Mode — Reset Link:
              </div>
              <a href={resetUrl} style={{ color: '#185FA5', wordBreak: 'break-all' }}>
                {resetUrl}
              </a>
            </div>
          )}

          {!msg && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your email address</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="your@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                className="btn btn-primary"
                type="submit"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                disabled={loading}
              >
                {loading
                  ? <span className="spinner" style={{ width: 16, height: 16 }} />
                  : '📧 Send Reset Link'
                }
              </button>
            </form>
          )}

          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: 16, paddingTop: 14, textAlign: 'center'
          }}>
            <Link to="/login" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;