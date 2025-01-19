import React, { useState, useEffect } from 'react';
import Character from '../components/Character';
import Marketplace from '../components/Marketplace';
import Forum from '../components/Forum';

const CommunityPage = () => {
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showForum, setShowForum] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '1') {
        setShowMarketplace(prev => !prev); // Toggle marketplace visibility
      }
      if (e.key === '2') {
        setShowForum(prev => !prev); // Toggle forum visibility
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex justify-center w-screen h-screen bg-black">
      <div 
        className="relative w-[50%] h-full bg-contain bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: 'url("/background/community.png")' }}
      >
        <Character scale={2} />
        {showMarketplace && (
          <div className="absolute inset-0 bg-black bg-opacity-50">
            <Marketplace />
          </div>
        )}
        {showForum && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Forum onClose={() => setShowForum(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;

