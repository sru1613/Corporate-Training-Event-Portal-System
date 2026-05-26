import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, registrationsAPI, materialsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdArrowBack, MdUpload, MdDownload, MdDelete, MdPeople, MdLibraryBooks } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const TrainerEventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [evRes, partRes, matRes] = await Promise.all([
          eventsAPI.getById(id),
          registrationsAPI.getParticipants(id),
          materialsAPI.getByEvent(id)
        ]);
        setEvent(evRes.data.data);
        setParticipants(partRes.data.data);
        setMaterials(matRes.data.data);
      } catch { toast.error('Failed to load event details'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) return toast.warning('Title and file are required');
    const fd = new FormData();
    fd.append('title', uploadForm.title);
    fd.append('description', uploadForm.description);
    fd.append('file', uploadForm.file);
    setUploading(true);
    try {
      await materialsAPI.upload(id, fd);
      toast.success('Material uploaded');
      setUploadForm({ title: '', description: '', file: null });
      const matRes = await materialsAPI.getByEvent(id);
      setMaterials(matRes.data.data);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (mid) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await materialsAPI.delete(mid);
      setMaterials(prev => prev.filter(m => m._id !== mid));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Loader overlay={false} />;
  if (!event) return null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <Link to="/trainer/events" className="btn btn-ghost btn-sm"><MdArrowBack /> Back</Link>
          <h2 className="page-title" style={{ marginTop: 'var(--spacing-sm)' }}>{event.title}</h2>
        </div>
      </div>

      <div className="tabs">
        {[['overview', 'Overview'], ['participants', `Participants (${participants.length})`], ['materials', `Materials (${materials.length})`]].map(([key, label]) => (
          <button key={key} className={`tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--spacing-md)' }}>
              {[
                ['Category', event.category],
                ['Mode', event.mode],
                ['Start Date', format(new Date(event.startDate), 'MMM dd, yyyy')],
                ['End Date', format(new Date(event.endDate), 'MMM dd, yyyy')],
                ['Time', `${event.startTime} – ${event.endTime}`],
                ['Location', event.location || event.meetingLink || 'TBD'],
                ['Participants', `${event.currentParticipants}/${event.maxParticipants}`],
                ['Status', event.status],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--light-cyan)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{k}</div>
                  <div style={{ fontWeight: 600, color: 'var(--french-blue)' }}>{v}</div>
                </div>
              ))}
            </div>
            {event.description && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Description</div>
                <p style={{ color: 'var(--text-muted)' }}>{event.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'participants' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><MdPeople /> Participants ({participants.length})</h3>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Status</th><th>Registration Date</th></tr></thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No participants yet</td></tr>
                ) : participants.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.employee?.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.employee?.email}</td>
                    <td>{p.employee?.department || '—'}</td>
                    <td><span className={`badge badge-${p.status === 'Confirmed' ? 'success' : p.status === 'Pending' ? 'warning' : 'danger'}`}>{p.status}</span></td>
                    <td>{format(new Date(p.registrationDate), 'MMM dd, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'materials' && (
        <>
          <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className="card-header"><h3 className="card-title"><MdUpload /> Upload Material</h3></div>
            <div className="card-body">
              <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">Title <span className="required">*</span></label>
                  <input className="form-control" placeholder="Material title" value={uploadForm.title}
                    onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">File <span className="required">*</span></label>
                  <input className="form-control" type="file" required
                    onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <input className="form-control" placeholder="Optional description" value={uploadForm.description}
                    onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? <><span className="spinner" /> Uploading...</> : <><MdUpload /> Upload</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title"><MdLibraryBooks /> Materials ({materials.length})</h3></div>
            <div className="table-container">
              <table>
                <thead><tr><th>Title</th><th>File Type</th><th>Size</th><th>Downloads</th><th>Actions</th></tr></thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No materials uploaded</td></tr>
                  ) : materials.map(m => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 500 }}>{m.title}</td>
                      <td><span className="badge badge-secondary">{m.fileType}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{m.fileSize ? `${(m.fileSize / 1024).toFixed(1)} KB` : '—'}</td>
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
          </div>
        </>
      )}
    </div>
  );
};

export default TrainerEventDetail;
