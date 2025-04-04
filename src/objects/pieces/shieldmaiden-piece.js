class ShieldmaidenPiece extends PlayerPiece {
    constructor(scene, board, row, col) {
        super(scene, board, row, col, 'shieldmaiden_piece');
        this.xp = 0; // Initialize XP for king piece too
        this.xpText = null;
        this.name = generateVikingName();
        this.maxHealth = 2;
        this.health = this.maxHealth;

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

        this.createHearts();
    }

    getLevelConfig() {
        return {
            1: { xpRequired: 0, texture: 'shieldmaiden_piece', bonus: {} },
            2: { xpRequired: 4, texture: 'shieldmaiden_piece_level2', bonus: { health: 1} },
            3: { xpRequired: 8, texture: 'shieldmaiden_piece_level3', bonus: { attack: 1, health: 1} },
        };
    }

    getProtectedTiles() {
        return [
            [this.row - 1, this.col],
            [this.row + 1, this.col],
            [this.row, this.col - 1],
            [this.row, this.col + 1],
        ];

        // level based spread?
        switch (this.level) {

        }

        return null;
    }
}