import React, { useState } from 'react';
import styles from '../styles/landingpage.module.css';
import GameLogin from '../components/GameLogin';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    setShowLogin(true);
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/landingpage/landing.gif')" }}
    >
      <GameLogin />
    </div>
  );
}

// Add this to prevent static path error
export async function getStaticProps() {
  return {
    props: {}
  };
}
