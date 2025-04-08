const Ability = Object.freeze({
    NONE: "none",
    PROTECTION: "protection",
    STUN: "stun",
});

const AbilityTrigger = Object.freeze({
    NONE: "none",
    PASSIVE: "passive",
    ACTIVE: "active",
});

// TODO: set up ability icons for each ability, but only display these when piece is selected

// TODO: set up range definition

// TODO: show range when piece is selected or hovered over

class Piece {
    constructor(scene, board, side, row, col, level) {
        this.scene = scene;
        this.board = board;
        this.side = side;
        this.row = row;
        this.col = col;
        this.originalRow = row;
        this.originalCol = col;
        let { x, y } = board.getTilePosition(row, col);

        this.levelConfig = this.getLevelConfig();

        this.maxHealth = 1;
        this.health = 1;
        this.attack = 1;
        this.moveRange = 66;
        this.attackMultiplier = 1;
        this.survivalMultiplier = 1;
        this.texture = null;
        this.xp = 0;

        this.ability = Ability.NONE;
        this.abilityTrigger = AbilityTrigger.NONE;
        this.abilityRange = 0;

        this.sprite = scene.add.sprite(x, y, this.texture).setOrigin(0.5).setDisplaySize(board.tileSize, board.tileSize);

        this.hearts = [];
        this.createHearts();

        this.attackIcons = [];
        this.createAttackIcons();

        this.level = level;
        this.setLevel(this.level);

        this.hasMoved = false;
        this.inAction = false;
        this.spentForRound = false;
        this.canLevelUp = false;

        this.sprite.setInteractive();
        this.sprite.on('pointerdown', () => {
            if (!this.spentForRound) {
                scene.selectPiece(this);
            }
        });

        // Add hover event listeners
        this.sprite.on('pointerover', () => scene.setHoveredPiece(this));
        this.sprite.on('pointerout', () => scene.clearHoveredPiece(this));

        board.tiles[row][col].piece = this;
    }

    clearSpentForRound() {
        this.spentForRound = false;
        this.sprite.clearTint();
    }

    spentForThisRound() {
        this.spentForRound = true;
        this.sprite.setTint(0x666666);
    }

    gainXP() {
        if (!this.canLevelUp) {
            return;
        }

        this.xp += 1;
        this.checkLevelUp();
        this.showXpGainAnimation();
    }

    checkLevelUp() {
        const nextLevel = this.level + 1;
        if (this.levelConfig[nextLevel] && this.xp >= this.levelConfig[nextLevel].xpRequired) {
            this.setLevel(nextLevel);
            this.showLevelUpAnimation();
        }
    }

    setLevel(newLevel) {
        const config = this.levelConfig[newLevel];
        if (!config) return; // Invalid level

        this.level = newLevel;
        this.texture = config.texture;

        if (this.sprite) {
            this.sprite.setTexture(config.texture).setOrigin(0.5).setDisplaySize(this.board.tileSize, this.board.tileSize);
        }

        this.maxHealth = config.maxHealth;
        this.health = this.maxHealth;

        this.attack = config.attack;
        this.moveRange = config.moveRange;

        if (config.ability) {
            this.ability = config.ability;
            this.abilityTrigger = config.abilityTrigger;
            this.abilityRange = config.abilityRange;
        }

        this.createHearts();
        this.createAttackIcons();
    }

    showXpGainAnimation() {
        const floatingText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 20,
            '+1',
            { fontSize: '20px', fill: '#ffff00', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: floatingText,
            y: this.sprite.y - 60,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }

    showLevelUpAnimation() {
        //Add animation for level up here, for example particle effect, or different text animation.
        const levelUpText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 40,
            `Level Up!`,
            {fontSize: '24px', fill: '#00ff00', stroke: '#000', strokeThickness: 3}
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: levelUpText,
            y: this.sprite.y - 80,
            alpha: 0,
            duration: 2500,
            ease: 'Power2',
            onComplete: () =>{
                levelUpText.destroy();
            }
        })
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
        const newHealth = Math.min(this.health + amount, this.maxHealth);

        if (newHealth !== this.health) {
            const healthDelta = newHealth - this.health;
            this.health = newHealth;

            this.showHealAnimation(healthDelta);

            this.updateHearts();
        }
    }

    showHealAnimation(healthDelta) {
        const healthText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 40,
            "+" + healthDelta + "HP",
            {fontSize: '24px', fill: '#ff0000', stroke: '#000', strokeThickness: 3}
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: healthText,
            y: this.sprite.y - 80,
            alpha: 0,
            duration: 2500,
            ease: 'Power2',
            onComplete: () =>{
                healthText.destroy();
            }
        })
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

    returnToOriginalPosition() {
        this.row = this.originalRow;
        this.col = this.originalCol;
        this.board.tiles[this.row][this.col].piece = this;
        const newPos = this.board.getTilePosition(this.row, this.col);
        this.x = newPos.x;
        this.y = newPos.y;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
}