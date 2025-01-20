import React, { useState } from 'react';
import styles from '../styles/landingpage.module.css';
import GameLogin from '../components/GameLogin';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    setShowLogin(true);
  };

  return (
    <div 
      className={styles.container}
      onClick={!showLogin ? handleClick : undefined}
      style={{ cursor: !showLogin ? 'pointer' : 'default' }}
    >
      {!showLogin ? (
        <div className={styles.content}>
          <div className={styles.gifContainer}>
            <img 
              src="/landingpage/landing.gif"
              alt="Landing Animation"
              className={styles.landingGif}
            />
          </div>
          <div className={styles.sunnybackContainer}>
            <img 
              src="/landingpage/sunnyback.png"
              alt="Sunny Background"
              className={styles.sunnybackImage}
            />
          </div>
          <div className={styles.startText}>
            START
          </div>
        </div>
      ) : (
        <div className={styles.loginOverlay}>
          <GameLogin />
        </div>
      )}
    </div>
  );
}

// Add this to prevent static path error
export async function getStaticProps() {
  return {
    props: {}
  };
}
