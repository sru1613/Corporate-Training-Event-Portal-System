import { useState, useEffect } from 'react';
import { registrationsAPI, materialsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdDownload, MdLibraryBooks, MdSearch } from 'react-icons/md';
import Loader from '../../components/common/Loader';

const EmployeeMaterials = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matLoading, setMatLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    registrationsAPI.getMy({ limit: 100 })
      .then(res => {
        const confirmed = res.data.data.filter(r => r.status === 'Confirmed' && r.event);
        setEvents(confirmed.map(r => r.event));
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEvent) { setMaterials([]); return; }
    setMatLoading(true);
    materialsAPI.getByEvent(selectedEvent)
      .then(res => setMaterials(res.data.data))
      .catch(() => toast.error('Failed to load materials'))
      .finally(() => setMatLoading(false));
  }, [selectedEvent]);

  const handleDownload = async (mid, filename) => {
    try {
      const mat = materials.find(m => m._id === mid);
      if (mat) {
        window.open(mat.filePath, '_blank');
        setMaterials(prev => prev.map(m => m._id === mid ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m));
      }
    } catch { toast.error('Download failed'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const fileIcon = (type) => {
    const icons = { PDF: '📄', Presentation: '📊', Video: '🎥', Document: '📝', Image: '🖼️', Other: '📎' };
    return icons[type] || '📎';
  };

  const filtered = materials.filter(m => m.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Training Materials</h2>
          <p className="page-subtitle">Download materials from your registered events</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="card-body">
          <div className="form-group" style={{ marginBottom: 0, maxWidth: '450px' }}>
            <label className="form-label">Select Event</label>
            <select className="form-control" value={selectedEvent} onChange={e => { setSelectedEvent(e.target.value); setSearch(''); }}>
              <option value="">-- Select a registered event --</option>
              {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? <Loader overlay={false} /> : (
        selectedEvent && (
          <>
            {matLoading ? <Loader overlay={false} /> : (
              <>
                <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div className="card-body">
                    <div className="search-box">
                      <MdSearch />
                      <input className="search-input" placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title"><MdLibraryBooks /> Materials ({filtered.length})</h3>
                  </div>
                  {filtered.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                      <MdLibraryBooks style={{ fontSize: '3rem', opacity: 0.3 }} />
                      <p style={{ color: 'var(--text-muted)' }}>No materials available for this event</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
                      {filtered.map(m => (
                        <div key={m._id} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--frosted-blue-2)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                          <div style={{ fontSize: '2rem' }}>{fileIcon(m.fileType)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--french-blue)' }}>{m.title}</div>
                            {m.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{m.description}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                            <span className="badge badge-secondary">{m.fileType}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSize(m.fileSize)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.downloadCount || 0} downloads</span>
                          </div>
                          <button className="btn btn-primary btn-sm" onClick={() => handleDownload(m._id, m.fileName)} style={{ alignSelf: 'flex-start' }}>
                            <MdDownload /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )
      )}
    </div>
  );
};

export default EmployeeMaterials;
