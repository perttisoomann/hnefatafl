class GameBoard {
    constructor(scene, rows = 11, cols = 11, tileSize = 64) {
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize;
        this.offsetX = (scene.scale.width - this.cols * this.tileSize) / 2;
        this.offsetY = (scene.scale.height - this.rows * this.tileSize) / 2;
        this.tiles = [];
        this.createBoard();
    }

    createBoard() {
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                let x = this.offsetX + col * this.tileSize;
                let y = this.offsetY + row * this.tileSize;
                let isLight = (row + col) % 2 === 0;
                let tile = this.scene.add.image(x, y, 'board', isLight ? 0 : 1)
                    .setOrigin(0)
                    .setDisplaySize(this.tileSize, this.tileSize);
                this.tiles[row][col] = { tile, modifier: null, highlight: null, piece: null };
            }
        }
    }

    getTilePosition(row, col) {
        return {
            x: this.offsetX + col * this.tileSize + this.tileSize / 2,
            y: this.offsetY + row * this.tileSize + this.tileSize / 2
        };
    }

    highlightTiles(positions, piece) {
        this.clearHighlights();
        positions.forEach(([row, col]) => {
            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                let { x, y } = this.getTilePosition(row, col);
                this.tiles[row][col].highlight = this.scene.add.rectangle(x, y, this.tileSize, this.tileSize, 0x00ff00, 0.3);

                // Make the highlight interactive
                this.tiles[row][col].highlight.setInteractive();

                // Add hover effects
                this.tiles[row][col].highlight.on('pointerover', () => {
                    this.tiles[row][col].highlight.fillAlpha = 0.7;
                });

                this.tiles[row][col].highlight.on('pointerout', () => {
                    this.tiles[row][col].highlight.fillAlpha = 0.3;
                });

                // Add click event to move the piece
                this.tiles[row][col].highlight.on('pointerdown', () => {
                    this.scene.movePiece(piece, row, col);
                });
            }
        });
    }

    clearHighlights() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.tiles[row][col].highlight) {
                    this.tiles[row][col].highlight.destroy();
                    this.tiles[row][col].highlight = null;
                }
            }
        }
    }
}

class Piece {
    constructor(scene, board, row, col, texture) {
        this.scene = scene;
        this.board = board;
        this.row = row;
        this.col = col;
        let { x, y } = board.getTilePosition(row, col);
        this.sprite = scene.add.sprite(x, y, texture).setOrigin(0.5).setDisplaySize(board.tileSize, board.tileSize);
        this.health = 1;
        this.sprite.setInteractive();
        this.sprite.on('pointerdown', () => scene.selectPiece(this));
        board.tiles[row][col].piece = this;
    }

    getValidMoves() {
        let moves = [];
        // Check vertical movement
        for (let i = this.row - 1; i >= 0; i--) {
            if (this.board.tiles[i][this.col].piece) break;
            moves.push([i, this.col]);
        }
        for (let i = this.row + 1; i < this.board.rows; i++) {
            if (this.board.tiles[i][this.col].piece) break;
            moves.push([i, this.col]);
        }
        // Check horizontal movement
        for (let j = this.col - 1; j >= 0; j--) {
            if (this.board.tiles[this.row][j].piece) break;
            moves.push([this.row, j]);
        }
        for (let j = this.col + 1; j < this.board.cols; j++) {
            if (this.board.tiles[this.row][j].piece) break;
            moves.push([this.row, j]);
        }
        return moves;
    }
}

class PlayerPiece extends Piece {
    constructor(scene, board, row, col) {
        super(scene, board, row, col, 'pawn_piece');
        this.sprite.on('pointerover', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.setTint(0x00ff00);
            }
        });
        this.sprite.on('pointerout', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.clearTint();
            }
        });
    }
}

class EnemyPiece extends Piece {
    constructor(scene, board, row, col) {
        super(scene, board, row, col, 'enemy_piece');
    }
}

class KingPiece extends Piece {
    constructor(scene, board, row, col) {
        super(scene, board, row, col, 'king_piece');
        this.sprite.on('pointerover', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.setTint(0x00ff00);
            }
        });
        this.sprite.on('pointerout', () => {
            if (scene.selectedPiece !== this) {
                this.sprite.clearTint();
            }
        });
    }
}

class VikingChess extends Phaser.Scene {
    constructor() {
        super({ key: 'VikingChess' });
        this.gameState = 'playerTurn';
        this.selectedPiece = null;
    }

    preload() {
        this.load.spritesheet('board', 'assets/board.png', {
            frameWidth: 94,
            frameHeight: 94
        });
        this.load.image('pawn_piece', 'assets/pawn_piece.png');
        this.load.image('enemy_piece', 'assets/enemy_piece.png');
        this.load.image('king_piece', 'assets/king_piece.png');
    }

    create() {
        this.board = new GameBoard(this);

        this.kingPiece = new KingPiece(this, this.board, 5, 5);

        this.playerPieces = [];
        const playerPositions = [
            [3, 5], [4, 4], [4, 5], [4, 6], [5, 3], [5, 4], [5, 6], [5, 7], [6, 4], [6, 5], [6, 6], [7, 5]
        ];
        playerPositions.forEach(([row, col]) => {
            this.playerPieces.push(new PlayerPiece(this, this.board, row, col));
        });

        this.enemyPieces = [];
        const enemyPositions = [
            [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
            [1, 5],
            [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
            [5, 1],
            [3, 10], [4, 10], [5, 10], [6, 10], [7, 10],
            [5, 9],
            [10, 3], [10, 4], [10, 5], [10, 6], [10, 7],
            [9, 5]
        ];
        enemyPositions.forEach(([row, col]) => {
            this.enemyPieces.push(new EnemyPiece(this, this.board, row, col));
        });
    }

    selectPiece(piece) {
        if (this.gameState !== 'playerTurn') return;
        if (!(piece instanceof PlayerPiece) && !(piece instanceof KingPiece)) return;
        if (this.selectedPiece) {
            this.selectedPiece.sprite.clearTint();
            this.board.clearHighlights();
        }
        this.selectedPiece = piece;
        this.selectedPiece.sprite.setTint(0xffff00);
        this.board.highlightTiles(piece.getValidMoves(), piece);
    }

    movePiece(piece, newRow, newCol) {
        if (!this.selectedPiece) return;

        // Update the board data
        this.board.tiles[piece.row][piece.col].piece = null;
        this.board.tiles[newRow][newCol].piece = piece;

        // Update piece position
        piece.row = newRow;
        piece.col = newCol;

        // Move the sprite
        let { x, y } = this.board.getTilePosition(newRow, newCol);

        // Animate the movement
        this.tweens.add({
            targets: piece.sprite,
            x: x,
            y: y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Check for captures after the move
                this.checkCaptures(piece);

                // Clear the selection and highlights
                this.selectedPiece.sprite.clearTint();
                this.board.clearHighlights();
                this.selectedPiece = null;

                // Switch turns
                this.gameState = 'enemyTurn';

                // For now, let's switch back to player turn automatically
                this.time.delayedCall(500, () => {
                    this.gameState = 'playerTurn';
                });
            }
        });
    }

    checkCaptures(piece) {
        // This will be implemented later
        // For now, it's just a placeholder
        console.log("Checking for captures");
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    parent: 'game-container',
    scene: [VikingChess]
};

const game = new Phaser.Game(config);