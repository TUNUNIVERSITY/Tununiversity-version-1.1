import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [grades, setGrades] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, scheduleRes, notifRes] = await Promise.all([
        studentAPI.getDashboard(),
        studentAPI.getSchedule(),
        studentAPI.getNotifications()
      ]);

      setStats(statsRes.data.stats);
      setSchedule(scheduleRes.data.schedule);
      setNotifications(notifRes.data.notifications);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const loadAbsences = async () => {
    try {
      const res = await studentAPI.getAbsences();
      setAbsences(res.data.absences);
    } catch (error) {
      console.error('Error loading absences:', error);
    }
  };

  const loadGrades = async () => {
    try {
      const res = await studentAPI.getGrades();
      setGrades(res.data.grades);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await studentAPI.getMessages();
      setMessages(res.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'absences' && absences.length === 0) loadAbsences();
    if (tab === 'grades' && grades.length === 0) loadGrades();
    if (tab === 'messages' && messages.length === 0) loadMessages();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const groupScheduleByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    
    schedule.forEach(slot => {
      const day = days[slot.day_of_week];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(slot);
    });
    
    return grouped;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">UniPlatform</span>
        </div>
        <div className="dashboard-user">
          <span>Welcome, {user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <nav className="dashboard-nav">
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => handleTabChange('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={activeTab === 'schedule' ? 'active' : ''}
              onClick={() => handleTabChange('schedule')}
            >
              📅 Schedule
            </button>
            <button 
              className={activeTab === 'grades' ? 'active' : ''}
              onClick={() => handleTabChange('grades')}
            >
              📝 Grades
            </button>
            <button 
              className={activeTab === 'absences' ? 'active' : ''}
              onClick={() => handleTabChange('absences')}
            >
              ⚠️ Absences
            </button>
            <button 
              className={activeTab === 'notifications' ? 'active' : ''}
              onClick={() => handleTabChange('notifications')}
            >
              🔔 Notifications {stats?.unreadNotifications > 0 && `(${stats.unreadNotifications})`}
            </button>
            <button 
              className={activeTab === 'messages' ? 'active' : ''}
              onClick={() => handleTabChange('messages')}
            >
              💬 Messages {stats?.unreadMessages > 0 && `(${stats.unreadMessages})`}
            </button>
          </nav>
        </aside>

        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <h3>{stats?.upcomingSessions || 0}</h3>
                    <p>Upcoming Sessions</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-info">
                    <h3>{stats?.totalAbsences || 0}</h3>
                    <p>Total Absences</p>
                  </div>
                </div>
                <div className="stat-card alert">
                  <div className="stat-icon">❌</div>
                  <div className="stat-info">
                    <h3>{stats?.unexcusedAbsences || 0}</h3>
                    <p>Unexcused Absences</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔔</div>
                  <div className="stat-info">
                    <h3>{stats?.unreadNotifications || 0}</h3>
                    <p>New Notifications</p>
                  </div>
                </div>
              </div>

              <div className="recent-notifications">
                <h3>Recent Notifications</h3>
                {notifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notification-date">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-content">
              <h2>My Schedule</h2>
              {Object.entries(groupScheduleByDay()).map(([day, slots]) => (
                <div key={day} className="schedule-day">
                  <h3>{day}</h3>
                  <div className="schedule-slots">
                    {slots.map(slot => (
                      <div key={slot.id} className="schedule-slot">
                        <div className="slot-time">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="slot-details">
                          <h4>{slot.subject_name} ({slot.subject_code})</h4>
                          <p>📍 {slot.room_name} - {slot.building}</p>
                          <p>👨‍🏫 {slot.teacher_name}</p>
                          <span className="session-type">{slot.session_type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="grades-content">
              <h2>My Grades</h2>
              <div className="grades-table">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Code</th>
                      <th>Grade</th>
                      <th>Type</th>
                      <th>Credits</th>
                      <th>Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(grade => (
                      <tr key={grade.id}>
                        <td>{grade.subject_name}</td>
                        <td>{grade.subject_code}</td>
                        <td className="grade-value">{grade.grade_value}</td>
                        <td>{grade.grade_type}</td>
                        <td>{grade.credits}</td>
                        <td>{grade.semester} - {grade.academic_year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'absences' && (
            <div className="absences-content">
              <h2>My Absences</h2>
              <div className="absences-list">
                {absences.map(absence => (
                  <div key={absence.id} className="absence-item">
                    <div className="absence-header">
                      <h4>{absence.subject_name} ({absence.subject_code})</h4>
                      <span className={`absence-status ${absence.is_excused ? 'excused' : 'unexcused'}`}>
                        {absence.is_excused ? '✓ Excused' : '✗ Unexcused'}
                      </span>
                    </div>
                    <p>Date: {new Date(absence.absence_date).toLocaleDateString()}</p>
                    <p>Session: {absence.session_name}</p>
                    {absence.request_status && (
                      <p className="request-status">
                        Excuse Request: <strong>{absence.request_status}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-content">
              <h2>Notifications</h2>
              <div className="notifications-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notification-card ${!notif.is_read ? 'unread' : ''}`}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <div className="notification-meta">
                      <span className="notification-type">{notif.type}</span>
                      <span className="notification-date">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-content">
              <h2>Messages</h2>
              <div className="messages-list">
                {messages.map(msg => (
                  <div key={msg.id} className={`message-card ${!msg.is_read ? 'unread' : ''}`}>
                    <div className="message-header">
                      <h4>{msg.subject}</h4>
                      <span className="message-date">
                        {new Date(msg.sent_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="message-sender">
                      From: {msg.sender_name} ({msg.sender_role})
                    </p>
                    <p className="message-body">{msg.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
