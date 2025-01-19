import { useEffect, useState, useRef } from 'react';
import styles from '../styles/gamega.module.css';
import { useRouter } from 'next/router';
import { useAccount } from '@starknet-react/core';
import { WalletConnect } from '../components/WalletConnect';
import { getGameContract } from '../utils/contracts';

// Only the first 5 movements for the game board
const actions = ['e4e5', 'c4c5', 'd4e4', 'b3a3', 'a1a1'];

export default function Game() {
    console.log("Game component rendering");

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
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [gameActive, setGameActive] = useState(false);
    const [gameInstance, setGameInstance] = useState(null);
    const { address, isConnected, provider } = useAccount();
    const [walletError, setWalletError] = useState('');

    // Ref to control the autoplay loop
    const autoplayRef = useRef(false);

    const handleFrameClick = () => {
        if (currentImage < 4) {
            setCurrentImage(currentImage + 1);
        }
    };

    // AI Agent Function
    const findBestMove = (scene) => {
        if (!scene || !scene.grid) return null;
        
        let bestScore = 0;
        let bestMove = null;

        // Check each orb
        for (let row = 0; row < scene.gridSize; row++) {
            for (let col = 0; col < scene.gridSize; col++) {
                // Check each adjacent position
                const adjacentPositions = [
                    [row - 1, col], // up
                    [row + 1, col], // down
                    [row, col - 1], // left
                    [row, col + 1]  // right
                ];

                for (const [adjRow, adjCol] of adjacentPositions) {
                    if (adjRow >= 0 && adjRow < scene.gridSize && 
                        adjCol >= 0 && adjCol < scene.gridSize) {
                        
                        const orb1 = scene.grid[row][col];
                        const orb2 = scene.grid[adjRow][adjCol];
                        
                        if (!orb1 || !orb2) continue;

                        // Try the swap
                        scene.grid[row][col] = orb2;
                        scene.grid[adjRow][adjCol] = orb1;

                        // Count potential matches
                        const score = countPotentialMatches(scene, row, col, adjRow, adjCol);

                        // Revert the swap
                        scene.grid[row][col] = orb1;
                        scene.grid[adjRow][adjCol] = orb2;

                        // Update best move if this score is better
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = {
                                orb1: { row, col },
                                orb2: { row: adjRow, col: adjCol } // Standardized property names
                            };
                        }
                    }
                }
            }
        }
        
        return bestMove;
    };

    // Placeholder for countPotentialMatches function
    const countPotentialMatches = (scene, row1, col1, row2, col2) => {
        // Implement your logic to count potential matches after swapping orb1 and orb2
        // This is a placeholder and should return a numerical score based on potential matches
        return Math.floor(Math.random() * 10); // Example: random score
    };

    // Autoplay Handler using Async Loop
    const handleAutoPlay = async (scene) => {
        console.log("Autoplay started");
        autoplayRef.current = true;

        while (autoplayRef.current && gameActive && swapCount > 0 && !isMonsterDead) {
            if (scene.isProcessing) {
                console.log("Scene is processing, waiting...");
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait before checking again
                continue;
            }

            console.log("Attempting to make a move...");
            const bestMove = findBestMove(scene);

            if (bestMove) {
                console.log("Found best move:", bestMove);
                const orb1 = scene.grid[bestMove.orb1.row][bestMove.orb1.col];
                const orb2 = scene.grid[bestMove.orb2.row][bestMove.orb2.col];

                if (orb1 && orb2) {
                    console.log("Executing move...");
                    scene.selectOrb(orb1);
                    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for orb1 selection
                    scene.selectOrb(orb2);
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for orb2 selection and processing
                } else {
                    console.log("Orbs not found for the best move");
                }
            } else {
                console.log("No valid moves found. Stopping autoplay.");
                setIsAutoPlaying(false);
                autoplayRef.current = false;
            }

            // Wait before making the next move
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log("Autoplay ended");
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
                        this.autoPlayEnabled = false;
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
                        this.startY = (gameHeight - gridHeight) / 2 - 70;

                        this.grid = [];
                        for (let row = 0; row < this.gridSize; row++) {
                            this.grid[row] = [];
                            for (let col = 0; col < this.gridSize; col++) {
                                let validTypes = [...this.orbTypes];
                                
                                // Remove types that would create initial matches
                                if (row >= 2) {
                                    // Check vertical matches
                                    if (this.grid[row-1][col] && this.grid[row-2][col] &&
                                        this.grid[row-1][col].getData('type') === this.grid[row-2][col].getData('type')) {
                                        validTypes = validTypes.filter(type => type !== this.grid[row-1][col].getData('type'));
                                    }
                                }
                                
                                if (col >= 2) {
                                    // Check horizontal matches
                                    if (this.grid[row][col-1] && this.grid[row][col-2] &&
                                        this.grid[row][col-1].getData('type') === this.grid[row][col-2].getData('type')) {
                                        validTypes = validTypes.filter(type => type !== this.grid[row][col-1].getData('type'));
                                    }
                                }
                                
                                // If no valid types (rare case), reset validTypes to all types
                                if (validTypes.length === 0) {
                                    validTypes = [...this.orbTypes];
                                }
                                
                                const randomType = Phaser.Math.RND.pick(validTypes);
                                const x = this.startX + col * (this.tileSize + this.orbPadding) + this.tileSize / 2;
                                const y = this.startY + row * (this.tileSize + this.orbPadding) + this.tileSize / 2;
                                
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

                        setGameActive(true);
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
                        
                        if (this.autoPlayEnabled) {
                            this.performAIMove();
                        }
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
                                    const x = this.startX + col * (this.tileSize + this.orbPadding) + this.tileSize / 2;
                                    const y = this.startY + this.tileSize / 2;
                                    
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
                                                y: this.startY + row * (this.tileSize + this.orbPadding) + this.tileSize / 2,
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

                    checkForPotentialMatches() {
                        // Check horizontal matches
                        for (let row = 0; row < this.gridSize; row++) {
                            for (let col = 0; col < this.gridSize - 2; col++) {
                                if (!this.grid[row][col]) continue;
                                const type = this.grid[row][col].getData('type');
                                if (this.grid[row][col + 1] && 
                                    this.grid[row][col + 2] &&
                                    type === this.grid[row][col + 1].getData('type') &&
                                    type === this.grid[row][col + 2].getData('type')) {
                                    return true;
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
                                    return true;
                                }
                            }
                        }
                        return false;
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
                setGameInstance(game);

                return () => {
                    setGameActive(false);
                    setGameInstance(null);
                    game.destroy(true);
                };
            } catch (error) {
                console.error('Error in game initialization:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (isAutoPlaying && gameInstance) {
            const scene = gameInstance.scene.scenes[0];
            if (scene) {
                handleAutoPlay(scene);
            }
        } else {
            autoplayRef.current = false; // Stop the autoplay loop
        }
    }, [isAutoPlaying, gameInstance, swapCount, isMonsterDead]);

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
        if (!showMonster) {
            router.push('/dungeonhall');
        }
    };

    // Add a click handler for the autoplay button that includes console logs
    const handleAutoPlayClick = () => {
        console.log("Autoplay button clicked, current state:", !isAutoPlaying);
        setIsAutoPlaying(!isAutoPlaying);
    };

    // Example of how to handle a transaction
    const handleGameTransaction = async () => {
        if (!isConnected) {
            setWalletError('Please connect your wallet first');
            return;
        }

        try {
            const contract = getGameContract(provider); // Ensure you pass the correct provider
            const response = await contract.invoke('increase_balance', [amount]); // Replace 'amount' with the actual value
            console.log('Transaction submitted:', response);
        } catch (error) {
            console.error('Transaction failed:', error);
            setWalletError('Transaction failed: ' + error.message);
        }
    };

    const walletSection = (
        <div className={styles['wallet-section']}>
            <WalletConnect />
            {walletError && (
                <p className={styles['wallet-error']}>{walletError}</p>
            )}
        </div>
    );

    return (
        <div className={styles['game-container-wrapper']}>
            <WalletConnect />
            
            <div className={styles['content-wrapper']}>
                <button
                    onClick={handleAutoPlayClick}
                    className={`${styles['autoplay-button']} ${isAutoPlaying ? styles['autoplay-playing'] : styles['autoplay-stopped']}`}
                >
                    <span style={{
                        display: 'inline-block',
                        transform: isAutoPlaying ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s ease',
                    }}>
                        {isAutoPlaying ? '⏹' : '▶'}
                    </span>
                    <span style={{
                        position: 'relative',
                        display: 'inline-block',
                        transform: 'translateY(0)',
                        transition: 'transform 0.3s ease',
                    }}>
                        {isAutoPlaying ? 'Stop Auto' : 'Auto'}
                    </span>
                </button>
                
                <style jsx global>{`
                    @keyframes pulse {
                        0% {
                            box-shadow: 0 0 15px rgba(255, 71, 87, 0.3);
                        }
                        50% {
                            box-shadow: 0 0 25px rgba(255, 71, 87, 0.5);
                        }
                        100% {
                            box-shadow: 0 0 15px rgba(255, 71, 87, 0.3);
                        }
                    }
                `}</style>
                
                <div className={styles['top-section']}>
                    <div className={styles['health-bar-monster-label']}>
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
                    <div className={styles['health-bar-human-label']}>
                        You
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
                    <div className={styles['swap-counter']}>
                        Swaps: {swapCount}/2
                    </div>
                    
                    <div className={styles['human-image']}>
                        <img 
                            src={isMonsterAttacking ? "/monster/power.gif" : "/human.png"}
                            alt="Human"
                        />
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

                {/* Add wallet connection button */}
                <div className={styles['wallet-section']}>
                    {!walletConnected ? (
                        <button 
                            onClick={connectWallet}
                            className={styles['wallet-button']}
                        >
                            Connect Braavos Wallet
                        </button>
                    ) : (
                        <div>
                            <div className={styles['wallet-address']}>
                                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </div>
                            <button 
                                onClick={disconnectWallet}
                                className={styles['wallet-button']}
                            >
                                Disconnect Wallet
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}