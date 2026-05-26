import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPerson, MdRefresh } from 'react-icons/md';
import Loader from '../../components/common/Loader';

const ROLE_COLORS = { admin: 'badge-dark', trainer: 'badge-primary', employee: 'badge-info' };

const UserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState(user || { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '', employeeId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        const { data } = await usersAPI.update(user._id, form);
        toast.success('User updated successfully');
        onSave(data.data);
      } else {
        const { data } = await usersAPI.create(form);
        toast.success('User created successfully');
        onSave(data.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{user ? 'Edit User' : 'Create New User'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Enter full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="user@company.com" />
              </div>
              {!user && (
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Password <span className="required">*</span></label>
                  <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Min 6 characters" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Role <span className="required">*</span></label>
                <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="employee">Employee</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input className="form-control" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. EMP-2026-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Information Technology" />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-control" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Senior Software Engineer" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter contact number" />
              </div>
              {user && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState({ open: false, user: null });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchUsers(); }, [pagination.page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await usersAPI.getAll(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeleting(id);
    try {
      await usersAPI.delete(id);
      toast.success('User deleted successfully');
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = (saved) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u._id === saved._id);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = saved; return updated; }
      return [saved, ...prev];
    });
    setPagination(p => ({ ...p, total: p.total + 1 }));
  };

  const getRoleBadge = (role) => <span className={`badge ${ROLE_COLORS[role] || 'badge-secondary'}`}>{role}</span>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Manage Users</h2>
          <p className="page-subtitle">{pagination.total} total users</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost btn-sm" onClick={fetchUsers}><MdRefresh /></button>
          <button className="btn btn-primary" onClick={() => setModal({ open: true, user: null })}>
            <MdAdd /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-sm)', flex: 1 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <MdSearch />
            <input className="form-control" placeholder="Search by name, email, department..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <select className="form-control" style={{ width: '150px' }} value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="trainer">Trainer</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {loading ? <Loader overlay={false} /> : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Employee ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="7">
                    <div className="empty-state"><div className="empty-state-icon"><MdPerson /></div><p>No users found</p></div>
                  </td></tr>
                ) : users.map((user, i) => (
                  <tr key={user._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {(pagination.page - 1) * 10 + i + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{user.department || '-'}</td>
                    <td>{user.employeeId || '-'}</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal({ open: true, user })}>
                          <MdEdit />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(user._id)} disabled={deleting === user._id}>
                          {deleting === user._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <MdDelete />}
                        </button>
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

      {modal.open && (
        <UserModal user={modal.user} onClose={() => setModal({ open: false, user: null })} onSave={handleSave} />
      )}
    </div>
  );
};

export default ManageUsers;
