class Side {
    constructor(name, isHuman = false) {
        this.name = name;
        this.isHuman = isHuman;
        this.pieces = [];
        this.objectives = [];
    }

    setup(scene, board) {}

    setupObjectives(scene) {}

    addPiece(piece) {
        this.pieces.push(piece);
    }

    addObjective(objective) {
        this.objectives.push(objective);
    }
}
