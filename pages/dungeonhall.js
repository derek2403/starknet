import React, { useState, useEffect } from 'react';
import styles from '../styles/DungeonGame.module.css';
import { useRouter } from 'next/router';

const actions = ['a1', 'a1', 'a1', 'a1', 'a1', 'a1', 'a1', 
                'a1', 'a1', 'a1', 'a1', 'a1', 'a1', 'a1', 'a1'];

export default function DungeonGame() {
  const router = useRouter();
  const [position, setPosition] = useState({ x: 538, y: 542 });
  const [characterLoaded, setCharacterLoaded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const MOVE_SPEED = 30;
  const PORTAL_X = 100;
  const PORTAL_THRESHOLD = 20; // Detection range for portal

  useEffect(() => {
    console.log("All dungeon actions:", actions);
    
    // Only handle dungeon moves here
    const dungeonMoves = actions.filter(action => action.length === 2);
    console.log("Dungeon movements:", dungeonMoves);
    console.log("Number of dungeon moves:", dungeonMoves.length);

    // Check if character is near the portal
    if (Math.abs(position.x - PORTAL_X) <= PORTAL_THRESHOLD && !showNotification) {
      setShowNotification(true);
      
      // Wait 3 seconds then redirect
      setTimeout(() => {
        router.push('/realrealworld');
      }, 3000);
    }
  }, [position.x]);

  useEffect(() => {
    const characterImage = new Image();
    characterImage.src = '/human.png';
    characterImage.onload = () => setCharacterLoaded(true);

    const handleKeyPress = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w':
          setPosition(prev => ({ ...prev, y: prev.y - MOVE_SPEED }));
          break;
        case 's':
          setPosition(prev => ({ ...prev, y: prev.y + MOVE_SPEED }));
          break;
        case 'a':
          setPosition(prev => ({ ...prev, x: prev.x - MOVE_SPEED }));
          break;
        case 'd':
          setPosition(prev => ({ ...prev, x: prev.x + MOVE_SPEED }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!characterLoaded) {
    return <div>Loading assets...</div>;
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.map}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className={styles.mapVideo}
        >
          <source src="/dungeon/mapmap.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div 
          className={styles.character}
          style={{
            backgroundImage: 'url(/human.png)',
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        />
        {showNotification && (
          <div className={styles.notification}>
            Directing you to outside world...
          </div>
        )}
      </div>
    </div>
  );
}
