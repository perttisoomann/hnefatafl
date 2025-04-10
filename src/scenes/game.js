const GameState = Object.freeze({
    PASSIVE_MOVES: "passiveMoves",
    PASSIVE_MOVE_CHECK: "passiveCheckConditions",
    GET_MOVE: "getMove",
    MOVE_PIECE: "movePiece",
    CHECK_CAPTURES: "checkCaptures",
    AWAIT_ACTIONS: "awaitActions",
    DELAY: "delay",
    NEXT_TURN: "nextTurn",
    NEXT_ROUND: "nextRound",
});

class VikingChess extends Phaser.Scene {
    constructor() {
        super({ key: 'VikingChess' });
        this.gameState = 'playerTurn';
        this.selectedPiece = null;
        this.selectedRow = null;
        this.selectedCol = null;
        this.statusText = null;
        this.restartButton = null;
        this.goldGroup = null; // Group to hold gold pieces
        this.playerGold = 0;
        this.infoPanel = null;

        const player = new HumanSide();
        const enemy = new MonsterSide();

        player.addOpposition(enemy);
        enemy.addOpposition(player);

        this.sides = [enemy, player];
        this.activeSide = 0;
        this.animationCheckCounter = 0;
        this.state = null;
        this.nextState = null;
    }

    preload() {
        this.load.spritesheet('board', 'assets/board.png', {
            frameWidth: 94,
            frameHeight: 94
        });
        this.load.image('pawn_piece', 'assets/pawn_piece.png');
        this.load.image('pawn_piece_level2', 'assets/pawn_piece_level2.png');
        this.load.image('pawn_piece_level3', 'assets/pawn_piece_level3.png');

        this.load.image('shieldmaiden_piece', 'assets/shieldmaiden_piece.png');
        this.load.image('shieldmaiden_piece_level2', 'assets/shieldmaiden_piece_level2.png');
        this.load.image('shieldmaiden_piece_level3', 'assets/shieldmaiden_piece_level3.png');

        this.load.image('enemy_piece', 'assets/enemy_piece.png');
        this.load.image('enemy_piece_level2', 'assets/enemy_piece_level2.png');
        this.load.image('enemy_piece_level3', 'assets/enemy_piece_level3.png');

        this.load.image('king_piece', 'assets/king_piece.png');
        this.load.image('king_piece_level2', 'assets/king_piece_level2.png');
        this.load.image('king_piece_level3', 'assets/king_piece_level3.png');

        this.load.image('gold', 'assets/gold.png');
        this.load.image('player_win_graphic', 'assets/player_win.png');
        this.load.image('enemy_win_graphic', 'assets/enemy_win.png');

        this.load.image('heart_red', 'assets/heart_full.png');
        this.load.image('heart_grey', 'assets/heart_empty.png');

        this.load.image('attack_blue', 'assets/attack_full.png');
    }

