class HumanSide extends Side {
    constructor() {
        super('Human', false);
    }

    setup(scene, board) {
        const centerCol = Math.floor(board.cols / 2);
        const centerRow = Math.floor(board.rows / 2);

        this.addPiece(new KingPiece(scene, board, centerRow, centerCol));

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
            this.addPiece(new PlayerPiece(scene, board, row, col));
        });
    }
}
