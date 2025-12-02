import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Messages.css';

const API_BASE_URL = 'http://localhost:4003/api';

function Messages() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Expanded message state
  const [expandedMessage, setExpandedMessage] = useState(null);
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Compose state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Try to get from user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.id) {
            setUserId(user.id);
            // Store it for future use
            localStorage.setItem('userId', user.id);
          } else {
            setError('User ID not found in stored data');
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
          setError('Invalid user data');
        }
      } else {
        setError('User not authenticated');
      }
    }
  }, []);

  useEffect(() => {
    if (userId && (activeTab === 'inbox' || activeTab === 'sent')) {
      fetchMessages();
    }
  }, [activeTab, userId]);

  const fetchMessages = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === 'inbox' ? 'inbox' : 'sent';
      const response = await axios.get(`${API_BASE_URL}/messages/${endpoint}?user_id=${userId}`);
      setMessages(response.data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(`Failed to fetch ${activeTab} messages`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (email) => {
    if (email.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/messages/search-users?email=${email}`);
      setSearchResults(response.data.data || []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleSelectUser = (user) => {
    setRecipientEmail(user.email);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!recipientEmail || !content || !content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!userId) {
      setError('User not authenticated. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get recipient ID from email
      const userResponse = await axios.get(`${API_BASE_URL}/messages/user-by-email?email=${recipientEmail}`);
      const recipientId = userResponse.data.data.user_id;

      const messageData = {
        sender_id: parseInt(userId),
        recipient_id: parseInt(recipientId),
        subject: (subject && subject.trim()) ? subject.trim() : 'No Subject',
        content: content.trim()
      };

      console.log('Sending message with data:', messageData);

      await axios.post(`${API_BASE_URL}/messages/send`, messageData);

      // Clear form
      setRecipientEmail('');
      setSubject('');
      setContent('');
      setActiveTab('sent');
      
      // Show success message briefly
      setError(null);
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyContent.trim()) {
      setError('Reply content cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await axios.post(`${API_BASE_URL}/messages/${messageId}/reply`, {
        sender_id: parseInt(userId),
        content: replyContent
      });

      setReplyingTo(null);
      setReplyContent('');
      fetchMessages();
      alert('Reply sent successfully!');
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const toggleMessage = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
    setReplyingTo(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessageList = () => {
    if (loading) {
      return <div className="message-loading">Loading messages...</div>;
    }

    if (messages.length === 0) {
      return <div className="no-messages">No messages in {activeTab}</div>;
    }

    return (
      <div className="message-list">
        {messages.map((message) => (
          <div key={message.message_id} className="message-item-wrapper">
            <div
              className={`message-item ${!message.is_read && activeTab === 'inbox' ? 'unread' : ''} ${
                expandedMessage === message.message_id ? 'expanded' : ''
              }`}
              onClick={() => toggleMessage(message.message_id)}
            >
              <div className="message-header">
                <div className="message-sender">
                  <div className="message-avatar">
                    {activeTab === 'inbox' 
                      ? message.sender_name?.charAt(0) || 'U'
                      : message.recipient_name?.charAt(0) || 'U'
                    }
                  </div>
                  <div className="message-info">
                    <div className="message-name">
                      {activeTab === 'inbox' ? message.sender_name : message.recipient_name}
                    </div>
                    <div className="message-email">
                      {activeTab === 'inbox' ? message.sender_email : message.recipient_email}
                    </div>
                  </div>
                </div>
                <div className="message-meta">
                  <span className="message-date">{formatDate(message.created_at)}</span>
                  {!message.is_read && activeTab === 'inbox' && (
                    <span className="unread-indicator">●</span>
                  )}
                </div>
              </div>
              
              <div className="message-subject">{message.subject}</div>
              
              {expandedMessage === message.message_id && (
                <div className="message-content">
                  <p>{message.content}</p>
                </div>
              )}
            </div>

            {expandedMessage === message.message_id && activeTab === 'inbox' && (
              <div className="message-actions">
                {replyingTo === message.message_id ? (
                  <div className="reply-form">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply..."
                      rows="4"
                    />
                    <div className="reply-buttons">
                      <button 
                        className="btn-send-reply"
                        onClick={() => handleReply(message.message_id)}
                        disabled={loading}
                      >
                        Send Reply
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn-reply"
                    onClick={() => setReplyingTo(message.message_id)}
                  >
                    Reply
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCompose = () => {
    return (
      <div className="compose-container">
        <form onSubmit={handleSendMessage} className="compose-form">
          <div className="form-group">
            <label>To (Email) *</label>
            <div className="search-input-wrapper">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  handleSearchUsers(e.target.value);
                }}
                onFocus={() => recipientEmail.length >= 2 && setShowSearchResults(true)}
                placeholder="Enter recipient email"
                required
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="search-result-item"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="search-result-name">{user.name}</div>
                      <div className="search-result-email">{user.email}</div>
                      <div className="search-result-role">{user.role}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject (optional)"
            />
          </div>

          <div className="form-group">
            <label>Message *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              rows="8"
              required
            />
          </div>

          <button type="submit" className="btn-send" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-tabs">
        <button
          className={`tab-button ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
           Inbox
        </button>
        <button
          className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
           Sent
        </button>
        <button
          className={`tab-button ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          Compose
        </button>
      </div>

      <div className="messages-content">
        {activeTab === 'compose' ? renderCompose() : renderMessageList()}
      </div>
    </div>
  );
}

export default Messages;
