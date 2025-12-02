import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarDay, FaClock, FaExclamationTriangle, FaEnvelope, FaUserClock, FaCalendarPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getTodaySessions } from '../services/teacherService';
import { formatTime, getRelativeDate } from '../utils/dateUtils';
import { getStatusBadgeClass } from '../utils/helpers';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function Dashboard({ teacherId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaySessions();
  }, [teacherId]);

  const loadTodaySessions = async () => {
    try {
      const response = await getTodaySessions(teacherId);
      setSessions(response.data || []);
    } catch (error) {
      toast.error('Failed to load today\'s sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
    

      {/* Stats Cards */}
      <div className="grid grid-cols-4 mb-3">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FaCalendarDay />
          </div>
          <div className="stat-content">
            <h3>{sessions.length}</h3>
            <p>Today's Sessions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{sessions.filter(s => s.status === 'completed').length}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{sessions.reduce((sum, s) => sum + parseInt(s.total_absences || 0), 0)}</h3>
            <p>Absences Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <FaEnvelope />
          </div>
          <div className="stat-content">
            <h3>0</h3>
            <p>Unread Messages</p>
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Today's Sessions</h2>
          <Link to="/sessions" className="btn btn-primary btn-sm">View All</Link>
        </div>
        
        {sessions.length === 0 ? (
          <EmptyState message="No sessions scheduled for today" />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
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
                    </td>
                    <td>
                      <Link 
                        to={`/sessions/${session.session_id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Links</h2>
        </div>
        <div className="grid grid-cols-3">
          <Link to="/timetable" className="btn btn-secondary">
            <FaCalendarDay />
            View Timetable
          </Link>
          <Link to="/absence-requests" className="btn btn-secondary">
            <FaUserClock />
            Absence Requests
          </Link>
          <Link to="/makeup-sessions" className="btn btn-secondary">
            <FaCalendarPlus />
            Schedule Make-Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
