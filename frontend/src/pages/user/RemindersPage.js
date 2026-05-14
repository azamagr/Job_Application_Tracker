import React, { useEffect, useState } from 'react';
import { reminderAPI, appAPI } from '../../utils/api';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [myApps, setMyApps]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [form, setForm] = useState({
    application: '', type: 'Interview',
    reminderDate: '', reminderTime: '09:00',
    notifyVia: 'Both', message: ''
  });

  const load = async () => {
    const [r, a] = await Promise.all([reminderAPI.getAll(), appAPI.getAll({ limit: 50 })]);
    setReminders(r.data.reminders);
    setMyApps(a.data.applications);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const reminderDate = new Date(`${form.reminderDate}T${form.reminderTime}`).toISOString();
      await reminderAPI.create({ application: form.application, type: form.type, reminderDate, notifyVia: form.notifyVia, message: form.message });
      setForm(p => ({ ...p, application: '', message: '' }));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save reminder');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await reminderAPI.delete(id); load();
  };

  const typeColors = { Interview: 'var(--warning)', 'Follow-up': 'var(--primary)', Deadline: 'var(--danger)', 'Offer response': 'var(--success)' };
  const upcoming = reminders.filter(r => new Date(r.reminderDate) >= new Date());
  const past     = reminders.filter(r => new Date(r.reminderDate) < new Date());

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
      <div className="card">
        <div className="card-title">Set Reminder</div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Application *</label>
            <select className="form-control" value={form.application} onChange={e => setForm(p => ({ ...p, application: e.target.value }))} required>
              <option value="">Select application...</option>
              {myApps.map(a => <option key={a._id} value={a._id}>{a.company} – {a.position}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reminder type *</label>
            <select className="form-control" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {['Interview', 'Follow-up', 'Deadline', 'Offer response'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-control" type="date" value={form.reminderDate} onChange={e => setForm(p => ({ ...p, reminderDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-control" type="time" value={form.reminderTime} onChange={e => setForm(p => ({ ...p, reminderTime: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notify via</label>
            <select className="form-control" value={form.notifyVia} onChange={e => setForm(p => ({ ...p, notifyVia: e.target.value }))}>
              {['Both', 'Email', 'In-app'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea className="form-control" rows={2} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="e.g. Bring portfolio..." />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '🔔 Save reminder'}
          </button>
        </form>
      </div>

      <div>
        <div className="card">
          <div className="card-title">Upcoming ({upcoming.length})</div>
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> :
           upcoming.length === 0 ? <p className="text-muted text-sm">No upcoming reminders</p> :
           upcoming.map(r => (
            <div key={r._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: typeColors[r.type] || 'var(--primary)', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{r.application?.company} – {r.type}</div>
                <div className="text-muted text-sm">{new Date(r.reminderDate).toLocaleString()} · via {r.notifyVia}</div>
                {r.message && <div className="text-sm text-muted" style={{ marginTop: 2 }}>{r.message}</div>}
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r._id)}>✕</button>
            </div>
          ))}
        </div>

        {past.length > 0 && (
          <div className="card">
            <div className="card-title" style={{ color: 'var(--text-muted)' }}>Past reminders ({past.length})</div>
            {past.map(r => (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)', opacity: 0.6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13 }}>{r.application?.company} – {r.type}</div>
                <div className="text-muted text-sm">{new Date(r.reminderDate).toLocaleDateString()}</div>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r._id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;