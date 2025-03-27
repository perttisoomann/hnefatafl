class Side {
    constructor(name, isAI) {
        this.name = name;
        this.isAI = isAI;
        this.pieces = [];
    }

    setup(scene, board) {
    }

    addPiece(piece) {
        this.pieces.push(piece);
    }
}
