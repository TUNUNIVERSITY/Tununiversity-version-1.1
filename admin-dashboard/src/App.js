import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auth data in URL (from cross-origin redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    
    if (authParam) {
      try {
        // Decode and store auth data from URL
        const authData = JSON.parse(atob(authParam));
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('userId', authData.user.id);
        localStorage.setItem('userRole', authData.user.role);
        localStorage.setItem('userName', `${authData.user.firstName || ''} ${authData.user.lastName || ''}`.trim() || authData.user.cin);
        localStorage.setItem('userEmail', authData.user.email || '');
        
        // Clean URL by removing auth parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Set authenticated state
        setIsAuthenticated(true);
        setUserRole(authData.user.role);
        setLoading(false);
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        window.location.href = 'http://localhost:3001';
      }
    } else {
      // Check authentication from localStorage
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      
      if (token && role === 'admin') {
        setIsAuthenticated(true);
        setUserRole(role);
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        window.location.href = 'http://localhost:3001';
      }
    }
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated && userRole === 'admin' ? 
              <AdminDashboard /> : 
              <Navigate to="http://localhost:3000/login" replace />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated && userRole === 'admin' ? 
              <AdminDashboard /> : 
              <Navigate to="http://localhost:3000/login" replace />
          } 
        />
        <Route 
          path="/messages" 
          element={
            isAuthenticated && userRole === 'admin' ? 
              <Messages /> : 
              <Navigate to="http://localhost:3000/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
