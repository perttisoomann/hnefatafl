class HumanSide extends Side {
    constructor() {
        super('Human', Species.HUMAN, true);
    }

    setup(scene, board) {
        const centerCol = Math.floor(board.cols / 2);
        const centerRow = Math.floor(board.rows / 2);

        this.addPiece(new KingPiece(scene, board, this, centerRow, centerCol));

        const playerPositions = [
            // Cardinal directions
            [centerRow - 1, centerCol],
            [centerRow, centerCol - 1],
            [centerRow, centerCol + 1],
            [centerRow + 1, centerCol],

            // Diagonals
            [centerRow - 1, centerCol - 1],
            [centerRow - 1, centerCol + 1],
            [centerRow + 1, centerCol - 1],
            [centerRow + 1, centerCol + 1],
        ];

        playerPositions.forEach(([row, col]) => {
            this.addPiece(new PlayerPiece(scene, board, this, row, col));
        });
    }

    setupObjectives(scene)
    {
        this.objectives = [];

        const escapePositions = [
            [0, 0],
            [scene.board.rows - 1, 0],
            [0, scene.board.cols - 1],
            [scene.board.rows - 1, scene.board.cols - 1],
        ];
        this.objectives.push(new KingEscapes(this, escapePositions));

        this.objectives.push(new EliminateOpposition(this, 1));
    }
}
