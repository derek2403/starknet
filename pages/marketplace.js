import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import Character from '../components/Character'

const inter = Inter({ subsets: ['latin'] })

export default function Marketplace() {
  const [showNoBuy, setShowNoBuy] = useState(false)

  const handleKeyPress = (event) => {
    if (event.key === '1') {
      setShowNoBuy(prev => !prev)
    }
  }

  // Add event listener when component mounts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    
    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <main className={`${inter.className} min-h-screen relative`}>
      {/* Background - lowest layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/background/market.gif')" }}
      />

      {/* Map Layer */}
      <div className="absolute inset-0 z-1 flex items-center justify-center">
        <img 
          src="/notif/market.gif"
          alt="Market Map"
          className="max-w-[80%] h-auto"
        />
      </div>

      {/* Character Layer */}
      <div className="absolute inset-0 z-10">
        <Character 
          moveRange={{ 
            x: { min: 200, max: 800 },
            y: { min: 200, max: 600 }
          }}
          initialPosition={{ x: 500, y: 400 }}
          hairStyle="spikeyhair"
          actionType="run"
          scale={2.5}
          initialFacing="right"
          MOVEMENT_SPEED={10}
        />
      </div>

      {/* Notification Layer - highest layer */}
      {showNoBuy && (
        <img 
          src="/notif/nobuy.png"
          alt="No Buy Notification"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full h-auto z-20"
        />
      )}
    </main>
  )
}
