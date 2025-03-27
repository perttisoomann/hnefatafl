class GameBoard {
    constructor(scene, rows = 9, cols = 9, tileSize = 70) {
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.offsetX = (scene.scale.width - this.cols * this.tileSize) / 2;
        this.offsetY = (scene.scale.height - this.rows * this.tileSize) / 2;
        this.tiles = [];
        this.createBoard();
    }

    createBoard() {
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                let x = this.offsetX + col * this.tileSize;
                let y = this.offsetY + row * this.tileSize;
                let isLight = (row + col) % 2 === 0;
                let tile = this.scene.add.image(x, y, 'board', isLight ? 0 : 1)
                    .setOrigin(0)
                    .setDisplaySize(this.tileSize, this.tileSize);
                this.tiles[row][col] = { tile, modifier: null, highlight: null, piece: null };
            }
        }
    }

    resetBoard() {
        // Clear piece references from tiles without destroying tiles
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.tiles[row][col].piece = null;
            }
        }
        this.clearHighlights();
    }

    getTilePosition(row, col) {
        return {
            x: this.offsetX + col * this.tileSize + this.tileSize / 2,
            y: this.offsetY + row * this.tileSize + this.tileSize / 2
        };
    }

    highlightTiles(positions, piece) {
        this.clearHighlights();
        positions.forEach(([row, col]) => {
            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                let { x, y } = this.getTilePosition(row, col);
                this.tiles[row][col].highlight = this.scene.add.rectangle(x, y, this.tileSize, this.tileSize, 0x00ff00, 0.3);

                // Make the highlight interactive
                this.tiles[row][col].highlight.setInteractive();

                // Add hover effects
                this.tiles[row][col].highlight.on('pointerover', () => {
                    this.tiles[row][col].highlight.fillAlpha = 0.7;
                });

                this.tiles[row][col].highlight.on('pointerout', () => {
                    this.tiles[row][col].highlight.fillAlpha = 0.3;
                });

                // Add click event to move the piece
                this.tiles[row][col].highlight.on('pointerdown', () => {
                    this.scene.selectedRow = row;
                    this.scene.selectedCol = col;
                    this.scene.processState(GameState.MOVE_PIECE);
                });
            }
        });
    }

    clearHighlights() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.tiles[row][col].highlight) {
                    this.tiles[row][col].highlight.destroy();
                    this.tiles[row][col].highlight = null;
                }
            }
        }
    }

    // Add cleanup method to destroy all board elements
    cleanup() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.tiles[row][col].highlight) {
                    this.tiles[row][col].highlight.destroy();
                }
                if (this.tiles[row][col].tile) {
                    this.tiles[row][col].tile.destroy();
                }
                if (this.tiles[row][col].modifier) {
                    this.tiles[row][col].modifier.destroy();
                }
            }
        }
    }
}