import { useAccount, useConnect } from '@starknet-react/core';
import { useState, useEffect } from 'react';

export default function GameLogin() {
    const { connect, connectors, status } = useConnect();
    const { address } = useAccount();
    const [username, setUsername] = useState();
    const [error, setError] = useState();
    const [isConnecting, setIsConnecting] = useState(false);
    
    const controller = connectors[0];

    useEffect(() => {
        if (!address) return;
        controller?.username?.().then((name) => setUsername(name));
    }, [address, controller]);

    const handleConnect = async () => {
        if (!controller || status === 'connecting') return;
        
        try {
            setError(null);
            setIsConnecting(true);
            
            // Check if Cartridge is ready
            if (!controller.ready) {
                window.open('https://x.cartridge.gg', '_blank');
                throw new Error('Please login to Cartridge first');
            }

            await connect({ connector: controller });
        } catch (err) {
            console.error('Connection error:', err);
            setError(err.message || 'Failed to connect. Please make sure you have a Cartridge account and are logged in.');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="bg-black/80 rounded-xl p-6 w-80 text-center text-white">
            <div className="mb-6">
                <h2 className="text-xl font-bold">My Game</h2>
                <p className="text-gray-300">Connect your Cartridge account</p>
            </div>

            {address ? (
                <div className="mb-4">
                    <p>Welcome {username || address}</p>
                </div>
            ) : (
                <>
                    <button 
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        onClick={handleConnect}
                        disabled={isConnecting || !controller}
                    >
                        {isConnecting ? 'Connecting...' : 'LOG IN'}
                    </button>
                    {error && (
                        <p className="mt-2 text-red-500 text-sm">{error}</p>
                    )}
                </>
            )}

            <div className="mt-6 text-sm text-gray-400">
                <p>Need a controller? <a href="https://x.cartridge.gg" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">Sign up</a></p>
                <p>Powered by Cartridge</p>
            </div>
        </div>
    );
} 