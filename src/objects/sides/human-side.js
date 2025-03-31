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

        // TODO: King reaches corners
        // TODO: Any enemy pieces left is 1 or less
    }
}
