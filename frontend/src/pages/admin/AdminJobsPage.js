import React, { useEffect, useState, useCallback } from 'react';
import { jobAPI } from '../../utils/api';

const CATEGORIES = ['Engineering', 'Design', 'Data Science', 'Management', 'Marketing', 'Other'];

const defaultForm = {
  company: '',
  title: '',
  description: '',
  category: 'Engineering',
  location: 'Remote',
  jobLink: '',
};

const AdminJobsPage = () => {
  const [jobs, setJobs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob]   = useState(null);
  const [form, setForm]         = useState(defaultForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Admin fetches all jobs (active + inactive)
      const { data } = await jobAPI.getAll({ search, limit: 100 });
      setJobs(data.jobs);
      setTotal(data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  // Listen for topbar "Post New Job" button
  useEffect(() => {
    const handler = () => openAdd();
    window.addEventListener('open-add-job', handler);
    return () => window.removeEventListener('open-add-job', handler);
  }, []);

  const openAdd = () => {
    setEditJob(null);
    setForm(defaultForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (job) => {
    setEditJob(job);
    setForm({
      company:     job.company,
      title:       job.title,
      description: job.description,
      category:    job.category,
      location:    job.location,
      jobLink:     job.jobLink || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editJob) {
        await jobAPI.update(editJob._id, form);
        setSuccessMsg('Job updated successfully!');
      } else {
        await jobAPI.create(form);
        setSuccessMsg('Job posted successfully!');
      }
      setShowModal(false);
      load();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await jobAPI.delete(id);
      setSuccessMsg('Job deleted.');
      load();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggle = async (job) => {
    try {
      await jobAPI.update(job._id, { isActive: !job.isActive });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const catColors = {
    Engineering:   { bg: '#E6F1FB', color: '#185FA5' },
    Design:        { bg: '#EEEDFE', color: '#534AB7' },
    'Data Science':{ bg: '#EAF3DE', color: '#3B6D11' },
    Management:    { bg: '#FAEEDA', color: '#854F0B' },
    Marketing:     { bg: '#FAECE7', color: '#993C1D' },
    Other:         { bg: '#F1EFE8', color: '#5F5E5A' },
  };

  return (
    <div>
      {/* Top bar */}
      <div className="gap-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 340 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search jobs or companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-muted text-sm">{total} total jobs</span>
        <button className="btn btn-primary" onClick={openAdd}>+ Post new job</button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Jobs table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto', width: 28, height: 28 }} />
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs posted yet</h3>
              <p>Click "Post new job" to add your first listing</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openAdd}>+ Post new job</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Posted</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  const cat = catColors[job.category] || catColors['Other'];
                  return (
                    <tr key={job._id}>
                      <td style={{ fontWeight: 600 }}>{job.company}</td>
                      <td>{job.title}</td>
                      <td>
                        <span style={{
                          background: cat.bg, color: cat.color,
                          padding: '2px 8px', borderRadius: 12,
                          fontSize: 11, fontWeight: 600
                        }}>
                          {job.category}
                        </span>
                      </td>
                      <td className="text-muted text-sm">{job.location}</td>
                      <td className="text-muted text-sm">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span style={{
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600
                        }}>
                          {job.applicationCount || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${job.isActive ? 'badge-offer' : 'badge-rejected'}`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm" onClick={() => openEdit(job)} title="Edit">
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ fontSize: 11 }}
                            onClick={() => handleToggle(job)}
                            title={job.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {job.isActive ? '⏸ Hide' : '▶ Show'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(job._id, job.title)}
                            title="Delete"
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editJob ? '✏️ Edit Job Posting' : '📋 Post New Job'}
              </span>
              <button className="btn btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSave}>
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
                  <label className="form-label">Job title *</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Senior Engineer"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-control"
                    placeholder="Remote / Lahore / Hybrid"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job description *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the role, responsibilities, requirements..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job link (optional)</label>
                <input
                  className="form-control"
                  type="url"
                  placeholder="https://careers.company.com/job/..."
                  value={form.jobLink}
                  onChange={e => setForm(p => ({ ...p, jobLink: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
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
                  disabled={saving}
                >
                  {saving
                    ? <span className="spinner" style={{ width: 14, height: 14 }} />
                    : editJob ? '💾 Save changes' : '📋 Post job'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;