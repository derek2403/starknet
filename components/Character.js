import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDojoContract } from '../hooks/useDojoContract';
import { useAccount } from '@starknet-react/core';

const Character = ({ scale = 1 }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { position, spawn, move, isInitialized, isConnected, connectWallet } = useDojoContract();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  // Define spawn points and speeds for different pages
  const pageSettings = {
    '/community': { 
      spawn: { x: 300, y: 400 },
      speed: 3  // Faster speed for community page
    },
    '/mapTest': { 
      spawn: { x: 523, y: 280 },
      speed: 1  // Normal speed for mapTest page
    }
  };

  // Set initial position and movement speed based on current page
  const [initialPosition] = useState(pageSettings[router.pathname]?.spawn || { x: 523, y: 280 });
  const MOVEMENT_SPEED = pageSettings[router.pathname]?.speed || 1;

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const SPRITE_WIDTH = 96;
  const SPRITE_HEIGHT = 64;
  const TOTAL_FRAMES = 8;
  const ANIMATION_SPEED = 100; // Adjusted to match cat's animation speed
  const BASE_SCALE_FACTOR = 1;

  // Animation frame effect - only runs when character is moving
  useEffect(() => {
    let animationInterval;
    if (isMoving) {
      animationInterval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % TOTAL_FRAMES);
      }, ANIMATION_SPEED);
    } else {
      setCurrentFrame(0); // Reset to first frame when static
    }

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [isMoving]);

  // Spawn character when component mounts
  useEffect(() => {
    if (address) {
      spawn();
    }
  }, [address]);

  // Update movement handling
  useEffect(() => {
    if (!address || !isInitialized) return;

    const handleKeyDown = (e) => {
      const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!validKeys.includes(e.key)) return;

      setIsMoving(true);
      if (e.key === 'ArrowLeft') setFacingLeft(true);
      if (e.key === 'ArrowRight') setFacingLeft(false);

      move(e.key, true); // true for keydown
    };

    const handleKeyUp = (e) => {
      const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!validKeys.includes(e.key)) return;

      move(e.key, false); // false for keyup
      
      // Only stop moving animation if no keys are pressed
      if (!validKeys.some(key => key !== e.key && isKeyPressed(key))) {
        setIsMoving(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [address, isInitialized, move]);

  // Helper function to check if a key is currently pressed
  const isKeyPressed = (key) => {
    return document.querySelector(`[data-key="${key}"]`)?.getAttribute('aria-pressed') === 'true';
  };

  const containerStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent'
  };

  const spriteStyles = (isBase) => ({
    width: `${SPRITE_WIDTH}px`,
    height: `${SPRITE_HEIGHT}px`,
    backgroundImage: `url("/character/${isBase ? 'base' : 'bowlhair'}_run_strip8.png")`,
    imageRendering: 'pixelated',
    backgroundPosition: `-${currentFrame * SPRITE_WIDTH}px 0px`,
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `scaleX(${facingLeft ? -1 : 1}) scale(${BASE_SCALE_FACTOR * scale})`,
    transition: 'transform 0.1s ease-in-out',
    pointerEvents: 'none'
  });

  // Add a connect wallet button if not connected
  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4">
        <button 
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={{
        ...spriteStyles(true),
        left: `${position.x}px`,
        top: `${position.y}px`
      }} />
      <div style={{
        ...spriteStyles(false),
        left: `${position.x}px`,
        top: `${position.y}px`
      }} />
    </div>
  );
};

export default Character;
