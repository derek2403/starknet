import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Forum.module.css';

const Forum = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: newMessage,
        sender: 'Player'
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Community Forum</h1>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div ref={chatBoxRef} className={styles.chatBox}>
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`${styles.message} ${
                msg.sender === 'Player' ? styles.playerMessage : styles.otherMessage
              }`}
            >
              <span className={styles.sender}>{msg.sender}: </span>
              <span className={styles.messageText}>{msg.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={styles.input}
            placeholder="Type your message..."
          />
          <button type="submit" className={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Forum;
