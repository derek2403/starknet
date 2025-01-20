import { useEffect, useState, useCallback } from 'react';
import styles from '../styles/gamega.module.css';
import { useRouter } from 'next/router';
import NPC from '../pages/components/NPC.js';

// Only the first 5 movements for the game board
const actions = ['e4e5', 'c4c5', 'd4e4', 'b3a3', 'a1a1'];

export default function Game() {
    const router = useRouter();
    const [currentImage, setCurrentImage] = useState(1);
    const [humanPower, setHumanPower] = useState(0);
    const [monsterHealth, setMonsterHealth] = useState(100);
    const [monsterPower, setMonsterPower] = useState(0);
    const [humanHealth, setHumanHealth] = useState(100);
    const [swapCount, setSwapCount] = useState(2);
    const [isAttacking, setIsAttacking] = useState(false);
    const [isMonsterAttacking, setIsMonsterAttacking] = useState(false);
    const [isMonsterDead, setIsMonsterDead] = useState(false);
    const [showMonster, setShowMonster] = useState(true);
    const [showVictory, setShowVictory] = useState(false);
    const [showEmpty, setShowEmpty] = useState(false);
    const [npcAction, setNpcAction] = useState('idle');
    const [showNoItemDrop, setShowNoItemDrop] = useState(false);
    const [showContinueButton, setShowContinueButton] = useState(false);
    const [isAIPlaying, setIsAIPlaying] = useState(false);
    const [aiInterval, setAiInterval] = useState(null);
    const [gameInitialized, setGameInitialized] = useState(false);
    const [isProcessingMove, setIsProcessingMove] = useState(false);

    const handleFrameClick = () => {
        if (currentImage < 4) {
            setCurrentImage(currentImage + 1);
        }
    };

    useEffect(() => {
        console.log("All game board actions:", actions);
        
        // Only handle game board moves here
        const gameBoardMoves = actions.filter(action => action.length > 2);
        console.log("Game board movements:", gameBoardMoves);
        console.log("Number of game board moves:", gameBoardMoves.length);

        if (typeof window !== 'undefined') {
            try {
                const Phaser = require('phaser');

                class MainScene extends Phaser.Scene {
                    constructor() {
                        super({ key: 'MainScene' });
                        this.gridSize = 6;
                        this.tileSize = 60;
                        this.orbSize = 100;
                        this.orbPadding = 30;
                        this.orbTypes = ['dark', 'fire', 'heart', 'light', 'water', 'wood'];
                        this.selectedOrb = null;
                        this.isProcessing = false;
                    }

                    preload() {
                        this.orbTypes.forEach(type => {
                            this.load.image(type, `/gameJew/${type}.png`);
                        });
                        this.load.spritesheet('hit', '/monster/empty.gif', {
                            frameWidth: 32,
                            frameHeight: 32
                        });
                        this.load.spritesheet('power', '/monster/power.gif', {
                            frameWidth: 32,
                            frameHeight: 32
                        });
                    }

                    create() {
                        const gameWidth = this.cameras.main.width;
                        const gameHeight = this.cameras.main.height;
                        const gridWidth = this.gridSize * this.tileSize;
                        const gridHeight = this.gridSize * this.tileSize;
                        
                        this.startX = (gameWidth - gridWidth) / 2 - 80; /*up = left, down = right*/
                        this.startY = (gameHeight - gridHeight) / 2-70;

                        this.grid = [];
                        for (let row = 0; row < this.gridSize; row++) {
                            this.grid[row] = [];
                            for (let col = 0; col < this.gridSize; col++) {
                                const randomType = Phaser.Math.RND.pick(this.orbTypes);
                                const x = this.startX + col * (this.tileSize + this.orbPadding) + this.tileSize/2;
                                const y = this.startY + row * (this.tileSize + this.orbPadding) + this.tileSize/2;
                                
                                const orb = this.add.sprite(x, y, randomType)
                                    .setScale(2.5)
                                    .setInteractive()
                                    .setData({ row, col, type: randomType });
                                
                                orb.on('pointerdown', () => this.selectOrb(orb));
                                this.grid[row][col] = orb;
                            }
                        }

                        this.anims.create({
                            key: 'hit-effect',
                            frames: this.anims.generateFrameNumbers('hit', { start: 0, end: 5 }),
                            frameRate: 12,
                            repeat: 0
                        });

                        this.anims.create({
                            key: 'power-effect',
                            frames: this.anims.generateFrameNumbers('power', { start: 0, end: 5 }),
                            frameRate: 12,
                            repeat: 0
                        });

                        // Signal that the game is ready
                        setGameInitialized(true);
                        window.gameScene = this;
                    }

                    selectOrb(orb) {
                        if (this.isProcessing) return;
                        
                        if (!this.selectedOrb) {
                            this.selectedOrb = orb;
                            orb.setTint(0x888888);
                        } else {
                            const row1 = this.selectedOrb.getData('row');
                            const col1 = this.selectedOrb.getData('col');
                            const row2 = orb.getData('row');
                            const col2 = orb.getData('col');

                            if (this.isAdjacent(row1, col1, row2, col2)) {
                                this.swapOrbs(this.selectedOrb, orb);
                            }

                            this.selectedOrb.clearTint();
                            this.selectedOrb = null;
                        }
                    }

                    isAdjacent(row1, col1, row2, col2) {
                        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
                    }

                    swapOrbs(orb1, orb2) {
                        this.isProcessing = true;

                        const row1 = orb1.getData('row');
                        const col1 = orb1.getData('col');
                        const row2 = orb2.getData('row');
                        const col2 = orb2.getData('col');

                        // Swap in grid array
                        this.grid[row1][col1] = orb2;
                        this.grid[row2][col2] = orb1;

                        // Update orb data
                        orb1.setData({ row: row2, col: col2 });
                        orb2.setData({ row: row1, col: col1 });

                        // Animate swap
                        this.tweens.add({
                            targets: orb1,
                            x: orb2.x,
                            y: orb2.y,
                            duration: 100,
                            onComplete: () => {
                                this.startProcessing();
                            }
                        });

                        this.tweens.add({
                            targets: orb2,
                            x: orb1.x,
                            y: orb1.y,
                            duration: 100
                        });

                        // Decrease swap count
                        setSwapCount(prevCount => {
                            const newCount = prevCount - 1;
                            
                            if (newCount === 0) {
                                // Wait for processing to complete before attacking
                                const checkProcessing = setInterval(() => {
                                    if (!this.isProcessing) {
                                        clearInterval(checkProcessing);
                                        
                                        setIsAttacking(true);
                                        
                                        const powerEffect = this.add.sprite(
                                            this.cameras.main.width * 0.75,
                                            this.cameras.main.height * 0.2,
                                            'power'
                                        ).setScale(2);
                                        
                                        powerEffect.play('power-effect');

                                        setTimeout(() => {
                                            setMonsterHealth(prevHealth => {
                                                const newHealth = Math.max(0, prevHealth - 50);
                                                
                                                if (newHealth === 0) {
                                                    // Start death sequence
                                                    setIsMonsterDead(true);
                                                    
                                                    // Wait for diemonster.gif to play then redirect
                                                    setTimeout(() => {
                                                        router.push('/dungeonhall');
                                                    }, 2000);
                                                } else {
                                                    monsterCounterAttack(this);
                                                }
                                                
                                                return newHealth;
                                            });
                                            
                                            setHumanPower(0);
                                            setSwapCount(2);
                                            setIsAttacking(false);
                                            powerEffect.destroy();
                                        }, 1000);
                                    }
                                }, 100);
                            }
                            return newCount;
                        });
                    }

                    async startProcessing() {
                        this.isProcessing = true;
                        
                        let hasMatches;
                        do {
                            hasMatches = await this.findAndRemoveMatches();
                            if (hasMatches) {
                                await new Promise(resolve => setTimeout(resolve, 100));
                                await this.fillGridWithNewOrbs();
                                await new Promise(resolve => setTimeout(resolve, 100));
                            }
                        } while (hasMatches);

                        this.isProcessing = false;
                    }

                    async fillGridWithNewOrbs() {
                        let hasEmptySpaces;
                        do {
                            hasEmptySpaces = false;
                            
                            await this.dropOrbs();
                            
                            for (let col = 0; col < this.gridSize; col++) {
                                if (!this.grid[0][col]) {
                                    hasEmptySpaces = true;
                                    const randomType = Phaser.Math.RND.pick(this.orbTypes);
                                    const x = this.startX + col * (this.tileSize + this.orbPadding) + this.tileSize/2;
                                    const y = this.startY + this.tileSize/2;
                                    
                                    const orb = this.add.sprite(x, y - this.tileSize, randomType)
                                        .setScale(2.5)
                                        .setInteractive()
                                        .setData({ row: 0, col, type: randomType });
                                    
                                    orb.on('pointerdown', () => this.selectOrb(orb));
                                    this.grid[0][col] = orb;

                                    await new Promise(resolve => {
                                        this.tweens.add({
                                            targets: orb,
                                            y: y,
                                            duration: 150,
                                            ease: 'Bounce.easeOut',
                                            onComplete: resolve
                                        });
                                    });
                                }
                            }

                            // Check for empty spaces
                            for (let row = 0; row < this.gridSize; row++) {
                                for (let col = 0; col < this.gridSize; col++) {
                                    if (!this.grid[row][col]) {
                                        hasEmptySpaces = true;
                                        break;
                                    }
                                }
                                if (hasEmptySpaces) break;
                            }
                        } while (hasEmptySpaces);
                    }

                    async dropOrbs() {
                        for (let col = 0; col < this.gridSize; col++) {
                            for (let row = this.gridSize - 1; row > 0; row--) {
                                if (!this.grid[row][col]) {
                                    let sourceRow = row - 1;
                                    while (sourceRow >= 0 && !this.grid[sourceRow][col]) {
                                        sourceRow--;
                                    }

                                    if (sourceRow >= 0) {
                                        const orb = this.grid[sourceRow][col];
                                        this.grid[row][col] = orb;
                                        this.grid[sourceRow][col] = null;
                                        orb.setData('row', row);

                                        await new Promise(resolve => {
                                            this.tweens.add({
                                                targets: orb,
                                                y: this.startY + row * (this.tileSize + this.orbPadding) + this.tileSize/2,
                                                duration: 150,
                                                ease: 'Bounce.easeOut',
                                                onComplete: resolve
                                            });
                                        });
                                    }
                                }
                            }
                        }
                    }

                    async findAndRemoveMatches() {
                        return new Promise(resolve => {
                            const matches = new Set();

                            // Check horizontal matches
                            for (let row = 0; row < this.gridSize; row++) {
                                for (let col = 0; col < this.gridSize - 2; col++) {
                                    if (!this.grid[row][col]) continue;
                                    const type = this.grid[row][col].getData('type');
                                    if (this.grid[row][col + 1] && 
                                        this.grid[row][col + 2] &&
                                        type === this.grid[row][col + 1].getData('type') &&
                                        type === this.grid[row][col + 2].getData('type')) {
                                        matches.add(this.grid[row][col]);
                                        matches.add(this.grid[row][col + 1]);
                                        matches.add(this.grid[row][col + 2]);
                                    }
                                }
                            }

                            // Check vertical matches
                            for (let row = 0; row < this.gridSize - 2; row++) {
                                for (let col = 0; col < this.gridSize; col++) {
                                    if (!this.grid[row][col]) continue;
                                    const type = this.grid[row][col].getData('type');
                                    if (this.grid[row + 1][col] && 
                                        this.grid[row + 2][col] &&
                                        type === this.grid[row + 1][col].getData('type') &&
                                        type === this.grid[row + 2][col].getData('type')) {
                                        matches.add(this.grid[row][col]);
                                        matches.add(this.grid[row + 1][col]);
                                        matches.add(this.grid[row + 2][col]);
                                    }
                                }
                            }

                            if (matches.size > 0) {
                                // Calculate power gain (2% per orb)
                                const powerGain = matches.size * 2;
                                setHumanPower(prevPower => Math.min(100, prevPower + powerGain));

                                let matchesProcessed = 0;
                                matches.forEach(orb => {
                                    const row = orb.getData('row');
                                    const col = orb.getData('col');
                                    this.grid[row][col] = null;
                                    
                                    const hitEffect = this.add.sprite(orb.x, orb.y, 'hit')
                                        .setScale(2);
                                    
                                    hitEffect.play('hit-effect');

                                    this.tweens.add({
                                        targets: hitEffect,
                                        alpha: { from: 1, to: 0 },
                                        duration: 300,
                                        onComplete: () => {
                                            hitEffect.destroy();
                                        }
                                    });

                                    this.tweens.add({
                                        targets: orb,
                                        alpha: 0,
                                        scale: 0,
                                        duration: 150,
                                        onComplete: () => {
                                            orb.destroy();
                                            matchesProcessed++;
                                            if (matchesProcessed === matches.size) {
                                                resolve(true);
                                            }
                                        }
                                    });
                                });
                            } else {
                                resolve(false);
                            }
                        });
                    }

                    // Add a helper method for AI moves
                    makeAIMove(orb1, orb2) {
                        if (!this.isProcessing && orb1 && orb2) {
                            this.selectOrb(orb1);
                            setTimeout(() => {
                                this.selectOrb(orb2);
                            }, 200);
                        }
                    }
                }

                const config = {
                    type: Phaser.AUTO,
                    width: 700,
                    height: 600,
                    scene: MainScene,
                    backgroundColor: '#2d2d2d',
                    parent: 'game-container',
                };

                const game = new Phaser.Game(config);

                return () => {
                    game.destroy(true);
                };
            } catch (error) {
                console.error('Error in game initialization:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (swapCount === 0) {
            // When swaps are used up, trigger attack animation
            setNpcAction('attack');
            
            // After attack animation, return to idle
            setTimeout(() => {
                setNpcAction('idle');
            }, 1000);  // Adjust timing based on your attack animation duration
        }
    }, [swapCount]);

    // Monster counter-attack sequence
    const monsterCounterAttack = (scene) => {
        // First power increase
        setMonsterPower(5);

        // Wait 2 seconds then increase to 15%
        setTimeout(() => {
            setMonsterPower(15);

            // Create power effect on human
            const humanPowerEffect = scene.add.sprite(
                scene.cameras.main.width * 0.25,  // Left side for human
                scene.cameras.main.height * 0.3,  // Adjust height as needed
                'power'
            ).setScale(2);
            
            humanPowerEffect.play('power-effect');
            setIsMonsterAttacking(true);

            // After power effect, reduce human health
            setTimeout(() => {
                setHumanHealth(prevHealth => Math.max(0, prevHealth - 20));
                setMonsterPower(0);  // Reset monster power
                setIsMonsterAttacking(false);
                humanPowerEffect.destroy();
            }, 1000);
        }, 2000);
    };

    // Handle click after monster is dead
    const handleClick = () => {
        if (!showMonster && !showNoItemDrop) {
            // Only allow clicks when not showing notification
            // Add any other click handling here
        }
    };

    useEffect(() => {
        if (monsterHealth <= 0) {
            // Monster defeated
            setShowMonster(false);
            setShowVictory(true);
            setTimeout(() => {
                setShowNoItemDrop(true);
            }, 3000); // Wait 3 seconds after victory
        }
    }, [monsterHealth]);

    // Only close and redirect when player clicks the close button
    const handleClose = () => {
        setShowNoItemDrop(false);
        router.push('/dungeonhall');
    };

    // Modify findBestMove to strictly check isAIPlaying
    const findBestMove = (scene) => {
        if (!isAIPlaying || !scene || !scene.grid || isProcessingMove) {
            return null;
        }
        // Look for potential matches
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 5; col++) {
                const orb1 = scene.grid[row][col];
                const orb2 = scene.grid[row][col + 1];

                if (!orb1 || !orb2 || !orb1.active || !orb2.active) {
                    continue;
                }

                // Check if these orbs would make a match when swapped
                const type1 = orb1.getData('type');
                const type2 = orb2.getData('type');

                // Check horizontal match potential
                if (col < 4 && scene.grid[row][col + 2]) {
                    const type3 = scene.grid[row][col + 2].getData('type');
                    if (type2 === type3) {
                        return { orb1, orb2 };
                    }
                }

                // Check vertical match potential
                if (row < 4 && scene.grid[row + 1][col] && scene.grid[row + 2][col]) {
                    const below1 = scene.grid[row + 1][col].getData('type');
                    const below2 = scene.grid[row + 2][col].getData('type');
                    if (type1 === below1 && type1 === below2) {
                        return { orb1, orb2 };
                    }
                }
            }
        }
        return null;
    };

    // Update toggleAIPlay to be more strict
    const toggleAIPlay = useCallback(() => {
        // Clear any existing interval first
        if (aiInterval) {
            clearInterval(aiInterval);
            setAiInterval(null);
        }

        setIsAIPlaying(prev => {
            if (!prev) {
                console.log("Starting AI...");
                const interval = setInterval(() => {
                    const scene = window.gameScene;
                    if (scene && !isProcessingMove && swapCount > 0) {
                        console.log("Finding move...");
                        setIsProcessingMove(true);
                        const move = findBestMove(scene);
                        if (move) {
                            console.log("Found move at row " + move.row + ", col " + move.col);
                            console.log("Executing move...");
                            scene.selectOrb(scene.grid[move.row][move.col]);
                            setIsProcessingMove(false);
                        }
                    }
                }, 2000);
                setAiInterval(interval);
                return true;
            }
            console.log("Stopping AI...");
            return false;
        });
    }, [aiInterval, isProcessingMove, swapCount]);

    // Add cleanup effect that runs on mount/unmount only
    useEffect(() => {
        // Ensure AI is off initially
        setIsAIPlaying(false);
        setIsProcessingMove(false);
        
        // Cleanup function
        return () => {
            if (aiInterval) {
                clearInterval(aiInterval);
                setAiInterval(null);
            }
            setIsAIPlaying(false);
            setIsProcessingMove(false);
        };
    }, []); // Empty dependency array means this only runs on mount/unmount

    // Add the Auto button with better visibility
    return (
        <div 
            className={styles['game-container-wrapper']}
            onClick={handleClick}
        >
            <div className={styles['content-wrapper']}>
                <div className={styles['game-title']}>
                    Defeat Eldrakor!
                </div>
                
                <div className={styles['top-section']}>
                    <div className={styles['monster-stats-box']}>
                        <div className={styles['health-bar-monster-label']}>
                            <img 
                                src="/monster/helmet.png" 
                                alt="Helmet" 
                                className={styles['helmet-icon']}
                            />
                            Eldrakor
                        </div>
                        <div className={styles['health-bar-monster']}>
                            <div 
                                className={styles['health-bar-monster-fill']} 
                                style={{ width: `${monsterHealth}%` }}
                            />
                        </div>
                        <div className={styles['power-bar-monster']}>
                            <div 
                                className={styles['power-bar-monster-fill']}
                                style={{ width: `${monsterPower}%` }}
                            />
                        </div>
                    </div>
                    
                    <div className={styles['monster-animation']}>
                        <img 
                            src={
                                isMonsterDead 
                                    ? "/monster/diemonster.gif" 
                                    : isAttacking 
                                        ? "/monster/power.gif" 
                                        : "/monster/startattack.gif"
                            }
                            alt="Monster Animation"
                        />
                    </div>
                </div>
                
                <div className={styles['middle-section']}>
                    <div className={styles['human-stats-box']}>
                        <div className={styles['health-bar-human-label']}>
                            <img 
                                src="/monster/leaf.png" 
                                alt="Human" 
                                className={styles['human-icon']}
                            />
                            <span style={{ position: 'relative', right: '-8px', top: '-40px' }}>You</span>
                        </div>
                        <div className={styles['health-bar-human']}>
                            <div 
                                className={styles['health-bar-human-fill']}
                                style={{ 
                                    width: `${humanHealth}%`,
                                    transition: 'width 0.5s ease-in-out'
                                }}
                            />
                        </div>
                        <div className={styles['power-bar-human']}>
                            <div 
                                className={styles['power-bar-human-fill']} 
                                style={{ width: `${humanPower}%` }}
                            />
                        </div>
                    </div>
                    <div className={styles['swap-counter']} style={{ position: 'relative', top: '-20px' }}>
                        Swaps: {swapCount}/2
                    </div>
                    
                    <div className={styles['human-image']}>
                        {isMonsterAttacking ? (
                            <img src="/monster/power.gif" alt="Human" />
                        ) : (
                            <NPC 
                                moveRange={{ x: { min: 0, max: 0 }, y: { min: 0, max: 0 }}}
                                initialPosition={{ x: 0, y: 0 }}
                                hairStyle="spikeyhair"
                                actionType={npcAction}
                                scale={5.5}
                            />
                        )}
                    </div>
                    <div 
                        className={styles['light-frame']}
                        onClick={handleFrameClick}
                    >
                        <img 
                            src={
                                showVictory
                                    ? "/eldrakor/youwin.png"
                                    : `/eldrakor/${currentImage}.png`
                            }
                            alt="Dialog frame"
                        />
                    </div>
                </div>

                <div id="game-container" className={styles['game-container']} />
            </div>

            {/* Full Screen No Item Drop Notification */}
            {showNoItemDrop && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
                     onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
                >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-80" />
                    
                    {/* Notification Content */}
                    <div className="relative z-50 w-screen h-screen flex flex-col items-center justify-center">
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 
                                     rounded-full flex items-center justify-center z-50 
                                     transition-colors transform hover:scale-110 active:scale-95"
                        >
                            <svg 
                                className="w-6 h-6 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </svg>
                        </button>

                        <img 
                            src="/notif/noitemdrop.png"
                            alt="No Item Drop"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Add this button */}
            <button 
                className={`${styles['ai-button']} ${isAIPlaying ? styles['active'] : ''}`} 
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("Auto button clicked");
                    toggleAIPlay();
                }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: isAIPlaying ? '#48bb78' : '#4a5568',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                {isAIPlaying ? 'Stop Auto' : 'Start Auto'}
            </button>
        </div>
    );
}