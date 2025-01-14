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