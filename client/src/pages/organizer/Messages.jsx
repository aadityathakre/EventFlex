import React, { useState } from 'react';
import './Messages.scss';

function OrganizerMessages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const conversations = {
    applicationAccepted: [
      {
        id: 1,
        name: 'Iswaran',
        avatar: 'IS',
        event: 'Wedding #1',
        lastMessage: 'Hello thanks for your invitation...',
        status: 'accepted',
      },
    ],
    applicationReceived: [
      {
        id: 2,
        name: 'Iswaran',
        avatar: 'IS',
        event: 'Wedding #2',
        lastMessage: '',
        status: 'received',
      },
      {
        id: 3,
        name: 'Iswaran',
        avatar: 'IS',
        event: 'Corporate Event',
        lastMessage: '',
        status: 'received',
      },
      {
        id: 4,
        name: 'Iswaran',
        avatar: 'IS',
        event: 'Birthday Party',
        lastMessage: '',
        status: 'received',
      },
    ],
    applicationRejected: [
      {
        id: 5,
        name: 'Iswaran',
        avatar: 'IS',
        event: 'Conference',
        lastMessage: '',
        status: 'rejected',
      },
      {
        id: 6,
        name: 'Iswaran',
        avatar: 'IS',
        event: 'Festival',
        lastMessage: '',
        status: 'rejected',
      },
    ],
  };

  const messages = [
    {
      id: 1,
      text: 'Hello thanks for your invitation, i think i am good to organize it starting tmrw',
      sender: 'them',
      timestamp: '10:30 AM',
    },
  ];

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log('Send message:', messageInput);
      setMessageInput('');
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

  return (
    <div className="organizer-messages">
      <div className="messages-sidebar">
        <h1>Messages</h1>

        <div className="conversations-section">
          <h3 className="section-title">APPLICATION ACCEPTED</h3>
          <div className="conversations-list">
            {conversations.applicationAccepted.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="conversation-avatar">
                  <span className="avatar-text">{conversation.avatar}</span>
                </div>
                <div className="conversation-info">
                  <span className="conversation-name">{conversation.name}</span>
                  <span className="conversation-event">{conversation.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="conversations-section">
          <h3 className="section-title">APPLICATION RECEIVED</h3>
          <div className="conversations-list">
            {conversations.applicationReceived.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="conversation-avatar">
                  <span className="avatar-text">{conversation.avatar}</span>
                </div>
                <div className="conversation-info">
                  <span className="conversation-name">{conversation.name}</span>
                  <span className="conversation-event">{conversation.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="conversations-section">
          <h3 className="section-title">APPLICATION REJECTED</h3>
          <div className="conversations-list">
            {conversations.applicationRejected.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="conversation-avatar">
                  <span className="avatar-text">{conversation.avatar}</span>
                </div>
                <div className="conversation-info">
                  <span className="conversation-name">{conversation.name}</span>
                  <span className="conversation-event">{conversation.event}</span>
                </div>
              </div>
            ))}
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

export default OrganizerMessages;
