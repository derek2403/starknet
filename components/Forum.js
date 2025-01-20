import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Forum.module.css';
import { useForumContract } from '../hooks/useForumContract';

const Forum = ({ onClose }) => {
  const { messages, sendMessage, isReady } = useForumContract();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (!isReady) {
      setError('Waiting for Dojo to initialize...');
      return;
    }

    if (newMessage.trim() && !isSending) {
      setIsSending(true);
      try {
        console.log('Sending message:', newMessage);
        const success = await sendMessage(newMessage);
        console.log('Message sent:', success);
        if (success) {
          setNewMessage('');
        } else {
          setError('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Error sending message: ' + error.message);
      } finally {
        setIsSending(false);
      }
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
                msg.sender === 'You' ? styles.playerMessage : styles.otherMessage
              }`}
            >
              <span className={styles.sender}>{msg.sender}</span>
              <span className={styles.messageText}>{msg.text}</span>
              <span className={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={styles.input}
            placeholder="Type your message..."
            disabled={isSending || !isReady}
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={isSending || !isReady}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Forum;
