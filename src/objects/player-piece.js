function generateVikingName() {
    const prefixes = ["Thor", "Odin", "Freyr", "Tyr", "Loki", "Bjorn", "Ivar", "Ragnar", "Astrid", "Ingrid"];
    const suffixes = ["son", "dottir", "hammer", "axe", "shield", "helm", "blade", "fist", "stone", "wind"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return prefix + suffix;
}

class PlayerPiece extends Piece {
    constructor(scene, board, row, col) {
        super(scene, board, row, col, 'pawn_piece');
        this.xp = 0; // Initialize XP counter for each player piece
        this.xpText = null; // Will store the text object for XP display
        this.name = generateVikingName();

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

        // Create XP text that follows the piece
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

    // Override the parent cleanup method to also clean up the XP text
    cleanup() {
        if (this.xpText) {
            this.xpText.destroy();
        }
        super.cleanup();
    }
}