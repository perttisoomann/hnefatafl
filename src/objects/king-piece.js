class KingPiece extends Piece {
    constructor(scene, board, row, col) {
        super(scene, board, row, col, 'king_piece');
        this.xp = 0; // Initialize XP for king piece too
        this.xpText = null;

        this.sprite.on('pointerover', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.setTint(0x00ff00);
            }
        });
        this.sprite.on('pointerout', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.clearTint();
            }
        });

        // Create XP text for king
        this.createXpDisplay(scene);
    }

    createXpDisplay(scene) {
        // Create a text object to show the XP below the piece
        this.xpText = scene.add.text(
            this.sprite.x,
            this.sprite.y + this.board.tileSize / 2 + 5,
            `XP: ${this.xp}`,
            { fontSize: '16px', fill: '#fff', stroke: '#000', strokeThickness: 2 }
        ).setOrigin(0.5);

        // Initially hide the XP display until the piece gains XP
        this.xpText.setAlpha(0);
    }

    updateXpDisplay() {
        if (this.xpText) {
            this.xpText.setText(`XP: ${this.xp}`);

            // Show the XP text if the piece has gained XP
            if (this.xp > 0) {
                this.xpText.setAlpha(1);
            }
        }
    }

    gainXP() {
        this.xp += 1;
        this.updateXpDisplay();
        this.showXpGainAnimation();
    }

    showXpGainAnimation() {
        // Create a floating +1 text
        const floatingText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 20,
            '+1',
            { fontSize: '20px', fill: '#ffff00', stroke: '#000', strokeThickness: 3 }
        ).setOrigin(0.5);

        // Animate the text floating upward and fading out
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

    getValidMoves() {
        let moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],         [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dx, dy]) => {
            let newRow = this.row + dx;
            let newCol = this.col + dy;
            if (newRow >= 0 && newRow < this.board.rows && newCol >= 0 && newCol < this.board.cols && !this.board.tiles[newRow][newCol].piece) {
                moves.push([newRow, newCol]);
            }
        });
        return moves;
    }

    // Override the parent cleanup method to also clean up the XP text
    cleanup() {
        if (this.xpText) {
            this.xpText.destroy();
        }
        super.cleanup();
    }
}