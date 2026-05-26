import { useState, useEffect } from 'react';
import { notificationsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdSend, MdMarkEmailRead, MdDelete, MdNotifications } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [sendForm, setSendForm] = useState({ recipients: [], title: '', message: '', type: 'SYSTEM' });
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, usersRes] = await Promise.all([
        notificationsAPI.getMy({ limit: 50 }),
        usersAPI.getAll({ limit: 100 })
      ]);
      setNotifications(notifRes.data.data);
      setUnreadCount(notifRes.data.unreadCount);
      setUsers(usersRes.data.data);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!sendForm.recipients.length || !sendForm.title || !sendForm.message) {
      toast.warning('Please fill all fields and select recipients');
      return;
    }
    setSending(true);
    try {
      await notificationsAPI.send(sendForm);
      toast.success(`Notification sent to ${sendForm.recipients.length} users`);
      setShowSendModal(false);
      setSendForm({ recipients: [], title: '', message: '', type: 'SYSTEM' });
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const toggleRecipient = (id) => {
    setSendForm(f => ({
      ...f,
      recipients: f.recipients.includes(id) ? f.recipients.filter(r => r !== id) : [...f.recipients, id]
    }));
  };

  const selectAllRole = (role) => {
    const roleUsers = users.filter(u => u.role === role).map(u => u._id);
    setSendForm(f => ({ ...f, recipients: [...new Set([...f.recipients, ...roleUsers])] }));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">{unreadCount} unread notifications</p>
        </div>
        <div className="page-header-right">
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
              <MdMarkEmailRead /> Mark All Read
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowSendModal(true)}>
            <MdSend /> Send Notification
          </button>
        </div>
      </div>

      {loading ? <Loader overlay={false} /> : (
        <div className="card">
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--spacing-2xl)' }}>
              <div className="empty-state-icon"><MdNotifications style={{ fontSize: '4rem', opacity: 0.3 }} /></div>
              <p>No notifications</p>
            </div>
          ) : notifications.map(n => (
            <div key={n._id} className={`notification-item${!n.isRead ? ' unread' : ''}`}>
              <div className="notification-icon" style={{ background: n.isRead ? 'var(--light-cyan)' : 'var(--gradient-primary)' }}>
                🔔
              </div>
              <div style={{ flex: 1 }}>
                <div className="notification-title">{n.title}</div>
                <div className="notification-msg">{n.message}</div>
                <div className="notification-time">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
              </div>
              {!n.isRead && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>New</span>}
            </div>
          ))}
        </div>
      )}

      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Send Notification</h3>
              <button className="modal-close" onClick={() => setShowSendModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSend}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title <span className="required">*</span></label>
                  <input className="form-control" value={sendForm.title} onChange={e => setSendForm({ ...sendForm, title: e.target.value })} required placeholder="Notification title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Message <span className="required">*</span></label>
                  <textarea className="form-control" value={sendForm.message} onChange={e => setSendForm({ ...sendForm, message: e.target.value })} required rows={3} placeholder="Notification message..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Recipients <span className="required">*</span> ({sendForm.recipients.length} selected)</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    {['employee', 'trainer', 'admin'].map(role => (
                      <button key={role} type="button" className="btn btn-ghost btn-sm" onClick={() => selectAllRole(role)}>
                        All {role}s
                      </button>
                    ))}
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1.5px solid var(--frosted-blue)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)' }}>
                    {users.map(u => (
                      <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'background var(--transition-fast)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--light-cyan)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <input type="checkbox" checked={sendForm.recipients.includes(u._id)} onChange={() => toggleRecipient(u._id)} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</span>
                        <span className={`badge ${u.role === 'admin' ? 'badge-dark' : u.role === 'trainer' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowSendModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? <><span className="spinner" /> Sending...</> : <><MdSend /> Send</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
