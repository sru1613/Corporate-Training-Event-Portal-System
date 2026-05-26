import { useState, useEffect } from 'react';
import { feedbackAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdRefresh, MdStar } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const StarDisplay = ({ rating }) => (
  <div className="star-rating">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={`star ${s <= rating ? 'filled' : 'empty'}`} style={{ fontSize: '0.9rem', cursor: 'default' }}>★</span>
    ))}
  </div>
);

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  useEffect(() => { fetchFeedback(); }, [pagination.page]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await feedbackAPI.getAll({ page: pagination.page, limit: 10 });
      setFeedback(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Employee Feedback</h2>
          <p className="page-subtitle">{pagination.total} feedback submissions</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchFeedback}><MdRefresh /></button>
      </div>

      {loading ? <Loader overlay={false} /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {feedback.length === 0 ? (
              <div className="empty-state card" style={{ padding: 'var(--spacing-2xl)' }}>
                <div className="empty-state-icon">💬</div>
                <p>No feedback submitted yet</p>
              </div>
            ) : feedback.map(fb => (
              <div key={fb._id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--deep-twilight)' }}>{fb.event?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        By {fb.employee?.name} • {fb.employee?.department} • {format(new Date(fb.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MdStar style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{fb.overallRating}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/5</span>
                    </div>
                  </div>

                  <div className="grid grid-3" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: 'var(--light-cyan)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>OVERALL</div>
                      <StarDisplay rating={fb.overallRating} />
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: 'var(--light-cyan)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>TRAINER</div>
                      <StarDisplay rating={fb.trainerRating || 0} />
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', background: 'var(--light-cyan)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>CONTENT</div>
                      <StarDisplay rating={fb.contentRating || 0} />
                    </div>
                  </div>

                  {fb.comments && (
                    <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>COMMENTS: </span>
                      <span style={{ fontSize: '0.875rem' }}>{fb.comments}</span>
                    </div>
                  )}
                  {fb.suggestions && (
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>SUGGESTIONS: </span>
                      <span style={{ fontSize: '0.875rem' }}>{fb.suggestions}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 'var(--spacing-sm)' }}>
                    <span className={`badge ${fb.wouldRecommend ? 'badge-success' : 'badge-danger'}`}>
                      {fb.wouldRecommend ? '👍 Would Recommend' : '👎 Would Not Recommend'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} className={`page-btn${pagination.page === i + 1 ? ' active' : ''}`}
                  onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminFeedback;
