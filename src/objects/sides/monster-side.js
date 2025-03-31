class MonsterSide extends Side {
    constructor() {
        super('Monster');
    }

    setup(scene, board) {
        const centerCol = Math.floor(board.cols / 2);
        const centerRow = Math.floor(board.rows / 2);

        let enemyPositions = [
            // Top
            [0, centerCol - 1],
            [0, centerCol],
            [0, centerCol + 1],

            // Bottom
            [board.rows - 1, centerCol - 1],
            [board.rows - 1, centerCol],
            [board.rows - 1, centerCol + 1],
        ];
        enemyPositions.forEach(([row, col]) => {
            this.addPiece(new EnemyPiece(scene, board, this, row, col));
        });

        enemyPositions = [
            // Left
            [centerRow, 0],

            // Right
            [centerRow, board.cols - 1],
        ];
        enemyPositions.forEach(([row, col]) => {
            this.addPiece(new EnemyPiece(scene, board, this, row, col, 1));
        });
    }

    setupObjectives(scene)
    {
        this.objectives = [];

        // TODO: capture human king
        // TODO: Any enemy pieces left is 1 or less
    }
}
