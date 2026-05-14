import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { appAPI, reminderAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats]         = useState(null);
  const [reminders, setReminders] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading]     = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [s, r, a] = await Promise.all([
          appAPI.getStats(),
          reminderAPI.getAll(),
          appAPI.getAll({ limit: 5, sort: '-createdAt' }),
        ]);
        setStats(s.data.stats);
        setReminders(r.data.reminders);
        setRecentApps(a.data.applications);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  const chartData = stats ? [
    { name: 'Applied',   count: stats.applied,   fill: '#185FA5' },
    { name: 'Screening', count: stats.screening, fill: '#534AB7' },
    { name: 'Interview', count: stats.interview, fill: '#854F0B' },
    { name: 'Offer',     count: stats.offer,     fill: '#3B6D11' },
    { name: 'Rejected',  count: stats.rejected,  fill: '#A32D2D' },
  ] : [];

  const statusClass = { Applied: 'applied', Screening: 'screening', Interview: 'interview', Offer: 'offer', Rejected: 'rejected' };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Good day, {user?.firstName}! 👋</h2>
        <p className="text-muted text-sm" style={{ marginTop: 2 }}>Here's your job search overview</p>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Total Applications</div><div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.total}</div></div>
          <div className="stat-card"><div className="stat-label">Interviews</div><div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.interview}</div></div>
          <div className="stat-card"><div className="stat-label">Offers</div><div className="stat-value" style={{ color: 'var(--success)' }}>{stats.offer}</div></div>
          <div className="stat-card"><div className="stat-label">Rejected</div><div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.rejected}</div></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Application Status Breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {chartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Upcoming Reminders</div>
          {reminders.length === 0 ? (
            <p className="text-muted text-sm">No upcoming reminders</p>
          ) : reminders.slice(0, 4).map(r => (
            <div key={r._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.application?.company} – {r.type}</div>
                <div className="text-muted text-sm">{new Date(r.reminderDate).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <button className="btn btn-sm" style={{ marginTop: 4 }} onClick={() => navigate('/reminders')}>View all</button>
        </div>
      </div>

      {stats && (
        <div className="card">
          <div className="card-title">Success Rates</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span className="text-muted">Interview rate</span>
                <span style={{ fontWeight: 600 }}>{stats.interviewRate}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${stats.interviewRate}%`, background: 'var(--warning)' }} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span className="text-muted">Offer rate</span>
                <span style={{ fontWeight: 600 }}>{stats.offerRate}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${stats.offerRate}%`, background: 'var(--success)' }} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Recent Applications</div>
          <button className="btn btn-sm" onClick={() => navigate('/applications')}>View all</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Company</th><th>Position</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {recentApps.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 500 }}>{a.company}</td>
                  <td>{a.position}</td>
                  <td className="text-muted text-sm">{new Date(a.dateApplied).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${statusClass[a.status]}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;