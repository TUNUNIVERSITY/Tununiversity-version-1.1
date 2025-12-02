import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Timetable = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    academicYear: '2024-2025',
    semester: '1'
  });

  useEffect(() => {
    fetchTimetable();
  }, [filters]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/timetable?${params}`);
      setSlots(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  if (loading) return <div className="loading">Loading timetable...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Timetable Management</h1>
        <p>View and manage department timetable</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <div className="filter-group">
          <label>Academic Year</label>
          <select
            value={filters.academicYear}
            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Semester</label>
          <select
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
        <div className="filter-group">
          <button className="btn btn-primary" onClick={fetchTimetable}>
            Refresh
          </button>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h2>Timetable Slots ({slots.length})</h2>
          <button className="btn btn-primary">Add New Slot</button>
        </div>
        {slots.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
            No timetable slots found for the selected filters
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Group</th>
                <th>Room</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{getDayName(slot.day_of_week)}</td>
                  <td>{slot.start_time} - {slot.end_time}</td>
                  <td>
                    <strong>{slot.subject_name}</strong><br />
                    <small>{slot.subject_code}</small>
                  </td>
                  <td>{slot.teacher_name}</td>
                  <td>{slot.group_name}</td>
                  <td>{slot.room_name}</td>
                  <td>
                    <span className={`badge ${slot.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {slot.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary">Edit</button>
                    {' '}
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Timetable;
