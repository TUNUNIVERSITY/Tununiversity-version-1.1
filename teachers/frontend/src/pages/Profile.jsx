import { useState, useEffect } from 'react';
import { getTeacher } from '../services/teacherService';
import Loading from '../components/Loading';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaBriefcase, FaCalendar, FaBuilding } from 'react-icons/fa';

function Profile({ teacherId }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTeacherProfile();
  }, [teacherId]);

  const loadTeacherProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTeacher(teacherId);
      setTeacher(response.data);
    } catch (err) {
      console.error('Error loading teacher profile:', err);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!teacher) return <div className="empty-state">No profile data found</div>;

  return (
    <div className="profile-page">
      <div className="page-header">
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2>{teacher.first_name} {teacher.last_name}</h2>
              <p className="profile-role">Teacher</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <div className="field-icon">
                    <FaEnvelope />
                  </div>
                  <div className="field-content">
                    <label>Email</label>
                    <p>{teacher.email}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="field-icon">
                    <FaIdCard />
                  </div>
                  <div className="field-content">
                    <label>CIN</label>
                    <p>{teacher.cin || 'N/A'}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="field-icon">
                    <FaPhone />
                  </div>
                  <div className="field-content">
                    <label>Phone</label>
                    <p>{teacher.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Professional Information</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <div className="field-icon">
                    <FaBriefcase />
                  </div>
                  <div className="field-content">
                    <label>Employee ID</label>
                    <p>{teacher.employee_id}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="field-icon">
                    <FaBuilding />
                  </div>
                  <div className="field-content">
                    <label>Department</label>
                    <p>{teacher.department_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="field-icon">
                    <FaCalendar />
                  </div>
                  <div className="field-content">
                    <label>Hire Date</label>
                    <p>{teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="profile-field">
                  <div className="field-icon">
                    <FaUser />
                  </div>
                  <div className="field-content">
                    <label>Specialization</label>
                    <p>{teacher.specialization || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
