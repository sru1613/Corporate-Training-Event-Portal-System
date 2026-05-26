import { useState, useEffect } from 'react';
import { eventsAPI, registrationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdSearch, MdEvent, MdLocationOn, MdPeople } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const categories = ['Technical', 'Soft Skills', 'Leadership', 'Compliance', 'Safety', 'Sales', 'HR', 'Finance', 'Other'];

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [registering, setRegistering] = useState(null);
  const [myRegs, setMyRegs] = useState([]);
  const limit = 9;

  useEffect(() => {
    registrationsAPI.getMy({ limit: 200 }).then(res => setMyRegs(res.data.data.map(r => r.event?._id))).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await eventsAPI.getAll({ page, limit, search, category, mode, status: 'Upcoming' });
        setEvents(res.data.data);
        setTotal(res.data.count || 0);
      } catch { toast.error('Failed to load events'); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, [page, search, category, mode]);

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      await registrationsAPI.register(eventId);
      toast.success('Registered successfully!');
      setMyRegs(prev => [...prev, eventId]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setRegistering(null); }
  };

  const modeColor = m => ({ Online: 'success', Offline: 'dark', Hybrid: 'warning' }[m] || 'info');
  const isFull = ev => ev.currentParticipants >= ev.maxParticipants;
  const isRegistered = (id) => myRegs.includes(id);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Browse Events</h2>
          <p className="page-subtitle">Discover and register for upcoming training programs</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="card-body" style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '200px' }}>
            <MdSearch />
            <input className="search-input" placeholder="Search by title, description..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={mode} onChange={e => { setMode(e.target.value); setPage(1); }}>
            <option value="">All Modes</option>
            {['Online', 'Offline', 'Hybrid'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Loader overlay={false} /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 'var(--spacing-lg)' }}>
            {events.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1', padding: '3rem' }}>
                <MdEvent style={{ fontSize: '3rem', opacity: 0.3 }} />
                <p>No upcoming events found</p>
              </div>
            ) : events.map(ev => (
              <div key={ev._id} className="card event-card" style={{ margin: 0 }}>
                <div style={{ background: 'var(--gradient-primary)', height: '6px', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }} />
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
                    <span className="badge badge-secondary">{ev.category}</span>
                    <span className={`badge badge-${modeColor(ev.mode)}`}>{ev.mode}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--french-blue)', marginBottom: 'var(--spacing-sm)' }}>{ev.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      📅 {format(new Date(ev.startDate), 'MMM dd')} – {format(new Date(ev.endDate), 'MMM dd, yyyy')}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      🕐 {ev.startTime} – {ev.endTime}
                    </div>
                    {(ev.location || ev.meetingLink) && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <MdLocationOn style={{ verticalAlign: 'middle' }} />
                        {' '}{ev.location || ev.meetingLink}
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: isFull(ev) ? 'var(--danger)' : 'var(--text-muted)' }}>
                      <MdPeople style={{ verticalAlign: 'middle' }} />
                      {' '}{ev.currentParticipants}/{ev.maxParticipants} {isFull(ev) ? '(Full)' : 'spots'}
                    </div>
                  </div>
                  {ev.trainers?.length > 0 && (
                    <div style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      👤 {ev.trainers.map(t => t.name).join(', ')}
                    </div>
                  )}
                  <button
                    className={`btn ${isRegistered(ev._id) ? 'btn-success' : isFull(ev) ? 'btn-secondary' : 'btn-primary'} btn-full`}
                    onClick={() => !isRegistered(ev._id) && !isFull(ev) && handleRegister(ev._id)}
                    disabled={registering === ev._id || isRegistered(ev._id)}
                  >
                    {registering === ev._id ? <><span className="spinner" /> Registering...</>
                      : isRegistered(ev._id) ? '✓ Registered'
                      : isFull(ev) ? 'Join Waitlist'
                      : 'Register Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {total > limit && (
            <div className="pagination" style={{ marginTop: 'var(--spacing-lg)' }}>
              <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
              <span className="pagination-info">Page {page} of {Math.ceil(total / limit)}</span>
              <button className="pagination-btn" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next ›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseEvents;
