import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Analytics = () => {
  const [absenceAnalytics, setAbsenceAnalytics] = useState(null);
  const [roomOccupancy, setRoomOccupancy] = useState([]);
  const [teacherWorkload, setTeacherWorkload] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [absences, rooms, teachers, students, summaryRes] = await Promise.all([
        api.get('/analytics/absences'),
        api.get('/analytics/room-occupancy'),
        api.get('/analytics/teacher-workload'),
        api.get('/analytics/student-performance'),
        api.get('/analytics/summary')
      ]);
      
      setAbsenceAnalytics(absences.data);
      setRoomOccupancy(rooms.data);
      setTeacherWorkload(teachers.data);
      setStudentPerformance(students.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <p>Department performance insights</p>
      </div>

      {error && <div className="error">{error}</div>}

      {summary && (
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <h3>Total Teachers</h3>
            <div className="value">{summary.totalTeachers}</div>
          </div>
          <div className="stat-card">
            <h3>Total Students</h3>
            <div className="value">{summary.totalStudents}</div>
          </div>
          <div className="stat-card">
            <h3>Specialties</h3>
            <div className="value">{summary.totalSpecialties}</div>
          </div>
          <div className="stat-card">
            <h3>Active Groups</h3>
            <div className="value">{summary.totalGroups}</div>
          </div>
          <div className="stat-card">
            <h3>Total Subjects</h3>
            <div className="value">{summary.totalSubjects}</div>
          </div>
          <div className="stat-card">
            <h3>Timetable Slots</h3>
            <div className="value">{summary.activeTimetableSlots}</div>
          </div>
        </div>
      )}

      <div className="data-table">
        <div className="table-header">
          <h2>Teacher Workload Analysis</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Teacher Name</th>
              <th>Total Classes</th>
              <th>Subjects</th>
              <th>Groups</th>
              <th>Weekly Hours</th>
              <th>Workload</th>
            </tr>
          </thead>
          <tbody>
            {teacherWorkload.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.employee_id}</td>
                <td>{teacher.teacher_name}</td>
                <td>{teacher.total_classes}</td>
                <td>{teacher.total_subjects}</td>
                <td>{teacher.total_groups}</td>
                <td>{parseFloat(teacher.weekly_hours).toFixed(2)}h</td>
                <td>
                  <span className={`badge ${
                    teacher.weekly_hours > 20 ? 'badge-danger' :
                    teacher.weekly_hours > 15 ? 'badge-warning' : 'badge-success'
                  }`}>
                    {teacher.weekly_hours > 20 ? 'High' :
                     teacher.weekly_hours > 15 ? 'Medium' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }} className="data-table">
        <div className="table-header">
          <h2>Room Occupancy Analysis</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Room Code</th>
              <th>Room Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Total Bookings</th>
              <th>Occupancy Rate</th>
            </tr>
          </thead>
          <tbody>
            {roomOccupancy.map((room) => (
              <tr key={room.id}>
                <td><strong>{room.code}</strong></td>
                <td>{room.name}</td>
                <td>
                  <span className="badge badge-info">{room.room_type}</span>
                </td>
                <td>{room.capacity}</td>
                <td>{room.total_slots}</td>
                <td>
                  <span className={`badge ${
                    room.occupancy_rate > 75 ? 'badge-danger' :
                    room.occupancy_rate > 50 ? 'badge-warning' : 'badge-success'
                  }`}>
                    {room.occupancy_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {absenceAnalytics && absenceAnalytics.topStudents && absenceAnalytics.topStudents.length > 0 && (
        <div style={{ marginTop: '30px' }} className="data-table">
          <div className="table-header">
            <h2>Students with Most Absences</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Group</th>
                <th>Specialty</th>
                <th>Total Absences</th>
                <th>Unjustified</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {absenceAnalytics.topStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.student_number}</td>
                  <td>{student.student_name}</td>
                  <td>{student.group_name}</td>
                  <td>{student.specialty_name}</td>
                  <td>{student.total_absences}</td>
                  <td>{student.unjustified_absences}</td>
                  <td>
                    <span className={`badge ${
                      student.total_absences > 10 ? 'badge-danger' :
                      student.total_absences > 5 ? 'badge-warning' : 'badge-success'
                    }`}>
                      {student.total_absences > 10 ? 'Critical' :
                       student.total_absences > 5 ? 'Warning' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '30px' }} className="data-table">
        <div className="table-header">
          <h2>Student Performance by Level</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Specialty</th>
              <th>Year</th>
              <th>Total Students</th>
              <th>Total Exams</th>
              <th>Average Score</th>
              <th>Min Score</th>
              <th>Max Score</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {studentPerformance.map((perf, index) => (
              <tr key={index}>
                <td>{perf.specialty_name}</td>
                <td>Year {perf.year_number}</td>
                <td>{perf.total_students}</td>
                <td>{perf.total_exams}</td>
                <td>{parseFloat(perf.average_score || 0).toFixed(2)}</td>
                <td>{parseFloat(perf.min_score || 0).toFixed(2)}</td>
                <td>{parseFloat(perf.max_score || 0).toFixed(2)}</td>
                <td>
                  <span className={`badge ${
                    perf.average_score >= 15 ? 'badge-success' :
                    perf.average_score >= 10 ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {perf.average_score >= 15 ? 'Excellent' :
                     perf.average_score >= 10 ? 'Average' : 'Needs Improvement'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
