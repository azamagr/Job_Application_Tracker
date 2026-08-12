import React, { useEffect, useState } from 'react';
import { docAPI } from '../../utils/api';

const DocumentsPage = () => {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType]   = useState('Resume');
  const [error, setError]     = useState('');

  const load = async () => {
    const { data } = await docAPI.getAll();
    setDocs(data.documents);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    try {
      await docAPI.upload(formData);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await docAPI.delete(id); load();
  };

  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const icons = { Resume: '📄', 'Cover Letter': '✉️', 'Job Description': '📋', Other: '📁' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
      <div>
        <div className="card">
          <div className="card-title">Upload Document</div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label className="form-label">Document type</label>
            <select className="form-control" value={fileType} onChange={e => setFileType(e.target.value)}>
              {['Resume', 'Cover Letter', 'Job Description', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <label className="upload-zone" style={{ display: 'block' }}>
            {uploading ? (
              <div><div className="spinner" style={{ margin: '0 auto 8px', width: 24, height: 24 }} /><p>Uploading...</p></div>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⬆️</div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Click to upload</div>
                <div className="text-sm text-muted">PDF, DOC, DOCX – max 5MB</div>
              </>
            )}
            <input type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        <div className="card">
          <div className="card-title">Tips</div>
          <ul style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 2, paddingLeft: 16 }}>
            <li>Keep multiple resume versions</li>
            <li>Tailor cover letters per application</li>
            <li>Save job descriptions for reference</li>
            <li>Max file size: 5MB</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Stored Documents ({docs.length})</div>
        {loading ? (
          <div className="spinner" style={{ margin: '0 auto', width: 24, height: 24 }} />
        ) : docs.length === 0 ? (
          <div className="empty-state"><h3>No documents yet</h3><p>Upload your first document</p></div>
        ) : (
          docs.map(doc => (
            <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{icons[doc.fileType] || '📄'}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.originalName}</div>
                <div className="text-muted text-sm">{doc.fileType} · {formatSize(doc.size || 0)} · {new Date(doc.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <a href={`/api/documents/download/${doc._id}`} className="btn btn-sm">↓</a>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(doc._id)}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;