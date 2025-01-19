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
        setShowMarketplace(prev => !prev);
      }
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
        style={{ backgroundImage: 'url("/background/background.jpg")' }}
      />
      <div className="flex justify-center w-screen h-screen relative">
        <div 
          className="relative w-[50%] h-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/background/community.png")' }}
        >
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

