class KingCaptured extends GameObjective {
    constructor(side, positions) {
        super(side, 'Capture king', 'Enemy Wins! King is captured!');
        this.positions = positions;
    }

    isAchieved() {
        for (const side of this.side.opposition) {
            if (side.pieces) {
                for (const piece of side.pieces) {
                    if (piece instanceof KingPiece) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}