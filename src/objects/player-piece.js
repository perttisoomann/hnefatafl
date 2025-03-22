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
    }

    gainXP() {
        this.xp += 1;
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
}