import React, { useState, useEffect } from 'react';
import { getOrganizers, startChat } from '../../api/host';
import './Messages.scss';

function HostMessages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState({
    accepted: [],
    invited: [],
    declined: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrganizers();
      const organizersData = response.data.data || response.data.organizers || response.data;

      console.log('Organizers for messages:', organizersData);

      // Group organizers by status
      const grouped = {
        accepted: [],
        invited: [],
        declined: [],
      };

      if (Array.isArray(organizersData)) {
        organizersData.forEach((org) => {
          const organizerData = org.organizer || org;
          const status = org.status || 'invited';

          const conversation = {
            id: organizerData._id || organizerData.id,
            organizerId: organizerData._id || organizerData.id,
            name: organizerData.fullName || organizerData.name ||
                  `${organizerData.first_name || ''} ${organizerData.last_name || ''}`.trim() || 'Organizer',
            avatar: organizerData.avatar || organizerData.profile_image_url,
            event: org.event?.title || 'Event',
            eventId: org.event?._id || org.event,
            poolId: org.pool?._id || org.pool,
            lastMessage: '',
            status: status,
          };

          // Group by status
          if (status === 'accepted') {
            grouped.accepted.push(conversation);
          } else if (status === 'declined') {
            grouped.declined.push(conversation);
          } else {
            grouped.invited.push(conversation);
          }
        });
      }

      setConversations(grouped);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError(err.response?.data?.message || 'Failed to fetch organizers');
    } finally {
      setLoading(false);
    }
  };

  // Sample messages for selected conversation (no API yet)
  const messages = [];

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (messageInput.trim() && selectedConversation) {
      try {
        const chatData = {
          organizerId: selectedConversation.organizerId,
          eventId: selectedConversation.eventId,
          poolId: selectedConversation.poolId,
          message: messageInput.trim(),
        };

        console.log('Sending chat message:', chatData);
        const response = await startChat(chatData);
        console.log('Chat response:', response.data);

        setMessageInput('');
        // Note: We don't have a get messages API yet, so we can't update the messages list
      } catch (err) {
        console.error('Error sending message:', err);
        // Don't show error to user, just log it
      }
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="host-messages">
        <div className="loading-state">
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-messages">
      <div className="messages-sidebar">
        <h1>Messages</h1>

        {error && (
          <div className="error-message" style={{
            padding: '12px',
            margin: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div className="conversations-section">
          <h3 className="section-title">ACCEPTED</h3>
          <div className="conversations-list">
            {conversations.accepted.length === 0 ? (
              <p className="empty-message">No accepted invitations</p>
            ) : (
              conversations.accepted.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar && conversation.avatar.startsWith('http') ? (
                      <img src={conversation.avatar} alt={conversation.name} className="avatar-image" />
                    ) : (
                      <span className="avatar-text">{getInitials(conversation.name)}</span>
                    )}
                  </div>
                  <div className="conversation-info">
                    <span className="conversation-name">{conversation.name}</span>
                    <span className="conversation-event">{conversation.event}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="conversations-section">
          <h3 className="section-title">INVITATION SENT</h3>
          <div className="conversations-list">
            {conversations.invited.length === 0 ? (
              <p className="empty-message">No pending invitations</p>
            ) : (
              conversations.invited.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar && conversation.avatar.startsWith('http') ? (
                      <img src={conversation.avatar} alt={conversation.name} className="avatar-image" />
                    ) : (
                      <span className="avatar-text">{getInitials(conversation.name)}</span>
                    )}
                  </div>
                  <div className="conversation-info">
                    <span className="conversation-name">{conversation.name}</span>
                    <span className="conversation-event">{conversation.event}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="conversations-section">
          <h3 className="section-title">DECLINED</h3>
          <div className="conversations-list">
            {conversations.declined.length === 0 ? (
              <p className="empty-message">No declined invitations</p>
            ) : (
              conversations.declined.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar && conversation.avatar.startsWith('http') ? (
                      <img src={conversation.avatar} alt={conversation.name} className="avatar-image" />
                    ) : (
                      <span className="avatar-text">{getInitials(conversation.name)}</span>
                    )}
                  </div>
                  <div className="conversation-info">
                    <span className="conversation-name">{conversation.name}</span>
                    <span className="conversation-event">{conversation.event}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="messages-content">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-user-avatar">
                <span className="avatar-text">{getInitials(selectedConversation.name)}</span>
              </div>
              <span className="chat-user-name">{selectedConversation.name}</span>
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-bubble">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Write message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="message-input"
              />
              <button type="submit" className="send-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HostMessages;
