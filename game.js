class GameBoard {
    constructor(scene, rows = 7, cols = 7, tileSize = 100) {
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

    // Add cleanup method to destroy all board elements
    cleanup() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.tiles[row][col].highlight) {
                    this.tiles[row][col].highlight.destroy();
                }
                if (this.tiles[row][col].tile) {
                    this.tiles[row][col].tile.destroy();
                }
                if (this.tiles[row][col].modifier) {
                    this.tiles[row][col].modifier.destroy();
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

    // Add cleanup method to destroy the sprite
    cleanup() {
        if (this.sprite) {
            this.sprite.destroy();
        }
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

    getValidMoves() {
        let moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],         [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dx, dy]) => {
            let newRow = this.row + dx;
            let newCol = this.col + dy;
            if (newRow >= 0 && newRow < this.board.rows && newCol >= 0 && newCol < this.board.cols && !this.board.tiles[newRow][newCol].piece) {
                moves.push([newRow, newCol]);
            }
        });
        return moves;
    }
}

class VikingChess extends Phaser.Scene {
    constructor() {
        super({ key: 'VikingChess' });
        this.gameState = 'playerTurn';
        this.selectedPiece = null;
        this.statusText = null;
        this.restartButton = null;
    }

    preload() {
        this.load.spritesheet('board', 'assets/board.png', {
            frameWidth: 94,
            frameHeight: 94
        });
        this.load.image('pawn_piece', 'assets/pawn_piece.png');
        this.load.image('enemy_piece', 'assets/enemy_piece.png');
        this.load.image('king_piece', 'assets/king_piece.png');
        this.load.image('gold', 'assets/gold.png');
    }

    create() {
        this.gameState = 'playerTurn';
        this.selectedPiece = null;
        this.statusText = null;
        this.restartButton = null;

        this.board = new GameBoard(this);

        this.kingPiece = new KingPiece(this, this.board, 3, 3);

        this.playerPieces = [];
        const playerPositions = [
            [2, 2], [2, 3], [2, 4], [3, 2], [3, 4], [4, 3]
        ];
        playerPositions.forEach(([row, col]) => {
            this.playerPieces.push(new PlayerPiece(this, this.board, row, col));
        });

        this.enemyPieces = [];
        const enemyPositions = [
            [0, 2], [0, 3], [0, 4], [3, 0], [3, 6], [6, 2], [6, 3], [6, 4]
        ];
        enemyPositions.forEach(([row, col]) => {
            this.enemyPieces.push(new EnemyPiece(this, this.board, row, col));
        });

        // Add status text
        this.statusText = this.add.text(
            this.cameras.main.width / 2,
            30,
            'Player Turn',
            { fontSize: '24px', fill: '#fff', fontFamily: 'Arial' }
        ).setOrigin(0.5);
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

        // Get start and end positions
        const startPos = this.board.getTilePosition(piece.row, piece.col);
        const endPos = this.board.getTilePosition(newRow, newCol);

        // Calculate the path through each tile
        const path = [];

        // Determine if moving horizontally or vertically
        const isHorizontal = piece.row === newRow;

        if (isHorizontal) {
            // Horizontal movement
            const direction = piece.col < newCol ? 1 : -1;

            for (let col = piece.col + direction; direction > 0 ? col <= newCol : col >= newCol; col += direction) {
                path.push(this.board.getTilePosition(piece.row, col));
            }
        } else {
            // Vertical movement
            const direction = piece.row < newRow ? 1 : -1;

            for (let row = piece.row + direction; direction > 0 ? row <= newRow : row >= newRow; row += direction) {
                path.push(this.board.getTilePosition(row, piece.col));
            }
        }

        // Store original position and values
        const originalY = piece.sprite.y;
        const originalOriginY = piece.sprite.originY;
        const pieceHeight = piece.sprite.height;

        // Calculate the baseline offset (how much the bottom of the sprite will move when changing origin)
        const baselineOffset = pieceHeight * (1 - originalOriginY - 0.5);

        // Create a timeline for the movement animation
        const timeline = this.tweens.createTimeline();

        // Add hop animations through each tile in the path
        path.forEach((pos, index) => {
            const hopDuration = 100; // Base duration for each hop

            // Add a hop tween for this tile
            timeline.add({
                targets: piece.sprite,
                x: pos.x,
                y: function(t, target, key, value, progress) {
                    // Base y position at this point in the path
                    const baseY = pos.y;

                    // Add hop using sine curve (up to 20px at peak)
                    const hopHeight = 20;
                    const hop = -Math.sin(progress * Math.PI) * hopHeight;

                    // Return position that keeps the base at the same level
                    return baseY + hop;
                },
                rotation: {
                    value: index % 2 === 0 ? 0.1 : -0.1, // Alternate slight rotation
                    ease: 'Sine.easeInOut'
                },
                duration: hopDuration
            });
        });

        // Add final position and rotation reset
        timeline.add({
            targets: piece.sprite,
            x: endPos.x,
            y: endPos.y,
            rotation: 0,
            duration: 100,
            onComplete: () => {
                // Update piece position
                piece.row = newRow;
                piece.col = newCol;

                // Check for captures after the move
                this.checkCaptures(piece);

                // Clear the selection and highlights
                this.selectedPiece.sprite.clearTint();
                this.board.clearHighlights();
                this.selectedPiece = null;

                // Check win conditions
                if (this.checkWinConditions()) {
                    return; // Game is over
                }

                // Switch turns
                this.gameState = 'enemyTurn';
                this.statusText.setText('Enemy Turn');

                // Enemy's turn with a slight delay
                this.time.delayedCall(800, this.enemyTurn, [], this);
            }
        });

        // Start the timeline
        timeline.play();
    }

