import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', phone: user?.phone || '',
    bio: user?.bio || '', skills: (user?.skills || []).join(', '),
    careerPreferences: user?.careerPreferences || ''
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg]   = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [error, setError] = useState('');

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setError('');
    try {
      const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      const { data } = await userAPI.updateProfile({ ...form, skills: skillsArr });
      updateUser(data.user);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePwSave = async e => {
    e.preventDefault(); setSavingPw(true); setPwMsg('');
    try {
      await userAPI.changePass(pwForm);
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.firstName} {user?.lastName}</div>
            <div className="text-muted text-sm">{user?.email}</div>
            <span className={`badge badge-${user?.role}`} style={{ marginTop: 4 }}>{user?.role}</span>
          </div>
        </div>

        {msg   && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First name</label>
              <input className="form-control" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last name</label>
              <input className="form-control" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+92 300 1234567" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Skills (comma-separated)</label>
            <input className="form-control" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="React, Node.js, Python..." />
          </div>
          <div className="form-group">
            <label className="form-label">Career preference</label>
            <select className="form-control" value={form.careerPreferences} onChange={e => setForm(p => ({ ...p, careerPreferences: e.target.value }))}>
              <option value="">Select...</option>
              {['Full-time remote', 'Hybrid', 'On-site'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '💾 Save profile'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Change Password</div>
        {pwMsg && <div className={`alert ${pwMsg.includes('success') ? 'alert-success' : 'alert-danger'}`}>{pwMsg}</div>}
        <form onSubmit={handlePwSave}>
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input className="form-control" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input className="form-control" type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} minLength={6} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingPw}>
            {savingPw ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '🔒 Change password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;