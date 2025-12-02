import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function AdminDashboard() {
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const storedUserName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    
    if (storedUserName) setUserName(storedUserName);
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'http://localhost:3000';
  };

  const handleNavigate = (url) => {
    // Get all auth data from localStorage
    const token = localStorage.getItem('token');
    const user = {
      id: localStorage.getItem('userId'),
      cin: localStorage.getItem('userCin'),
      email: localStorage.getItem('userEmail'),
      firstName: localStorage.getItem('userFirstName'),
      lastName: localStorage.getItem('userLastName'),
      role: localStorage.getItem('userRole'),
      isVerified: localStorage.getItem('userIsVerified')
    };

    // Encode auth data as base64
    const authData = btoa(JSON.stringify({ token, user }));
    
    // Navigate with auth parameter
    window.location.href = `${url}?auth=${authData}`;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1> Admin</h1>
        
      </div>

      <div className="user-info">
        <h2> Welcome, {userName}!</h2>
        {userEmail && <p> {userEmail}</p>}
        <p>🔑 Role: Administrator</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            className="messages-btn" 
            onClick={() => navigate('/messages')}
            style={{
          background: '#8b6f47',
          color: '#ffffff',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '12px',
          fontSize: '1.05rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(139, 111, 71, 0.25)',
          letterSpacing: '0.3px',
            }}
          >
             Messages
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="services-grid">
        <div 
          className="service-card"
          onClick={() => handleNavigate('http://localhost:3003')}
        >
          <div className="service-icon">🏢</div>
          <h2>University Management</h2>
          <p>Manage departments, students, teachers, and rooms</p>
          <div className="service-status">
            <span className="status-dot"></span>
            <span>Active</span>
          </div>
          <ul className="service-features">
            <li>Department Management</li>
            <li>Student Records</li>
            <li>Teacher Profiles</li>
            <li>Room Allocation</li>
          </ul>
        </div>

        <div 
          className="service-card"
          onClick={() => handleNavigate('http://localhost:3004')}
        >
          <div className="service-icon">📊</div>
          <h2>Analytics & Reports</h2>
          <p>View analytics, generate reports, and track performance</p>
          <div className="service-status">
            <span className="status-dot"></span>
            <span>Active</span>
          </div>
          <ul className="service-features">
            <li>Student Analytics</li>
            <li>Attendance Reports</li>
            <li>Grade Analysis</li>
            <li>Import/Export Data</li>
          </ul>
        </div>

        <div 
          className="service-card"
          onClick={() => handleNavigate('http://localhost:4004')}
        >
          <div className="service-icon">📅</div>
          <h2>Timetable Management</h2>
          <p>Create and manage class schedules and timetables</p>
          <div className="service-status">
            <span className="status-dot"></span>
            <span>Active</span>
          </div>
          <ul className="service-features">
            <li>Schedule Creation</li>
            <li>Class Timetables</li>
            <li>Room Booking</li>
            <li>PDF Export</li>
          </ul>
        </div>

        {/* <div 
          className="service-card"
          onClick={() => handleNavigate('http://localhost:4005')}
        >
          <div className="service-icon">📚</div>
          <h2>Repository Service</h2>
          <p>Manage course materials and academic resources</p>
          <div className="service-status">
            <span className="status-dot"></span>
            <span>Active</span>
          </div>
          <ul className="service-features">
            <li>Course Materials</li>
            <li>Document Library</li>
            <li>Resource Management</li>
            <li>File Uploads</li>
          </ul>
        </div> */}

        {/* <div 
          className="service-card"
          onClick={() => handleNavigate('http://localhost:3005')}
        >
          <div className="service-icon">👨‍🎓</div>
          <h2>Student View</h2>
          <p>Student-facing dashboard for timetables, grades, and messages</p>
          <div className="service-status">
            <span className="status-dot"></span>
            <span>Active</span>
          </div>
          <ul className="service-features">
            <li>Personal Timetable</li>
            <li>Grade Reports</li>
            <li>Absence Management</li>
            <li>Messaging System</li>
          </ul>
        </div> */}

        {/* <div 
          className="service-card"
          onClick={() => handleNavigate('http://localhost:3006')}
        >
          <div className="service-icon">👔</div>
          <h2>Head Department</h2>
          <p>Department head operations and management tools</p>
          <div className="service-status">
            <span className="status-dot"></span>
            <span>Active</span>
          </div>
          <ul className="service-features">
            <li>Department Analytics</li>
            <li>Request Management</li>
            <li>Teacher & Student Oversight</li>
            <li>Subject Planning</li>
          </ul>
        </div> */}

        {/* <div 
          className="service-card"
          onClick={() => handleNavigate('http://localhost:3007')}
        >
          <div className="service-icon">👩‍🏫</div>
          <h2>Teacher Portal</h2>
          <p>Teacher dashboard for sessions, attendance, and messaging</p>
          <div className="service-status">
            <span className="status-dot"></span>
            <span>Active</span>
          </div>
          <ul className="service-features">
            <li>Session Management</li>
            <li>Attendance Tracking</li>
            <li>Absence Requests</li>
            <li>Make-up Sessions</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}

export default AdminDashboard;
