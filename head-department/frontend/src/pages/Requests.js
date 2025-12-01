import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [makeupSessions, setMakeupSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
    fetchMakeupSessions();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/requests/absence?status=${filter}`);
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchMakeupSessions = async () => {
    try {
      const response = await api.get('/requests/makeup-sessions');
      setMakeupSessions(response.data);
    } catch (err) {
      console.error('Failed to load makeup sessions');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this request?')) return;
    
    try {
      await api.post(`/requests/absence/${id}/approve`, {
        reviewComment: 'Approved by department head'
      });
      alert('Request approved successfully');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    const comment = prompt('Enter rejection reason:');
    if (!comment) return;
    
    try {
      await api.post(`/requests/absence/${id}/reject`, {
        reviewComment: comment
      });
      alert('Request rejected successfully');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleApproveMakeup = async (id) => {
    if (!window.confirm('Are you sure you want to approve this makeup session?')) return;
    
    try {
      await api.post(`/requests/makeup-sessions/${id}/approve`, {
        reviewComment: 'Approved by department head'
      });
      alert('Makeup session approved successfully');
      fetchMakeupSessions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve makeup session');
    }
  };

  const handleRejectMakeup = async (id) => {
    const comment = prompt('Enter rejection reason:');
    if (!comment) return;
    
    try {
      await api.post(`/requests/makeup-sessions/${id}/reject`, {
        reviewComment: comment
      });
      alert('Makeup session rejected successfully');
      fetchMakeupSessions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject makeup session');
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Requests Management</h1>
        <p>Review and manage absence requests</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Status</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h2>Absence Requests ({requests.length})</h2>
        </div>
        {requests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
            No requests found
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Session Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <strong>{request.student_name}</strong><br />
                    <small>{request.student_number}</small>
                  </td>
                  <td>{request.subject_name}</td>
                  <td>
                    {new Date(request.session_date).toLocaleDateString()}<br />
                    <small>{request.start_time} - {request.end_time}</small>
                  </td>
                  <td>{request.request_reason}</td>
                  <td>
                    <span className={`badge badge-${
                      request.status === 'approved' ? 'success' :
                      request.status === 'rejected' ? 'danger' : 'warning'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </button>
                        {' '}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.status !== 'pending' && (
                      <button className="btn btn-sm btn-secondary">View Details</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="data-table" style={{ marginTop: '30px' }}>
        <div className="table-header">
          <h2>Makeup Sessions ({makeupSessions.length})</h2>
        </div>
        {makeupSessions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
            No makeup sessions scheduled
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Group</th>
                <th>Date & Time</th>
                <th>Room</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {makeupSessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.subject_name}</td>
                  <td>{session.teacher_name}</td>
                  <td>{session.group_name}</td>
                  <td>
                    {new Date(session.session_date).toLocaleDateString()}<br />
                    <small>{session.start_time} - {session.end_time}</small>
                  </td>
                  <td>{session.room_name}</td>
                  <td>{session.reason}</td>
                  <td>
                    <span className={`badge badge-${
                      session.status === 'completed' ? 'success' :
                      session.status === 'cancelled' ? 'danger' : 
                      session.status === 'approved' ? 'success' :
                      session.status === 'rejected' ? 'danger' : 'warning'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td>
                    {session.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApproveMakeup(session.id)}
                        >
                          Approve
                        </button>
                        {' '}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRejectMakeup(session.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {session.status !== 'pending' && (
                      <button className="btn btn-sm btn-secondary">View Details</button>
                    )}
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

export default Requests;
