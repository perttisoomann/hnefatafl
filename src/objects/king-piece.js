class KingPiece extends PlayerPiece {
    constructor(scene, board, side, row, col) {
        super(scene, board, side, row, col, 'king_piece');
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
            1: { xpRequired: 0, texture: 'king_piece', bonus: {} },
            2: { xpRequired: 4, texture: 'king_piece_level2', bonus: { health: 2, moveRange: 1 } },
            3: { xpRequired: 8, texture: 'king_piece_level3', bonus: { attack: 2, health: 1, moveRange: 2 } },
        };
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
}