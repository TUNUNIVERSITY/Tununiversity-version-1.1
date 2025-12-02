import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaCheckCircle, FaTimesCircle, FaUser } from 'react-icons/fa';
import { getSessionAttendance, markBulkAttendance } from '../services/teacherService';
import { formatDate, formatTime } from '../utils/dateUtils';
import Loading from '../components/Loading';

function TakeAttendance({ teacherId }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [changes, setChanges] = useState({});

  useEffect(() => {
    loadAttendance();
  }, [sessionId]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await getSessionAttendance(sessionId, { teacher_id: teacherId });
      
      if (response.data.students && response.data.students.length > 0) {
        const firstStudent = response.data.students[0];
        setSessionData({
          session_date: firstStudent.session_date,
          start_time: firstStudent.start_time,
          end_time: firstStudent.end_time,
          subject_name: firstStudent.subject_name,
          subject_code: firstStudent.subject_code,
          group_name: firstStudent.group_name,
        });
      }
      
      setStudents(response.data.students || []);
      setStatistics(response.data.statistics);
    } catch (error) {
      toast.error('Failed to load attendance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId, currentStatus) => {
    const newStatus = currentStatus === 'P' ? 'A' : 'P';
    
    setStudents(students.map(student => 
      student.student_id === studentId 
        ? { ...student, status: newStatus }
        : student
    ));

    setChanges({
      ...changes,
      [studentId]: newStatus
    });
  };

  const markAllPresent = () => {
    const allChanges = {};
    const updatedStudents = students.map(student => {
      allChanges[student.student_id] = 'P';
      return { ...student, status: 'P' };
    });
    setStudents(updatedStudents);
    setChanges(allChanges);
    toast.info('All students marked as present');
  };

  const markAllAbsent = () => {
    const allChanges = {};
    const updatedStudents = students.map(student => {
      allChanges[student.student_id] = 'A';
      return { ...student, status: 'A' };
    });
    setStudents(updatedStudents);
    setChanges(allChanges);
    toast.info('All students marked as absent');
  };

  const saveAttendance = async () => {
    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      return;
    }

    try {
      setSaving(true);
      
      const attendanceList = Object.entries(changes).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status: status,
        reason: status === 'A' ? 'Marked by teacher' : null
      }));

      await markBulkAttendance(sessionId, {
        teacher_id: teacherId,
        attendance_list: attendanceList
      });

      toast.success('Attendance saved successfully!');
      setChanges({});
      await loadAttendance(); // Reload to get updated statistics
    } catch (error) {
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const presentCount = students.filter(s => s.status === 'P').length;
  const absentCount = students.filter(s => s.status === 'A').length;
  const attendanceRate = students.length > 0 
    ? Math.round((presentCount / students.length) * 100) 
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate('/sessions')} className="btn btn-secondary">
          <FaArrowLeft /> Back to Sessions
        </button>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
          Take Attendance
        </h1>
        
        <button 
          onClick={saveAttendance} 
          className="btn btn-success"
          disabled={saving || Object.keys(changes).length === 0}
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {/* Session Info Card */}
      {sessionData && (
        <div className="card mb-4" style={{ backgroundColor: '#f8fafc' }}>
          <div className="card-body">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Subject</div>
                <div style={{ fontWeight: 600 }}>{sessionData.subject_name} ({sessionData.subject_code})</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Group</div>
                <div style={{ fontWeight: 600 }}>{sessionData.group_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Date</div>
                <div style={{ fontWeight: 600 }}>{formatDate(sessionData.session_date)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Time</div>
                <div style={{ fontWeight: 600 }}>
                  {formatTime(sessionData.start_time)} - {formatTime(sessionData.end_time)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ backgroundColor: '#10b981', color: 'white' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{presentCount}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Present</div>
        </div>
        <div className="stat-card" style={{ backgroundColor: '#ef4444', color: 'white' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{absentCount}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Absent</div>
        </div>
        <div className="stat-card" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{students.length}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Students</div>
        </div>
        <div className="stat-card" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{attendanceRate}%</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Attendance Rate</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button onClick={markAllPresent} className="btn btn-success">
          <FaCheckCircle /> Mark All Present
        </button>
        <button onClick={markAllAbsent} className="btn btn-danger">
          <FaTimesCircle /> Mark All Absent
        </button>
        {Object.keys(changes).length > 0 && (
          <div style={{ 
            marginLeft: 'auto', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#fef3c7', 
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#92400e'
          }}>
            {Object.keys(changes).length} unsaved change(s)
          </div>
        )}
      </div>

      {/* Students List */}
      <div className="card">
        <div className="card-header">
          <h3>Student Attendance List</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Email</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Status</th>
                <th style={{ textAlign: 'center', width: '200px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    <FaUser size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <div>No students found in this group</div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.student_number}</td>
                    <td style={{ fontWeight: 600 }}>
                      {student.first_name} {student.last_name}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {student.email}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${student.status === 'P' ? 'badge-success' : 'badge-danger'}`}>
                        {student.status === 'P' ? (
                          <>
                            <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                            Present
                          </>
                        ) : (
                          <>
                            <FaTimesCircle style={{ marginRight: '0.25rem' }} />
                            Absent
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleAttendance(student.student_id, student.status)}
                        className={`btn ${student.status === 'P' ? 'btn-danger' : 'btn-success'} btn-sm`}
                        title={`Mark as ${student.status === 'P' ? 'Absent' : 'Present'}`}
                      >
                        {student.status === 'P' ? (
                          <>
                            <FaTimesCircle /> Mark Absent
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Mark Present
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button at Bottom */}
      {students.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button 
            onClick={saveAttendance} 
            className="btn btn-success btn-lg"
            disabled={saving || Object.keys(changes).length === 0}
          >
            <FaSave /> {saving ? 'Saving Attendance...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

export default TakeAttendance;
