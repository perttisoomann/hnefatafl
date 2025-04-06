class EnemyPiece extends Piece {
    constructor(scene, board, side, row, col, level = 1) {
        super(scene, board, side, row, col, level);

        switch (level) {
            case 1:
                this.survivalMultiplier = 0.1;
                break;

            case 2:
                this.survivalMultiplier = 0.25;
                break;

            case 3:
                this.survivalMultiplier = 0.5;
                break;
        }
    }

    getLevelConfig() {
        return {
            1: {
                xpRequired: 0,
                texture: "enemy_piece",
                maxHealth: 1,
                attack: 1,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            },
            2: {
                xpRequired: 0,
                texture: "enemy_piece_level2",
                maxHealth: 1,
                attack: 2,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            },
            3: {
                xpRequired: 0,
                texture: "enemy_piece_level3",
                maxHealth: 2,
                attack: 2,
                attackMultiplier: 1,
                survivalMultiplier: 1,
                moveRange: 66,
            }
        };
    }

    getValidMoves() {
        let moves = [];

        const boardRows = this.board.rows;
        const boardCols = this.board.cols;
        const cornerPositions = [
            [0, 0], [0, boardCols - 1],
            [boardRows - 1, 0], [boardRows - 1, boardCols - 1]
        ];

        const isCorner = (r, c) => cornerPositions.some(([cr, cc]) => cr === r && cc === c);

        // Check vertical movement
        for (let i = this.row - 1; i >= 0; i--) {
            if (this.board.tiles[i][this.col].piece) break;
            if (!isCorner(i, this.col)) {
                moves.push([i, this.col]);
            }
        }
        for (let i = this.row + 1; i < this.board.rows; i++) {
            if (this.board.tiles[i][this.col].piece) break;
            if (!isCorner(i, this.col)) {
                moves.push([i, this.col]);
            }
        }

        // Check horizontal movement
        for (let j = this.col - 1; j >= 0; j--) {
            if (this.board.tiles[this.row][j].piece) break;
            if (!isCorner(this.row, j)) {
                moves.push([this.row, j]);
            }
        }
        for (let j = this.col + 1; j < this.board.cols; j++) {
            if (this.board.tiles[this.row][j].piece) break;
            if (!isCorner(this.row, j)) {
                moves.push([this.row, j]);
            }
        }
        return moves;
    }
}