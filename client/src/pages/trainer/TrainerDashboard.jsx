import { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdEvent, MdPeople, MdCheckCircle, MdUpcoming } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const TrainerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await eventsAPI.getMyEvents({ limit: 50 });
        setEvents(res.data.data || []);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <Loader overlay={false} />;

  const upcoming = events.filter(e => e.status === 'Upcoming').length;
  const completed = events.filter(e => e.status === 'Completed').length;
  const totalParticipants = events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0);
  const recent = events.slice(0, 5);

  const statCards = [
    { label: 'Total Events', value: events.length, icon: <MdEvent />, color: 'var(--gradient-primary)' },
    { label: 'Upcoming', value: upcoming, icon: <MdUpcoming />, color: 'var(--gradient-accent)' },
    { label: 'Total Participants', value: totalParticipants, icon: <MdPeople />, color: 'var(--gradient-secondary)' },
    { label: 'Completed', value: completed, icon: <MdCheckCircle />, color: 'linear-gradient(135deg,var(--blue-green),var(--sky-aqua))' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Trainer Dashboard</h2>
          <p className="page-subtitle">Your training overview</p>
        </div>
        <div className="page-header-right">
          <Link to="/trainer/events" className="btn btn-primary">View All Events</Link>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h3 className="card-title">My Events</h3>
          <Link to="/trainer/events" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Event</th><th>Start Date</th><th>Mode</th><th>Status</th><th>Participants</th><th>Action</th></tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No events assigned yet</td></tr>
              ) : recent.map(ev => (
                <tr key={ev._id}>
                  <td><span style={{ fontWeight: 500 }}>{ev.title}</span></td>
                  <td>{format(new Date(ev.startDate), 'MMM dd, yyyy')}</td>
                  <td><span className={`badge badge-${ev.mode === 'Online' ? 'success' : ev.mode === 'Offline' ? 'dark' : 'warning'}`}>{ev.mode}</span></td>
                  <td><span className={`badge badge-${ev.status === 'Upcoming' ? 'info' : ev.status === 'Ongoing' ? 'success' : ev.status === 'Completed' ? 'dark' : 'danger'}`}>{ev.status}</span></td>
                  <td>{ev.currentParticipants}/{ev.maxParticipants}</td>
                  <td><Link to={`/trainer/events/${ev._id}`} className="btn btn-ghost btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
