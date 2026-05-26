import { useState, useEffect, useRef } from 'react';
import { reportsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdBarChart, MdPeople, MdCheckCircle, MdFeedback, MdSchool, MdRefresh } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const cache = useRef({});

  useEffect(() => { fetchReport(activeTab); }, [activeTab]);

  const fetchReport = async (tab, forceRefresh = false) => {
    if (!forceRefresh && cache.current[tab] !== undefined) {
      setData(cache.current[tab]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setData(cache.current[tab] ?? null);
    try {
      let res;
      if (tab === 'attendance') res = await reportsAPI.getAttendance();
      else if (tab === 'participation') res = await reportsAPI.getParticipation();
      else if (tab === 'completion') res = await reportsAPI.getCompletion();
      else if (tab === 'feedback') res = await reportsAPI.getFeedback();
      else if (tab === 'trainers') res = await reportsAPI.getTrainers();
      const result = res?.data?.data ?? null;
      cache.current[tab] = result;
      setData(result);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const refreshReport = () => {
    delete cache.current[activeTab];
    fetchReport(activeTab, true);
  };

  const toArr = (d) => Array.isArray(d) ? d : [];

  const tabs = [
    { key: 'attendance', label: 'Attendance', icon: <MdCheckCircle /> },
    { key: 'participation', label: 'Participation', icon: <MdPeople /> },
    { key: 'completion', label: 'Completion', icon: <MdBarChart /> },
    { key: 'feedback', label: 'Feedback', icon: <MdFeedback /> },
    { key: 'trainers', label: 'Trainers', icon: <MdSchool /> },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-subtitle">Comprehensive training insights and data</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refreshReport}><MdRefresh /></button>
      </div>

      {/* Tab Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'btn btn-primary' : 'btn btn-secondary'}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? <Loader overlay={false} /> : !data ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No data available. Click the refresh button to try again.</div>
      ) : (
        <div className="slide-up">
          {/* Attendance Report */}
          {activeTab === 'attendance' && (
            <div>
              <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                {(data.summary || []).map(s => (
                  <div key={s._id} className="stat-card blue">
                    <div className="stat-icon blue"><MdCheckCircle /></div>
                    <div className="stat-info">
                      <div className="stat-value">{s.count}</div>
                      <div className="stat-label">{s._id}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Employee</th><th>Department</th><th>Event</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {(data.records || []).slice(0, 50).map(r => (
                      <tr key={r._id}>
                        <td>{r.employee?.name}</td>
                        <td>{r.employee?.department}</td>
                        <td>{r.event?.title}</td>
                        <td>{r.date && format(new Date(r.date), 'MMM dd, yyyy')}</td>
                        <td><span className={`badge ${r.status === 'Present' ? 'badge-success' : r.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>{r.status}</span></td>
                      </tr>
                    ))}
                    {(data.records || []).length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendance records found. Mark attendance on events to see data here.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Participation Report */}
          {activeTab === 'participation' && (
            <div>
              <div className="chart-container" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Top Participants</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={toArr(data).slice(0, 10).map(d => ({ name: d.name?.split(' ')[0], registrations: d.totalRegistrations }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--light-cyan)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="registrations" fill="var(--turquoise-surf)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>#</th><th>Employee</th><th>Department</th><th>Total Registrations</th></tr>
                  </thead>
                  <tbody>
                    {toArr(data).map((r, i) => (
                      <tr key={r._id}>
                        <td>{i + 1}</td>
                        <td><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.email}</div></td>
                        <td>{r.department}</td>
                        <td><span className="badge badge-info">{r.totalRegistrations}</span></td>
                      </tr>
                    ))}
                    {toArr(data).length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No participation data found. Employees need to register for events first.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Completion Report */}
          {activeTab === 'completion' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Event</th><th>Category</th><th>Date</th><th>Registrations</th><th>Attendance</th><th>Rate</th><th>Avg Rating</th></tr>
                </thead>
                <tbody>
                  {toArr(data).map((r, i) => (
                    <tr key={r.event?._id || i}>
                      <td><div style={{ fontWeight: 600 }}>{r.event?.title || '—'}</div></td>
                      <td><span className="badge badge-info">{r.event?.category || '—'}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{r.event?.startDate ? format(new Date(r.event.startDate), 'MMM dd, yyyy') : '—'}</td>
                      <td>{r.registrations}</td>
                      <td>{r.attendance}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-fill" style={{ width: `${r.attendanceRate || 0}%` }} />
                          </div>
                          <span style={{ fontSize: '0.8rem' }}>{r.attendanceRate || 0}%</span>
                        </div>
                      </td>
                      <td>{r.avgRating !== 'N/A' ? `⭐ ${r.avgRating}` : 'N/A'}</td>
                    </tr>
                  ))}
                  {toArr(data).length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No completion data available. Create and manage events to generate reports.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Feedback Analysis */}
          {activeTab === 'feedback' && (
            <div className="grid grid-2">
              <div className="card">
                <div className="card-header"><h4 className="card-title">Overall Feedback</h4></div>
                <div className="card-body">
                  {data.overall ? (
                    [
                      ['Avg Overall Rating', `⭐ ${data.overall.avgOverall?.toFixed(1)}`],
                      ['Avg Trainer Rating', `⭐ ${data.overall.avgTrainer?.toFixed(1)}`],
                      ['Avg Content Rating', `⭐ ${data.overall.avgContent?.toFixed(1)}`],
                      ['Total Responses', data.overall.totalResponses],
                      ['Would Recommend', data.overall.wouldRecommend],
                    ].map(([k, v]) => (
                      <div key={k} className="info-row"><span className="info-label">{k}</span><span className="info-value">{v}</span></div>
                    ))
                  ) : <div className="empty-state"><p>No feedback data</p></div>}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h4 className="card-title">By Event</h4></div>
                <div className="card-body" style={{ padding: 0 }}>
                  {(data.byEvent || []).map(e => (
                    <div key={e._id} style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderBottom: '1px solid var(--light-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{e.eventTitle}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#f59e0b' }}>⭐</span>
                        <span style={{ fontWeight: 700 }}>{e.avgRating?.toFixed(1)}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({e.count})</span>
                      </div>
                    </div>
                  ))}
                  {(data.byEvent || []).length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No feedback submitted yet. Employees can submit feedback after attending events.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trainer Report */}
          {activeTab === 'trainers' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Trainer</th><th>Department</th><th>Assigned Events</th><th>Completed Events</th><th>Avg Rating</th><th>Feedback Count</th></tr>
                </thead>
                <tbody>
                  {toArr(data).map(r => (
                    <tr key={r.trainer?._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.trainer?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.trainer?.email}</div>
                      </td>
                      <td>{r.trainer?.department}</td>
                      <td><span className="badge badge-info">{r.assignedEvents}</span></td>
                      <td><span className="badge badge-success">{r.completedEvents}</span></td>
                      <td>{r.avgRating !== 'N/A' ? `⭐ ${r.avgRating}` : 'N/A'}</td>
                      <td>{r.feedbackCount}</td>
                    </tr>
                  ))}
                  {toArr(data).length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No trainer data found. Assign trainers to events to see performance metrics.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
