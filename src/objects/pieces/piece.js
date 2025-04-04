class Piece {
    constructor(scene, board, side, row, col, texture) {
        this.scene = scene;
        this.board = board;
        this.side = side;
        this.row = row;
        this.col = col;
        let { x, y } = board.getTilePosition(row, col);

        this.levelConfig = this.getLevelConfig();

        this.level = 1;
        this.maxHealth = 1;
        this.health = 1;
        this.attack = 1;
        this.attackMultiplier = 1;
        this.survivalMultiplier = 1;

        this.hasMoved = false;
        this.inAction = false;
        this.isGainingXP = false;

        this.sprite = scene.add.sprite(x, y, texture).setOrigin(0.5).setDisplaySize(board.tileSize, board.tileSize);

        this.sprite.setInteractive();
        this.sprite.on('pointerdown', () => scene.selectPiece(this));

        // Add hover event listeners
        this.sprite.on('pointerover', () => scene.setHoveredPiece(this));
        this.sprite.on('pointerout', () => scene.clearHoveredPiece(this));

        board.tiles[row][col].piece = this;

        this.hearts = [];
        this.createHearts();

        this.attackIcons = [];
        this.createAttackIcons();
    }

    getLevelConfig() {
        return {
            1: {
                xpRequired: 0,
                texture: "",
                maxHealth: 1,
                health: 1,
                attack: 1,
                attackMultiplier: 1,
                survivalMultiplier: 1,
            }
        };
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

    createAttackIcons() {
        this.attackIcons.forEach(icon => icon.destroy()); // Clear existing icons
        this.attackIcons = [];

        const spacing = 12;
        for (let i = 0; i < this.attack; i++) {
            let attackIcon = this.scene.add.image(0, 0, 'attack_blue').setScale(0.5);
            this.attackIcons.push(attackIcon);
        }
        this.updateAttackIconsPosition();
    }

    updateHeartsPosition() {
        const spacing = 12;
        let startX = this.sprite.x - (this.maxHealth - 1) * spacing / 2;
        let startY = this.sprite.y - 16 + this.board.tileSize / 2 + 5; // Below the piece

        this.hearts.forEach((heart, index) => {
            heart.setPosition(startX + index * spacing, startY);
        });
    }

    updateAttackIconsPosition() {
        const spacing = 12;

        // Position attack icons above the piece
        let startX = this.sprite.x - (this.attack - 1) * spacing / 2;
        let startY = this.sprite.y + 5 - this.board.tileSize / 2;

        this.attackIcons.forEach((icon, index) => {
            icon.setPosition(startX + index * spacing, startY);
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

    protected() {
        this.canReceivePassiveBonus = false;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        this.updateHearts();
    }

    isMoving() {
        this.hasMoved = true;
        this.canReceivePassiveBonus = true;
    }

    death() {
        this.sprite.destroy();
        this.hearts.forEach(heart => heart.destroy()); // Destroy hearts
        this.hearts = [];
    }

    getProtectedTiles() {
        return null;
    }

    // Add cleanup method to destroy the sprite
    cleanup() {
        if (this.sprite) {
            this.sprite.destroy();
        }

        this.hearts.forEach(heart => heart.destroy()); // Destroy hearts
        this.hearts = [];

        this.attackIcons.forEach(heart => heart.destroy()); // Destroy hearts
        this.attackIcons = [];
    }
}