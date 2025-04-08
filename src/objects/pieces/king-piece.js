class KingPiece extends PlayerPiece {
    constructor(scene, board, side, row, col, level) {
        super(scene, board, side, row, col, level);
        this.name = generateVikingName();
    }

    getLevelConfig() {
        return {
            1: {
                xpRequired: 0,
                texture: "king_piece",
                maxHealth: 2,
                attack: 1,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 1,
                ability: Ability.STUN,
                abilityTrigger: AbilityTrigger.ACTIVE,
                abilityRange: 2,
            },
            2: {
                xpRequired: 4,
                texture: "pawn_piece_level2",
                maxHealth: 3,
                attack: 2,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 2,
                ability: Ability.STUN,
                abilityTrigger: AbilityTrigger.ACTIVE,
                abilityRange: 3,
            },
            3: {
                xpRequired: 8,
                texture: "pawn_piece_level3",
                maxHealth: 6,
                attack: 4,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 4,
                ability: Ability.STUN,
                abilityTrigger: AbilityTrigger.ACTIVE,
                abilityRange: 4,
            }
        };
    }

    getValidMoves() {
        let moves = [];
        const directions = [
            [-1, 0],
            [0, -1],[0, 1],
            [1, 0],
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
}