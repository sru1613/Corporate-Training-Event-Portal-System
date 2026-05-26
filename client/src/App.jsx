import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
import EventDetail from './pages/admin/EventDetail';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminReports from './pages/admin/AdminReports';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminNotifications from './pages/admin/AdminNotifications';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerEvents from './pages/trainer/TrainerEvents';
import TrainerEventDetail from './pages/trainer/TrainerEventDetail';
import TrainerAttendance from './pages/trainer/TrainerAttendance';
import TrainerMaterials from './pages/trainer/TrainerMaterials';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import BrowseEvents from './pages/employee/BrowseEvents';
import EmployeeRegistrations from './pages/employee/EmployeeRegistrations';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeFeedback from './pages/employee/EmployeeFeedback';
import EmployeeMaterials from './pages/employee/EmployeeMaterials';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Layout
import Layout from './components/common/Layout';
import Loader from './components/common/Loader';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'trainer') return <Navigate to="/trainer/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="events" element={<ManageEvents />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="registrations" element={<AdminRegistrations />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Trainer Routes */}
      <Route path="/trainer" element={
        <ProtectedRoute roles={['trainer']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<TrainerDashboard />} />
        <Route path="events" element={<TrainerEvents />} />
        <Route path="events/:id" element={<TrainerEventDetail />} />
        <Route path="attendance" element={<TrainerAttendance />} />
        <Route path="materials" element={<TrainerMaterials />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Employee Routes */}
      <Route path="/employee" element={
        <ProtectedRoute roles={['employee']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="events" element={<BrowseEvents />} />
        <Route path="registrations" element={<EmployeeRegistrations />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="feedback" element={<EmployeeFeedback />} />
        <Route path="materials" element={<EmployeeMaterials />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/unauthorized" element={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--gradient-primary)', color: 'white' }}>
          <h2>403 - Unauthorized</h2>
          <p>You don't have permission to access this page.</p>
          <RoleRedirect />
        </div>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
