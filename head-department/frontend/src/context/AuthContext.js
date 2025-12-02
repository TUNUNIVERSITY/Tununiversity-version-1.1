import React, { createContext, useState, useContext, useEffect } from 'react';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load authentication data from localStorage
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      // Build user object from localStorage
      const userData = {
        id: localStorage.getItem('userId'),
        cin: localStorage.getItem('userCin'),
        email: localStorage.getItem('userEmail'),
        firstName: localStorage.getItem('userFirstName'),
        lastName: localStorage.getItem('userLastName'),
        role: localStorage.getItem('userRole'),
        isVerified: localStorage.getItem('userIsVerified') === 'true'
      };
      
      setToken(storedToken);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call backend logout API to set is_verified = false
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:4002/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userCin');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userLastName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userIsVerified');
      // Redirect to login
      window.location.href = 'http://localhost:3001';
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
