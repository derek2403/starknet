import React, { useState, useEffect } from 'react';
import Boat from './Boat';
import Character from './Character';
import NPC from './NPC';

const Map = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleWheel = (e) => {
    const map = e.currentTarget;
    if (e.deltaY > 0) { // Scrolling down
      map.classList.add('zoomed-out');
    } else { // Scrolling up
      map.classList.remove('zoomed-out');
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <div 
        className={`
          w-full h-full 
          bg-[url('/background/map.png')] 
          bg-center bg-no-repeat bg-contain
          map-zoom-animation
          
        `}
        style={{
          transformOrigin: 'center center',
        }}
        // onWheel={handleWheel}
      >
        {/* Map content can be added here */}
        <Boat />
        <Character />

        <NPC 
          moveRange={{ 
          x: { min: 300, max: 450 }, // Same as initialPosition.x
          y: { min: 200, max: 400 }  // Same as initialPosition.y
          }}
          initialPosition={{ x: 450, y: 400 }}
          hairStyle="longhair"
          actionType="swim"
          scale={1}
          initialFacing="right"
          /> 

          <NPC 
          moveRange={{ 
          x: { min: 900, max: 1000 }, // Same as initialPosition.x
          y: { min: 200, max: 400 }  // Same as initialPosition.y
          }}
          initialPosition={{ x: 950, y: 200 }}
          hairStyle="shorthair"
          actionType="swim"
          scale={1}
          initialFacing="right"
          /> 

<NPC 
          moveRange={{ 
          x: { min: 350, max: 450 }, // Same as initialPosition.x
          y: { min: 200, max: 400 }  // Same as initialPosition.y
          }}
          initialPosition={{ x: 400, y: 200 }}
          hairStyle="shorthair"
          actionType="swim"
          scale={1}
          initialFacing="right"
          /> 

          <NPC 
  moveRange={{ 
    x: { min: 830, max: 830 }, // Same position for digging
    y: { min: 300, max: 300 }  
  }}
  initialPosition={{ x: 830, y: 300 }}
  hairStyle="spikeyhair"
  actionType="dig"
  scale={1}
  initialFacing="left"
/> 

<NPC 
  moveRange={{ 
    x: { min: 590, max: 590 }, // Same position for watering
    y: { min: 230, max: 230 }  
  }}
  initialPosition={{ x: 590, y: 230 }}
  hairStyle="mophair"  // or any other hair style
  actionType="watering"
  scale={1}
  initialFacing="right"
/> 



      </div>
    </div>
  );
};

export default Map;
