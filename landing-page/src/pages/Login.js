import React, { useEffect } from 'react';
import './Login.css';

function Login() {
  useEffect(() => {

    console.log('Redirecting to authentication service...');
    window.location.href = 'http://localhost:3000';
  }, []);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">UniPlatform</span>
          </div>
          <h2>Redirecting to Authentication Service</h2>
          <p>Please wait while we redirect you to the secure login portal...</p>
        </div>
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="redirect-message">
            You will be redirected to the authentication service where you can:
          </p>
          <ul className="feature-list">
            <li>✓ Select your role (Student, Teacher, Admin, Head of Department)</li>
            <li>✓ Login securely with your credentials</li>
            <li>✓ Access your personalized dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
