import { useConnectors, useAccount } from '@starknet-react/core';
import { useState } from 'react';
import { InjectedConnector } from '@starknet-react/core';

export function WalletConnect() {
  const { connect, disconnect, available } = useConnectors();
  const { address, isConnected } = useAccount();
  const [error, setError] = useState('');

  console.log("WalletConnect rendering:", {
    available,
    isConnected,
    address,
    hasConnectors: available?.length > 0
  });

  const handleConnect = async (connector) => {
    try {
      setError('');
      await connect(connector);
    } catch (err) {
      setError(err.message);
      console.error('Connection error:', err);
    }
  };

  const buttonStyle = {
    padding: '10px 20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(5px)',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
    width: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 9999,
    }}>
      {isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            fontSize: '12px',
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            marginBottom: '4px'
          }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <button 
            onClick={disconnect}
            style={{
              ...buttonStyle,
              background: 'rgba(220, 53, 69, 0.7)', // Red tint for disconnect
              borderColor: 'rgba(220, 53, 69, 0.3)'
            }}
          >
            <span>⏻</span> Disconnect
          </button>
        </div>
      ) : (
        <div>
          {available && available.length > 0 ? (
            available.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                style={buttonStyle}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>🔗</span> Connect Wallet
              </button>
            ))
          ) : (
            <button
              onClick={() => {
                const braavosConnector = new InjectedConnector({ 
                  options: { 
                    id: 'braavos',
                    name: 'Braavos Wallet'
                  }
                });
                handleConnect(braavosConnector);
              }}
              style={buttonStyle}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>🔗</span> Connect Wallet
            </button>
          )}
          {error && <p style={{ 
            color: '#ff4444', 
            marginTop: '8px', 
            fontSize: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>{error}</p>}
        </div>
      )}
    </div>
  );
}