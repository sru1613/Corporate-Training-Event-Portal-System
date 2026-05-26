import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { MdCheckCircle } from 'react-icons/md';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';

const statusColor = s => ({ Present: 'success', Absent: 'danger', Late: 'warning', Excused: 'info' }[s] || 'secondary');

const EmployeeAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0, total: 0, rate: 0 });

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await attendanceAPI.getMy({ limit: 100 });
        const data = res.data.data;
        setRecords(data);
        const present = data.filter(r => r.status === 'Present').length;
        const absent = data.filter(r => r.status === 'Absent').length;
        const late = data.filter(r => r.status === 'Late').length;
        const excused = data.filter(r => r.status === 'Excused').length;
        const total = data.length;
        setStats({ present, absent, late, excused, total, rate: total ? Math.round(((present + late) / total) * 100) : 0 });
      } catch { toast.error('Failed to load attendance'); }
      finally { setLoading(false); }
    };
    fetchAttendance();
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">My Attendance</h2>
          <p className="page-subtitle">View your training session attendance history</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {[
          { label: 'Total Sessions', value: stats.total, color: 'var(--gradient-primary)' },
          { label: 'Present', value: stats.present, color: 'linear-gradient(135deg,#22c55e,#16a34a)' },
          { label: 'Absent', value: stats.absent, color: 'linear-gradient(135deg,#ef4444,#dc2626)' },
          { label: 'Attendance Rate', value: `${stats.rate}%`, color: 'var(--gradient-accent)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}><MdCheckCircle /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? <Loader overlay={false} /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Remarks</th><th>Marked By</th></tr></thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendance records found</td></tr>
                ) : records.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.event?.title}</td>
                    <td>{r.date ? format(new Date(r.date), 'MMM dd, yyyy') : '—'}</td>
                    <td><span className={`badge badge-${statusColor(r.status)}`}>{r.status}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.checkInTime || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.checkOutTime || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '200px' }}>{r.remarks || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.markedBy?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
