import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Character = ({ scale = 1 }) => {
  const router = useRouter();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [initialPosition] = useState({ x: 523, y: 280 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const SPRITE_WIDTH = 96;
  const SPRITE_HEIGHT = 64;
  const TOTAL_FRAMES = 8;
  const ANIMATION_SPEED = 100; // Adjusted to match cat's animation speed
  const MOVEMENT_SPEED = 1;
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

  // Movement and key handling
  useEffect(() => {
    const keys = new Set();
    let moveInterval;

    const handleKeyDown = (e) => {
      const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!validKeys.includes(e.key)) return;

      if (!keys.has(e.key)) {
        keys.add(e.key);
        setIsMoving(true);
        
        if (e.key === 'ArrowLeft') setFacingLeft(true);
        if (e.key === 'ArrowRight') setFacingLeft(false);
        
        if (!moveInterval) {
          moveInterval = setInterval(() => {
            updatePosition(keys);
          }, 16);
        }
      }
    };

    const handleKeyUp = (e) => {
      keys.delete(e.key);
      if (keys.size === 0) {
        setIsMoving(false);
        clearInterval(moveInterval);
        moveInterval = null;
      }
    };

    const updatePosition = (keys) => {
      setOffset(prev => {
        let deltaX = 0;
        let deltaY = 0;

        if (keys.has('ArrowLeft')) deltaX -= 1;
        if (keys.has('ArrowRight')) deltaX += 1;
        if (keys.has('ArrowUp')) deltaY -= 1;
        if (keys.has('ArrowDown')) deltaY += 1;

        // Normalize diagonal movement
        if (deltaX !== 0 && deltaY !== 0) {
          const normalizer = 1 / Math.sqrt(2);
          deltaX *= normalizer;
          deltaY *= normalizer;
        }

        const newOffsetX = prev.x + (deltaX * MOVEMENT_SPEED);
        const newOffsetY = prev.y + (deltaY * MOVEMENT_SPEED);

        // Calculate absolute position
        const absoluteX = Math.round(initialPosition.x + newOffsetX);
        const absoluteY = Math.round(initialPosition.y + newOffsetY);
        
        console.log(`Character Position - X: ${absoluteX}, Y: ${absoluteY}`);

        // Check if character is at the specific position
        if (absoluteX === 523 && absoluteY === 255) {
          router.push('/community');
        }

        return { x: newOffsetX, y: newOffsetY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (moveInterval) {
        clearInterval(moveInterval);
      }
    };
  }, []);

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
    left: `${initialPosition.x + offset.x}px`,
    top: `${initialPosition.y + offset.y}px`,
    transform: `scaleX(${facingLeft ? -1 : 1}) scale(${BASE_SCALE_FACTOR * scale})`,
    transition: 'transform 0.1s ease-in-out',
    pointerEvents: 'none'
  });

  return (
    <div style={containerStyles}>
      <div style={spriteStyles(true)} /> {/* Base layer */}
      <div style={spriteStyles(false)} /> {/* Hair layer */}
    </div>
  );
};

export default Character;
