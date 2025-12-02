import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getWeekSessions } from '../services/teacherService';
import { formatDate, formatTime, getRelativeDate } from '../utils/dateUtils';
import { getStatusBadgeClass } from '../utils/helpers';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function Sessions({ teacherId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [teacherId]);

  const loadSessions = async () => {
    try {
      const response = await getWeekSessions(teacherId);
      setSessions(response.data || []);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1>This Week's Sessions</h1>
      </div>

      <div className="card">
        {sessions.length === 0 ? (
          <EmptyState message="No sessions scheduled for this week" />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Group</th>
                  <th>Room</th>
                  <th>Students</th>
                  <th>Absences</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.session_id}>
                    <td>
                      <strong>{getRelativeDate(session.session_date)}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {formatDate(session.session_date)}
                      </div>
                    </td>
                    <td>
                      <strong>{formatTime(session.start_time)}</strong> - {formatTime(session.end_time)}
                    </td>
                    <td>
                      <div>
                        <strong>{session.subject_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {session.subject_code}
                        </div>
                      </div>
                    </td>
                    <td>{session.group_name}</td>
                    <td>{session.room_name || 'TBA'}</td>
                    <td>{session.total_students}</td>
                    <td>
                      {session.total_absences > 0 ? (
                        <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>
                          {session.total_absences}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success-color)' }}>0</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(session.status)}`}>
                        {session.status}
                      </span>
                      {session.is_makeup && (
                        <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                          Make-Up
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/sessions/${session.session_id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/sessions/${session.session_id}/attendance`}
                          className="btn btn-success btn-sm"
                          title="Take Attendance"
                        >
                          Take Attendance
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sessions;
