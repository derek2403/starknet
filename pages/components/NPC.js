import React, { useState, useEffect } from 'react';

const NPC = ({ 
  moveRange = { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
  initialPosition = { x: 0, y: 0 },
  hairStyle = 'curlyhair', // 'curlyhair', 'spikeyhair', or 'mophair'
  actionType = 'idle', // 'idle', 'run', etc.
  scale = 1 
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [position, setPosition] = useState(initialPosition);
  const [targetPosition, setTargetPosition] = useState(initialPosition);
  const [facingLeft, setFacingLeft] = useState(false);
  
  // Animation configurations for different actions
  const actionConfigs = {
    idle: {
      totalFrames: 9,
      animationSpeed: 150,
      spriteFolder: 'idle',
      stripName: '_idle_strip9'
    },
    run: {
      totalFrames: 8,
      animationSpeed: 100,
      spriteFolder: 'run',
      stripName: '_run_strip8'
    },
    attack: {
      totalFrames: 10,
      animationSpeed: 100,
      spriteFolder: 'attack',
      stripName: '_attack_strip10'
    },
    // Add more actions as needed
    // walk: { ... },
    // jump: { ... },
    // attack: { ... }
  };

  const currentAction = actionConfigs[actionType] || actionConfigs.idle;
  
  const SPRITE_WIDTH = 96;
  const SPRITE_HEIGHT = 64;
  const MOVEMENT_SPEED = 0.5;
  const BASE_SCALE_FACTOR = 1;

  // Animation frame effect
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % currentAction.totalFrames);
    }, currentAction.animationSpeed);

    return () => clearInterval(animationInterval);
  }, [currentAction]);

  // Random movement effect
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const newTargetX = Math.random() * (moveRange.x.max - moveRange.x.min) + moveRange.x.min;
      const newTargetY = Math.random() * (moveRange.y.max - moveRange.y.min) + moveRange.y.min;
      
      setTargetPosition({ x: newTargetX, y: newTargetY });
      setFacingLeft(newTargetX < position.x);
    }, 5000);

    return () => clearInterval(moveInterval);
  }, [moveRange, position]);

  // Movement update effect
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPosition(current => {
        const dx = targetPosition.x - current.x;
        const dy = targetPosition.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOVEMENT_SPEED) {
          return current;
        }

        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        return {
          x: current.x + normalizedDx * MOVEMENT_SPEED,
          y: current.y + normalizedDy * MOVEMENT_SPEED
        };
      });
    }, 16);

    return () => clearInterval(updateInterval);
  }, [targetPosition]);

  const containerStyles = {
    position: 'absolute',
    width: `${SPRITE_WIDTH}px`,
    height: `${SPRITE_HEIGHT}px`,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `scaleX(${facingLeft ? -1 : 1}) scale(${BASE_SCALE_FACTOR * scale})`,
    transition: 'transform 0.1s ease-in-out'
  };

  const spriteStyles = (isBase, hairType) => ({
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundImage: `url("/NPC/${currentAction.spriteFolder}/${isBase ? 'base' : hairType}${currentAction.stripName}.png")`,
    imageRendering: 'pixelated',
    backgroundPosition: `-${currentFrame * SPRITE_WIDTH}px 0px`,
    pointerEvents: 'none'
  });

  return (
    <div style={containerStyles}>
      <div style={spriteStyles(true)} /> {/* Base layer */}
      <div style={spriteStyles(false, hairStyle)} /> {/* Hair layer */}
    </div>
  );
};

export default NPC;
