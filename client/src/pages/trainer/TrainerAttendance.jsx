import { useState, useEffect, useCallback } from 'react';
import { eventsAPI, registrationsAPI, attendanceAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdSave, MdCheckCircle } from 'react-icons/md';
import Loader from '../../components/common/Loader';

const statusOptions = ['Present', 'Absent', 'Late', 'Excused'];

const TrainerAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    eventsAPI.getMyEvents({ limit: 100 })
      .then(res => setEvents(res.data.data || []))
      .catch(() => toast.error('Failed to load events'));
  }, []);

  const loadEventData = useCallback(async (eventId, date) => {
    if (!eventId) return;
    setLoading(true);
    try {
      // Load participants and existing attendance records in parallel
      const [partRes, attRes] = await Promise.all([
        registrationsAPI.getParticipants(eventId),
        attendanceAPI.getForEvent(eventId, { date })
      ]);

      const confirmed = (partRes.data.data || []).filter(r => r.status === 'Confirmed');
      setParticipants(confirmed);

      // Build a lookup map of existing attendance by employeeId
      const existingMap = {};
      (attRes.data.data || []).forEach(rec => {
        existingMap[rec.employee?._id || rec.employee] = {
          status: rec.status,
          remarks: rec.remarks || ''
        };
      });

      // Pre-populate: use existing attendance if available, else default to Present
      const init = {};
      confirmed.forEach(r => {
        const empId = r.employee._id;
        init[empId] = existingMap[empId] || { status: 'Present', remarks: '' };
      });
      setAttendance(init);
    } catch {
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEvent) loadEventData(selectedEvent, attendanceDate);
  }, [selectedEvent, attendanceDate, loadEventData]);

  const handleChange = (empId, field, value) => {
    setAttendance(prev => ({ ...prev, [empId]: { ...prev[empId], [field]: value } }));
  };

  const markAll = (status) => {
    setAttendance(prev => {
      const updated = {};
      participants.forEach(p => { updated[p.employee._id] = { ...prev[p.employee._id], status }; });
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedEvent) return toast.warning('Select an event first');
    if (participants.length === 0) return toast.warning('No participants to save attendance for');
    setSaving(true);
    try {
      const attendanceList = participants.map(p => ({
        employeeId: p.employee._id,
        status: attendance[p.employee._id]?.status || 'Present',
        remarks: attendance[p.employee._id]?.remarks || '',
      }));
      await attendanceAPI.bulkMark({ eventId: selectedEvent, date: attendanceDate, attendanceList });
      toast.success(`Attendance saved for ${attendanceList.length} participant${attendanceList.length !== 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Mark Attendance</h2>
          <p className="page-subtitle">Record attendance for your training sessions</p>
        </div>
        {selectedEvent && participants.length > 0 && (
          <div className="page-header-right">
            <button className="btn btn-ghost btn-sm" onClick={() => markAll('Present')}>All Present</button>
            <button className="btn btn-ghost btn-sm" onClick={() => markAll('Absent')}>All Absent</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : <><MdSave /> Save Attendance</>}
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
              <label className="form-label">Select Event</label>
              <select className="form-control" value={selectedEvent} onChange={e => {
                  setParticipants([]);
                  setAttendance({});
                  setSelectedEvent(e.target.value);
                }}>
                <option value="">-- Choose an event --</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title} ({ev.status})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Attendance Date</label>
              <input className="form-control" type="date" value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {loading ? <Loader overlay={false} /> : (
        selectedEvent && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MdCheckCircle /> Participants ({participants.length})</h3>
            </div>
            {participants.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No confirmed participants for this event</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>#</th><th>Employee</th><th>Department</th><th>Status</th><th>Remarks</th></tr>
                  </thead>
                  <tbody>
                    {participants.map((p, i) => (
                      <tr key={p.employee._id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.employee.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.employee.email}</div>
                        </td>
                        <td>{p.employee.department || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {statusOptions.map(s => (
                              <button key={s} type="button"
                                className={`btn btn-sm ${attendance[p.employee._id]?.status === s
                                  ? s === 'Present' ? 'btn-success' : s === 'Absent' ? 'btn-danger' : s === 'Late' ? 'btn-warning' : 'btn-secondary'
                                  : 'btn-ghost'}`}
                                onClick={() => handleChange(p.employee._id, 'status', s)}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <input className="form-control" placeholder="Optional remarks" style={{ minWidth: '160px' }}
                            value={attendance[p.employee._id]?.remarks || ''}
                            onChange={e => handleChange(p.employee._id, 'remarks', e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default TrainerAttendance;
