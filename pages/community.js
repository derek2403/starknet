import React from 'react';
import Character from '../components/Character';

const CommunityPage = () => {
  const pageStyles = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundImage: 'url("/background/community.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden'
  };

  return (
    <div style={pageStyles}>
      <Character />
    </div>
  );
};

export default CommunityPage;

