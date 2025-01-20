import { useState } from 'react'

export default function Inventory() {
  const [showInventory, setShowInventory] = useState(false)

  const toggleInventory = () => {
    setShowInventory(prev => !prev)
  }

  return (
    <div className="fixed top-4 right-4 z-20">
      <button 
        onClick={toggleInventory}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Inventory
      </button>

      {showInventory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="relative">
            <img 
              src="/notif/noinvet.png" 
              alt="No Inventory"
              className="max-w-[80vw] max-h-[80vh] object-contain"
            />
            <button 
              onClick={toggleInventory}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}