const AuraTrigger = Object.freeze({
    CAPTURE: 'capture',
});

class Aura {
    constructor(piece, name) {
        this.name = name;
    }

    affectsTile(row, col) {
        const tiles = this.affectedTiles();

        // TODO: check if tile was affected or not

        return false;
    }

    affectedTiles() { return [];}
}

class ProtectiveAura extends Aura {
    constructor(piece) {
        super(piece,"Protect");
    }

    affectedTiles() {
        return [];
    }
}
