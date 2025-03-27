class Side {
    constructor(name, isHuman = false) {
        this.name = name;
        this.isHuman = isHuman;
        this.pieces = [];
    }

    setup(scene, board) {
    }

    addPiece(piece) {
        this.pieces.push(piece);
    }
}
