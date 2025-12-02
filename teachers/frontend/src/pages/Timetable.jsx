import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTeacherTimetable } from '../services/teacherService';
import { formatTime, getDayName, getCurrentAcademicYear, getCurrentSemester } from '../utils/dateUtils';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function Timetable({ teacherId }) {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [semester, setSemester] = useState(getCurrentSemester());

  useEffect(() => {
    loadTimetable();
  }, [teacherId, academicYear, semester]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const response = await getTeacherTimetable(teacherId, {
        academic_year: academicYear,
        semester: semester,
      });
      setTimetable(response.data || []);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = () => {
    const grouped = {};
    timetable.forEach(slot => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = [];
      }
      grouped[slot.day_of_week].push(slot);
    });
    return grouped;
  };

  if (loading) return <Loading />;

  const groupedTimetable = groupByDay();
  const days = [1, 2, 3, 4, 5, 6, 7]; // Monday to Sunday

  const handleDownloadPDF = () => {
    // Open PDF in new tab via API Gateway
    window.open(`http://localhost:4000/api/pdf/teacher/${teacherId}`, '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1>Timetable</h1>
        <div className="flex gap-2">
          <select 
            className="form-control" 
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>
          <select 
            className="form-control" 
            value={semester}
            onChange={(e) => setSemester(parseInt(e.target.value))}
            style={{ width: '120px' }}
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={handleDownloadPDF}
            title="Download Timetable PDF"
          >
            📥 Download PDF
          </button>
        </div>
      </div>

      {timetable.length === 0 ? (
        <div className="card">
          <EmptyState message="No timetable slots found for the selected period" />
        </div>
      ) : (
        <div className="card">
          {days.map(day => {
            const daySlots = groupedTimetable[day] || [];
            if (daySlots.length === 0) return null;

            return (
              <div key={day} className="mb-3">
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  color: 'var(--primary-color)'
                }}>
                  {getDayName(day)}
                </h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Subject</th>
                        <th>Group</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((slot) => (
                        <tr key={slot.slot_id}>
                          <td>
                            <strong>{formatTime(slot.start_time)}</strong> - {formatTime(slot.end_time)}
                          </td>
                          <td>
                            <div>
                              <strong>{slot.subject_name}</strong>
                              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                {slot.subject_code}
                              </div>
                            </div>
                          </td>
                          <td>{slot.group_name}</td>
                          <td>
                            {slot.room_name ? (
                              <div>
                                <strong>{slot.room_name}</strong>
                                {slot.building && (
                                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    {slot.building}
                                  </div>
                                )}
                              </div>
                            ) : (
                              'TBA'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Timetable;
