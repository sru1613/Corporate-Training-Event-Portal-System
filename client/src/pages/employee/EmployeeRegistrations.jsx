import { useState, useEffect } from 'react';
import { registrationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdEvent } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const EmployeeRegistrations = () => {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [cancelling, setCancelling] = useState(null);
  const limit = 10;

  const fetchRegs = async () => {
    setLoading(true);
    try {
      const res = await registrationsAPI.getMy({ page, limit });
      setRegs(res.data.data);
      setTotal(res.data.count || 0);
    } catch { toast.error('Failed to load registrations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRegs(); }, [page]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    setCancelling(id);
    try {
      await registrationsAPI.cancel(id);
      toast.success('Registration cancelled');
      fetchRegs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally { setCancelling(null); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">My Registrations</h2>
          <p className="page-subtitle">Track all your training event registrations</p>
        </div>
      </div>

      <div className="card">
        {loading ? <Loader overlay={false} /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Event</th><th>Start Date</th><th>Mode</th><th>Reg. Status</th><th>Completion</th><th>Registered On</th><th>Action</th></tr>
              </thead>
              <tbody>
                {regs.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <MdEvent style={{ fontSize: '2rem', opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                    No registrations found
                  </td></tr>
                ) : regs.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.event?.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.event?.category}</div>
                    </td>
                    <td>{r.event?.startDate ? format(new Date(r.event.startDate), 'MMM dd, yyyy') : '—'}</td>
                    <td>{r.event?.mode ? <span className={`badge badge-${r.event.mode === 'Online' ? 'success' : r.event.mode === 'Offline' ? 'dark' : 'warning'}`}>{r.event.mode}</span> : '—'}</td>
                    <td><span className={`badge badge-${r.status === 'Confirmed' ? 'success' : r.status === 'Pending' ? 'warning' : r.status === 'Waitlisted' ? 'info' : 'danger'}`}>{r.status}</span></td>
                    <td><span className={`badge badge-${r.completionStatus === 'Completed' ? 'success' : r.completionStatus === 'In Progress' ? 'primary' : 'secondary'}`}>{r.completionStatus || 'Not Started'}</span></td>
                    <td>{format(new Date(r.registrationDate), 'MMM dd, yyyy')}</td>
                    <td>
                      {(r.status === 'Confirmed' || r.status === 'Pending' || r.status === 'Waitlisted') && (
                        <button className="btn btn-danger btn-sm" disabled={cancelling === r._id} onClick={() => handleCancel(r._id)}>
                          {cancelling === r._id ? <span className="spinner" /> : 'Cancel'}
                        </button>
                      )}
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

export default EmployeeRegistrations;
