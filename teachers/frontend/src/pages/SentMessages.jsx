import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSentMessages } from '../services/teacherService';
import { formatDateTime } from '../utils/dateUtils';
import { truncate } from '../utils/helpers';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function SentMessages({ teacherId, userId }) {
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
      const response = await getSentMessages({ 
        teacher_id: userId,
        page,
        limit: 20,
      });
      setMessages(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load sent messages');
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
        <EmptyState message="No sent messages" />
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>To</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.message_id}>
                    <td>
                      <div>
                        <strong>{message.recipient_first_name} {message.recipient_last_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {message.recipient_role}
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
                      {message.is_read ? (
                        <span className="badge badge-success">Read</span>
                      ) : (
                        <span className="badge badge-secondary">Unread</span>
                      )}
                      {message.read_at && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {formatDateTime(message.read_at)}
                        </div>
                      )}
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

export default SentMessages;
