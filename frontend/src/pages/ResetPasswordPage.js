import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const { token }             = useParams();
  const navigate              = useNavigate();
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm)
      return setError('Passwords do not match');
    if (password.length < 6)
      return setError('Password must be at least 6 characters');

    setLoading(true); setError('');
    try {
      await axios.put(`/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
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

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, background: 'var(--primary)',
            borderRadius: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 14px', fontSize: 24
          }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reset Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Enter your new password below</p>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Password Reset Successful!</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <>
              {error && <div className="alert alert-danger">❌ {error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
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
                    : '🔐 Reset Password'
                  }
                </button>
              </form>
            </>
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

export default ResetPasswordPage;