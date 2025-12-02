import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaReply } from 'react-icons/fa';
import { getMessage } from '../services/teacherService';
import { formatDateTime } from '../utils/dateUtils';
import Loading from '../components/Loading';

function MessageView({ teacherId, userId }) {
  const { messageId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId_param = searchParams.get('user_id') || userId;
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessage();
  }, [messageId]);

  const loadMessage = async () => {
    try {
      const response = await getMessage(messageId, { user_id: userId });
      setMessage(response.data);
    } catch (error) {
      toast.error('Failed to load message');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!message) return <div>Message not found</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
        <FaArrowLeft /> Back
      </button>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '2rem',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {message.subject}
          </h2>
          
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                From: {message.sender_first_name} {message.sender_last_name}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {message.sender_email} ({message.sender_role})
              </div>
            </div>
            <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.875rem' }}>
              {formatDateTime(message.created_at)}
            </div>
          </div>

          {message.recipient_id == userId && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                To: {message.recipient_first_name} {message.recipient_last_name}
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          fontSize: '1rem', 
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          marginBottom: '2rem'
        }}>
          {message.content}
        </div>

        <div className="flex gap-2">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/messages/compose', { 
              state: { 
                replyTo: message,
                recipient_id: message.sender_id,
                recipient_email: message.sender_email
              }
            })}
          >
            <FaReply /> Reply
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageView;