    create() {
        this.gameState = 'passivePlayerTurn'; // Changed to start with passive player turn
        this.selectedPiece = null;
        this.statusText = null;
        this.restartButton = null;
        this.goldGroup = this.add.group(); // Initialize the gold group
        this.playerGold = 0;

        this.board = new GameBoard(this);

        this.sides.forEach(side => {
            side.setup(this, this.board);
            side.setupObjectives(this);
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

        this.delayForAction(GameState.GET_MOVE, 45);
    }

    processState(state) {
        this.state = state;
        this.nextState = null;
        console.log('SIDE: ' + this.sides[this.activeSide].name + ' STATE: ' + this.state);
        switch (this.state) {
            case GameState.PASSIVE_MOVES:
                this.processPassiveTurn();
                this.waitForActionsToComplete(GameState.PASSIVE_MOVE_CHECK);
                break;
            case GameState.PASSIVE_MOVE_CHECK:
                if (!this.wereObjectivesAchieved()) {
                    console.log('passive, Not achieved');
                    this.processState(GameState.GET_MOVE);
                }
                break;
            case GameState.GET_MOVE:
                if (!this.sides[this.activeSide].isPlayerControlled) {
                    this.enemyTurn();
                }
                break;
            case GameState.MOVE_PIECE:
                this.sides[this.activeSide].pieces.forEach(piece => piece.clearSpentForRound());
                this.board.clearHighlights();
                this.movePiece(this.selectedPiece, this.selectedRow, this.selectedCol);
                this.waitForActionsToComplete(GameState.CHECK_CAPTURES);
                break;
            case GameState.CHECK_CAPTURES:
                this.checkCaptures(this.selectedPiece);
                this.waitForActionsToComplete(GameState.NEXT_TURN);
                break;
            case GameState.NEXT_TURN:
                if (!this.wereObjectivesAchieved()) {
                    console.log('active, Not achieved');
                    this.nextSide();
                }
                break;
            case GameState.NEXT_ROUND:
                break;
        }
    }

    delayForAction(nextState, counter = 30) {
        this.state = GameState.DELAY;
        this.nextState = nextState;
        this.animationCheckCounter = counter;
        console.log('SIDE: ' + this.sides[this.activeSide].name + ' STATE: ' + this.state);
    }

    waitForActionsToComplete(nextState, counter = 15) {
        this.state = GameState.AWAIT_ACTIONS;
        this.nextState = nextState;
        this.animationCheckCounter = counter;
        console.log('SIDE: ' + this.sides[this.activeSide].name + ' STATE: ' + this.state);
    }

    nextSide() {
        this.selectedPiece = null;
        this.selectedRow = null;
        this.selectedCol = null;

        this.activeSide += 1;
        if (this.activeSide >= this.sides.length) {
            this.activeSide = 0;
        }

        this.delayForAction(GameState.PASSIVE_MOVES);
    }

    // Create the information panel
    createInfoPanel() {
        const panelWidth = 200;
        const panelHeight = 300;

        // Right-side panel for hovered piece
        const rightPanelX = this.cameras.main.width - panelWidth - 20;
        const panelY = this.cameras.main.height / 2 - panelHeight / 2;
        this.infoPanel = new InfoPanel(this, rightPanelX, panelY, panelWidth, panelHeight);
        this.hideInfoPanel();

        // Left-side panel for selected piece
        const leftPanelX = 20;
        this.selectedInfoPanel = new InfoPanel(this, leftPanelX, panelY, panelWidth, panelHeight);
        this.hideSelectedInfoPanel();
    }

    // Show selected piece info
    showSelectedPieceInfo(piece) {
        this.selectedInfoPanel.show(piece);
    }

    // Hide selected piece info
    hideSelectedInfoPanel() {
        this.selectedInfoPanel.hide();
    }

    processPassiveTurn() {
        this.statusText.setText('Passive Turn');

        let capturesFound = false;

        const allEnemyPieces = this.getEnemyPieces();

        // Check all enemy pieces
        for (const enemyPiece of allEnemyPieces) {
            if (!enemyPiece.sprite || !enemyPiece.sprite.active || enemyPiece.hasMoved) continue;

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

                const side1Piece = this.board.tiles[side1Row][side1Col].piece;
                const side2Piece = this.board.tiles[side2Row][side2Col].piece;

                if (
                    side1Piece
                    && side2Piece
                    && side1Piece.side === this.sides[this.activeSide]
                    && side2Piece.side === this.sides[this.activeSide]
                ) {
                    capturesFound = true;
                    this.performAttackAnimation(side1Piece, side2Piece, enemyPiece, true);
                    break;
                }
            }

            if (capturesFound) {
                // Only handle one capture per passive turn to make it more visible
                break;
            }
        }

        this.resetMovementFlags();

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

    resetMovementFlags() {
        this.sides.forEach(side => {
            side.pieces.forEach(piece => piece.hasMoved = false);
        });
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
        if (!this.sides[this.activeSide].isPlayerControlled) return;

        if (!(piece instanceof PlayerPiece)) return;

        if (this.selectedPiece) {
            this.selectedPiece.sprite.clearTint();
            this.board.clearHighlights();
        }

        this.selectedPiece = piece;
        this.selectedPiece.sprite.setTint(0xffff00);
        this.board.highlightTiles(piece.getValidMoves(), piece);

        this.showSelectedPieceInfo(piece);

        this.updateStatusText();
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
        piece.sprite.clearTint();
        piece.inAction = true;
        piece.isMoving();

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
            const hopDuration = 75; // Base duration for each hop

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
            duration: 75,
            onComplete: () => {
                // Update piece position
                piece.row = newRow;
                piece.col = newCol;

                // Update XP text position if it's a player piece
                if ((piece instanceof PlayerPiece) && piece.xpText) {
                    piece.xpText.setPosition(
                        piece.sprite.x,
                        piece.sprite.y + this.board.tileSize / 2 + 5
                    );
                }

                // Check for gold pickup
                if (piece instanceof PlayerPiece) {
                    this.checkGoldPickup(piece);
                }

                piece.inAction = false;
            }
        });

        // Start the timeline
        timeline.play();
    }

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
        this.attackOpportunityMap = this.applyForesight(this.computeAttackOpportunityMap(), 2);
        this.attackSetupMap = this.applyForesight(this.computeAttackSetupMap(), 2);

