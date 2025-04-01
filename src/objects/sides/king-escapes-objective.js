class KingEscapes extends GameObjective {
    constructor(side, positions) {
        super(side, 'King escapes', 'Player Wins! King escaped!');
        this.positions = positions;
    }

    isAchieved() {
        const kingPieces = this.side.pieces.filter((piece) => piece && piece instanceof KingPiece);

        if (!kingPieces.length) {
            return false;
        }

        for (const king of kingPieces) {
            console.log(king);
            for (const position of this.positions) {
                if (king.row === position[0] && king.col === position[1]) {
                    return true;
                }
            }
        }

        return false;
    }
}