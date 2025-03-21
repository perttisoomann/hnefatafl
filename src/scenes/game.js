class VikingChess extends Phaser.Scene {
    constructor() {
        super({ key: 'VikingChess' });
        this.gameState = 'playerTurn';
        this.selectedPiece = null;
        this.statusText = null;
        this.restartButton = null;
        this.goldGroup = null; // Group to hold gold pieces
        this.playerGold = 0;
        this.infoPanel = null;
    }

    preload() {
        this.load.spritesheet('board', 'assets/board.png', {
            frameWidth: 94,
            frameHeight: 94
        });
        this.load.image('pawn_piece', 'assets/pawn_piece.png');
        this.load.image('pawn_piece_level2', 'assets/pawn_piece_level2.png');
        this.load.image('pawn_piece_level3', 'assets/pawn_piece_level3.png');
        this.load.image('enemy_piece', 'assets/enemy_piece.png');
        this.load.image('king_piece', 'assets/king_piece.png');
        this.load.image('king_piece_level2', 'assets/king_piece_level2.png');
        this.load.image('king_piece_level3', 'assets/king_piece_level3.png');
        this.load.image('gold', 'assets/gold.png');
    }

    create() {
        this.gameState = 'passivePlayerTurn'; // Changed to start with passive player turn
        this.selectedPiece = null;
        this.statusText = null;
        this.restartButton = null;
        this.goldGroup = this.add.group(); // Initialize the gold group
        this.playerGold = 0;

        this.board = new GameBoard(this);

        this.kingPiece = new KingPiece(this, this.board, 3, 3);

        this.playerPieces = [];
        const playerPositions = [
            [2, 3], [3, 2], [4, 3], [3, 4], // Cardinal directions
            [2, 2], [2, 4], [4, 2], [4, 4]  // Diagonals
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
            'Passive Player Turn',
            { fontSize: '24px', fill: '#fff', fontFamily: 'Arial' }
        ).setOrigin(0.5);

        // Create info panel on the right side
        this.createInfoPanel();

        // Process the passive player turn as soon as the game starts
        this.processPassivePlayerTurn();
    }

    // Create the information panel
    createInfoPanel() {
        const panelWidth = 200;
        const panelHeight = 300;
        const panelX = this.cameras.main.width - panelWidth - 20;
        const panelY = this.cameras.main.height / 2 - panelHeight / 2;

        this.infoPanel = new InfoPanel(this, panelX, panelY, panelWidth, panelHeight);
        // Initially hide the panel (set alpha to 0)
        this.hideInfoPanel();
    }

    processPassivePlayerTurn() {
        if (this.gameState !== 'passivePlayerTurn') return;

        this.statusText.setText('Passive Player Turn');

        // Check for any enemy pieces that are sandwiched between player pieces
        let capturesFound = false;

        // Check all enemy pieces
        for (const enemyPiece of this.enemyPieces) {
            if (!enemyPiece.sprite || !enemyPiece.sprite.active) continue;

            const row = enemyPiece.row;
            const col = enemyPiece.col;

            // Check all four directions for sandwich captures
            const directions = [
                [0, 1],  // Right
                [0, -1], // Left
                [1, 0],  // Down
                [-1, 0]  // Up
            ];

            for (const [dx, dy] of directions) {
                // Check first side
                const side1Row = row - dx;
                const side1Col = col - dy;

                // Check second side
                const side2Row = row + dx;
                const side2Col = col + dy;

                // Make sure both sides are within bounds
                if (side1Row < 0 || side1Row >= this.board.rows ||
                    side1Col < 0 || side1Col >= this.board.cols ||
                    side2Row < 0 || side2Row >= this.board.rows ||
                    side2Col < 0 || side2Col >= this.board.cols) {
                    continue;
                }

                // Get pieces on both sides
                const side1Piece = this.board.tiles[side1Row][side1Col].piece;
                const side2Piece = this.board.tiles[side2Row][side2Col].piece;

                // Check if enemy is sandwiched between player pieces
                if ((side1Piece instanceof PlayerPiece || side1Piece instanceof KingPiece) &&
                    (side2Piece instanceof PlayerPiece || side2Piece instanceof KingPiece)) {

                    capturesFound = true;

                    // Store the pieces involved for XP calculation
                    const attackerPieces = [side1Piece, side2Piece];

                    // First show the attack animation
                    this.time.delayedCall(500, () => {
                        this.performAttackAnimation(side1Piece, side2Piece, enemyPiece);
                    });

                    // We found a sandwich capture - break out of directions loop
                    break;
                }
            }

            if (capturesFound) {
                // Only handle one capture per passive turn to make it more visible
                break;
            }
        }

        // Use a delayed call to transition to player turn after passive effects
        // Add a longer delay if captures were found to allow animations to complete
        const delayTime = capturesFound ? 1000 : 500;

        this.time.delayedCall(delayTime, () => {
            // After passive effects, transition to active player turn
            this.gameState = 'playerTurn';
            this.statusText.setText('Player Turn');
            this.updateStatusText();
        }, [], this);
    }

    // Process passive effects for enemy's turn
    processPassiveEnemyTurn() {
        if (this.gameState !== 'passiveEnemyTurn') return;

        this.statusText.setText('Passive Enemy Turn');

        // Check for any player pieces that are sandwiched between enemy pieces
        let capturesFound = false;

        // Check all player pieces (including king)
        const allPlayerPieces = [...this.playerPieces];
        if (this.kingPiece && this.kingPiece.sprite && this.kingPiece.sprite.active) {
            allPlayerPieces.push(this.kingPiece);
        }

        // Check each player piece
        for (const playerPiece of allPlayerPieces) {
            if (!playerPiece.sprite || !playerPiece.sprite.active) continue;

            const row = playerPiece.row;
            const col = playerPiece.col;

            // Check all four directions for sandwich captures
            const directions = [
                [0, 1],  // Right
                [0, -1], // Left
                [1, 0],  // Down
                [-1, 0]  // Up
            ];

            for (const [dx, dy] of directions) {
                // Check first side
                const side1Row = row - dx;
                const side1Col = col - dy;

                // Check second side
                const side2Row = row + dx;
                const side2Col = col + dy;

                // Make sure both sides are within bounds
                if (side1Row < 0 || side1Row >= this.board.rows ||
                    side1Col < 0 || side1Col >= this.board.cols ||
                    side2Row < 0 || side2Row >= this.board.rows ||
                    side2Col < 0 || side2Col >= this.board.cols) {
                    continue;
                }

                // Get pieces on both sides
                const side1Piece = this.board.tiles[side1Row][side1Col].piece;
                const side2Piece = this.board.tiles[side2Row][side2Col].piece;

                // Check if player is sandwiched between enemy pieces
                if (side1Piece instanceof EnemyPiece && side2Piece instanceof EnemyPiece) {
                    capturesFound = true;

                    // Store the pieces involved for attack calculation
                    const attackerPieces = [side1Piece, side2Piece];

                    // First show the attack animation
                    this.time.delayedCall(500, () => {
                        this.performAttackAnimation(side1Piece, side2Piece, playerPiece);
                    });

                    // We found a sandwich capture - break out of directions loop
                    break;
                }
            }

            if (capturesFound) {
                // Only handle one capture per passive turn to make it more visible
                break;
            }
        }

        // Use a delayed call to transition to enemy turn after passive effects
        // Add a longer delay if captures were found to allow animations to complete
        const delayTime = capturesFound ? 1000 : 500;

        this.time.delayedCall(delayTime, () => {
            // After passive effects, transition to active enemy turn
            this.gameState = 'enemyTurn';
            this.statusText.setText('Enemy Turn');
            this.updateStatusText();

            // Start enemy turn with a slight delay
            this.time.delayedCall(800, this.enemyTurn, [], this);
        }, [], this);
    }

    // Show the info panel with piece details - Unchanged
    showPieceInfo(piece) {
        this.infoPanel.show(piece);
    }

    // Hide the info panel
    hideInfoPanel() {
        this.infoPanel.hide();
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
        this.updateStatusText(); // Update status to show treasure
    }

    updateStatusText() {
        let text = '';

        // Set text based on current game state
        switch(this.gameState) {
            case 'passivePlayerTurn':
                text = 'Passive Player Turn';
                break;
            case 'playerTurn':
                text = 'Player Turn';
                break;
            case 'passiveEnemyTurn':
                text = 'Passive Enemy Turn';
                break;
            case 'enemyTurn':
                text = 'Enemy Turn';
                break;
            default:
                text = this.gameState;
        }

        text += ` | Gold: ${this.playerGold}`;
        this.statusText.setText(text);
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
                duration: hopDuration,
                onComplete: () => {
                    // Check for gold pickup
                    if (piece instanceof PlayerPiece || piece instanceof KingPiece) {
                        this.checkGoldPickup(piece);
                    }
                }
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

                // Update XP text position if it's a player piece
                if ((piece instanceof PlayerPiece || piece instanceof KingPiece) && piece.xpText) {
                    piece.xpText.setPosition(
                        piece.sprite.x,
                        piece.sprite.y + this.board.tileSize / 2 + 5
                    );
                }

                // Check for gold pickup
                if (piece instanceof PlayerPiece || piece instanceof KingPiece) {
                    this.checkGoldPickup(piece);
                }

                // Clear the selection and highlights
                this.selectedPiece.sprite.clearTint();
                this.board.clearHighlights();
                this.selectedPiece = null;
                this.updateStatusText(); // Update status after move

                // Update info panel if piece is currently hovered
                if (piece === this.hoveredPiece) {
                    this.showPieceInfo(piece);
                }

                // Flag to track if captures are in progress
                let capturesInProgress = false;
                let captureAnimationComplete = false;

                // Create a modified checkCaptures that tracks completion
                const checkCapturesWithCallback = () => {
                    const directions = [
                        [0, 1],  // Right
                        [0, -1], // Left
                        [1, 0],  // Down
                        [-1, 0]  // Up
                    ];

                    const row = piece.row;
                    const col = piece.col;
                    const isPlayerPiece = piece instanceof PlayerPiece || piece instanceof KingPiece;

                    // First check if any captures will be performed
                    let willCaptureAny = false;

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

                            // Don't capture the king with this method
                            if (adjacentPiece instanceof KingPiece) continue;

                            // Check for sandwiching piece
                            const sandwichRow = checkRow + dx;
                            const sandwichCol = checkCol + dy;

                            if (sandwichRow >= 0 && sandwichRow < this.board.rows &&
                                sandwichCol >= 0 && sandwichCol < this.board.cols) {

                                const sandwichPiece = this.board.tiles[sandwichRow][sandwichCol].piece;

                                // If the sandwiching piece is of the same type as the current piece
                                if ((isPlayerPiece && (sandwichPiece instanceof PlayerPiece || sandwichPiece instanceof KingPiece)) ||
                                    (!isPlayerPiece && sandwichPiece instanceof EnemyPiece)) {

                                    willCaptureAny = true;
                                    break;
                                }
                            }
                        }
                    }

                    // If we're not capturing anything, proceed directly to next steps
                    if (!willCaptureAny) {
                        proceedAfterCaptures();
                        return;
                    }

                    // If we are capturing, set flag and create a timeout
                    capturesInProgress = true;

                    // Now perform the actual captures
                    this.checkCaptures(piece);

                    // Set a timeout for when animations should be complete
                    // This is a fallback in case capture animations don't trigger completion
                    this.time.delayedCall(1200, () => {
                        if (capturesInProgress) {
                            capturesInProgress = false;
                            proceedAfterCaptures();
                        }
                    });
                };

                // Function to call after captures are complete
                const proceedAfterCaptures = () => {
                    // Check win conditions
                    if (this.checkWinConditions()) {
                        return; // Game is over
                    }

                    // Switch turns - now go to passiveEnemyTurn instead of directly to enemyTurn
                    this.gameState = 'passiveEnemyTurn';
                    this.statusText.setText('Passive Enemy Turn');
                    this.updateStatusText();

                    // Process passive enemy turn effects
                    this.processPassiveEnemyTurn();
                };

                // Hook into the performAttackAnimation method to track completions
                const originalPerformAttackAnimation = this.performAttackAnimation;
                this.performAttackAnimation = (piece1, piece2, targetPiece) => {
                    capturesInProgress = true;

                    // Call original method
                    originalPerformAttackAnimation.call(this, piece1, piece2, targetPiece);

                    // After a reasonable delay that covers animations, proceed
                    this.time.delayedCall(800, () => {
                        capturesInProgress = false;
                        // If no more captures are in progress, proceed
                        proceedAfterCaptures();
                    });
                };

                // Start the capture checks
                checkCapturesWithCallback();

                // Restore original method
                this.time.delayedCall(1500, () => {
                    this.performAttackAnimation = originalPerformAttackAnimation;
                });
            }
        });

        // Start the timeline
        timeline.play();
    }

    // Rest of the methods remain largely unchanged

    setHoveredPiece(piece) {
        this.hoveredPiece = piece;
        this.showPieceInfo(piece);
    }

    clearHoveredPiece(piece) {
        if (this.hoveredPiece === piece) {
            this.hoveredPiece = null;
            this.hideInfoPanel();
        }
    }

    checkGoldPickup(piece) {
        const pieceBounds = piece.sprite.getBounds();
        let goldToRemove = null;

        this.goldGroup.getChildren().forEach(gold => {
            const goldBounds = gold.getBounds();
            if (Phaser.Geom.Rectangle.Overlaps(pieceBounds, goldBounds)) {
                this.playerGold += 10;
                goldToRemove = gold;
            }
        });

        if (goldToRemove) {
            this.goldGroup.remove(goldToRemove, true, true); // Remove from group and destroy
            this.updateStatusText(); // Update the displayed treasure
        }
    }

    // enemyTurn should only be called during enemyTurn state
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
            // No moves available, switch back to passive player turn
            this.gameState = 'passivePlayerTurn';
            this.statusText.setText('Passive Player Turn');
            this.updateStatusText();

            // Process passive player turn
            this.processPassivePlayerTurn();
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

                // Update info panel if piece is currently hovered
                if (piece === this.hoveredPiece) {
                    this.showPieceInfo(piece);
                }

                // Check for captures
                this.checkCaptures(piece);

                // Check win conditions
                if (this.checkWinConditions()) {
                    return; // Game is over
                }

                // Switch turns back to passive player turn
                this.gameState = 'passivePlayerTurn';
                this.statusText.setText('Passive Player Turn');
                this.updateStatusText();

                // Process passive player turn
                this.processPassivePlayerTurn();
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

                        // Store the pieces involved in this capture for XP calculation
                        if (isPlayerPiece && adjacentPiece instanceof EnemyPiece) {
                            // Perform attack animation with both capturing pieces
                            this.performAttackAnimation(piece, sandwichPiece, adjacentPiece);
                        } else {
                            // Enemy capturing player piece
                            this.performAttackAnimation(piece, sandwichPiece, adjacentPiece);
                        }
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

        // Store the attacking pieces if they're player pieces for XP gain
        const attackerPieces = [];
        attackerPieces.push(piece1);
        attackerPieces.push(piece2);

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
                this.capturePiece(targetPiece, attackerPieces);
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

    capturePiece(piece, attackerPieces = []) {

        let maxAttack = 0;
        attackerPieces.forEach(attacker => {
            maxAttack = Math.max(maxAttack, attacker.attack);
        });

        // If an enemy was captured by player pieces, award XP
        if (piece instanceof EnemyPiece && attackerPieces.length > 0) {
            // Award XP to all player pieces involved in the capture
            attackerPieces.forEach(attacker => {
                attacker.gainXP();
            });
        }

        piece.health -= maxAttack;

        if (piece.health > 0) {
            return;
        }

        // If this is the currently hovered piece, hide info panel
        if (piece === this.hoveredPiece) {
            this.hideInfoPanel();
            this.hoveredPiece = null;
        }

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
                    if (Math.random() < 0.66) {
                        this.spawnGold(piece.row, piece.col);
                    }
                }
            }
        });
    }

    spawnGold(row, col) {
        let { x, y } = this.board.getTilePosition(row, col);
        const gold = this.add.sprite(x, y, 'gold').setOrigin(0.5).setDisplaySize(this.board.tileSize * 0.6, this.board.tileSize * 0.6); // Adjust size as needed
        this.goldGroup.add(gold);
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

        // Destroy the gold group
        if (this.goldGroup) {
            this.goldGroup.destroy(true, true);
        }

        // Stop all tweens
        this.tweens.killAll();

        // Clear all timers
        this.time.removeAllEvents();

        // Remove status text
        if (this.statusText) {
            this.statusText.destroy();
        }

        if(this.infoPanel){
            this.infoPanel.destroy();
        }
    }
}