        // Find all possible moves for all enemy pieces
        let allMoves = [];

        this.sides[this.activeSide].pieces.forEach(piece => {
            if (!piece.sprite.active || piece.spentForRound) {
                return;
            }

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
            const selectedMove = allMoves[0];
            this.selectedPiece = selectedMove.piece;
            this.selectedRow = selectedMove.row;
            this.selectedCol = selectedMove.col;
            this.processState(GameState.MOVE_PIECE);
        } else {
            this.processState(GameState.NEXT_TURN);
        }
    }

    computeAttackOpportunityMap() {
        let map = Array.from({ length: this.board.rows }, () => Array(this.board.cols).fill(0));
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                if (this.board.tiles[row][col].piece) continue; // Only process empty tiles

                for (const [dx, dy] of directions) {
                    let playerRow = row + dx;
                    let playerCol = col + dy;
                    let enemyRow = row + 2 * dx;
                    let enemyCol = col + 2 * dy;

                    if (this.isValidTile(playerRow, playerCol) && this.isValidTile(enemyRow, enemyCol)) {
                        let playerPiece = this.board.tiles[playerRow][playerCol].piece;
                        let enemyPiece = this.board.tiles[enemyRow][enemyCol].piece;

                        if ((playerPiece instanceof PlayerPiece || playerPiece instanceof KingPiece) &&
                            (enemyPiece instanceof EnemyPiece)) {
                            map[row][col] += playerPiece instanceof KingPiece ? 5 : 1;
                        }
                    }
                }
            }
        }
        return map;
    }

    computeAttackSetupMap() {
        let map = Array.from({ length: this.board.rows }, () => Array(this.board.cols).fill(0));
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                if (this.board.tiles[row][col].piece) continue; // Only process empty tiles

                for (const [dx, dy] of directions) {
                    let playerRow = row + dx;
                    let playerCol = col + dy;
                    let emptyRow = row + 2 * dx;
                    let emptyCol = col + 2 * dy;

                    if (this.isValidTile(playerRow, playerCol) && this.isValidTile(emptyRow, emptyCol)) {
                        let playerPiece = this.board.tiles[playerRow][playerCol].piece;
                        let emptyTile = !this.board.tiles[emptyRow][emptyCol].piece;

                        if ((playerPiece instanceof PlayerPiece || playerPiece instanceof KingPiece) && emptyTile) {
                            map[row][col] += playerPiece instanceof KingPiece ? 5 : 1;
                        }
                    }
                }
            }
        }
        return map;
    }

    applyForesight(originalMap, iterations = 1) {
        const strength = 0.5;
        let map = Array.from({ length: this.board.rows }, () => Array(this.board.cols).fill(0));
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        // TODO: calculate new values
        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                if (originalMap[row][col] !== 0) {
                    for (const [dx, dy] of directions) {
                        let checkRow = row;
                        let checkCol = col;
                        for (let i = 1; i < this.board.cols; i++) {
                            checkRow += dy;
                            checkCol += dx;

                            // reached the end of the board
                            if (
                                checkRow < 0 || checkRow >= this.board.rows
                                || checkCol < 0 || checkCol >= this.board.cols
                            ) {
                                break;
                            }

                            // reached a tile with piece on it
                            if (this.board.tiles[checkRow][checkCol].piece) {
                                break;
                            }

                            map[checkRow][checkCol] += originalMap[row][col] * strength;
                        }
                    }
                }
            }
        }

        // TODO: pass to iterative loop

        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                map[row][col] += originalMap[row][col];
            }
        }

        return map;
    }

    evaluateMove(piece, row, col) {
        let score = 0;

        // Use precomputed escape danger map
        score += this.attackSetupMap[row][col] * 50 * piece.attackMultiplier;

        // Use precomputed attack opportunity map
        score += this.attackOpportunityMap[row][col] * 250 * piece.attackMultiplier;

        /*
        // Check if the move escapes an imminent attack
        if (this.avoidsAttack(piece, row, col)) {
            score += 80 * piece.survivalMultiplier;
        }
         */


        /*
        // Distance to king (aggression factor)
        const distanceToKing = Math.abs(row - this.kingPiece.row) + Math.abs(col - this.kingPiece.col);
        score += (20 - distanceToKing) * 5 * piece.attackMultiplier;
         */

        // Randomness to avoid predictable behavior
        score += Math.random() * 5;

        return score;
    }

    avoidsAttack(piece, row, col) {
        return this.isTileSafe(row, col) ? 1 : 0;
    }

    isTileSafe(row, col) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dx, dy] of directions) {
            const adjRow = row + dx;
            const adjCol = col + dy;
            if (this.isValidTile(adjRow, adjCol)) {
                const adjPiece = this.board.tiles[adjRow][adjCol].piece;
                if (adjPiece instanceof PlayerPiece) return false;
            }
        }
        return true;
    }

    isValidTile(row, col) {
        return row >= 0 && row < this.board.rows && col >= 0 && col < this.board.cols;
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

                const targetPiece = this.board.tiles[checkRow][checkCol].piece;

                // Skip if no piece
                if (!targetPiece) continue;

                // ... or piece is same type
                if ((isPlayerPiece && (targetPiece instanceof PlayerPiece || targetPiece instanceof KingPiece)) ||
                    (!isPlayerPiece && targetPiece instanceof EnemyPiece)) {
                    if (targetPiece instanceof KingPiece) continue; // Allow king to be captured normally
                    continue;
                }

                // Check for sandwiching piece
                const sandwichRow = checkRow + dx;
                const sandwichCol = checkCol + dy;

                if (sandwichRow >= 0 && sandwichRow < this.board.rows &&
                    sandwichCol >= 0 && sandwichCol < this.board.cols) {

                    const sandwichPiece = this.board.tiles[sandwichRow][sandwichCol].piece;

                    // If the sandwiching piece is of the same type as the current piece
                    if ((isPlayerPiece && (sandwichPiece instanceof PlayerPiece)) ||
                        (!isPlayerPiece && sandwichPiece instanceof EnemyPiece)) {

                        // TODO: check for aura protection here?

                        this.performAttackAnimation(piece, sandwichPiece, targetPiece);
                    }
                }
            }
        }
    }

    getProtector(targetPiece) {
        return null;

        const pieces = targetPiece instanceof PlayerPiece ? this.enemyPieces : this.playerPieces;
        let protector = null;

        pieces.forEach(piece => {
            if (!protector && piece !== targetPiece) {
                const protectedTiles = piece.getProtectedTiles();

                if (protectedTiles) {
                    const exists = protectedTiles.some(
                        ([row, col]) => row === targetPiece.row && col === targetPiece.col
                    );

                    if (exists) {
                        protector = piece;
                    }
                }
            }
        });

        return protector;
    }

    performProtectionAnimation(protector, targetPiece) {
        return;
    }

    performAttackAnimation(piece1, piece2, targetPiece, disableForRound = false) {
        piece1.isActive = true;
        piece2.isActive = true;
        targetPiece.isActive = true;

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

        // First attacker thrusts forward (parallel)
        this.tweens.add({
            targets: piece1.sprite,
            x: p1ThrustX,
            y: p1ThrustY,
            duration: 60,
            ease: 'Power1',
            yoyo: true,
            onComplete: () => {
                piece1.isActive = false;
                if (disableForRound) {
                    piece1.spentForThisRound();
                }
                createBloodEffect();
            }
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
            onComplete: () => {
                piece2.isActive = false;
                if (disableForRound) {
                    piece2.spentForThisRound();
                }
                createBloodEffect();
                this.capturePiece(targetPiece, attackerPieces);
            }
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

        piece.takeDamage(maxAttack);

        if (piece.health > 0) {
            piece.isActive = false;
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
                piece.death();

                if (piece instanceof EnemyPiece) {
                    if (Math.random() < 0.66) {
                        this.spawnGold(piece.row, piece.col);
                    }
                }

                piece.side.pieces = piece.side.pieces.filter(p => p !== piece);
            }
        });
    }

    spawnGold(row, col) {
        let { x, y } = this.board.getTilePosition(row, col);
        const gold = this.add.sprite(x, y, 'gold').setOrigin(0.5).setDisplaySize(this.board.tileSize * 0.6, this.board.tileSize * 0.6); // Adjust size as needed
        this.goldGroup.add(gold);
    }

    wereObjectivesAchieved() {
        console.log('STATE: Check objectives.');

        let gameFinished = false;
        this.sides.forEach(side => {
            console.log(gameFinished);
            if (gameFinished) {
                return;
            }

            side.objectives.some(objective => {
                console.log(gameFinished);
                if (gameFinished) {
                    return;
                }

                if (objective.isAchieved()) {
                    console.log('SIDE: ' + objective.side.name + ' Check: ' + objective.name + ' (ACHIEVED)');
                    gameFinished = true;
                    this.endGame(objective.message, side.isPlayerControlled);
                    return;
                }

                console.log('SIDE: ' + objective.side.name + ' Check: ' + objective.name);
            });
        });

        console.log('final', gameFinished);

        return gameFinished;
    }

    endGame(message, playerWon = true) {
        console.log('GAME OVER: ' + message + ' Human: ' + playerWon);

        this.statusText.setText(message);

        if (playerWon) {
            this.winGraphic = this.add.image(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50,
                'player_win_graphic'
            ).setOrigin(0.5).setDepth(100);

            // Add continue button for player wins
            this.continueButton = this.add.text(
                this.cameras.main.width / 2 - 100,
                this.cameras.main.height - 50,
                'Continue Campaign',
                { fontSize: '24px', fill: '#fff', backgroundColor: '#008800', padding: { x: 10, y: 5 } }
            ).setOrigin(0.5).setInteractive().setDepth(100);

            this.continueButton.on('pointerdown', () => {
                this.continueButton.destroy();
                this.resetGameWithCurrentPlayerPieces();
            });
        } else {
            this.winGraphic = this.add.image(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50,
                'enemy_win_graphic'
            ).setOrigin(0.5).setDepth(100);
        }

        // Animation for the graphic
        this.tweens.add({
            targets: this.winGraphic,
            scale: { from: 0.5, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 800,
            ease: 'Bounce.Out'
        });

        // Always add restart button for both win/loss
        this.restartButton = this.add.text(
            this.cameras.main.width / 2 + (message.includes("Player Wins") ? 100 : 0),
            this.cameras.main.height - 50,
            'New Game',
            { fontSize: '24px', fill: '#fff', backgroundColor: '#333', padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setInteractive().setDepth(100);

        this.restartButton.on('pointerdown', () => {
            this.cleanup();
            this.scene.restart();
        });
    }

    resetGameWithCurrentPlayerPieces() {
        console.log("STATE: --- Moving to the next round ---");

        // Clean up everything except player pieces
        if (this.restartButton) this.restartButton.destroy();

        if (this.winGraphic) this.winGraphic.destroy();
        if (this.goldGroup) this.goldGroup.destroy(true, true);
        this.tweens.killAll();

        // Reset game state
        this.selectedPiece = null;
        this.goldGroup = this.add.group();

        this.board.resetBoard();

        this.sides[0].cleanup();
        this.sides[0] = undefined;

        const enemy = new MonsterSide();

        this.sides[1].addOpposition(enemy);
        enemy.addOpposition(this.sides[1]);
        enemy.setup(this, this.board);

        this.sides[0] = enemy;
        this.sides[1].resetPieces();
        this.sides[1].healPeaces();

        this.activeSide = 0;
        this.animationCheckCounter = 0;

        console.log(this.sides);

        this.delayForAction(GameState.GET_MOVE, 45);
    }

    update() {
        this.sides.forEach(side => {
            side.pieces.forEach(piece => {
                piece.updateHeartsPosition();
                piece.updateAttackIconsPosition();
            });
        });

        if (this.state === GameState.AWAIT_ACTIONS) {
            this.animationCheckCounter -= 1;

            if (this.animationCheckCounter <= 0) {
                if (this.hasActionInProgress()) {
                    this.animationCheckCounter = 15;
                } else {
                    this.processState(this.nextState);
                }
            }
        }

        if (this.state === GameState.DELAY) {
            this.animationCheckCounter -= 1;

            if (this.animationCheckCounter <= 0) {
                this.processState(this.nextState);
            }
        }
    }

    hasActionInProgress() {
        for (const side of this.sides) {
            if (side.pieces.some(piece => piece.inAction === true)) {
                return true;
            }
        }
        return false;
    }

    getEnemyPieces() {
        return this.sides.filter(side => side !== this.sides[this.activeSide])
            .flatMap(side => side.pieces);
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

        if (this.winGraphic) {
            this.winGraphic.destroy();
        }

        if (this.continueButton) {
            this.continueButton.destroy();
        }
    }
}
