import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUserMinus } from 'react-icons/fa';
import { getSessionDetails, reportAbsence } from '../services/teacherService';
import { formatDate, formatTime } from '../utils/dateUtils';
import { getStatusBadgeClass, capitalize } from '../utils/helpers';
import Loading from '../components/Loading';

function SessionDetails({ teacherId }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportingAbsence, setReportingAbsence] = useState(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await getSessionDetails(sessionId);
      setSession(response.data);
    } catch (error) {
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAbsence = async (student) => {
    if (reportingAbsence) return;

    const confirmed = window.confirm(
      `Report absence for ${student.first_name} ${student.last_name}?`
    );

    if (!confirmed) return;

    try {
      setReportingAbsence(student.student_id);
      await reportAbsence({
        student_id: student.student_id,
        session_id: sessionId,
        absence_type: 'unjustified',
        reason: '',
        teacher_id: teacherId,
      });
      toast.success('Absence reported successfully');
      loadSession();
    } catch (error) {
      toast.error(error.message || 'Failed to report absence');
    } finally {
      setReportingAbsence(null);
    }
  };

  if (loading) return <Loading />;
  if (!session) return <div className="card">Session not found</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
        <FaArrowLeft /> Back
      </button>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Session Details</h2>
          <span className={`badge ${getStatusBadgeClass(session.status)}`}>
            {session.status}
          </span>
        </div>

        <div className="grid grid-cols-2 mb-3">
          <div>
            <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Subject</h3>
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {session.subject_name} ({session.subject_code})
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Group</h3>
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{session.group_name}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Date</h3>
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{formatDate(session.session_date)}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Time</h3>
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Room</h3>
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {session.room_name || 'TBA'} {session.building && `(${session.building})`}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>Attendance</h3>
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {parseInt(session.total_students) - parseInt(session.total_absences)} / {session.total_students} present
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student Attendance</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Registration #</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {session.students && session.students.map((student) => (
                <tr key={student.student_id}>
                  <td><strong>{student.registration_number}</strong></td>
                  <td>{student.first_name} {student.last_name}</td>
                  <td>{student.email}</td>
                  <td>
                    {student.absence_id ? (
                      <div>
                        <span className={`badge ${getStatusBadgeClass(student.absence_type)}`}>
                          {capitalize(student.absence_type)}
                        </span>
                        {student.request_status && (
                          <span className={`badge ${getStatusBadgeClass(student.request_status)}`} 
                                style={{ marginLeft: '0.5rem' }}>
                            Request: {capitalize(student.request_status)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="badge badge-success">Present</span>
                    )}
                  </td>
                  <td>
                    {!student.absence_id && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReportAbsence(student)}
                        disabled={reportingAbsence === student.student_id}
                      >
                        <FaUserMinus />
                        {reportingAbsence === student.student_id ? 'Reporting...' : 'Report Absence'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SessionDetails;
