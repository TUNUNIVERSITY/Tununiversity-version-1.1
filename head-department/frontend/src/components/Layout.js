import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();

  const handleExternalNavigation = (url) => {
    // Get auth data from localStorage
    const token = localStorage.getItem('token');
    const authUser = {
      id: localStorage.getItem('userId'),
      cin: localStorage.getItem('userCin'),
      email: localStorage.getItem('userEmail'),
      firstName: localStorage.getItem('userFirstName'),
      lastName: localStorage.getItem('userLastName'),
      role: localStorage.getItem('userRole'),
      isVerified: localStorage.getItem('userIsVerified')
    };

    // Encode auth data
    const authData = btoa(JSON.stringify({ token, user: authUser }));
    
    // Navigate with auth parameter
    window.location.href = `${url}?auth=${authData}`;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Department Head zone </h2>
          <p>Tununiversity</p>
        </div>
        <nav>
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/" end> Dashboard</NavLink>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleExternalNavigation('http://localhost:4004'); }}>
                 Timetable Management
              </a>
            </li>
            <li>
              <NavLink to="/subjects"> Subjects</NavLink>
            </li>
            <li>
              <NavLink to="/groups"> Groups</NavLink>
            </li>
            <li>
              <NavLink to="/teachers"> Teachers</NavLink>
            </li>
            <li>
              <NavLink to="/students"> Students</NavLink>
            </li>
            <li>
              <NavLink to="/requests"> Requests</NavLink>
            </li>
            <li>
              <NavLink to="/messages"> Messages</NavLink>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleExternalNavigation('http://localhost:3004'); }}>
                 Analytics & Reports
              </a>
            </li>
            <li>
              <NavLink to="/profile"> Profile</NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      
      <div className="main-content">
        <nav className="navbar">
          <div className="navbar-search">
            <h3>Welcome back, {user?.first_name || 'User'}</h3>
          </div>
          <div className="navbar-user">
            <div className="user-info">
              <div className="name">{user?.first_name} {user?.last_name}</div>
              <div className="role">Department Head</div>
            </div>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </nav>
        
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
