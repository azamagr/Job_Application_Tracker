import React, { useEffect, useState } from 'react';
import { jobAPI, appAPI } from '../../utils/api';

const CATEGORIES = ['Engineering', 'Design', 'Data Science', 'Management', 'Marketing', 'Other'];

const BrowseJobsPage = () => {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [applied, setApplied] = useState(new Set());
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await jobAPI.getAll({ search, category });
        setJobs(data.jobs);
      } finally { setLoading(false); }
    })();
  }, [search, category]);

  const handleApply = async (job) => {
    if (applied.has(job._id)) return;
    setApplying(job._id);
    try {
      await appAPI.create({ jobId: job._id, company: job.company, position: job.title, jobLink: job.jobLink });
      setApplied(prev => new Set([...prev, job._id]));
    } finally { setApplying(null); }
  };

  return (
    <div>
      <div className="gap-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search jobs, companies..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 180 }} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto', width: 28, height: 28 }} /></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state"><h3>No jobs found</h3><p>Try different search terms</p></div>
      ) : (
        jobs.map(job => (
          <div className="card" key={job._id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{job.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {job.company} · {job.location} ·{' '}
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{job.category}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{job.description}</p>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Posted {new Date(job.createdAt).toLocaleDateString()} · {job.applicationCount} applicants
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <button
                  className={`btn ${applied.has(job._id) ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleApply(job)}
                  disabled={applying === job._id || applied.has(job._id)}
                  style={{ minWidth: 100 }}
                >
                  {applying === job._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> :
                   applied.has(job._id) ? '✓ Applied' : 'Apply now'}
                </button>
                {job.jobLink && (
                  <a href={job.jobLink} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ fontSize: 11 }}>View posting ↗</a>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BrowseJobsPage;