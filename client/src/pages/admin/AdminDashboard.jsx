import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI, eventsAPI } from '../../services/api';
import { MdEvent, MdPeople, MdAssignment, MdCheckCircle, MdTrendingUp, MdSchedule } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const COLORS = ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: res } = await reportsAPI.getDashboard();
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader overlay={false} />;

  const stats = data?.stats || {};
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = (data?.eventsByMonth || []).map(item => ({
    name: monthLabels[item._id.month - 1],
    events: item.count
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">Overview of the Corporate Training Portal</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => navigate('/admin/events')}>
            <MdEvent /> Create Event
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card blue">
          <div className="stat-icon blue"><MdEvent /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalEvents || 0}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><MdPeople /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><MdAssignment /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalRegistrations || 0}</div>
            <div className="stat-label">Registrations</div>
          </div>
        </div>
        <div className="stat-card dark">
          <div className="stat-icon dark"><MdCheckCircle /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.completedEvents || 0}</div>
            <div className="stat-label">Completed Events</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="chart-container">
          <h4 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--deep-twilight)' }}>Events by Month</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--light-cyan)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--light-cyan)' }} />
              <Bar dataKey="events" fill="var(--bright-teal-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--deep-twilight)' }}>Events by Category</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data?.categoryBreakdown || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                {(data?.categoryBreakdown || []).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-2">
        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Upcoming Events</h4>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {(data?.upcomingEventsList || []).length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="empty-state-icon">📅</div>
                <p>No upcoming events</p>
              </div>
            ) : (data?.upcomingEventsList || []).map(event => (
              <div key={event._id} onClick={() => navigate(`/admin/events/${event._id}`)}
                style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderBottom: '1px solid var(--light-cyan)', cursor: 'pointer', transition: 'background var(--transition-fast)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(202,240,248,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontWeight: 600, color: 'var(--deep-twilight)', marginBottom: 4 }}>{event.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 'var(--spacing-md)' }}>
                  <span><MdSchedule style={{ verticalAlign: 'middle' }} /> {format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
                  <span>{event.mode}</span>
                  <span style={{ color: 'var(--color-primary)' }}>{event.currentParticipants}/{event.maxParticipants}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Recent Registrations</h4>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/registrations')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {(data?.recentRegistrations || []).length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="empty-state-icon">📝</div>
                <p>No recent registrations</p>
              </div>
            ) : (data?.recentRegistrations || []).map(reg => (
              <div key={reg._id} style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderBottom: '1px solid var(--light-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--deep-twilight)', fontSize: '0.875rem' }}>{reg.employee?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{reg.event?.title}</div>
                </div>
                <span className="badge badge-success">Confirmed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
