import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeacher } from '../services/teacherService';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

function Header({ teacherId }) {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadTeacherInfo();
  }, [teacherId]);

  const loadTeacherInfo = async () => {
    try {
      const response = await getTeacher(teacherId);
      setTeacher(response.data);
    } catch (err) {
      console.error('Error loading teacher info:', err);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
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
        // Clear any stored auth data
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to login page
        window.location.href = 'http://localhost:3001';
      }
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          {/* Page title can be added dynamically here */}
        </div>
        
        <div className="header-actions">
          <div className="user-menu">
            <button 
              className="user-menu-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                <FaUser />
              </div>
              <div className="user-info">
                <span className="user-name">
                  {teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Loading...'}
                </span>
                <span className="user-role">Teacher</span>
              </div>
            </button>

            {showDropdown && (
              <div className="user-dropdown">
                <button onClick={handleProfileClick} className="dropdown-item">
                  <FaUser />
                  <span>My Profile</span>
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
