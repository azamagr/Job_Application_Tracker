import React, { useEffect, useState, useCallback } from 'react';
import { appAPI, docAPI } from '../../utils/api';

const STATUSES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];
const statusClass = {
  Applied: 'applied', Screening: 'screening',
  Interview: 'interview', Offer: 'offer', Rejected: 'rejected'
};

const defaultForm = {
  company: '',
  position: '',
  jobLink: '',
  contactPerson: '',
  dateApplied: new Date().toISOString().split('T')[0],
  status: 'Applied',
  notes: '',
};

const ApplicationsPage = () => {
  const [apps, setApps]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editApp, setEditApp]     = useState(null);
  const [form, setForm]           = useState(defaultForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // File states — FR3.5
  const [resumeFile, setResumeFile]           = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [uploadingFiles, setUploadingFiles]   = useState(false);

  // Load applications — FR3.1, FR3.4
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await appAPI.getAll({ search, status: statusFilter });
      setApps(data.applications);
      setTotal(data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Listen for topbar button
  useEffect(() => {
    const handler = () => openAdd();
    window.addEventListener('open-add-app', handler);
    return () => window.removeEventListener('open-add-app', handler);
  }, []);

  const openAdd = () => {
    setEditApp(null);
    setForm(defaultForm);
    setResumeFile(null);
    setCoverLetterFile(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (app) => {
    setEditApp(app);
    setForm({
      company:       app.company,
      position:      app.position,
      jobLink:       app.jobLink || '',
      contactPerson: app.contactPerson || '',
      dateApplied:   app.dateApplied?.split('T')[0] || '',
      status:        app.status,
      notes:         app.notes || '',
    });
    setResumeFile(null);
    setCoverLetterFile(null);
    setError('');
    setShowModal(true);
  };

  // Upload single file to documents — FR3.5
  const uploadFile = async (file, fileType, applicationId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('applicationId', applicationId);
    await docAPI.upload(formData);
  };

  // Save application — FR3.2, FR3.3
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let savedApp;

      if (editApp) {
        // FR3.3 — Update
        const { data } = await appAPI.update(editApp._id, form);
        savedApp = data.application;
        setSuccessMsg('Application updated!');
      } else {
        // FR3.1, FR3.2 — Create new
        const { data } = await appAPI.create(form);
        savedApp = data.application;
        setSuccessMsg('Application added!');
      }

      // FR3.5 — Upload resume and cover letter if selected
      if (resumeFile || coverLetterFile) {
        setUploadingFiles(true);
        const appId = savedApp._id || editApp?._id;

        if (resumeFile) {
          await uploadFile(resumeFile, 'Resume', appId);
        }
        if (coverLetterFile) {
          await uploadFile(coverLetterFile, 'Cover Letter', appId);
        }
        setUploadingFiles(false);
      }

      setShowModal(false);
      load();
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Save failed. Try again.');
    } finally {
      setSaving(false);
      setUploadingFiles(false);
    }
  };

  // FR3.3 — Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await appAPI.delete(id);
      setSuccessMsg('Application deleted.');
      load();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Delete failed');
    }
  };

  // FR3.4 — Quick status change from table
  const handleStatusChange = async (app, newStatus) => {
    try {
      await appAPI.update(app._id, { status: newStatus });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  // File size check
  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      e.target.value = '';
      return;
    }
    setter(file);
  };

  return (
    <div>

      {/* Search + Filter bar — FR3.4, UC-09 */}
      <div className="gap-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search company, position..."
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
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <button className="btn btn-primary" onClick={openAdd}>
          + Add application
        </button>

        <span className="text-muted text-sm">{total} total</span>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Applications Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto', width: 28, height: 28 }} />
            </div>
          ) : apps.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <h3>No applications yet</h3>
              <p>Click "Add application" to track your first job</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openAdd}>
                + Add application
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600 }}>{app.company}</td>
                    <td>{app.position}</td>
                    <td className="text-muted text-sm">
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </td>

                    {/* FR3.4 — Status dropdown */}
                    <td>
                      <select
                        className={`badge badge-${statusClass[app.status]}`}
                        style={{ border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        value={app.status}
                        onChange={e => handleStatusChange(app, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>

                    <td className="text-muted text-sm">{app.contactPerson || '—'}</td>

                    {/* FR3.5 — Show if docs attached */}
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {app.resume && (
                          <span style={{
                            fontSize: 10, padding: '2px 6px', borderRadius: 8,
                            background: '#E6F1FB', color: '#185FA5', fontWeight: 600
                          }}>📄 CV</span>
                        )}
                        {app.coverLetter && (
                          <span style={{
                            fontSize: 10, padding: '2px 6px', borderRadius: 8,
                            background: '#EAF3DE', color: '#3B6D11', fontWeight: 600
                          }}>✉️ CL</span>
                        )}
                        {!app.resume && !app.coverLetter && (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" onClick={() => openEdit(app)}>
                          ✏️ Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(app._id)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal — FR3.1, FR3.2, FR3.3, FR3.5 */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal" style={{ width: 560 }}>
            <div className="modal-header">
              <span className="modal-title">
                {editApp ? '✏️ Edit Application' : '📋 Add Job Application'}
              </span>
              <button className="btn btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSave}>

              {/* FR3.2 — Application details */}
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '.5px',
                marginBottom: 10, paddingBottom: 6,
                borderBottom: '1px solid var(--border)'
              }}>
                Application Details
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company name *</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Google"
                    value={form.company}
                    onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position *</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Software Engineer"
                    value={form.position}
                    onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date Applied</label>
                  <input
                    className="form-control"
                    type="date"
                    value={form.dateApplied}
                    onChange={e => setForm(p => ({ ...p, dateApplied: e.target.value }))}
                  />
                </div>
                {/* FR3.4 — Status */}
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Link</label>
                <input
                  className="form-control"
                  type="url"
                  placeholder="https://careers.company.com/..."
                  value={form.jobLink}
                  onChange={e => setForm(p => ({ ...p, jobLink: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input
                  className="form-control"
                  placeholder="Recruiter name or email"
                  value={form.contactPerson}
                  onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Add any notes here..."
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>

              {/* FR3.5 — Document Upload Section */}
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '.5px',
                margin: '16px 0 10px', paddingBottom: 6,
                borderBottom: '1px solid var(--border)'
              }}>
                📎 Documents (FR3.5)
              </div>

              <div className="form-row">
                {/* Resume Upload */}
                <div className="form-group">
                  <label className="form-label">Resume / CV</label>
                  <label style={{
                    display: 'block', border: '1.5px dashed var(--border)',
                    borderRadius: 8, padding: '12px', textAlign: 'center',
                    cursor: 'pointer', background: resumeFile ? '#EAF3DE' : 'var(--bg)',
                    transition: 'all .15s'
                  }}>
                    {resumeFile ? (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>📄</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#3B6D11' }}>
                          {resumeFile.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {(resumeFile.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>⬆️</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Click to upload Resume
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          PDF, DOC, DOCX — max 5MB
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx"
                      onChange={e => handleFileChange(e, setResumeFile)}
                    />
                  </label>
                  {resumeFile && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      style={{ marginTop: 4, width: '100%' }}
                      onClick={() => setResumeFile(null)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {/* Cover Letter Upload */}
                <div className="form-group">
                  <label className="form-label">Cover Letter</label>
                  <label style={{
                    display: 'block', border: '1.5px dashed var(--border)',
                    borderRadius: 8, padding: '12px', textAlign: 'center',
                    cursor: 'pointer', background: coverLetterFile ? '#E6F1FB' : 'var(--bg)',
                    transition: 'all .15s'
                  }}>
                    {coverLetterFile ? (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>✉️</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#185FA5' }}>
                          {coverLetterFile.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {(coverLetterFile.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>⬆️</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Click to upload Cover Letter
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          PDF, DOC, DOCX — max 5MB
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx"
                      onChange={e => handleFileChange(e, setCoverLetterFile)}
                    />
                  </label>
                  {coverLetterFile && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      style={{ marginTop: 4, width: '100%' }}
                      onClick={() => setCoverLetterFile(null)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>

              <div style={{
                background: '#E6F1FB', borderRadius: 8,
                padding: '8px 12px', fontSize: 12, color: '#185FA5',
                marginBottom: 14
              }}>
                💡 Documents are optional — you can also upload them later from the Documents page
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving || uploadingFiles}
                >
                  {saving || uploadingFiles ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                      {uploadingFiles ? 'Uploading files...' : 'Saving...'}
                    </div>
                  ) : (
                    editApp ? '💾 Save changes' : '✅ Add application'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicationsPage;