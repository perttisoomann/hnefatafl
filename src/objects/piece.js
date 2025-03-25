class Piece {
    constructor(scene, board, row, col, texture) {
        this.scene = scene;
        this.board = board;
        this.row = row;
        this.col = col;
        let { x, y } = board.getTilePosition(row, col);
        this.sprite = scene.add.sprite(x, y, texture).setOrigin(0.5).setDisplaySize(board.tileSize, board.tileSize);
        this.maxHealth = 1;
        this.health = 1;
        this.attack = 1;
        this.hasMoved = false;
        this.attackMultiplier = 1;
        this.survivalMultiplier = 1;

        this.sprite.setInteractive();
        this.sprite.on('pointerdown', () => scene.selectPiece(this));

        // Add hover event listeners
        this.sprite.on('pointerover', () => scene.setHoveredPiece(this));
        this.sprite.on('pointerout', () => scene.clearHoveredPiece(this));

        board.tiles[row][col].piece = this;

        // Create a hearts array instead of a group
        this.hearts = [];
        this.createHearts();
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

    createHearts() {
        this.hearts.forEach(heart => heart.destroy()); // Destroy hearts
        this.hearts = [];

        const spacing = 12;
        for (let i = 0; i < this.maxHealth; i++) {
            let heartTexture = i < this.health ? 'heart_red' : 'heart_grey';
            let heart = this.scene.add.image(0, 0, heartTexture).setScale(0.5);
            this.hearts.push(heart);
        }
        this.updateHeartsPosition();
    }

    updateHeartsPosition() {
        const spacing = 12;
        let startX = this.sprite.x - (this.maxHealth - 1) * spacing / 2;
        let startY = this.sprite.y - 16 + this.board.tileSize / 2 + 5; // Below the piece

        this.hearts.forEach((heart, index) => {
            heart.setPosition(startX + index * spacing, startY);
        });
    }

    updateHearts() {
        // Update heart textures
        this.hearts.forEach((heart, index) => {
            heart.setTexture(index < this.health ? 'heart_red' : 'heart_grey');
        });
        this.updateHeartsPosition();
    }

    takeDamage(amount) {
        this.health = Math.max(this.health - amount, 0);
        this.updateHearts();
        if (this.health <= 0) {
            this.cleanup();
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        this.updateHearts();
    }

    death() {
        this.sprite.destroy();
        this.hearts.forEach(heart => heart.destroy()); // Destroy hearts
        this.hearts = [];
    }

    // Add cleanup method to destroy the sprite
    cleanup() {
        if (this.sprite) {
            this.sprite.destroy();
        }

        this.hearts.forEach(heart => heart.destroy()); // Destroy hearts
        this.hearts = [];
    }
}