    enemyTurn() {
        if (this.gameState !== 'enemyTurn') return;

        // Find all possible moves for all enemy pieces
        let allMoves = [];

        this.enemyPieces.forEach(piece => {
            if (!piece.sprite.active) return; // Skip captured pieces

            const validMoves = piece.getValidMoves();
            validMoves.forEach(([row, col]) => {
                // Calculate a score for this move
                const moveScore = this.evaluateMove(piece, row, col);

                allMoves.push({
                    piece,
                    row,
                    col,
                    score: moveScore
                });
            });
        });

        // Sort moves by score (highest first)
        allMoves.sort((a, b) => b.score - a.score);

        if (allMoves.length > 0) {
            // Get the best move (or one of the top moves with some randomness)
            const randomIndex = Math.floor(Math.random() * Math.min(3, allMoves.length));
            const selectedMove = allMoves[randomIndex];

            // Execute the move
            this.executeEnemyMove(selectedMove.piece, selectedMove.row, selectedMove.col);
        } else {
            // No moves available, switch back to player
            this.gameState = 'playerTurn';
            this.statusText.setText('Player Turn');
        }
    }

    executeEnemyMove(piece, newRow, newCol) {
        // Update the board data
        this.board.tiles[piece.row][piece.col].piece = null;
        this.board.tiles[newRow][newCol].piece = piece;

        // Get start and end positions
        const startPos = this.board.getTilePosition(piece.row, piece.col);
        const endPos = this.board.getTilePosition(newRow, newCol);

        // Calculate the path through each tile
        const path = [];

        // Determine if moving horizontally or vertically
        const isHorizontal = piece.row === newRow;

        if (isHorizontal) {
            // Horizontal movement
            const direction = piece.col < newCol ? 1 : -1;

            for (let col = piece.col + direction; direction > 0 ? col <= newCol : col >= newCol; col += direction) {
                path.push(this.board.getTilePosition(piece.row, col));
            }
        } else {
            // Vertical movement
            const direction = piece.row < newRow ? 1 : -1;

            for (let row = piece.row + direction; direction > 0 ? row <= newRow : row >= newRow; row += direction) {
                path.push(this.board.getTilePosition(row, piece.col));
            }
        }

        // Create a timeline for the movement animation
        const timeline = this.tweens.createTimeline();

        // Add hop animations through each tile in the path
        path.forEach((pos, index) => {
            const hopDuration = 100; // Base duration for each hop

            // Add a hop tween for this tile
            timeline.add({
                targets: piece.sprite,
                x: pos.x,
                y: function(t, target, key, value, progress) {
                    // Base y position at this point in the path
                    const baseY = pos.y;

                    // Add hop using sine curve (up to 20px at peak)
                    const hopHeight = 20;
                    const hop = -Math.sin(progress * Math.PI) * hopHeight;

                    // Return position that keeps the base at the same level
                    return baseY + hop;
                },
                rotation: {
                    value: index % 2 === 0 ? 0.1 : -0.1, // Alternate slight rotation
                    ease: 'Sine.easeInOut'
                },
                duration: hopDuration
            });
        });

        // Add final position and rotation reset
        timeline.add({
            targets: piece.sprite,
            x: endPos.x,
            y: endPos.y,
            rotation: 0,
            duration: 100,
            onComplete: () => {
                // Update piece position
                piece.row = newRow;
                piece.col = newCol;

                // Check for captures
                this.checkCaptures(piece);

                // Check win conditions
                if (this.checkWinConditions()) {
                    return; // Game is over
                }

                // Switch turns back to player
                this.gameState = 'playerTurn';
                this.statusText.setText('Player Turn');
            }
        });

        // Start the timeline
        timeline.play();
    }

