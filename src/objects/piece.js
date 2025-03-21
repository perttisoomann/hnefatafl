class Piece {
    constructor(scene, board, row, col, texture) {
        this.scene = scene;
        this.board = board;
        this.row = row;
        this.col = col;
        let { x, y } = board.getTilePosition(row, col);
        this.sprite = scene.add.sprite(x, y, texture).setOrigin(0.5).setDisplaySize(board.tileSize, board.tileSize);
        this.health = 1;
        this.sprite.setInteractive();
        this.sprite.on('pointerdown', () => scene.selectPiece(this));

        // Add hover event listeners
        this.sprite.on('pointerover', () => scene.setHoveredPiece(this));
        this.sprite.on('pointerout', () => scene.clearHoveredPiece(this));

        board.tiles[row][col].piece = this;
    }

    getValidMoves() {
        let moves = [];
        // Check vertical movement
        for (let i = this.row - 1; i >= 0; i--) {
            if (this.board.tiles[i][this.col].piece) break;
            moves.push([i, this.col]);
        }
        for (let i = this.row + 1; i < this.board.rows; i++) {
            if (this.board.tiles[i][this.col].piece) break;
            moves.push([i, this.col]);
        }
        // Check horizontal movement
        for (let j = this.col - 1; j >= 0; j--) {
            if (this.board.tiles[this.row][j].piece) break;
            moves.push([this.row, j]);
        }
        for (let j = this.col + 1; j < this.board.cols; j++) {
            if (this.board.tiles[this.row][j].piece) break;
            moves.push([this.row, j]);
        }
        return moves;
    }

    // Add cleanup method to destroy the sprite
    cleanup() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}