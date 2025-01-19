import React, { useState, useEffect } from 'react';
import Character from '../components/Character';
import Marketplace from '../components/Marketplace';
import Forum from '../components/Forum';
import NPC from '../components/NPC';

const CommunityPage = () => {
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showForum, setShowForum] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '2') {
        setShowForum(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/background/beach.gif")' }}
      />
      <div className="flex justify-center w-screen h-screen relative">
        <div 
          className="relative w-[50%] h-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/background/community.png")' }}
        >
          <NPC 
          moveRange={{ 
          x: { min: 400, max: 400 }, // Same as initialPosition.x
          y: { min: 200, max: 200 }  // Same as initialPosition.y
          }}
          initialPosition={{ x: 400, y: 200 }}
          hairStyle="mophair"
          actionType="idle"
          scale={2}
          initialFacing="left"
          />  

          <NPC 
          moveRange={{ 
          x: { min: 150, max: 150 }, // Same as initialPosition.x
          y: { min: 300, max: 300 }  // Same as initialPosition.y
          }}
          initialPosition={{ x: 150, y: 300 }}
          hairStyle="curlyhair"
          actionType="idle"
          scale={2}
          initialFacing="right"
          />  

          <NPC 
          moveRange={{ 
          x: { min: 600, max: 600 }, // Same as initialPosition.x
          y: { min: 400, max: 400 }  // Same as initialPosition.y
          }}
          initialPosition={{ x: 600, y: 400 }}
          hairStyle="spikeyhair"
          actionType="idle"
          scale={2}
          initialFacing="right"
          /> 

          <Character scale={2} />
          {showMarketplace && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="w-[50%]">
                <Marketplace />
              </div>
            </div>
          )}
          {showForum && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="w-[50%]">
                <Forum onClose={() => setShowForum(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;

