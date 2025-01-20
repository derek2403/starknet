import { GeistSans } from 'geist/font'
import { useState, useEffect } from 'react'
import Inventory from '../components/inventory'

const font = GeistSans

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
    <main className={`${font.className} min-h-screen bg-sky-100 flex justify-center items-center relative`}>
      <img 
        src="/notif/market.gif"
        alt="Market Animation"
        className="max-w-full h-auto"
      />
      {showNoBuy && (
        <img 
          src="/notif/nobuy.png"
          alt="No Buy Notification"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full h-auto z-10"
        />
      )}
      <Inventory />
    </main>
  )
}
