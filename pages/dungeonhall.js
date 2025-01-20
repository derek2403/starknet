import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Character from '../components/Character.js';
import { fontSans } from '../lib/fonts';
import Inventory from '../components/inventory'

export default function DungeonHall() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const [showGamePrompt, setShowGamePrompt] = useState(false);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === '2') {
        setShowGamePrompt(true);
        setTimeout(() => {
          router.push('/gamega');
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  // Portal check effect
  useEffect(() => {
    if (showNotification) {
      setTimeout(() => {
        router.push('/mapTest');
      }, 3000);
    }
  }, [showNotification, router]);

  return (
    <main className={`${fontSans.className} min-h-screen relative`}>
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

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -60%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>
      </div>
      <Inventory />
    </main>
  );
}