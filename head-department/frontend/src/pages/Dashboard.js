import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, sessionsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity?limit=5'),
        api.get('/dashboard/upcoming-sessions')
      ]);
      
      setStats(statsRes.data);
      setActivity(activityRes.data);
      setUpcomingSessions(sessionsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-header">
       
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Teachers</h3>
          <div className="value">{stats?.teachers || 0}</div>
          <div className="label">Total Faculty Members</div>
        </div>

        <div className="stat-card">
          <h3>Students</h3>
          <div className="value">{stats?.students || 0}</div>
          <div className="label">Enrolled Students</div>
        </div>

        <div className="stat-card">
          <h3>Subjects</h3>
          <div className="value">{stats?.subjects || 0}</div>
          <div className="label">Active Courses</div>
        </div>

        <div className="stat-card">
          <h3>Groups</h3>
          <div className="value">{stats?.groups || 0}</div>
          <div className="label">Student Groups</div>
        </div>

        <div className="stat-card">
          <h3>Pending Requests</h3>
          <div className="value">{stats?.pendingRequests || 0}</div>
          <div className="label">Awaiting Approval</div>
        </div>

        <div className="stat-card">
          <h3>Today's Sessions</h3>
          <div className="value">{stats?.todaySessions || 0}</div>
          <div className="label">Scheduled Classes</div>
        </div>

        <div className="stat-card">
          <h3>Recent Absences</h3>
          <div className="value">{stats?.recentAbsences || 0}</div>
          <div className="label">Last 7 Days</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="data-table">
          <div className="table-header">
            <h2>Recent Activity</h2>
          </div>
          {activity.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
              No recent activity
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="badge badge-info">{item.type.replace('_', ' ')}</span>
                    </td>
                    <td>{item.student_name}</td>
                    <td>
                      <span className={`badge badge-${
                        item.status === 'approved' ? 'success' :
                        item.status === 'rejected' ? 'danger' : 'warning'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <h2>Upcoming Sessions</h2>
          </div>
          {upcomingSessions.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
              No upcoming sessions
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Group</th>
                  <th>Time</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.subject_name}</td>
                    <td>{session.group_name}</td>
                    <td>
                      {new Date(session.session_date).toLocaleDateString()} <br />
                      {session.start_time} - {session.end_time}
                    </td>
                    <td>{session.room_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
