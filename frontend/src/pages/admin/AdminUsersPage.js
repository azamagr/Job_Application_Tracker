import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../utils/api';

const AdminUsersPage = () => {
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // for detail modal

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search, status: statusFilter });
      setUsers(data.users);
      setTotal(data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggle = async (user) => {
    const action = user.isActive ? 'Block' : 'Activate';
    if (!window.confirm(`${action} user "${user.firstName} ${user.lastName}"?`)) return;
    try {
      await adminAPI.toggleUser(user._id);
      showSuccess(`User ${user.isActive ? 'blocked' : 'activated'} successfully.`);
      load();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(
      `Permanently delete "${user.firstName} ${user.lastName}"?\n\nThis will also delete all their applications.`
    )) return;
    try {
      await adminAPI.deleteUser(user._id);
      showSuccess('User deleted successfully.');
      load();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Initials avatar
  const getInitials = (u) =>
    `${(u.firstName || '?')[0]}${(u.lastName || '?')[0]}`.toUpperCase();

  // Avatar color based on name
  const avatarColors = [
    { bg: '#E6F1FB', color: '#185FA5' },
    { bg: '#EAF3DE', color: '#3B6D11' },
    { bg: '#EEEDFE', color: '#534AB7' },
    { bg: '#FAEEDA', color: '#854F0B' },
    { bg: '#FAECE7', color: '#993C1D' },
  ];
  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div>
      {/* Search and filters */}
      <div className="gap-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 340 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All users</option>
          <option value="active">Active only</option>
          <option value="blocked">Blocked only</option>
        </select>

        <span className="text-muted text-sm">{total} registered users</span>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Stats row */}
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Total users</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {users.filter(u => u.isActive).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Blocked</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {users.filter(u => !u.isActive).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total applications</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {users.reduce((sum, u) => sum + (u.applicationCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto', width: 28, height: 28 }} />
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Career field</th>
                  <th>Joined</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const av = getAvatarColor(user.firstName || 'A');
                  return (
                    <tr key={user._id}>
                      {/* Name + avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            className="avatar"
                            style={{ width: 32, height: 32, fontSize: 12, background: av.bg, color: av.color, flexShrink: 0 }}
                          >
                            {getInitials(user)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {user.firstName} {user.lastName}
                            </div>
                            {user.skills?.length > 0 && (
                              <div className="text-sm text-muted">
                                {user.skills.slice(0, 2).join(', ')}
                                {user.skills.length > 2 && ` +${user.skills.length - 2}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="text-sm text-muted">{user.email}</td>

                      <td className="text-sm text-muted">
                        {user.careerPreferences || '—'}
                      </td>

                      <td className="text-sm text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <span style={{
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600
                        }}>
                          {user.applicationCount || 0}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${user.isActive ? 'badge-offer' : 'badge-rejected'}`}>
                          {user.isActive ? '✓ Active' : '✕ Blocked'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {/* View detail */}
                          <button
                            className="btn btn-sm"
                            onClick={() => setSelectedUser(user)}
                            title="View details"
                          >
                            👁 View
                          </button>

                          {/* Block / Unblock */}
                          <button
                            className="btn btn-sm"
                            style={{
                              background: user.isActive ? 'var(--warning-bg)' : 'var(--success-bg)',
                              color: user.isActive ? 'var(--warning)' : 'var(--success)',
                              borderColor: user.isActive ? 'var(--warning)' : 'var(--success)',
                            }}
                            onClick={() => handleToggle(user)}
                            title={user.isActive ? 'Block user' : 'Activate user'}
                          >
                            {user.isActive ? '🚫 Block' : '✅ Activate'}
                          </button>

                          {/* Delete */}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(user)}
                            title="Delete user"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setSelectedUser(null)}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">👤 User Details</span>
              <button className="btn btn-sm" onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div
                className="avatar"
                style={{ width: 52, height: 52, fontSize: 18, background: getAvatarColor(selectedUser.firstName || 'A').bg, color: getAvatarColor(selectedUser.firstName || 'A').color }}
              >
                {getInitials(selectedUser)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </div>
                <div className="text-muted text-sm">{selectedUser.email}</div>
                <span className={`badge ${selectedUser.isActive ? 'badge-offer' : 'badge-rejected'}`} style={{ marginTop: 4 }}>
                  {selectedUser.isActive ? 'Active' : 'Blocked'}
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Phone',         value: selectedUser.phone || 'Not provided' },
                { label: 'Career pref.',  value: selectedUser.careerPreferences || 'Not set' },
                { label: 'Joined',        value: new Date(selectedUser.createdAt).toLocaleDateString() },
                { label: 'Applications',  value: selectedUser.applicationCount || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                  <div className="text-sm text-muted" style={{ marginBottom: 2 }}>{label}</div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            {selectedUser.skills?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="text-sm text-muted" style={{ marginBottom: 6 }}>Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedUser.skills.map(skill => (
                    <span
                      key={skill}
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {selectedUser.bio && (
              <div style={{ marginBottom: 16 }}>
                <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Bio</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{selectedUser.bio}</p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                style={{
                  flex: 1,
                  background: selectedUser.isActive ? 'var(--warning-bg)' : 'var(--success-bg)',
                  color: selectedUser.isActive ? 'var(--warning)' : 'var(--success)',
                  borderColor: selectedUser.isActive ? 'var(--warning)' : 'var(--success)',
                }}
                onClick={() => { handleToggle(selectedUser); setSelectedUser(null); }}
              >
                {selectedUser.isActive ? '🚫 Block user' : '✅ Activate user'}
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => { handleDelete(selectedUser); setSelectedUser(null); }}
              >
                🗑 Delete user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;