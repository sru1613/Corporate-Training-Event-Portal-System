import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdPeople, MdEvent, MdAssignment, MdBarChart,
  MdFeedback, MdNotifications, MdPerson, MdLogout,
  MdSchool, MdCheckCircle, MdFolder, MdLibraryBooks
} from 'react-icons/md';

const adminNav = [
  { section: 'Overview', items: [
    { path: '/admin/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  ]},
  { section: 'Management', items: [
    { path: '/admin/users', icon: <MdPeople />, label: 'Users' },
    { path: '/admin/events', icon: <MdEvent />, label: 'Training Events' },
    { path: '/admin/registrations', icon: <MdAssignment />, label: 'Registrations' },
  ]},
  { section: 'Analytics', items: [
    { path: '/admin/reports', icon: <MdBarChart />, label: 'Reports' },
    { path: '/admin/feedback', icon: <MdFeedback />, label: 'Feedback' },
  ]},
  { section: 'Communication', items: [
    { path: '/admin/notifications', icon: <MdNotifications />, label: 'Notifications' },
  ]},
];

const trainerNav = [
  { section: 'Overview', items: [
    { path: '/trainer/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  ]},
  { section: 'My Work', items: [
    { path: '/trainer/events', icon: <MdSchool />, label: 'My Events' },
    { path: '/trainer/attendance', icon: <MdCheckCircle />, label: 'Attendance' },
    { path: '/trainer/materials', icon: <MdFolder />, label: 'Materials' },
  ]},
];

const employeeNav = [
  { section: 'Overview', items: [
    { path: '/employee/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  ]},
  { section: 'Training', items: [
    { path: '/employee/events', icon: <MdEvent />, label: 'Browse Events' },
    { path: '/employee/registrations', icon: <MdAssignment />, label: 'My Registrations' },
    { path: '/employee/attendance', icon: <MdCheckCircle />, label: 'My Attendance' },
    { path: '/employee/materials', icon: <MdLibraryBooks />, label: 'Materials' },
  ]},
  { section: 'Feedback', items: [
    { path: '/employee/feedback', icon: <MdFeedback />, label: 'My Feedback' },
  ]},
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navConfig = user?.role === 'admin' ? adminNav : user?.role === 'trainer' ? trainerNav : employeeNav;
  const profilePath = `/${user?.role}/profile`;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <div className="sidebar-logo">CTP<span>ortal</span></div>
          <div className="sidebar-subtitle">Corporate Training</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navConfig.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="nav-section">
          <div className="nav-section-title">Account</div>
          <NavLink to={profilePath} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <MdPerson />
            Profile
          </NavLink>
          <div className="nav-item" onClick={() => { logout(); navigate('/login'); }}>
            <MdLogout />
            Logout
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <NavLink to={profilePath} className="sidebar-user" style={{ textDecoration: 'none' }}>
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
