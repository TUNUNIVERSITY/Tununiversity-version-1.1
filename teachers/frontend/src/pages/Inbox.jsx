import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';
import { getInboxMessages } from '../services/teacherService';
import { formatDateTime } from '../utils/dateUtils';
import { truncate } from '../utils/helpers';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function Inbox({ teacherId, userId }) {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    loadMessages();
  }, [userId, page]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // In production, get user_id from auth context
      const response = await getInboxMessages({ 
        teacher_id: userId,
        page,
        limit: 20,
      });
      setMessages(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load inbox messages');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  if (loading) return <Loading />;

  return (
    <div>
      {messages.length === 0 ? (
        <EmptyState message="No messages in inbox" />
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr 
                    key={message.message_id}
                    style={{ 
                      fontWeight: message.is_read ? 'normal' : '600',
                      backgroundColor: message.is_read ? 'white' : '#f8fafc'
                    }}
                  >
                    <td>
                      {message.is_read ? (
                        <FaEnvelopeOpen style={{ color: '#94a3b8' }} />
                      ) : (
                        <FaEnvelope style={{ color: 'var(--primary-color)' }} />
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>{message.sender_first_name} {message.sender_last_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {message.sender_role}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{message.subject}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {truncate(message.content, 60)}
                        </div>
                      </div>
                    </td>
                    <td>{formatDateTime(message.created_at)}</td>
                    <td>
                      <Link 
                        to={`/messages/${message.message_id}?user_id=${teacherId}`}
                        className="btn btn-primary btn-sm"
                      >
                        Read
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-3">
              <div style={{ color: '#64748b' }}>
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalItems} total messages)
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Inbox;
