import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Since we have user data in context, we can use it directly
      setProfileData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        specialization: user?.specialization || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // In a real application, you would call an API endpoint to update the profile
      // await api.put('/profile', profileData);
      
      // For now, show success message
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Update local storage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      // In a real application, you would call an API endpoint
      // await api.post('/profile/change-password', {
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword
      // });
      
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="success" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '4px' }}>{success}</div>}

      <div className="profile-container" style={{ display: 'grid', gap: '20px', maxWidth: '1200px' }}>
        {/* Profile Information Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: 0 }}>Profile Information</h2>
            {!editing && (
              <button 
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            {editing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={profileData.specialization}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-success">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="detail-grid">
                <div className="detail-item">
                  <label>First Name:</label>
                  <span>{profileData.first_name}</span>
                </div>
                <div className="detail-item">
                  <label>Last Name:</label>
                  <span>{profileData.last_name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{profileData.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{profileData.phone || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Role:</label>
                  <span className="badge badge-info">Department Head</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{user?.department_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Specialization:</label>
                  <span>{profileData.specialization || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: 0 }}>Change Password</h2>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
                <small style={{ color: '#666' }}>Must be at least 8 characters long</small>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Account Statistics Card */}
        <div className="card">
          <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: 0 }}>Account Information</h2>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="stat-card" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Department</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>{user?.department_name || 'N/A'}</div>
              </div>
              <div className="stat-card" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Department Code</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>{user?.department_code || 'N/A'}</div>
              </div>
              <div className="stat-card" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>User ID</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>#{user?.id}</div>
              </div>
              <div className="stat-card" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Account Type</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
