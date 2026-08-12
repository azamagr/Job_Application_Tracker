import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminAPI } from '../../utils/api';

const COLORS = ['#185FA5', '#534AB7', '#854F0B', '#3B6D11', '#A32D2D'];

const AdminDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  const statusChart = data?.appsByStatus ? Object.entries(data.appsByStatus).map(([k, v]) => ({ name: k, count: v })) : [];
  const pieData = statusChart.map((s, i) => ({ ...s, fill: COLORS[i] }));

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total Users</div><div className="stat-value" style={{ color: 'var(--primary)' }}>{data?.stats.totalUsers}</div></div>
        <div className="stat-card"><div className="stat-label">Active Jobs</div><div className="stat-value" style={{ color: 'var(--success)' }}>{data?.stats.totalJobs}</div></div>
        <div className="stat-card"><div className="stat-label">Total Applications</div><div className="stat-value" style={{ color: 'var(--warning)' }}>{data?.stats.totalApps}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Applications by Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChart}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#185FA5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Status Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">Most Applied Jobs</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Job</th><th>Company</th><th>Applications</th></tr></thead>
              <tbody>
                {data?.topJobs?.map((j, i) => (
                  <tr key={j._id}>
                    <td className="text-muted">{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{j.title}</td>
                    <td className="text-muted text-sm">{j.company}</td>
                    <td><span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{j.applicationCount}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Recent Registrations</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
              <tbody>
                {data?.recentUsers?.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                    <td className="text-muted text-sm">{u.email}</td>
                    <td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;