class PuzzleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene' });
        this.gridSize = 6;
        this.orbSize = 64; // Standard size for game sprites
        this.orbTypes = ['fire', 'water', 'wood', 'light', 'dark', 'heart'];
    }

    preload() {
        // Load orb sprites
        this.orbTypes.forEach(type => {
            this.load.image(type, `gameJew/${type}.png`);
        });
    }

    create() {
        this.grid = [];
        this.selectedOrb = null;

        // Calculate grid position to center it
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        this.offsetX = (gameWidth - (this.gridSize * this.orbSize)) / 2;
        this.offsetY = (gameHeight - (this.gridSize * this.orbSize)) / 2;

        // Initialize grid
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const randomType = Phaser.Math.RND.pick(this.orbTypes);
                const x = this.offsetX + col * this.orbSize + this.orbSize/2;
                const y = this.offsetY + row * this.orbSize + this.orbSize/2;
                
                const orb = this.add.sprite(x, y, randomType)
                    .setInteractive()
                    .setData({ row, col, type: randomType });
                
                this.grid[row][col] = orb;
            }
        }

        // Setup input handling
        this.input.on('gameobjectdown', this.onOrbClick, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);
    }

    onOrbClick(pointer, orb) {
        this.selectedOrb = orb;
        orb.setTint(0x888888); // Visual feedback
    }

    onPointerMove(pointer) {
        if (!this.selectedOrb) return;

        // Get grid position from pointer
        const gridX = Math.floor((pointer.x - this.offsetX) / this.orbSize);
        const gridY = Math.floor((pointer.y - this.offsetY) / this.orbSize);

        // Check if move is valid
        if (this.isValidMove(this.selectedOrb.getData('row'), 
                           this.selectedOrb.getData('col'), 
                           gridY, gridX)) {
            this.swapOrbs(this.selectedOrb.getData('row'), 
                         this.selectedOrb.getData('col'), 
                         gridY, gridX);
        }
    }

    onPointerUp() {
        if (this.selectedOrb) {
            this.selectedOrb.clearTint();
            this.selectedOrb = null;
            this.checkMatches();
        }
    }

    isValidMove(startRow, startCol, endRow, endCol) {
        if (endRow < 0 || endRow >= this.gridSize || 
            endCol < 0 || endCol >= this.gridSize) return false;
        
        return Math.abs(startRow - endRow) + Math.abs(startCol - endCol) === 1;
    }

    swapOrbs(row1, col1, row2, col2) {
        const orb1 = this.grid[row1][col1];
        const orb2 = this.grid[row2][col2];

        // Swap positions in grid array
        this.grid[row1][col1] = orb2;
        this.grid[row2][col2] = orb1;

        // Update orb data
        orb1.setData({ row: row2, col: col2 });
        orb2.setData({ row: row1, col: col1 });

        // Animate the swap
        this.tweens.add({
            targets: orb1,
            x: orb2.x,
            y: orb2.y,
            duration: 200
        });

        this.tweens.add({
            targets: orb2,
            x: orb1.x,
            y: orb1.y,
            duration: 200
        });
    }

    checkMatches() {
        let hasMatches = false;

        // Check horizontal matches
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize - 2; col++) {
                const type1 = this.grid[row][col].getData('type');
                const type2 = this.grid[row][col + 1].getData('type');
                const type3 = this.grid[row][col + 2].getData('type');

                if (type1 === type2 && type2 === type3) {
                    hasMatches = true;
                    // Handle match (e.g., remove orbs, add score)
                    this.handleMatch(row, col, 'horizontal');
                }
            }
        }

        // Check vertical matches
        for (let row = 0; row < this.gridSize - 2; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const type1 = this.grid[row][col].getData('type');
                const type2 = this.grid[row + 1][col].getData('type');
                const type3 = this.grid[row + 2][col].getData('type');

                if (type1 === type2 && type2 === type3) {
                    hasMatches = true;
                    // Handle match (e.g., remove orbs, add score)
                    this.handleMatch(row, col, 'vertical');
                }
            }
        }

        return hasMatches;
    }

    handleMatch(row, col, direction) {
        if (direction === 'horizontal') {
            for (let i = 0; i < 3; i++) {
                const orb = this.grid[row][col + i];
                this.tweens.add({
                    targets: orb,
                    alpha: 0,
                    scale: 0.5,
                    duration: 200,
                    onComplete: () => {
                        orb.destroy();
                        // Here you would add logic to make orbs fall and fill empty spaces
                    }
                });
            }
        } else {
            for (let i = 0; i < 3; i++) {
                const orb = this.grid[row + i][col];
                this.tweens.add({
                    targets: orb,
                    alpha: 0,
                    scale: 0.5,
                    duration: 200,
                    onComplete: () => {
                        orb.destroy();
                        // Here you would add logic to make orbs fall and fill empty spaces
                    }
                });
            }
        }
    }
}

// Configuration object for Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: PuzzleScene,
    backgroundColor: '#2d2d2d'
};

// Create the game instance
const game = new Phaser.Game(config); 