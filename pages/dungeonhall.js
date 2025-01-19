import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Character from '../components/Character.js';

export default function DungeonGame() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);

  // Portal check effect
  useEffect(() => {
    if (showNotification) {
      setTimeout(() => {
        router.push('/mapTest');
      }, 3000);
    }
  }, [showNotification, router]);

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Layer */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/dungeon/dback.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
      />

      {/* Map Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2
        }}
      >
        <img 
          src="/dungeon/dungeonhall.png" 
          alt="Dungeon Map"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Character Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 3
        }}
      >
        <Character 
          moveRange={{ 
            x: { min: 0, max: 1000 },
            y: { min: 0, max: 800 }
          }}
          initialPosition={{ x: 500, y: 400 }}
          hairStyle="spikeyhair"
          actionType="run"
          scale={2}
          initialFacing="right"
          MOVEMENT_SPEED={10}  // Updated to use correct prop name and value
        />
      </div>

      {/* Notification Layer */}
      {showNotification && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 4
          }}
        >
          Directing you to outside world...
        </div>
      )}
    </div>
  );
}