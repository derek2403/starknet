import React, { useState, useEffect } from 'react';
import Boat from './Boat';

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
        onWheel={handleWheel}
      >
        {/* Map content can be added here */}
        <Boat />
      </div>
    </div>
  );
};

export default Map;
