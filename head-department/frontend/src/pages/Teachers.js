import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teachers');
      setTeachers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      const response = await api.get(`/teachers/${id}`);
      setSelectedTeacher(response.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load teacher details');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate teacher ${name}? This will prevent them from logging in.`)) return;
    
    try {
      await api.delete(`/teachers/${id}`);
      alert('Teacher deactivated successfully');
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to deactivate teacher');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeacher(null);
  };

  if (loading) return <div className="loading">Loading teachers...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Teachers Management</h1>
        <p>View faculty members and their workload</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="data-table">
        <div className="table-header">
          <h2>All Teachers ({teachers.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Total Classes</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td><strong>{teacher.employee_id}</strong></td>
                <td>{teacher.first_name} {teacher.last_name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.specialization || 'N/A'}</td>
                <td>{teacher.total_classes}</td>
                <td>{teacher.phone || 'N/A'}</td>
                <td>
                  <span className={`badge ${teacher.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {teacher.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleViewDetails(teacher.id)}
                  >
                    View Details
                  </button>
                  {' '}
                  {teacher.is_active && (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(teacher.id, `${teacher.first_name} ${teacher.last_name}`)}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teacher Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Teacher Details</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <div className="loading">Loading details...</div>
              ) : selectedTeacher && (
                <>
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Employee ID:</label>
                        <span>{selectedTeacher.employee_id}</span>
                      </div>
                      <div className="detail-item">
                        <label>Full Name:</label>
                        <span>{selectedTeacher.first_name} {selectedTeacher.last_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Email:</label>
                        <span>{selectedTeacher.email}</span>
                      </div>
                      <div className="detail-item">
                        <label>Phone:</label>
                        <span>{selectedTeacher.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Specialization:</label>
                        <span>{selectedTeacher.specialization || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Hire Date:</label>
                        <span>{selectedTeacher.hire_date ? new Date(selectedTeacher.hire_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Department:</label>
                        <span>{selectedTeacher.department_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span className={`badge ${selectedTeacher.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {selectedTeacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                    <div className="detail-section">
                      <h3>Subjects Taught ({selectedTeacher.subjects.length})</h3>
                      <div className="detail-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Subject Code</th>
                              <th>Subject Name</th>
                              <th>Group</th>
                              <th>Year</th>
                              <th>Semester</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTeacher.subjects.map((subject, index) => (
                              <tr key={index}>
                                <td>{subject.code}</td>
                                <td>{subject.name}</td>
                                <td>{subject.group_name}</td>
                                <td>{subject.academic_year}</td>
                                <td>{subject.semester}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTeacher.timetable && selectedTeacher.timetable.length > 0 && (
                    <div className="detail-section">
                      <h3>Weekly Timetable ({selectedTeacher.timetable.length} classes)</h3>
                      <div className="detail-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Day</th>
                              <th>Time</th>
                              <th>Subject</th>
                              <th>Group</th>
                              <th>Room</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTeacher.timetable.map((slot) => (
                              <tr key={slot.id}>
                                <td>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week]}</td>
                                <td>{slot.start_time} - {slot.end_time}</td>
                                <td>{slot.subject_name}</td>
                                <td>{slot.group_name}</td>
                                <td>{slot.room_name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
