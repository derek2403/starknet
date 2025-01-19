import React, { useState, useEffect } from 'react';
import styles from '../styles/DungeonGame.module.css';
import { useRouter } from 'next/router';
import NPC from '../pages/components/NPC.js';

const actions = ['a1', 'a1', 'a1', 'a1', 'a1', 'a1', 'a1', 
                'a1', 'a1', 'a1', 'a1', 'a1', 'a1', 'a1', 'a1'];

export default function DungeonGame() {
  const router = useRouter();
  const [position, setPosition] = useState({ x: 907, y: 733 });
  const [characterLoaded, setCharacterLoaded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const MOVE_SPEED = 30;
  const PORTAL_X = 657;
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
    <div className={styles.gameContainer}
         style={{
           backgroundImage: 'url(/dungeon/dback.gif)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <div className={styles.map}>
        <img 
          src="/dungeon/dungeonhall.png" 
          alt="Dungeon Map"
          className={styles.mapImage}
        />
        <div 
          className={styles.character}
          style={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <NPC 
            moveRange={{ x: { min: 0, max: 0 }, y: { min: 0, max: 0 }}}
            initialPosition={{ x: 0, y: 0 }}
            hairStyle="spikeyhair"
            actionType="idle"
            scale={3.5}
          />
        </div>
        {showNotification && (
          <div className={styles.notification}>
            Directing you to outside world...
          </div>
        )}
      </div>
    </div>
  );
}
