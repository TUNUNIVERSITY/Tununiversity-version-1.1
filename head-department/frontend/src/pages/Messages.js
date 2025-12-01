import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Messages.css';

const API_BASE_URL = 'http://localhost:4007/api';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Compose form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId && (activeTab === 'inbox' || activeTab === 'sent')) {
      fetchMessages();
    }
  }, [userId, activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'inbox' ? 'inbox' : 'sent';
      const response = await axios.get(`${API_BASE_URL}/messages/${endpoint}?user_id=${userId}`);
      setMessages(response.data.data || []);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (email) => {
    if (email.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/search-users?email=${email}`);
      setSearchResults(response.data.data || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setRecipientEmail(value);
    searchUsers(value);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setRecipientEmail(user.email);
    setSearchTerm(user.email);
    setSearchResults([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSending(true);

    try {
      // Get recipient ID
      const userResponse = await axios.get(`${API_BASE_URL}/messages/user-by-email?email=${recipientEmail}`);
      const recipientId = userResponse.data.data.user_id;

      await axios.post(`${API_BASE_URL}/messages/send`, {
        sender_id: parseInt(userId),
        recipient_id: recipientId,
        subject: subject || 'No Subject',
        content
      });

      setSuccess('Message sent successfully!');
      setRecipientEmail('');
      setSubject('');
      setContent('');
      setSelectedUser(null);
      setSearchTerm('');
      
      setTimeout(() => {
        setSuccess('');
        setActiveTab('sent');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e, message) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      await axios.post(`${API_BASE_URL}/messages/${message.message_id}/reply`, {
        sender_id: parseInt(userId),
        content: replyContent
      });

      setSuccess('Reply sent successfully!');
      setReplyingTo(null);
      setReplyContent('');
      
      setTimeout(() => {
        setSuccess('');
        fetchMessages();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>
      </div>

      <div className="messages-tabs">
        <button
          className={`tab-button ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          📥 Inbox
        </button>
        <button
          className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          📤 Sent
        </button>
        <button
          className={`tab-button ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          ✏️ Compose
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {(activeTab === 'inbox' || activeTab === 'sent') && (
        <div className="messages-list">
          {loading ? (
            <div className="loading-state">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.message_id}
                className={`message-item ${!message.is_read && activeTab === 'inbox' ? 'unread' : ''}`}
              >
                <div className="message-avatar">
                  {activeTab === 'inbox'
                    ? message.sender_first_name?.charAt(0) || '?'
                    : message.recipient_first_name?.charAt(0) || '?'}
                </div>
                <div className="message-content-wrapper">
                  <div className="message-header-row">
                    <span className="message-sender">
                      {activeTab === 'inbox'
                        ? `${message.sender_first_name} ${message.sender_last_name}`
                        : `To: ${message.recipient_first_name} ${message.recipient_last_name}`}
                    </span>
                    <span className="message-time">{formatDate(message.created_at)}</span>
                  </div>
                  <div
                    className="message-subject"
                    onClick={() => setExpandedMessage(expandedMessage === message.message_id ? null : message.message_id)}
                  >
                    {message.subject}
                  </div>
                  {expandedMessage === message.message_id ? (
                    <>
                      <div className="message-body">{message.content}</div>
                      {activeTab === 'inbox' && (
                        <>
                          <button
                            className="btn-reply"
                            onClick={() => setReplyingTo(message.message_id)}
                          >
                            ↩️ Reply
                          </button>
                          {replyingTo === message.message_id && (
                            <form className="reply-form" onSubmit={(e) => handleReply(e, message)}>
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Type your reply..."
                                rows="4"
                                required
                                disabled={sending}
                              />
                              <div className="reply-actions">
                                <button type="submit" className="btn-send" disabled={sending}>
                                  {sending ? 'Sending...' : 'Send Reply'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-cancel"
                                  onClick={() => setReplyingTo(null)}
                                  disabled={sending}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <p className="message-preview">{message.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'compose' && (
        <div className="compose-form-container">
          <form className="compose-form" onSubmit={handleSendMessage}>
            <div className="form-group">
              <label>To: *</label>
              <div className="search-container">
                <input
                  type="email"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by email..."
                  required
                  disabled={sending}
                />
                {searchResults.length > 0 && !selectedUser && (
                  <div className="search-results">
                    {searchResults.map((user) => (
                      <div
                        key={user.user_id}
                        className="search-result-item"
                        onClick={() => selectUser(user)}
                      >
                        <div className="result-name">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="result-email">
                          {user.email} • {user.role}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUser && (
                  <div className="selected-user">
                    <div>
                      <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>
                      <span> ({selectedUser.email})</span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => {
                        setSelectedUser(null);
                        setRecipientEmail('');
                        setSearchTerm('');
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject"
                disabled={sending}
              />
            </div>

            <div className="form-group">
              <label>Message: *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your message..."
                rows="8"
                required
                disabled={sending}
              />
            </div>

            <button type="submit" className="btn-send-message" disabled={sending}>
              {sending ? 'Sending...' : '📤 Send Message'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Messages;
