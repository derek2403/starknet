import { useAccount, useConnect } from '@starknet-react/core';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GameLogin() {
    const router = useRouter();
    const { connect, connectors, status } = useConnect();
    const { address } = useAccount();
    const [username, setUsername] = useState('');
    const [error, setError] = useState();
    const [isConnecting, setIsConnecting] = useState(false);
    
    const controller = connectors[0];

    const truncateAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    useEffect(() => {
        if (!address) return;
        const timer = setTimeout(() => {
            router.push('/map');
        }, 5000);
        return () => clearTimeout(timer);
    }, [address, router]);

    const handleConnect = async () => {
        if (!controller || status === 'connecting') return;
        
        try {
            setError(null);
            setIsConnecting(true);
            
            if (!controller.ready) {
                window.open('https://x.cartridge.gg', '_blank');
                throw new Error('Please login to Cartridge first');
            }

            await connect({ connector: controller });
        } catch (err) {
            console.error('Connection error:', err);
            setError(err.message || 'Failed to connect');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

            {/* Login Card */}
            <div className="w-[280px] bg-gray-900 rounded-lg overflow-hidden shadow-xl z-10 animate-fadeIn">
                {/* Game Cover with Title */}
                <div className="h-40 relative overflow-hidden">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/landingpage/landing.gif')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900" />
                    
                    {/* Text Logo in Top Right */}
                    <div className="absolute top-3 right-3">
                        <h2 className="text-3xl font-bold text-white transform rotate-[-5deg] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            SUNNY
                        </h2>
                        <h2 className="text-3xl font-bold text-emerald-400 transform rotate-[-5deg] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            FARM
                        </h2>
                    </div>

                    {/* Title Text */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-2xl font-bold text-white">Welcome to Sunny Farm</h1>
                        <p className="text-sm text-gray-300">Enter your Cartridge username</p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-800 text-white rounded px-3 py-2 mb-4 border border-gray-700 focus:border-emerald-500 focus:outline-none"
                    />

                    {address ? (
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden">
                                <img 
                                    src="/landingpage/sunnyback.png"
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-emerald-500 font-medium">{truncateAddress(address)}</p>
                            <p className="text-sm text-gray-400">Redirecting...</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="w-full bg-emerald-500 text-white rounded py-2 font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {isConnecting ? 'Connecting...' : 'LOG IN with Wallet'}
                        </button>
                    )}

                    {error && (
                        <p className="mt-2 text-red-500 text-sm text-center">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-800 text-center">
                    <p className="text-xs text-gray-400">
                        Powered by{' '}
                        <a href="https://x.cartridge.gg" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">
                            Cartridge
                        </a>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
} 