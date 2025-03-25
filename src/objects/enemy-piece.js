class EnemyPiece extends Piece {
    constructor(scene, board, row, col, level = 1) {
        let texture = 'enemy_piece';

        switch (level) {
            case 2:
                texture = 'enemy_piece_level2';
                break;
            case 3:
                texture = 'enemy_piece_level3';
                break;
        }

        super(scene, board, row, col, texture);

        switch (level) {
            case 1:
                this.survivalMultiplier = 0.1;
                break;

            case 2:
                this.health = 2;
                this.survivalMultiplier = 0.25;
                break;

            case 3:
                this.health = 3;
                this.attack = 2;
                this.survivalMultiplier = 0.5;
                break;
        }
    }
}