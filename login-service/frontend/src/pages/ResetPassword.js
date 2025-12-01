import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Token is missing.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, newPassword);
      
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="ring">
        <i style={{ '--clr': '#00ff0a' }}></i>
        <i style={{ '--clr': '#ff0057' }}></i>
        <i style={{ '--clr': '#fffd44' }}></i>
        <div className="login">
          <h2>Reset Password</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="inputBx">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min 6 chars)"
                required
                minLength={6}
                disabled={loading || success}
              />
            </div>

            <div className="inputBx">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
                minLength={6}
                disabled={loading || success}
              />
            </div>

            <div className="inputBx">
              <input
                type="submit"
                value={loading ? 'Resetting...' : 'Reset Password'}
                disabled={loading || success}
              />
            </div>
          </form>

          <div className="links">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
