import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Subjects from './pages/Subjects';
import Groups from './pages/Groups';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Requests from './pages/Requests';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Messages from './pages/Messages';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="groups" element={<Groups />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="students" element={<Students />} />
        <Route path="requests" element={<Requests />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Check for authentication parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    
    if (authParam) {
      try {
        // Decode the auth data
        const authData = JSON.parse(atob(authParam));
        
        // Store in localStorage
        if (authData.token) localStorage.setItem('token', authData.token);
        if (authData.user) {
          localStorage.setItem('userId', authData.user.id);
          localStorage.setItem('userCin', authData.user.cin);
          localStorage.setItem('userEmail', authData.user.email);
          localStorage.setItem('userFirstName', authData.user.firstName);
          localStorage.setItem('userLastName', authData.user.lastName);
          localStorage.setItem('userName', `${authData.user.firstName} ${authData.user.lastName}`);
          localStorage.setItem('userRole', authData.user.role);
          localStorage.setItem('userIsVerified', authData.user.isVerified);
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to decode auth parameter:', error);
      }
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || (userRole !== 'admin' && userRole !== 'department_head')) {
      window.location.href = 'http://localhost:3001';
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
