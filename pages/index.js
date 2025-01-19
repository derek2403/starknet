import React from 'react';
import styles from '../styles/landingpage.module.css';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/mapTest');  // Navigate to mapTest.js when clicked
  };

  return (
    <div 
      className={styles.container}
      onClick={handleClick}  // Add click handler to the entire container
      style={{ cursor: 'pointer' }}  // Add pointer cursor to indicate clickable
    >
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
    </div>
  );
}
