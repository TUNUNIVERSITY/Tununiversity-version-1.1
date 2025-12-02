import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaSearch } from 'react-icons/fa';
import { sendMessage, replyToMessage, searchUsersByEmail } from '../services/teacherService';

function ComposeMessage({ teacherId, userId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const replyTo = location.state?.replyTo;
  
  const [formData, setFormData] = useState({
    sender_id: userId,
    recipient_id: location.state?.recipient_id || '',
    subject: replyTo ? (replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`) : '',
    content: '',
    parent_message_id: replyTo?.message_id || null,
  });
  const [sending, setSending] = useState(false);
  const [emailSearch, setEmailSearch] = useState(location.state?.recipient_email || '');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (userId) {
      setFormData(prev => ({ ...prev, sender_id: userId }));
    }
  }, [userId]);

  useEffect(() => {
    if (location.state?.recipient_id && location.state?.recipient_email) {
      setSelectedUser({
        user_id: location.state.recipient_id,
        email: location.state.recipient_email,
        first_name: replyTo?.sender_first_name || '',
        last_name: replyTo?.sender_last_name || '',
        role: replyTo?.sender_role || ''
      });
    }
  }, []);

  const handleEmailSearch = async (searchTerm) => {
    setEmailSearch(searchTerm);
    
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await searchUsersByEmail(searchTerm);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setFormData({ ...formData, recipient_id: user.user_id });
    setEmailSearch(user.email);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sender_id) {
      toast.error('User authentication error. Please refresh the page.');
      return;
    }

    if (!formData.recipient_id || !formData.subject || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    console.log('Sending message with data:', formData);

    setSending(true);
    
    try {
      // Use reply endpoint if replying to a message
      if (replyTo) {
        console.log('Sending reply to message:', replyTo.message_id);
        const result = await replyToMessage(replyTo.message_id, {
          sender_id: formData.sender_id,
          content: formData.content,
        });
        console.log('Reply response:', result);
        toast.success('Reply sent successfully');
      } else {
        console.log('Sending new message');
        const result = await sendMessage(formData);
        console.log('Send response:', result);
        toast.success('Message sent successfully');
      }
      
      // Only navigate after successful send
      navigate('/messages/sent');
    } catch (error) {
      console.error('Message send error:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {replyTo && (
        <div style={{
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>
            Replying to:
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            <strong>{replyTo.sender_first_name} {replyTo.sender_last_name}</strong>
            <div style={{ marginTop: '0.25rem' }}>Subject: {replyTo.subject}</div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipient Email *</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={emailSearch}
                onChange={(e) => handleEmailSearch(e.target.value)}
                placeholder="Search by email..."
                disabled={location.state?.recipient_id || searching}
              />
            </div>
            
            {selectedUser && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {selectedUser.email} • {selectedUser.role}
                    {selectedUser.identifier && ` • ${selectedUser.identifier}`}
                  </div>
                </div>
                {!location.state?.recipient_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setFormData({ ...formData, recipient_id: '' });
                      setEmailSearch('');
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}

            {searchResults.length > 0 && !selectedUser && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                marginTop: '0.25rem',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}>
                {searchResults.map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() => selectUser(user)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {user.first_name} {user.last_name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {user.email} • {user.role}
                      {user.identifier && ` • ${user.identifier}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
            Type at least 2 characters to search for users by email
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Subject *</label>
          <input
            type="text"
            className="form-control"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Enter message subject"
            required
            maxLength="255"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message *</label>
          <textarea
            className="form-control"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter your message"
            rows="10"
            required
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={sending}>
            <FaPaperPlane />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/messages/inbox')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComposeMessage;
