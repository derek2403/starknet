import { useState, useEffect } from 'react';
import { connect } from '@braavos-wallet/connect';

export default function Game() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    
    // ... existing wallet connection code ...

    // Add UI overlay component
    const GameOverlay = ({ score, highScore, loading, saveStatus }) => (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div>
                <div>Score: {score}</div>
                <div>High Score: {highScore}</div>
            </div>
            {loading && (
                <div style={{
                    padding: '10px',
                    background: '#333',
                    borderRadius: '5px'
                }}>
                    Loading...
                </div>
            )}
            {saveStatus && (
                <div style={{
                    padding: '10px',
                    background: saveStatus.includes('Error') ? '#ff4444' : '#44ff44',
                    borderRadius: '5px',
                    opacity: 1,
                    transition: 'opacity 0.5s',
                }}>
                    {saveStatus}
                </div>
            )}
        </div>
    );

    // Update the MainScene class
    class MainScene extends Phaser.Scene {
        // ... existing scene code ...

        async saveGameState() {
            if (!wallet) return;

            try {
                setSaveStatus('Saving...');
                setLoading(true);

                const gameState = {
                    score: this.score,
                    moveCount: this.moveCount,
                    highScore: Math.max(this.score, this.highScore),
                    timestamp: Date.now(),
                    grid: this.grid.map(row => 
                        row.map(orb => orb ? orb.getData('type') : null)
                    )
                };

                // Convert the 2D grid to match the contract's Array2D structure
                const flatGrid = gameState.grid.flat();
                const contractGameState = {
                    score: gameState.score,
                    move_count: gameState.moveCount,
                    high_score: gameState.highScore,
                    timestamp: gameState.timestamp,
                    grid: {
                        rows: gameState.grid.length,
                        cols: gameState.grid[0].length,
                        data: flatGrid
                    }
                };

                const tx = await wallet.execute({
                    contractAddress: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS,
                    entrypoint: 'save_game_state',
                    calldata: [contractGameState]  // Use the modified structure
                });

                setSaveStatus('Game Saved!');
                setTimeout(() => setSaveStatus(''), 2000);
            } catch (error) {
                setSaveStatus('Error: Failed to save');
                console.error('Failed to save game state:', error);
            } finally {
                setLoading(false);
            }
        }

        async loadGameState() {
            if (!wallet) return;

            try {
                setLoading(true);
                setSaveStatus('Loading...');

                const savedState = await wallet.call({
                    contractAddress: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS,
                    entrypoint: 'get_game_state'
                });

                if (savedState) {
                    // Convert the flat grid back to 2D
                    const grid2D = [];
                    for (let i = 0; i < savedState.grid.rows; i++) {
                        const row = [];
                        for (let j = 0; j < savedState.grid.cols; j++) {
                            row.push(savedState.grid.data[i * savedState.grid.cols + j]);
                        }
                        grid2D.push(row);
                    }
                    savedState.grid = grid2D;
                    
                    // ... rest of loading logic ...
                    setSaveStatus('Game Loaded!');
                    setTimeout(() => setSaveStatus(''), 2000);
                }
            } catch (error) {
                setSaveStatus('Error: Failed to load');
                console.error('Failed to load game state:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
            position: 'relative'
        }}>
            <button 
                onClick={connectWallet}
                style={{
                    marginBottom: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#4a4a4a',
                    color: 'white',
                    border: '2px solid #00ff00',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {wallet ? 'Connected' : 'Connect Wallet'}
            </button>
            <div 
                id="game-container"
                style={{
                    width: '800px',
                    height: '600px',
                    border: '2px solid red',
                    position: 'relative'
                }}
            >
                <GameOverlay 
                    score={game?.scene?.scenes[0]?.score || 0}
                    highScore={game?.scene?.scenes[0]?.highScore || 0}
                    loading={loading}
                    saveStatus={saveStatus}
                />
            </div>
        </div>
    );
}