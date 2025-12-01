import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      const response = await api.get(`/students/${id}`);
      setSelectedStudent(response.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load student details');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate student ${name}? This will prevent them from logging in.`)) return;
    
    try {
      await api.delete(`/students/${id}`);
      alert('Student deactivated successfully');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to deactivate student');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Students Management</h1>
        <p>View all enrolled students</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="data-table">
        <div className="table-header">
          <h2>All Students ({students.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student Number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Level</th>
              <th>Group</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td><strong>{student.student_number}</strong></td>
                <td>{student.first_name} {student.last_name}</td>
                <td>{student.email}</td>
                <td>{student.specialty_name}</td>
                <td>{student.level_name} (Year {student.year_number})</td>
                <td>{student.group_name}</td>
                <td>
                  <span className={`badge ${student.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleViewDetails(student.id)}
                  >
                    View Details
                  </button>
                  {' '}
                  {student.is_active && (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)}
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

      {/* Student Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <div className="loading">Loading details...</div>
              ) : selectedStudent && (
                <>
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Student Number:</label>
                        <span>{selectedStudent.student_number}</span>
                      </div>
                      <div className="detail-item">
                        <label>Full Name:</label>
                        <span>{selectedStudent.first_name} {selectedStudent.last_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Email:</label>
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="detail-item">
                        <label>Phone:</label>
                        <span>{selectedStudent.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Date of Birth:</label>
                        <span>{selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Enrollment Date:</label>
                        <span>{new Date(selectedStudent.enrollment_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Academic Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Specialty:</label>
                        <span>{selectedStudent.specialty_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Level:</label>
                        <span>{selectedStudent.level_name} (Year {selectedStudent.year_number})</span>
                      </div>
                      <div className="detail-item">
                        <label>Group:</label>
                        <span>{selectedStudent.group_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span className={`badge ${selectedStudent.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {selectedStudent.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedStudent.absences && selectedStudent.absences.length > 0 && (
                    <div className="detail-section">
                      <h3>Recent Absences ({selectedStudent.absences.length})</h3>
                      <div className="detail-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Subject</th>
                              <th>Type</th>
                              <th>Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudent.absences.slice(0, 10).map((absence) => (
                              <tr key={absence.id}>
                                <td>{new Date(absence.session_date).toLocaleDateString()}</td>
                                <td>{absence.subject_name}</td>
                                <td>
                                  <span className={`badge badge-${
                                    absence.absence_type === 'justified' ? 'success' :
                                    absence.absence_type === 'unjustified' ? 'danger' : 'warning'
                                  }`}>
                                    {absence.absence_type}
                                  </span>
                                </td>
                                <td>{absence.reason || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedStudent.grades && selectedStudent.grades.length > 0 && (
                    <div className="detail-section">
                      <h3>Grades ({selectedStudent.grades.length})</h3>
                      <div className="detail-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Exam Type</th>
                              <th>Score</th>
                              <th>Date</th>
                              <th>Semester</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedStudent.grades.slice(0, 10).map((grade) => (
                              <tr key={grade.id}>
                                <td>{grade.subject_name}</td>
                                <td>{grade.exam_type}</td>
                                <td>{grade.score}/{grade.max_score}</td>
                                <td>{new Date(grade.exam_date).toLocaleDateString()}</td>
                                <td>{grade.semester} - {grade.academic_year}</td>
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

export default Students;
