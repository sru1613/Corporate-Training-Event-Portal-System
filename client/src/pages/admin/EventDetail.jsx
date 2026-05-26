import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, registrationsAPI, materialsAPI, feedbackAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdArrowBack, MdPeople, MdEvent, MdStar, MdFileDownload, MdDelete } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, partRes, matRes, fbRes] = await Promise.all([
        eventsAPI.getById(id),
        registrationsAPI.getParticipants(id),
        materialsAPI.getByEvent(id),
        feedbackAPI.getEventSummary(id)
      ]);
      setEvent(evRes.data.data);
      setParticipants(partRes.data.data);
      setMaterials(matRes.data.data);
      setFeedbackSummary(fbRes.data.data);
    } catch (err) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await materialsAPI.delete(matId);
      setMaterials(prev => prev.filter(m => m._id !== matId));
      toast.success('Material deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <Loader overlay={false} />;
  if (!event) return <div className="empty-state"><p>Event not found</p></div>;

  const tabs = ['overview', 'participants', 'materials', 'feedback'];

  return (
    <div className="fade-in">
      <div className="back-link" onClick={() => navigate('/admin/events')}>
        <MdArrowBack /> Back to Events
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">{event.title}</h2>
          <p className="page-subtitle">{event.category} • {event.mode}</p>
        </div>
        <span className={`badge badge-${event.status === 'Upcoming' ? 'info' : event.status === 'Completed' ? 'secondary' : event.status === 'Ongoing' ? 'success' : 'danger'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
          {event.status}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--light-cyan)', marginBottom: 'var(--spacing-xl)' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? 'var(--bright-teal-blue)' : 'var(--text-muted)', borderBottom: activeTab === tab ? '2px solid var(--bright-teal-blue)' : '2px solid transparent', marginBottom: '-2px', textTransform: 'capitalize', fontSize: '0.875rem', transition: 'all var(--transition-fast)' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header"><h4 className="card-title">Event Details</h4></div>
            <div className="card-body">
              <div className="info-row"><span className="info-label">Description</span></div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>{event.description}</p>
              {[
                ['Start Date', format(new Date(event.startDate), 'MMMM dd, yyyy')],
                ['End Date', format(new Date(event.endDate), 'MMMM dd, yyyy')],
                ['Time', `${event.startTime} - ${event.endTime}`],
                ['Location', event.location],
                ['Mode', event.mode],
                ['Max Participants', event.maxParticipants],
                ['Registered', event.currentParticipants],
                ['Available Spots', event.maxParticipants - event.currentParticipants],
              ].map(([label, value]) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value}</span>
                </div>
              ))}
              {event.meetingLink && (
                <div className="info-row">
                  <span className="info-label">Meeting Link</span>
                  <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Join</a>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h4 className="card-title">Trainers</h4></div>
            <div className="card-body" style={{ padding: 0 }}>
              {event.trainers?.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}><p>No trainers assigned</p></div>
              ) : event.trainers?.map(trainer => (
                <div key={trainer._id} style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderBottom: '1px solid var(--light-cyan)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {trainer.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{trainer.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{trainer.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Registered Participants ({participants.length})</h4>
          </div>
          <div className="table-container" style={{ boxShadow: 'none', border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Department</th><th>Employee ID</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p._id}>
                    <td>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.employee?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.employee?.email}</div>
                    </td>
                    <td>{p.employee?.department || '-'}</td>
                    <td>{p.employee?.employeeId || '-'}</td>
                    <td><span className={`badge ${p.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="card">
          <div className="card-header"><h4 className="card-title">Training Materials ({materials.length})</h4></div>
          <div className="card-body" style={{ padding: 0 }}>
            {materials.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                <div className="empty-state-icon">📚</div>
                <p>No materials uploaded yet</p>
              </div>
            ) : materials.map(m => (
              <div key={m._id} style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderBottom: '1px solid var(--light-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.fileType} • {m.downloadCount} downloads</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={`/api/materials/${m._id}/download`} className="btn btn-ghost btn-sm"><MdFileDownload /> Download</a>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMaterial(m._id)}><MdDelete /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header"><h4 className="card-title">Feedback Summary</h4></div>
            <div className="card-body">
              {!feedbackSummary?.summary?.count ? (
                <div className="empty-state"><p>No feedback submitted yet</p></div>
              ) : (
                <>
                  {[
                    ['Overall Rating', feedbackSummary.summary.avgOverall?.toFixed(1)],
                    ['Trainer Rating', feedbackSummary.summary.avgTrainer?.toFixed(1)],
                    ['Content Rating', feedbackSummary.summary.avgContent?.toFixed(1)],
                    ['Total Responses', feedbackSummary.summary.count],
                    ['Would Recommend', `${feedbackSummary.summary.wouldRecommend}/${feedbackSummary.summary.count}`],
                  ].map(([label, value]) => (
                    <div key={label} className="info-row">
                      <span className="info-label">{label}</span>
                      <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {typeof value === 'string' && parseFloat(value) > 0 ? (
                          <><MdStar style={{ color: '#f59e0b' }} />{value}</>
                        ) : value}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h4 className="card-title">Rating Distribution</h4></div>
            <div className="card-body">
              {(feedbackSummary?.distribution || []).map(d => (
                <div key={d._id} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>{d._id} Stars</span><span>{d.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(d.count / (feedbackSummary?.summary?.count || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
