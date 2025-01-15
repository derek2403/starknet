import { useEffect } from 'react';

export default function Game() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const Phaser = require('phaser');

                class MainScene extends Phaser.Scene {
                    constructor() {
                        super({ key: 'MainScene' });
                        this.gridSize = 6;
                        this.tileSize = 64;
                        this.orbTypes = ['dark', 'fire', 'heart', 'light', 'water', 'wood'];
                        this.selectedOrb = null;
                        this.isProcessing = false;
                        this.autoPlayEnabled = false;
                    }

                    preload() {
                        this.orbTypes.forEach(type => {
                            this.load.image(type, `/gameJew/${type}.png`);
                        });
                    }

                    create() {
                        const gameWidth = this.cameras.main.width;
                        const gameHeight = this.cameras.main.height;
                        const gridWidth = this.gridSize * this.tileSize;
                        const gridHeight = this.gridSize * this.tileSize;
                        
                        this.startX = (gameWidth - gridWidth) / 2;
                        this.startY = (gameHeight - gridHeight) / 2;

                        this.grid = [];
                        for (let row = 0; row < this.gridSize; row++) {
                            this.grid[row] = [];
                            for (let col = 0; col < this.gridSize; col++) {
                                const randomType = Phaser.Math.RND.pick(this.orbTypes);
                                const x = this.startX + col * this.tileSize + this.tileSize/2;
                                const y = this.startY + row * this.tileSize + this.tileSize/2;
                                
                                const orb = this.add.image(x, y, randomType)
                                    .setInteractive()
                                    .setData({ row, col, type: randomType });
                                
                                orb.on('pointerdown', () => this.selectOrb(orb));
                                this.grid[row][col] = orb;
                            }
                        }

                        // Replace the old autoplay button with this styled version
                        const buttonWidth = 140;
                        const buttonHeight = 40;
                        const padding = 10;

                        // Create button background
                        const buttonBackground = this.add.rectangle(padding + buttonWidth/2, padding + buttonHeight/2, 
                            buttonWidth, buttonHeight, 0x4a4a4a)
                            .setInteractive()
                            .setAlpha(0.9);

                        // Add a border
                        const buttonBorder = this.add.rectangle(padding + buttonWidth/2, padding + buttonHeight/2, 
                            buttonWidth, buttonHeight)
                            .setStrokeStyle(2, 0x00ff00);

                        // Improved text styling
                        const autoPlayButton = this.add.text(padding + buttonWidth/2, padding + buttonHeight/2, 'AutoPlay: OFF', {
                            fontSize: '20px',
                            fontFamily: 'Arial',
                            color: '#ffffff',
                            align: 'center'
                        }).setOrigin(0.5);

                        // Group the elements for easier interaction
                        const buttonGroup = this.add.container(0, 0, [buttonBackground, buttonBorder, autoPlayButton]);

                        // Hover effects
                        buttonBackground.on('pointerover', () => {
                            buttonBackground.setFillStyle(0x666666);
                            this.input.setDefaultCursor('pointer');
                        });

                        buttonBackground.on('pointerout', () => {
                            buttonBackground.setFillStyle(0x4a4a4a);
                            this.input.setDefaultCursor('default');
                        });

                        buttonBackground.on('pointerdown', () => {
                            buttonBackground.setFillStyle(0x333333);
                        });

                        buttonBackground.on('pointerup', () => {
                            buttonBackground.setFillStyle(0x666666);
                            this.autoPlayEnabled = !this.autoPlayEnabled;
                            autoPlayButton.setText(`AutoPlay: ${this.autoPlayEnabled ? 'ON' : 'OFF'}`);
                            if (this.autoPlayEnabled) {
                                buttonBorder.setStrokeStyle(2, 0xff0000);  // Red border when active
                                this.performAIMove();
                            } else {
                                buttonBorder.setStrokeStyle(2, 0x00ff00);  // Green border when inactive
                            }
                        });
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
                                    const x = this.startX + col * this.tileSize + this.tileSize/2;
                                    const y = this.startY + this.tileSize/2;
                                    
                                    const orb = this.add.image(x, y - this.tileSize, randomType)
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
                                                y: this.startY + row * this.tileSize + this.tileSize/2,
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

                    findAndRemoveMatches() {
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
                                let matchesProcessed = 0;
                                matches.forEach(orb => {
                                    const row = orb.getData('row');
                                    const col = orb.getData('col');
                                    this.grid[row][col] = null;
                                    
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

                    async performAIMove() {
                        if (!this.autoPlayEnabled || this.isProcessing) return;

                        const bestMove = this.findBestMove();
                        if (bestMove) {
                            const { orb1, orb2 } = bestMove;
                            await this.makeAIMove(orb1, orb2);
                        }

                        // Schedule next move
                        setTimeout(() => {
                            if (this.autoPlayEnabled) {
                                this.performAIMove();
                            }
                        }, 500);
                    }

                    async makeAIMove(orb1, orb2) {
                        this.selectOrb(orb1);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        this.selectOrb(orb2);
                    }

                    findBestMove() {
                        // Check each possible swap for matches
                        for (let row = 0; row < this.gridSize; row++) {
                            for (let col = 0; col < this.gridSize; col++) {
                                // Check right swap
                                if (col < this.gridSize - 1) {
                                    if (this.wouldCreateMatch(row, col, row, col + 1)) {
                                        return {
                                            orb1: this.grid[row][col],
                                            orb2: this.grid[row][col + 1]
                                        };
                                    }
                                }
                                // Check down swap
                                if (row < this.gridSize - 1) {
                                    if (this.wouldCreateMatch(row, col, row + 1, col)) {
                                        return {
                                            orb1: this.grid[row][col],
                                            orb2: this.grid[row + 1][col]
                                        };
                                    }
                                }
                            }
                        }
                        return null;
                    }

                    wouldCreateMatch(row1, col1, row2, col2) {
                        // Temporarily swap orbs
                        const temp = this.grid[row1][col1];
                        this.grid[row1][col1] = this.grid[row2][col2];
                        this.grid[row2][col2] = temp;

                        let hasMatch = this.checkForMatches(row1, col1) || 
                                       this.checkForMatches(row2, col2);

                        // Swap back
                        this.grid[row2][col2] = this.grid[row1][col1];
                        this.grid[row1][col1] = temp;

                        return hasMatch;
                    }

                    checkForMatches(row, col) {
                        const type = this.grid[row][col].getData('type');

                        // Check horizontal matches
                        if (col >= 2 && 
                            this.grid[row][col-2]?.getData('type') === type && 
                            this.grid[row][col-1]?.getData('type') === type) return true;
                        if (col >= 1 && col < this.gridSize-1 && 
                            this.grid[row][col-1]?.getData('type') === type && 
                            this.grid[row][col+1]?.getData('type') === type) return true;
                        if (col < this.gridSize-2 && 
                            this.grid[row][col+1]?.getData('type') === type && 
                            this.grid[row][col+2]?.getData('type') === type) return true;

                        // Check vertical matches
                        if (row >= 2 && 
                            this.grid[row-2][col]?.getData('type') === type && 
                            this.grid[row-1][col]?.getData('type') === type) return true;
                        if (row >= 1 && row < this.gridSize-1 && 
                            this.grid[row-1][col]?.getData('type') === type && 
                            this.grid[row+1][col]?.getData('type') === type) return true;
                        if (row < this.gridSize-2 && 
                            this.grid[row+1][col]?.getData('type') === type && 
                            this.grid[row+2][col]?.getData('type') === type) return true;

                        return false;
                    }
                }

                const config = {
                    type: Phaser.AUTO,
                    width: 800,
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

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000'
        }}>
            <div 
                id="game-container"
                style={{
                    width: '800px',
                    height: '600px',
                    border: '2px solid red'
                }}
            />
        </div>
    );
}