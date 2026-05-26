import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MdSave, MdLock, MdPerson } from 'react-icons/md';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    designation: user?.designation || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('New passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Manage your personal information and security</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)', alignItems: 'flex-start' }}>
        {/* Avatar Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-body">
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: '#fff', margin: '0 auto var(--spacing-md)' }}>
              {initials}
            </div>
            <h3 style={{ fontWeight: 700, color: 'var(--french-blue)', marginBottom: '4px' }}>{user?.name}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-dark' : user?.role === 'trainer' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
              {user?.role}
            </span>
            {user?.employeeId && (
              <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'var(--light-cyan)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Employee ID: </span>
                <span style={{ fontWeight: 600 }}>{user.employeeId}</span>
              </div>
            )}
            {user?.department && (
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.department}</div>
            )}
            {user?.designation && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.designation}</div>
            )}
          </div>
        </div>

        {/* Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title"><MdPerson /> Personal Information</h3></div>
            <div className="card-body">
              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input className="form-control" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Enter your contact number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-control" value={profileForm.department} onChange={e => setProfileForm({ ...profileForm, department: e.target.value })} placeholder="e.g. Engineering" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={profileForm.designation} onChange={e => setProfileForm({ ...profileForm, designation: e.target.value })} placeholder="e.g. Senior Engineer" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? <><span className="spinner" /> Saving...</> : <><MdSave /> Save Changes</>}
                </button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title"><MdLock /> Change Password</h3></div>
            <div className="card-body">
              <form onSubmit={handlePasswordSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Current Password <span className="required">*</span></label>
                    <input className="form-control" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required placeholder="Enter current password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password <span className="required">*</span></label>
                    <input className="form-control" type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required placeholder="Enter new password (min 6 chars)" minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password <span className="required">*</span></label>
                    <input className="form-control" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required placeholder="Re-enter new password" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingPw}>
                  {savingPw ? <><span className="spinner" /> Changing...</> : <><MdLock /> Change Password</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
