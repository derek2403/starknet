import React, { useState, useEffect } from 'react';

const Boat = () => {
  const [position, setPosition] = useState(0); // Start at 300px from left
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const speed = 2; // pixels per frame
  
  // Map dimensions
  const MAP_WIDTH = 930; // original map width
  const SCALE = 1.7; // matches the CSS scale value
  const BOAT_WIDTH = 100;

  useEffect(() => {
    const moveBoat = () => {
      setPosition((prevPosition) => {
        const newPosition = prevPosition + speed * direction;

        // Check if boat reached map edges
        if (newPosition >= MAP_WIDTH - BOAT_WIDTH) {
          setDirection(-1);
          return MAP_WIDTH - BOAT_WIDTH;
        } else if (newPosition <= 0) {
          setDirection(1);
          return 0;
        }

        return newPosition;
      });
    };

    const animationFrame = setInterval(moveBoat, 50);

    return () => clearInterval(animationFrame);
  }, [direction]);

  return (
    <div 
      style={{ 
        position: 'absolute',
        left: `${position + 300}px`, // Add 300px offset to the dynamic position
        top: '155px',
        transform: `scaleX(${direction})`,
        width: '100px',
        height: '100px',
        zIndex: 10,
      }}
    >
      <img
        src="/background/boat.gif"
        alt="Moving boat"
        style={{ 
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default Boat;