    evaluateMove(piece, row, col) {
        let score = 0;

        // Prioritize moves that can capture player pieces
        const captureScore = this.canCaptureAfterMove(piece, row, col);
        score += captureScore * 100;

        // Prioritize moves toward the king
        const distanceToKing = Math.abs(row - this.kingPiece.row) + Math.abs(col - this.kingPiece.col);
        score += (20 - distanceToKing) * 5;

        // Add some strategic positioning (center control, etc.)
        const centerDistance = Math.abs(row - 5) + Math.abs(col - 5);
        score += (10 - centerDistance) * 2;

        // Add some randomness to avoid predictability
        score += Math.random() * 10;

        return score;
    }

    canCaptureAfterMove(piece, newRow, newCol) {
        let captureCount = 0;

        // Temporarily move the piece
        const originalRow = piece.row;
        const originalCol = piece.col;
        const originalTilePiece = this.board.tiles[originalRow][originalCol].piece;
        const targetTilePiece = this.board.tiles[newRow][newCol].piece;

        // Update board data temporarily
        this.board.tiles[originalRow][originalCol].piece = null;
        this.board.tiles[newRow][newCol].piece = piece;
        piece.row = newRow;
        piece.col = newCol;

        // Check for potential captures
        // Check right
        if (newCol < this.board.cols - 2) {
            const rightPiece = this.board.tiles[newRow][newCol + 1].piece;
            if (rightPiece instanceof PlayerPiece || rightPiece instanceof KingPiece) {
                const sandwichPiece = this.board.tiles[newRow][newCol + 2].piece;
                if (sandwichPiece instanceof EnemyPiece) {
                    captureCount++;
                }
            }
        }

        // Check left
        if (newCol >= 2) {
            const leftPiece = this.board.tiles[newRow][newCol - 1].piece;
            if (leftPiece instanceof PlayerPiece || leftPiece instanceof KingPiece) {
                const sandwichPiece = this.board.tiles[newRow][newCol - 2].piece;
                if (sandwichPiece instanceof EnemyPiece) {
                    captureCount++;
                }
            }
        }

        // Check down
        if (newRow < this.board.rows - 2) {
            const downPiece = this.board.tiles[newRow + 1][newCol].piece;
            if (downPiece instanceof PlayerPiece || downPiece instanceof KingPiece) {
                const sandwichPiece = this.board.tiles[newRow + 2][newCol].piece;
                if (sandwichPiece instanceof EnemyPiece) {
                    captureCount++;
                }
            }
        }

        // Check up
        if (newRow >= 2) {
            const upPiece = this.board.tiles[newRow - 1][newCol].piece;
            if (upPiece instanceof PlayerPiece || upPiece instanceof KingPiece) {
                const sandwichPiece = this.board.tiles[newRow - 2][newCol].piece;
                if (sandwichPiece instanceof EnemyPiece) {
                    captureCount++;
                }
            }
        }

        // Restore the original board state
        piece.row = originalRow;
        piece.col = originalCol;
        this.board.tiles[originalRow][originalCol].piece = originalTilePiece;
        this.board.tiles[newRow][newCol].piece = targetTilePiece;

        return captureCount;
    }

