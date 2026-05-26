import { useState, useEffect } from 'react';
import { eventsAPI, materialsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdUpload, MdDownload, MdDelete, MdLibraryBooks } from 'react-icons/md';
import Loader from '../../components/common/Loader';

const TrainerMaterials = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', file: null });

  useEffect(() => {
    eventsAPI.getMyEvents({ limit: 100 }).then(res => setEvents(res.data.data)).catch(() => toast.error('Failed to load events'));
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    materialsAPI.getByEvent(selectedEvent)
      .then(res => setMaterials(res.data.data))
      .catch(() => toast.error('Failed to load materials'))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file || !form.title || !selectedEvent) return toast.warning('Select event, title and file');
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('file', form.file);
    setUploading(true);
    try {
      await materialsAPI.upload(selectedEvent, fd);
      toast.success('Material uploaded');
      setForm({ title: '', description: '', file: null });
      const res = await materialsAPI.getByEvent(selectedEvent);
      setMaterials(res.data.data);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (mid) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await materialsAPI.delete(mid);
      setMaterials(prev => prev.filter(m => m._id !== mid));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Training Materials</h2>
          <p className="page-subtitle">Upload and manage materials for your events</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="card-header"><h3 className="card-title">Select Event</h3></div>
        <div className="card-body">
          <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ maxWidth: '450px' }}>
            <option value="">-- Choose an event --</option>
            {events.map(ev => (
              <option key={ev._id} value={ev._id}>{ev.title} ({ev.status})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedEvent && (
        <>
          <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className="card-header"><h3 className="card-title"><MdUpload /> Upload New Material</h3></div>
            <div className="card-body">
              <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">Title <span className="required">*</span></label>
                  <input className="form-control" placeholder="Material title" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">File <span className="required">*</span></label>
                  <input className="form-control" type="file" required
                    onChange={e => setForm({ ...form, file: e.target.files[0] })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <input className="form-control" placeholder="Optional description" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? <><span className="spinner" /> Uploading...</> : <><MdUpload /> Upload Material</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title"><MdLibraryBooks /> Materials ({materials.length})</h3></div>
            {loading ? <Loader overlay={false} /> : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Title</th><th>Description</th><th>File Type</th><th>Size</th><th>Downloads</th><th>Actions</th></tr></thead>
                  <tbody>
                    {materials.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No materials uploaded for this event</td></tr>
                    ) : materials.map(m => (
                      <tr key={m._id}>
                        <td style={{ fontWeight: 500 }}>{m.title}</td>
                        <td style={{ color: 'var(--text-muted)', maxWidth: '200px' }}>{m.description || '—'}</td>
                        <td><span className="badge badge-secondary">{m.fileType}</span></td>
                        <td>{formatSize(m.fileSize)}</td>
                        <td>{m.downloadCount || 0}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href={m.filePath} target="_blank" rel="noreferrer" download className="btn btn-ghost btn-sm"><MdDownload /></a>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}><MdDelete /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrainerMaterials;
