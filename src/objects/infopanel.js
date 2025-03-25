class InfoPanel {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.panel = scene.add.rectangle(
            x + width / 2,
            y + height / 2,
            width,
            height,
            0x333333,
            0.8
        ).setOrigin(0.5);

        this.title = scene.add.text(
            x + width / 2,
            y + 20,
            'Piece Information',
            { fontSize: '18px', fill: '#fff', fontFamily: 'Arial', fontWeight: 'bold' }
        ).setOrigin(0.5);

        this.image = scene.add.sprite(
            x + width / 2,
            y + 80,
            'pawn_piece'
        ).setDisplaySize(64, 64).setVisible(false);

        this.text = scene.add.text(
            x + 20,
            y + 130,
            'Hover over a piece\nto see information',
            { fontSize: '16px', fill: '#fff', fontFamily: 'Arial', align: 'left', wordWrap: { width: width - 40 } }
        );

        this.hide();
    }

    show(piece) {
        this.panel.setAlpha(1);
        this.title.setAlpha(1);
        this.image.setAlpha(1);
        this.text.setAlpha(1);

        this.image.setTexture(piece.sprite.texture.key);
        this.image.setVisible(true);

        let title = '';
        let details = '';

        if (piece instanceof KingPiece) {
            title = 'King ' + piece.name;
            details = `The king must escape to the edge\nof the board to win.\n\n` +
                `Experience: ${piece.xp} XP\n` +
                `Health: ${piece.health}/${piece.maxHealth}\n` +
                `Attack: ${piece.attack}\n` +
                `Movement: One space in any direction`;
        } else if (piece instanceof PlayerPiece) {
            title = 'Defender ' + piece.name;
            details = `Protect the king and capture\nenemy pieces.\n\n` +
                `Experience: ${piece.xp} XP\n` +
                `Health: ${piece.health}/${piece.maxHealth}\n` +
                `Attack: ${piece.attack}\n` +
                `Movement: Any number of spaces\nhorizontally or vertically`;
        } else if (piece instanceof EnemyPiece) {
            title = 'Attacker';
            details = `Capture the king by surrounding\nit on all four sides.\n\n` +
                `Health: ${piece.health}/${piece.maxHealth}\n` +
                `Attack: ${piece.attack}\n` +
                `Movement: Any number of spaces\nhorizontally or vertically`;
        }

        this.title.setText(title);
        this.text.setText(details);
    }

    hide() {
        this.panel.setAlpha(0.5);
        this.title.setAlpha(0.5);
        this.image.setAlpha(0);
        this.text.setText('Hover over a piece\nto see information');
    }

    destroy() {
        this.panel.destroy();
        this.title.destroy();
        this.image.destroy();
        this.text.destroy();
    }
}