    checkCaptures(piece) {
        const directions = [
            [0, 1],  // Right
            [0, -1], // Left
            [1, 0],  // Down
            [-1, 0]  // Up
        ];

        const row = piece.row;
        const col = piece.col;
        const isPlayerPiece = piece instanceof PlayerPiece || piece instanceof KingPiece;

        for (const [dx, dy] of directions) {
            const checkRow = row + dx;
            const checkCol = col + dy;

            // Check if there's an adjacent piece to capture
            if (checkRow >= 0 && checkRow < this.board.rows &&
                checkCol >= 0 && checkCol < this.board.cols) {

                const adjacentPiece = this.board.tiles[checkRow][checkCol].piece;

                // Skip if no piece or piece is same type
                if (!adjacentPiece) continue;
                if ((isPlayerPiece && (adjacentPiece instanceof PlayerPiece || adjacentPiece instanceof KingPiece)) ||
                    (!isPlayerPiece && adjacentPiece instanceof EnemyPiece)) continue;

                // Check for sandwiching piece
                const sandwichRow = checkRow + dx;
                const sandwichCol = checkCol + dy;

                if (sandwichRow >= 0 && sandwichRow < this.board.rows &&
                    sandwichCol >= 0 && sandwichCol < this.board.cols) {

                    const sandwichPiece = this.board.tiles[sandwichRow][sandwichCol].piece;

                    // If the sandwiching piece is of the same type as the current piece
                    if ((isPlayerPiece && (sandwichPiece instanceof PlayerPiece || sandwichPiece instanceof KingPiece)) ||
                        (!isPlayerPiece && sandwichPiece instanceof EnemyPiece)) {

                        // Don't capture the king with this method
                        if (adjacentPiece instanceof KingPiece) continue;

                        // Perform attack animation with both capturing pieces!
                        this.performAttackAnimation(piece, sandwichPiece, adjacentPiece);
                    }
                }
            }
        }
    }

    performAttackAnimation(piece1, piece2, targetPiece) {
        // Save original positions
        const piece1OrigX = piece1.sprite.x;
        const piece1OrigY = piece1.sprite.y;
        const piece2OrigX = piece2.sprite.x;
        const piece2OrigY = piece2.sprite.y;

        // Calculate attack direction vectors
        const p1ToTarget = {
            x: targetPiece.sprite.x - piece1OrigX,
            y: targetPiece.sprite.y - piece1OrigY
        };

        const p2ToTarget = {
            x: targetPiece.sprite.x - piece2OrigX,
            y: targetPiece.sprite.y - piece2OrigY
        };

        // Normalize and scale for thrust distance (20% of the way)
        const thrustDistance = 0.5;
        const p1ThrustX = piece1OrigX + (p1ToTarget.x * thrustDistance);
        const p1ThrustY = piece1OrigY + (p1ToTarget.y * thrustDistance);
        const p2ThrustX = piece2OrigX + (p2ToTarget.x * thrustDistance);
        const p2ThrustY = piece2OrigY + (p2ToTarget.y * thrustDistance);

        // Track completion of both animations
        let completionCount = 0;

        const createBloodEffect = () => {
            // Shake the camera slightly
            this.cameras.main.shake(100, 0.01);
        };

        const checkBothComplete = () => {
            completionCount++;
            if (completionCount === 1) {
                // Create blood effect after first hit
                createBloodEffect();
            }
            if (completionCount === 2) {
                // Create second blood effect after second hit
                createBloodEffect();
                // After both attacks complete, capture the piece
                this.capturePiece(targetPiece);
            }
        };

        // First attacker thrusts forward (parallel)
        this.tweens.add({
            targets: piece1.sprite,
            x: p1ThrustX,
            y: p1ThrustY,
            duration: 60,
            ease: 'Power1',
            yoyo: true,
            onComplete: checkBothComplete
        });

        // Second attacker thrusts forward (parallel)
        this.tweens.add({
            targets: piece2.sprite,
            x: p2ThrustX,
            y: p2ThrustY,
            duration: 60,
            ease: 'Power1',
            yoyo: true,
            delay: 50,
            onComplete: checkBothComplete
        });
    }

