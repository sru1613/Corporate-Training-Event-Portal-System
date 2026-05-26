import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import { MdNotifications, MdPerson, MdLogout, MdMarkEmailRead } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const profilePath = `/${user?.role}/profile`;

  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    const titles = {
      dashboard: 'Dashboard', users: 'Manage Users', events: 'Training Events',
      registrations: 'Registrations', reports: 'Reports & Analytics',
      feedback: 'Feedback', notifications: 'Notifications', profile: 'My Profile',
      attendance: 'Attendance', materials: 'Training Materials',
    };
    return titles[last] || 'Portal';
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getMy({ limit: 10 });
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{getPageTitle()}</h1>
      </div>
      <div className="topbar-right">
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setShowNotif(!showNotif)}
            style={{ position: 'relative' }}>
            <MdNotifications size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--color-danger)', color: 'white',
                fontSize: '0.65rem', fontWeight: 700, padding: '2px 5px',
                borderRadius: '8px', minWidth: '16px', textAlign: 'center'
              }}>{unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '360px', background: 'white', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)', zIndex: 200, overflow: 'hidden',
              border: '1px solid var(--light-cyan)'
            }}>
              <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'var(--gradient-light)',
                borderBottom: '1px solid var(--light-cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--deep-twilight)' }}>
                  Notifications {unreadCount > 0 && <span className="nav-badge" style={{ position: 'static', display: 'inline' }}>{unreadCount}</span>}
                </span>
                {unreadCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                    <MdMarkEmailRead /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="empty-state-icon">🔔</div>
                    <p>No notifications</p>
                  </div>
                ) : notifications.map(notif => (
                  <div key={notif._id} className={`notification-item${!notif.isRead ? ' unread' : ''}`}
                    onClick={() => handleMarkRead(notif._id)}>
                    <div className="notification-icon" style={{
                      background: notif.isRead ? 'var(--light-cyan)' : 'var(--gradient-accent)'
                    }}>🔔</div>
                    <div style={{ flex: 1 }}>
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-msg">{notif.message}</div>
                      <div className="notification-time">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div onClick={() => setShowProfile(!showProfile)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--light-cyan)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--deep-twilight)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>

          {showProfile && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '200px', background: 'white', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)', zIndex: 200, overflow: 'hidden',
              border: '1px solid var(--light-cyan)'
            }}>
              <NavLink to={profilePath} onClick={() => setShowProfile(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'background var(--transition-fast)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--light-cyan)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <MdPerson /> My Profile
              </NavLink>
              <div style={{ height: '1px', background: 'var(--light-cyan)' }} />
              <div onClick={() => { logout(); navigate('/login'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'background var(--transition-fast)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <MdLogout /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
