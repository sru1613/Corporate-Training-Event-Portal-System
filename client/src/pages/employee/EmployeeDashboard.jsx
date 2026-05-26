import { useState, useEffect } from 'react';
import { registrationsAPI, notificationsAPI, eventsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdEvent, MdCheckCircle, MdNotifications, MdHourglassEmpty } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [regs, setRegs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      registrationsAPI.getMy({ limit: 5 }),
      notificationsAPI.getMy({ limit: 5 })
    ]).then(([rRes, nRes]) => {
      setRegs(rRes.data.data);
      setNotifications(nRes.data.data);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = regs.filter(r => r.status === 'Confirmed').length;
  const pending = regs.filter(r => r.status === 'Pending').length;
  const completed = regs.filter(r => r.completionStatus === 'Completed').length;
  const total = regs.length;

  if (loading) return <Loader overlay={false} />;

  const statCards = [
    { label: 'My Registrations', value: total, icon: <MdEvent />, color: 'var(--gradient-primary)' },
    { label: 'Confirmed', value: confirmed, icon: <MdCheckCircle />, color: 'var(--gradient-accent)' },
    { label: 'Pending', value: pending, icon: <MdHourglassEmpty />, color: 'var(--gradient-secondary)' },
    { label: 'Completed', value: completed, icon: <MdCheckCircle />, color: 'linear-gradient(135deg,var(--blue-green),var(--sky-aqua))' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">My Dashboard</h2>
          <p className="page-subtitle">Your training overview</p>
        </div>
        <div className="page-header-right">
          <Link to="/employee/events" className="btn btn-primary">Browse Events</Link>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Registrations</h3>
            <Link to="/employee/registrations" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {regs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No registrations yet. <Link to="/employee/events">Browse events</Link></p></div>
          ) : (
            <div style={{ padding: 'var(--spacing-md)' }}>
              {regs.map(r => (
                <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--frosted-blue-2)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{r.event?.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.event?.startDate ? format(new Date(r.event.startDate), 'MMM dd, yyyy') : ''}</div>
                  </div>
                  <span className={`badge badge-${r.status === 'Confirmed' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent Notifications</h3></div>
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No notifications</p></div>
          ) : (
            <div>
              {notifications.map(n => (
                <div key={n._id} className={`notification-item${!n.isRead ? ' unread' : ''}`}>
                  <div className="notification-icon" style={{ background: 'var(--gradient-primary)' }}><MdNotifications /></div>
                  <div>
                    <div className="notification-title">{n.title}</div>
                    <div className="notification-msg">{n.message}</div>
                    <div className="notification-time">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
