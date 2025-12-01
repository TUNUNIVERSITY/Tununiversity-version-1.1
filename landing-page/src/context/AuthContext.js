import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const loadUserData = async () => {
      // First, check if user logged in via the external auth service (sessionStorage)
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      const userDataString = sessionStorage.getItem('userData');
      
      if (isLoggedIn === 'true' && userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          console.log('User data loaded from auth service:', userData);
          setUser(userData);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing sessionStorage userData:', error);
        }
      }

      // Fallback to token-based auth (if implementing local backend)
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          console.error('Load user error:', error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserData();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    // TODO: Replace this with your external authentication service call
    // Example:
    // try {
    //   const response = await fetch('YOUR_EXTERNAL_AUTH_SERVICE_URL/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(credentials)
    //   });
    //   const data = await response.json();
    //   const { token, user } = data;
    //   
    //   localStorage.setItem('token', token);
    //   setToken(token);
    //   setUser(user);
    //   
    //   return { success: true };
    // } catch (error) {
    //   return {
    //     success: false,
    //     message: error.message || 'Login failed'
    //   };
    // }

    console.error('Login is now handled by external authentication service. Please implement the external auth call.');
    return {
      success: false,
      message: 'Login not configured. Use external authentication service.'
    };
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    
    // Redirect to auth service login
    window.location.href = 'http://localhost:3000';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
