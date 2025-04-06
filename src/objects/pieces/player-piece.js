function generateVikingName() {
    const prefixes = ["Thor", "Odin", "Freyr", "Tyr", "Loki", "Bjorn", "Ivar", "Ragnar", "Astrid", "Ingrid"];
    const suffixes = ["son", "dottir", "hammer", "axe", "shield", "helm", "blade", "fist", "stone", "wind"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return prefix + suffix;
}

class PlayerPiece extends Piece {
    constructor(scene, board, side, row, col, level) {
        super(scene, board, side, row, col, level);
        this.canLevelUp = true;
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

    getLevelConfig() {
        return {
            1: {
                xpRequired: 0,
                texture: "pawn_piece",
                maxHealth: 1,
                attack: 1,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            },
            2: {
                xpRequired: 3,
                texture: "pawn_piece_level2",
                maxHealth: 2,
                attack: 1,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            },
            3: {
                xpRequired: 6,
                texture: "pawn_piece_level3",
                maxHealth: 2,
                attack: 2,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            }
        };
    }
}