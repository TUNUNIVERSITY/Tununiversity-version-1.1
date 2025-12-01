import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Token is missing.');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card verification-container">
        <div className="auth-header">
          <h1>🎓 Email Verification</h1>
        </div>

        {status === 'verifying' && (
          <>
            <div className="verification-icon">
              <span className="loading" style={{ width: '60px', height: '60px' }}></span>
            </div>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verification-icon success">✓</div>
            <div className="alert alert-success">{message}</div>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verification-icon error">✗</div>
            <div className="alert alert-error">{message}</div>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
