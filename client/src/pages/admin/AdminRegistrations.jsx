import { useState, useEffect } from 'react';
import { registrationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdSearch, MdRefresh } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchRegistrations(); }, [pagination.page, statusFilter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await registrationsAPI.getAll(params);
      setRegistrations(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load registrations'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await registrationsAPI.cancel(id, 'Cancelled by admin');
      toast.success('Registration cancelled');
      setRegistrations(prev => prev.map(r => r._id === id ? { ...r, status: 'Cancelled' } : r));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">All Registrations</h2>
          <p className="page-subtitle">{pagination.total} total registrations</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost btn-sm" onClick={fetchRegistrations}><MdRefresh /></button>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-control" style={{ width: '160px' }} value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Waitlisted">Waitlisted</option>
        </select>
      </div>

      {loading ? <Loader overlay={false} /> : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Employee</th><th>Event</th><th>Reg. Date</th><th>Status</th><th>Completion</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr><td colSpan="7"><div className="empty-state"><p>No registrations found</p></div></td></tr>
                ) : registrations.map((r, i) => (
                  <tr key={r._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{(pagination.page - 1) * 15 + i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.employee?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employee?.department}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.event?.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.event?.startDate && format(new Date(r.event.startDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{format(new Date(r.registrationDate), 'MMM dd, yyyy')}</td>
                    <td>
                      <span className={`badge ${r.status === 'Confirmed' ? 'badge-success' : r.status === 'Waitlisted' ? 'badge-warning' : r.status === 'Cancelled' ? 'badge-danger' : 'badge-secondary'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.completionStatus === 'Completed' ? 'badge-success' : r.completionStatus === 'In Progress' ? 'badge-info' : 'badge-secondary'}`}>
                        {r.completionStatus}
                      </span>
                    </td>
                    <td>
                      {r.status === 'Confirmed' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r._id)}>Cancel</button>
                      )}
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
    </div>
  );
};

export default AdminRegistrations;
