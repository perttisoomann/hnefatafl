class ShieldmaidenPiece extends PlayerPiece {
    constructor(scene, board, side, row, col, level) {
        super(scene, board, side, row, col, level);
        this.canLevelUp = true;
        this.name = generateVikingName();
    }

    getLevelConfig() {
        return {
            1: {
                xpRequired: 0,
                texture: "shieldmaiden_piece",
                maxHealth: 2,
                attack: 1,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            },
            2: {
                xpRequired: 3,
                texture: "shieldmaiden_piece_level2",
                maxHealth: 3,
                attack: 1,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            },
            3: {
                xpRequired: 6,
                texture: "shieldmaiden_piece_level3",
                maxHealth: 4,
                attack: 2,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            }
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