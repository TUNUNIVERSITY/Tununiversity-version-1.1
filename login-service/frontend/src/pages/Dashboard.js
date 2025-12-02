import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Then fetch fresh data from API
        const response = await authAPI.getProfile();
        if (response.success) {
          setUser(response.user);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile');
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to set is_verified to false
      await authAPI.logout();
    } catch (err) {
      console.error('Logout API error:', err);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading" style={{ width: '60px', height: '60px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <h3>University Platform</h3>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </nav>

      <div className="container">
        <div className="dashboard">
          <h2>Welcome, {user?.first_name || 'User'}! 👋</h2>

          {error && <div className="alert alert-error">{error}</div>}

          {user && (
            <div className="user-info">
              <h3>Your Profile Information</h3>
              <p><strong>CIN:</strong> {user.cin}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              <p><strong>Role:</strong> {user.role?.toUpperCase()}</p>
              <p><strong>Verified:</strong> {user.is_verified ? '✓ Yes' : '✗ No'}</p>
              <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                View Courses
              </button>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                My Schedule
              </button>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                Grades
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
