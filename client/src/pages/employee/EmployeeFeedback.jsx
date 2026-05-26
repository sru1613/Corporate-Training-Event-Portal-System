import { useState, useEffect } from 'react';
import { feedbackAPI, registrationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdStar, MdStarBorder, MdSend } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange && onChange(n)} style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 0, fontSize: '1.4rem', color: n <= value ? 'var(--turquoise-surf)' : 'var(--frosted-blue)' }}>
        {n <= value ? <MdStar /> : <MdStarBorder />}
      </button>
    ))}
  </div>
);

const EmployeeFeedback = () => {
  const [myFeedback, setMyFeedback] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ event: '', trainer: '', trainerRating: 0, contentRating: 0, overallRating: 0, comments: '', suggestions: '', wouldRecommend: true });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fbRes, regRes] = await Promise.all([
        feedbackAPI.getMy({ limit: 50 }),
        registrationsAPI.getMy({ limit: 100 })
      ]);
      setMyFeedback(fbRes.data.data);
      const givenEventIds = fbRes.data.data.map(f => f.event?._id);
      const eligible = regRes.data.data.filter(r =>
        r.status === 'Confirmed' &&
        !givenEventIds.includes(r.event?._id) &&
        r.event?.status === 'Completed'
      );
      setCompletedEvents(eligible);
    } catch { toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event || !form.trainerRating || !form.contentRating || !form.overallRating) {
      return toast.warning('Please fill all required rating fields');
    }
    setSubmitting(true);
    try {
      await feedbackAPI.submit({
        eventId: form.event,
        trainerId: form.trainer || undefined,
        trainerRating: form.trainerRating,
        contentRating: form.contentRating,
        overallRating: form.overallRating,
        comments: form.comments,
        suggestions: form.suggestions,
        wouldRecommend: form.wouldRecommend,
      });
      toast.success('Feedback submitted!');
      setShowForm(false);
      setForm({ event: '', trainer: '', trainerRating: 0, contentRating: 0, overallRating: 0, comments: '', suggestions: '', wouldRecommend: true });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const selectedEvent = completedEvents.find(r => r.event?._id === form.event)?.event;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">My Feedback</h2>
          <p className="page-subtitle">Rate and review completed training events</p>
        </div>
        <div className="page-header-right">
          {completedEvents.length > 0 && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : <><MdSend /> Give Feedback</>}
            </button>
          )}
          {completedEvents.length === 0 && myFeedback.length === 0 && !loading && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--light-cyan)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.9rem' }}>
              Feedback unlocks after an event ends
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header"><h3 className="card-title">Submit Feedback</h3></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Completed Event <span className="required">*</span></label>
                  <select className="form-control" value={form.event} onChange={e => setForm({ ...form, event: e.target.value, trainer: '' })} required>
                    <option value="">-- Select a completed event --</option>
                    {completedEvents.map(r => (
                      <option key={r.event?._id} value={r.event?._id}>{r.event?.title}</option>
                    ))}
                  </select>
                </div>
                {selectedEvent?.trainers?.length > 0 && (
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Trainer</label>
                    <select className="form-control" value={form.trainer} onChange={e => setForm({ ...form, trainer: e.target.value })}>
                      <option value="">-- Select trainer --</option>
                      {selectedEvent.trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
                {[['Trainer Rating', 'trainerRating'], ['Content Rating', 'contentRating'], ['Overall Rating', 'overallRating']].map(([label, field]) => (
                  <div key={field} className="form-group">
                    <label className="form-label">{label} <span className="required">*</span></label>
                    <StarRating value={form[field]} onChange={v => setForm({ ...form, [field]: v })} />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Comments</label>
                  <textarea className="form-control" rows={3} placeholder="Share your experience..." value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Suggestions</label>
                  <textarea className="form-control" rows={2} placeholder="Any suggestions for improvement..." value={form.suggestions} onChange={e => setForm({ ...form, suggestions: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.wouldRecommend} onChange={e => setForm({ ...form, wouldRecommend: e.target.checked })} />
                    I would recommend this training
                  </label>
                </div>
              </div>
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner" /> Submitting...</> : <><MdSend /> Submit Feedback</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <Loader overlay={false} /> : (
        <div>
          {myFeedback.length === 0 && !showForm ? (
            <div className="card">
              <div className="empty-state" style={{ padding: '3rem' }}>
                <MdStar style={{ fontSize: '3rem', opacity: 0.3 }} />
                <p>No feedback submitted yet</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Feedback can be given only after a training event has ended</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 'var(--spacing-lg)' }}>
              {myFeedback.map(fb => (
                <div key={fb._id} className="card" style={{ margin: 0 }}>
                  <div className="card-body">
                    <h3 style={{ fontWeight: 700, color: 'var(--french-blue)', marginBottom: 'var(--spacing-sm)' }}>{fb.event?.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
                      {fb.createdAt ? format(new Date(fb.createdAt), 'MMM dd, yyyy') : ''}{fb.trainer ? ` · Trainer: ${fb.trainer.name}` : ''}
                    </div>
                    {[['Trainer', fb.trainerRating], ['Content', fb.contentRating], ['Overall', fb.overallRating]].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</span>
                        <StarRating value={val} />
                      </div>
                    ))}
                    {fb.comments && <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>"{fb.comments}"</p>}
                    <div style={{ marginTop: 'var(--spacing-sm)' }}>
                      <span className={`badge ${fb.wouldRecommend ? 'badge-success' : 'badge-danger'}`}>
                        {fb.wouldRecommend ? '👍 Recommended' : '👎 Not Recommended'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeFeedback;
