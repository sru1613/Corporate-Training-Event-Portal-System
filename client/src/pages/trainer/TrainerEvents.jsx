import { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdSearch, MdEvent } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TrainerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await eventsAPI.getMyEvents({ page, limit, search, status });
        setEvents(res.data.data);
        setTotal(res.data.count || 0);
      } catch { toast.error('Failed to load events'); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, [page, search, status]);

  const statusColor = s => ({ Upcoming: 'info', Ongoing: 'success', Completed: 'dark', Cancelled: 'danger' }[s] || 'info');

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">My Events</h2>
          <p className="page-subtitle">Events you are assigned to train</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '200px' }}>
            <MdSearch />
            <input className="search-input" placeholder="Search events..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? <Loader overlay={false} /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Event</th><th>Category</th><th>Start Date</th><th>End Date</th><th>Mode</th><th>Status</th><th>Participants</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <MdEvent style={{ fontSize: '2rem', opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                    No events found
                  </td></tr>
                ) : events.map(ev => (
                  <tr key={ev._id}>
                    <td style={{ fontWeight: 500 }}>{ev.title}</td>
                    <td><span className="badge badge-secondary">{ev.category}</span></td>
                    <td>{format(new Date(ev.startDate), 'MMM dd, yyyy')}</td>
                    <td>{format(new Date(ev.endDate), 'MMM dd, yyyy')}</td>
                    <td><span className={`badge ${ev.mode === 'Online' ? 'badge-success' : ev.mode === 'Offline' ? 'badge-dark' : 'badge-warning'}`}>{ev.mode}</span></td>
                    <td><span className={`badge badge-${statusColor(ev.status)}`}>{ev.status}</span></td>
                    <td>{ev.currentParticipants}/{ev.maxParticipants}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/trainer/events/${ev._id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div className="pagination">
            <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <span className="pagination-info">Page {page} of {Math.ceil(total / limit)}</span>
            <button className="pagination-btn" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerEvents;
