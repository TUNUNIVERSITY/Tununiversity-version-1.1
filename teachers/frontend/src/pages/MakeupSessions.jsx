import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import { 
  getMakeupSessions, 
  createMakeupSession, 
  getTeacherSubjects, 
  getTeacherGroups,
  getRooms
} from '../services/teacherService';
import { formatDate, formatTime } from '../utils/dateUtils';
import { getStatusBadgeClass, capitalize } from '../utils/helpers';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function MakeupSessions({ teacherId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    teacher_id: teacherId,
    subject_id: '',
    group_id: '',
    session_date: '',
    start_time: '',
    end_time: '',
    reason: '',
    room_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMakeupSessions();
    loadSubjects();
    loadGroups();
    loadRooms();
  }, [teacherId]);

  const loadMakeupSessions = async () => {
    try {
      setLoading(true);
      const response = await getMakeupSessions(teacherId);
      setSessions(response.data || []);
    } catch (error) {
      toast.error('Failed to load make-up sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await getTeacherSubjects(teacherId);
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to load subjects');
    }
  };

  const loadGroups = async () => {
    try {
      const response = await getTeacherGroups(teacherId);
      setGroups(response.data || []);
    } catch (error) {
      console.error('Failed to load groups');
    }
  };

  const loadRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data || []);
    } catch (error) {
      console.error('Failed to load rooms');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject_id || !formData.group_id || !formData.room_id || !formData.session_date || 
        !formData.start_time || !formData.end_time || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await createMakeupSession(formData);
      toast.success('Make-up session scheduled successfully');
      setShowModal(false);
      setFormData({
        teacher_id: teacherId,
        subject_id: '',
        group_id: '',
        session_date: '',
        start_time: '',
        end_time: '',
        reason: '',
        room_id: '',
      });
      loadMakeupSessions();
    } catch (error) {
      toast.error(error.message || 'Failed to schedule make-up session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1>Make-Up Sessions</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Schedule Make-Up Session
        </button>
      </div>

      <div className="card">
        {sessions.length === 0 ? (
          <EmptyState message="No make-up sessions scheduled" />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Subject</th>
                  <th>Group</th>
                  <th>Room</th>
                  <th>Students</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.makeup_session_id}>
                    <td>
                      <div>
                        <strong>{formatDate(session.session_date)}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {formatTime(session.start_time)} - {formatTime(session.end_time)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{session.subject_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {session.subject_code}
                        </div>
                      </div>
                    </td>
                    <td>{session.group_name}</td>
                    <td>
                      {session.room_name ? (
                        <div>
                          <strong>{session.room_name}</strong>
                          {session.building && (
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {session.building}
                            </div>
                          )}
                        </div>
                      ) : (
                        'TBA'
                      )}
                    </td>
                    <td>{session.student_count}</td>
                    <td style={{ maxWidth: '200px' }}>{session.reason}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(session.status)}`}>
                        {capitalize(session.status)}
                      </span>
                    </td>
                    <td>{formatDate(session.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Make-Up Session Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">Schedule Make-Up Session</h3>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    className="form-control"
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name} ({subject.subject_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Group *</label>
                  <select
                    className="form-control"
                    value={formData.group_id}
                    onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                    required
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group.group_id} value={group.group_id}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Room *</label>
                  <select
                    className="form-control"
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.building} ({room.room_type}, Capacity: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.session_date}
                    onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <textarea
                    className="form-control"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Explain the reason for the make-up session"
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MakeupSessions;
