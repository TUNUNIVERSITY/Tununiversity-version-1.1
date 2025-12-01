import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

function Login() {
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setNeedsVerification(false);

    try {
      const response = await authAPI.login(cin, password, role);
      
      if (response && response.success) {
        // Store token and user info in current origin
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userName', `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim() || response.user.cin);
        localStorage.setItem('userEmail', response.user.email || '');
        
        // Encode authentication data for URL transfer (cross-origin)
        const authData = btoa(JSON.stringify({
          token: response.token,
          user: response.user
        }));
        
        console.log('🔍 Login Response:', response);
        console.log('👤 User Role:', response.user.role);
        console.log('🎯 Checking redirect for role:', response.user.role);
        
        // Redirect based on role with auth data in URL
        if (response.user.role === 'admin') {
          console.log('➡️ Redirecting to ADMIN dashboard');
          window.location.href = `http://localhost:3002/dashboard?auth=${authData}`;
        } else if (response.user.role === 'student') {
          console.log('➡️ Redirecting to STUDENT dashboard');
          window.location.href = `http://localhost:3005/dashboard?auth=${authData}`;
        } else if (response.user.role === 'teacher') {
          console.log('➡️ Redirecting to TEACHER dashboard');
          window.location.href = `http://localhost:3007/dashboard?auth=${authData}`;
        } else if (response.user.role === 'department_head') {
          console.log('➡️ Redirecting to HEAD DEPARTMENT at http://localhost:3006');
          window.location.href = `http://localhost:3006?auth=${authData}`;
        } else {
          console.log('⚠️ Unknown role, using default navigation');
          navigate('/dashboard');
        }
        // Keep loading true during redirect
        return;
      } else {
        setError('Login failed. Invalid response from server.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        setError('Your email is not verified. A verification email has been sent to your registered email address. Please check your inbox.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials and selected role.');
      }
      setLoading(false); // Only set loading to false on error
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.sendVerification(cin);
      setError('');
      alert(`Verification email sent to ${response.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email');
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
          <h2>Login </h2>

          {error && (
            <div className={`alert ${needsVerification ? 'alert-warning' : 'alert-error'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="inputBx">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="department_head">Department Head</option>
              </select>
            </div>

            <div className="inputBx">
              <input
                type="text"
                value={cin}
                onChange={(e) => setCin(e.target.value)}
                placeholder="Enter your CIN"
                required
                disabled={loading}
              />
            </div>

            <div className="inputBx">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
              />
            </div>

            <div className="inputBx">
              <input
                type="submit"
                value={loading ? 'Loading...' : 'Sign in'}
                disabled={loading}
              />
            </div>
          </form>

          {needsVerification && (
            <div className="inputBx">
              <input
                type="button"
                value="Resend Verification Email"
                onClick={handleResendVerification}
                disabled={loading}
                style={{ background: 'linear-gradient(45deg, #ff9a00, #ffd200)' }}
              />
            </div>
          )}

          <div className="links">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
