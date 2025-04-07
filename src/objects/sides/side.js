const Species = Object.freeze({
    HUMAN: "human",
    MONSTER: "monster",
});

class Side {
    constructor(name, species, isPlayerControlled = false) {
        this.name = name;
        this.species = species;
        this.isPlayerControlled = isPlayerControlled;
        this.opposition = [];
        this.friendlies = [];
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

    addOpposition(side) {
        this.opposition.push(side);
    }

    addFriendly(side) {
        this.friendlies.push(side);
    }

    resetPieces() {
        this.pieces.forEach((piece) => { piece.returnToOriginalPosition(); })
    }

    healPeaces(amount = 1) {
        this.pieces.forEach((piece) => { piece.heal(amount); })
    }

    cleanup() {
        this.pieces.forEach(piece => {
            piece.cleanup();
            piece = undefined;
        });

        this.pieces = [];
    }
}
