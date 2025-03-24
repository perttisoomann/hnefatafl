class EnemyPiece extends Piece {
    constructor(scene, board, row, col, texture) {
        super(scene, board, row, col, 'enemy_piece');

        this.survivalMultiplier = 0.1;
    }
}