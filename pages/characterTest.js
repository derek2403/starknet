import React from 'react';
import Character from '../components/Character';

const CharacterTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="relative w-[500px] h-[500px] bg-white">
        <Character />
      </div>
    </div>
  );
};

export default CharacterTest;