    capturePiece(piece) {
        // Remove from the board data
        this.board.tiles[piece.row][piece.col].piece = null;

        // Add a capture animation
        this.tweens.add({
            targets: piece.sprite,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => {
                // Remove the sprite
                piece.sprite.destroy();

                // Remove from arrays
                if (piece instanceof PlayerPiece) {
                    this.playerPieces = this.playerPieces.filter(p => p !== piece);
                } else if (piece instanceof EnemyPiece) {
                    this.enemyPieces = this.enemyPieces.filter(p => p !== piece);
                    if (Math.random() < 0.5) {
                        this.spawnGold(piece.row, piece.col);
                    }
                }
            }
        });
    }

    spawnGold(row, col) {
        let { x, y } = this.board.getTilePosition(row, col);
        this.add.sprite(x, y, 'gold').setOrigin(0.5).setDisplaySize(100, 100);
    }

    checkWinConditions() {
        // Check if the king reached an edge (player wins)
        if (this.kingPiece.row === 0 || this.kingPiece.row === this.board.rows - 1 ||
            this.kingPiece.col === 0 || this.kingPiece.col === this.board.cols - 1) {
            this.endGame("Player Wins! King escaped!");
            return true;
        }

        // Check if king is surrounded on all four sides (enemy wins)
        const kingRow = this.kingPiece.row;
        const kingCol = this.kingPiece.col;
        let surroundedCount = 0;

        // Check all four directions
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dx, dy] of directions) {
            const checkRow = kingRow + dx;
            const checkCol = kingCol + dy;

            if (checkRow < 0 || checkRow >= this.board.rows ||
                checkCol < 0 || checkCol >= this.board.cols) {
                continue; // Out of bounds counts as not surrounded
            }

            const adjacentPiece = this.board.tiles[checkRow][checkCol].piece;
            if (adjacentPiece instanceof EnemyPiece) {
                surroundedCount++;
            }
        }

        if (surroundedCount === 4) {
            this.endGame("Enemy Wins! King is captured!");
            return true;
        }

        // Check if player has no pieces left
        if (this.playerPieces.length === 0) {
            this.endGame("Enemy Wins! All defenders are captured!");
            return true;
        }

        // Check if enemy has no pieces left
        if (this.enemyPieces.length === 0) {
            this.endGame("Player Wins! All attackers are defeated!");
            return true;
        }

        return false;
    }

    endGame(message) {
        this.gameState = 'gameOver';
        this.statusText.setText(message);

        // Add a restart button
        this.restartButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'Restart Game',
            { fontSize: '24px', fill: '#fff', backgroundColor: '#333', padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setInteractive();

        this.restartButton.on('pointerdown', () => {
            this.cleanup(); // Clean up all game objects
            this.scene.restart();
        });
    }

    // Add cleanup method to properly destroy all game objects
    cleanup() {
        // Remove all event listeners and game objects
        if (this.restartButton) {
            this.restartButton.destroy();
        }

        // Clean up all pieces
        if (this.playerPieces) {
            this.playerPieces.forEach(piece => piece.cleanup());
        }

        if (this.enemyPieces) {
            this.enemyPieces.forEach(piece => piece.cleanup());
        }

        if (this.kingPiece) {
            this.kingPiece.cleanup();
        }

        // Clean up the board
        if (this.board) {
            this.board.cleanup();
        }

        // Stop all tweens
        this.tweens.killAll();

        // Clear all timers
        this.time.removeAllEvents();

        // Remove status text
        if (this.statusText) {
            this.statusText.destroy();
        }
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