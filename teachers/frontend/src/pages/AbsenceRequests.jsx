import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { getAbsenceRequests, approveAbsenceRequest, rejectAbsenceRequest } from '../services/teacherService';
import { formatDate, formatTime } from '../utils/dateUtils';
import { getStatusBadgeClass, capitalize } from '../utils/helpers';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function AbsenceRequests({ teacherId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadRequests();
  }, [teacherId, filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getAbsenceRequests(teacherId, {
        status: filter === 'all' ? undefined : filter,
      });
      setRequests(response.data || []);
    } catch (error) {
      toast.error('Failed to load absence requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    const confirmed = window.confirm('Are you sure you want to approve this absence request?');
    if (!confirmed) return;

    try {
      setProcessingId(requestId);
      await approveAbsenceRequest(requestId, {
        teacher_id: teacherId,
        review_comment: reviewComment,
      });
      toast.success('Absence request approved');
      setReviewModal(null);
      setReviewComment('');
      loadRequests();
    } catch (error) {
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!reviewComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(requestId);
      await rejectAbsenceRequest(requestId, {
        teacher_id: teacherId,
        review_comment: reviewComment,
      });
      toast.success('Absence request rejected');
      setReviewModal(null);
      setReviewComment('');
      loadRequests();
    } catch (error) {
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1>Absence Requests</h1>
        <select 
          className="form-control" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <EmptyState message={`No ${filter !== 'all' ? filter : ''} absence requests found`} />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Session Date</th>
                  <th>Request Reason</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.request_id}>
                    <td>
                      <div>
                        <strong>{request.student_first_name} {request.student_last_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {request.registration_number}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{request.subject_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {request.group_name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{formatDate(request.session_date)}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {formatTime(request.start_time)} - {formatTime(request.end_time)}
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      {request.request_reason || 'No reason provided'}
                      {request.supporting_document && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                          📎 Document attached
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {capitalize(request.status)}
                      </span>
                    </td>
                    <td>{formatDate(request.created_at)}</td>
                    <td>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setReviewModal({ request, action: 'approve' })}
                            disabled={processingId === request.request_id}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setReviewModal({ request, action: 'reject' })}
                            disabled={processingId === request.request_id}
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && request.review_comment && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => alert(`Review Comment: ${request.review_comment}`)}
                        >
                          View Comment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {reviewModal.action === 'approve' ? 'Approve' : 'Reject'} Absence Request
              </h3>
              <button onClick={() => setReviewModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-2">
                <strong>Student:</strong> {reviewModal.request.student_first_name} {reviewModal.request.student_last_name}
              </div>
              <div className="mb-2">
                <strong>Subject:</strong> {reviewModal.request.subject_name}
              </div>
              <div className="mb-2">
                <strong>Reason:</strong> {reviewModal.request.request_reason || 'No reason provided'}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Review Comment {reviewModal.action === 'reject' && <span style={{ color: 'red' }}>*</span>}
                </label>
                <textarea
                  className="form-control"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={`Add a comment ${reviewModal.action === 'reject' ? '(required for rejection)' : '(optional)'}`}
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReviewModal(null)}>
                Cancel
              </button>
              <button
                className={`btn ${reviewModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => reviewModal.action === 'approve' 
                  ? handleApprove(reviewModal.request.request_id)
                  : handleReject(reviewModal.request.request_id)
                }
                disabled={processingId === reviewModal.request.request_id}
              >
                {processingId === reviewModal.request.request_id 
                  ? 'Processing...' 
                  : reviewModal.action === 'approve' ? 'Approve' : 'Reject'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AbsenceRequests;
