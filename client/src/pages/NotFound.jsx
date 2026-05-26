import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();

  const home = user?.role === 'admin' ? '/admin/dashboard'
    : user?.role === 'trainer' ? '/trainer/dashboard'
    : user ? '/employee/dashboard'
    : '/login';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)', flexDirection: 'column', gap: 'var(--spacing-lg)', textAlign: 'center', padding: 'var(--spacing-xl)'
    }}>
      <div style={{ fontSize: '8rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--french-blue)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={home} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
