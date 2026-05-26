import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdRefresh, MdVisibility, MdEvent } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const STATUS_COLORS = { Upcoming: 'badge-info', Ongoing: 'badge-success', Completed: 'badge-secondary', Cancelled: 'badge-danger' };
const CATEGORIES = ['Technical', 'Soft Skills', 'Leadership', 'Compliance', 'Safety', 'Sales', 'HR', 'Finance', 'Other'];

const EventModal = ({ event, onClose, onSave }) => {
  const [form, setForm] = useState(event ? {
    ...event,
    startDate: event.startDate ? format(new Date(event.startDate), 'yyyy-MM-dd') : '',
    endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : '',
    trainers: event.trainers?.map(t => t._id || t) || []
  } : {
    title: '', description: '', category: 'Technical', startDate: '', endDate: '',
    startTime: '09:00', endTime: '17:00', location: '', mode: 'Offline',
    meetingLink: '', maxParticipants: 30, trainers: [], tags: [], status: 'Upcoming'
  });
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usersAPI.getTrainers().then(({ data }) => setTrainers(data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (event) {
        const { data } = await eventsAPI.update(event._id, form);
        toast.success('Event updated successfully');
        onSave(data.data);
      } else {
        const { data } = await eventsAPI.create(form);
        toast.success('Event created successfully');
        onSave(data.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrainer = (id) => {
    setForm(f => ({
      ...f,
      trainers: f.trainers.includes(id) ? f.trainers.filter(t => t !== id) : [...f.trainers, id]
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '700px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{event ? 'Edit Event' : 'Create Training Event'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Event Title <span className="required">*</span></label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Leadership Excellence Workshop" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description <span className="required">*</span></label>
                <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Provide a detailed description of the training event, objectives, and expected outcomes..." />
              </div>
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mode <span className="required">*</span></label>
                <select className="form-control" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date <span className="required">*</span></label>
                <input type="date" className="form-control" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date <span className="required">*</span></label>
                <input type="date" className="form-control" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time <span className="required">*</span></label>
                <input type="time" className="form-control" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Time <span className="required">*</span></label>
                <input type="time" className="form-control" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location <span className="required">*</span></label>
                <input className="form-control" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required placeholder="e.g. Conference Room A or Zoom Link" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Participants <span className="required">*</span></label>
                <input type="number" className="form-control" value={form.maxParticipants} onChange={e => { const v = parseInt(e.target.value); setForm({ ...form, maxParticipants: isNaN(v) ? '' : v }); }} required min={1} />
              </div>
              {(form.mode === 'Online' || form.mode === 'Hybrid') && (
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Meeting Link</label>
                  <input className="form-control" value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://zoom.us/j/..." />
                </div>
              )}
              {event && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Assign Trainers</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', border: '1.5px solid var(--frosted-blue)', borderRadius: 'var(--radius-md)', background: 'white', maxHeight: '150px', overflowY: 'auto' }}>
                  {trainers.length === 0 ? <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No trainers available</span> :
                    trainers.map(t => (
                      <label key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: form.trainers.includes(t._id) ? 'var(--bright-teal-blue)' : 'var(--light-cyan)', color: form.trainers.includes(t._id) ? 'white' : 'var(--deep-twilight)', fontSize: '0.8rem', fontWeight: 500, transition: 'all var(--transition-fast)' }}>
                        <input type="checkbox" checked={form.trainers.includes(t._id)} onChange={() => toggleTrainer(t._id)} style={{ display: 'none' }} />
                        {t.name}
                      </label>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState({ open: false, event: null });
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, [pagination.page, statusFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await eventsAPI.getAll(params);
      setEvents(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? All registrations will also be removed.')) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted');
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleSave = (saved) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e._id === saved._id);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = saved; return updated; }
      return [saved, ...prev];
    });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Training Events</h2>
          <p className="page-subtitle">{pagination.total} total events</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost btn-sm" onClick={fetchEvents}><MdRefresh /></button>
          <button className="btn btn-primary" onClick={() => setModal({ open: true, event: null })}>
            <MdAdd /> Create Event
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <form onSubmit={e => { e.preventDefault(); fetchEvents(); }} style={{ display: 'flex', gap: 'var(--spacing-sm)', flex: 1 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <MdSearch />
            <input className="form-control" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <select className="form-control" style={{ width: '140px' }} value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <Loader overlay={false} /> : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan="7">
                    <div className="empty-state"><div className="empty-state-icon"><MdEvent /></div><p>No events found</p></div>
                  </td></tr>
                ) : events.map(event => (
                  <tr key={event._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--deep-twilight)' }}>{event.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{event.mode}</div>
                    </td>
                    <td><span className="badge badge-info">{event.category}</span></td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{format(new Date(event.startDate), 'MMM dd')}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.startTime}</div>
                    </td>
                    <td style={{ maxWidth: '140px' }} className="truncate">{event.location}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${Math.min(100, (event.currentParticipants / event.maxParticipants) * 100)}%` }} />
                        </div>
                        <span style={{ fontSize: '0.78rem' }}>{event.currentParticipants}/{event.maxParticipants}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[event.status]}`}>{event.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate(`/admin/events/${event._id}`)} title="View"><MdVisibility /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal({ open: true, event })} title="Edit"><MdEdit /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(event._id)} title="Delete"><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} className={`page-btn${pagination.page === i + 1 ? ' active' : ''}`}
                  onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {modal.open && <EventModal event={modal.event} onClose={() => setModal({ open: false, event: null })} onSave={handleSave} />}
    </div>
  );
};

export default ManageEvents;
