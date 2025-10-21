// Match-3 Puzzle Game - Configuration and Constants
const GRID_SIZE = 8;
const TILE_SIZE = 70;
// Colorblind-friendly palette (distinct for protanopia, deuteranopia, and tritanopia)
const TILE_COLORS = [0x0173B2, 0xDE8F05, 0x029E73, 0xCC78BC, 0xCA9161, 0xECE133];
const SWAP_DURATION = 200;
const FALL_DURATION = 300;
const REMOVE_DURATION = 300;

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: GRID_SIZE * TILE_SIZE + 200,
    height: GRID_SIZE * TILE_SIZE + 100,
    parent: 'game-container',
    backgroundColor: '#2d3436',
    scene: {
        create: create,
        update: update
    }
};

// Game state variables
let game;
let grid = [];
let selectedTile = null;
let score = 0;
let scoreText;
let isProcessing = false;
let dragStartTile = null;

// Initialize the game
game = new Phaser.Game(config);

/**
 * Create function - initializes the game scene
 */
function create() {
    // Add title
    this.add.text(20, 20, 'Match-3 Puzzle', {
        fontSize: '32px',
        fill: '#fff',
        fontStyle: 'bold'
    });

    // Create score display
    scoreText = this.add.text(20, 70, 'Score: 0', {
        fontSize: '24px',
        fill: '#fff'
    });

    // Create restart button
    const restartBtn = this.add.text(GRID_SIZE * TILE_SIZE + 40, 150, 'Restart', {
        fontSize: '20px',
        fill: '#fff',
        backgroundColor: '#e74c3c',
        padding: { x: 20, y: 10 }
    }).setInteractive();

    restartBtn.on('pointerdown', () => {
        restartGame(this);
    });

    restartBtn.on('pointerover', () => {
        restartBtn.setStyle({ backgroundColor: '#c0392b' });
    });

    restartBtn.on('pointerout', () => {
        restartBtn.setStyle({ backgroundColor: '#e74c3c' });
    });

    // Add instructions
    this.add.text(GRID_SIZE * TILE_SIZE + 20, 250, 'Click or drag\na tile to an\nadjacent one\nto swap!', {
        fontSize: '16px',
        fill: '#dfe6e9',
        align: 'center',
        lineSpacing: 8
    });

    this.add.text(GRID_SIZE * TILE_SIZE + 20, 380, 'Scoring:\n3 tiles = 100\n4 tiles = 200\n5+ tiles = 400', {
        fontSize: '14px',
        fill: '#dfe6e9',
        align: 'left',
        lineSpacing: 5
    });

    // Initialize the game grid
    initializeGrid(this);
}

/**
 * Update function - called every frame
 */
function update() {
    // Game loop logic (currently not needed)
}

/**
 * Initialize the game grid with random tiles, ensuring no initial matches
 */
function initializeGrid(scene) {
    const startX = 20;
    const startY = 120;

    // Create 2D array for grid
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            let colorIndex;

            // Generate a color that doesn't create initial matches
            do {
                colorIndex = Phaser.Math.Between(0, TILE_COLORS.length - 1);
            } while (wouldCreateMatch(row, col, colorIndex));

            const tile = createTile(scene, col, row, colorIndex, startX, startY);
            grid[row][col] = tile;
        }
    }
}

/**
 * Check if placing a color at position would create a match
 */
function wouldCreateMatch(row, col, colorIndex) {
    // Check horizontal
    let horizontalCount = 1;
    if (col >= 1 && grid[row][col - 1]?.colorIndex === colorIndex) {
        horizontalCount++;
        if (col >= 2 && grid[row][col - 2]?.colorIndex === colorIndex) {
            return true;
        }
    }

    // Check vertical
    let verticalCount = 1;
    if (row >= 1 && grid[row - 1]?.[col]?.colorIndex === colorIndex) {
        verticalCount++;
        if (row >= 2 && grid[row - 2]?.[col]?.colorIndex === colorIndex) {
            return true;
        }
    }

    return false;
}

/**
 * Create a tile game object
 */
function createTile(scene, col, row, colorIndex, startX, startY) {
    const x = startX + col * TILE_SIZE + TILE_SIZE / 2;
    const y = startY + row * TILE_SIZE + TILE_SIZE / 2;

    // Create circle for tile
    const circle = scene.add.circle(x, y, 28, TILE_COLORS[colorIndex]);
    circle.setStrokeStyle(3, 0xffffff, 0.8);
    circle.setInteractive({ draggable: true });

    // Tile data
    circle.gridRow = row;
    circle.gridCol = col;
    circle.colorIndex = colorIndex;

    // Add drag handlers
    circle.on('dragstart', (pointer) => handleDragStart(scene, circle, pointer));
    circle.on('drag', (pointer, dragX, dragY) => handleDrag(scene, circle, pointer, dragX, dragY));
    circle.on('dragend', (pointer) => handleDragEnd(scene, circle, pointer));

    // Add click handler (for click-to-select mode)
    circle.on('pointerdown', () => handleTileClick(scene, circle));

    // Hover effects
    circle.on('pointerover', () => {
        if (!isProcessing) {
            circle.setScale(1.1);
        }
    });

    circle.on('pointerout', () => {
        circle.setScale(1.0);
    });

    return circle;
}

/**
 * Handle drag start
 */
function handleDragStart(scene, tile, pointer) {
    if (isProcessing) return;
    dragStartTile = tile;

    // Clear click selection if dragging
    if (selectedTile) {
        selectedTile.setStrokeStyle(3, 0xffffff, 0.8);
        selectedTile = null;
    }
}

/**
 * Handle drag movement
 */
function handleDrag(scene, tile, pointer, dragX, dragY) {
    if (isProcessing || !dragStartTile) return;

    // Don't actually move the tile visually during drag
    // We'll use pointer position to determine direction
}

/**
 * Handle drag end - check if dragged to adjacent tile
 */
function handleDragEnd(scene, tile, pointer) {
    if (isProcessing || !dragStartTile) {
        dragStartTile = null;
        return;
    }

    // Calculate drag direction
    const deltaX = pointer.x - tile.x;
    const deltaY = pointer.y - tile.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if drag was significant enough (threshold)
    const dragThreshold = TILE_SIZE / 3;

    if (absDeltaX > dragThreshold || absDeltaY > dragThreshold) {
        // Determine which direction was dominant
        let targetTile = null;

        if (absDeltaX > absDeltaY) {
            // Horizontal drag
            if (deltaX > 0 && tile.gridCol < GRID_SIZE - 1) {
                targetTile = grid[tile.gridRow][tile.gridCol + 1];
            } else if (deltaX < 0 && tile.gridCol > 0) {
                targetTile = grid[tile.gridRow][tile.gridCol - 1];
            }
        } else {
            // Vertical drag
            if (deltaY > 0 && tile.gridRow < GRID_SIZE - 1) {
                targetTile = grid[tile.gridRow + 1][tile.gridCol];
            } else if (deltaY < 0 && tile.gridRow > 0) {
                targetTile = grid[tile.gridRow - 1][tile.gridCol];
            }
        }

        // If we found a valid adjacent tile, swap
        if (targetTile) {
            swapTiles(scene, tile, targetTile);
        }
    }

    dragStartTile = null;
}

/**
 * Handle tile click events
 */
function handleTileClick(scene, tile) {
    if (isProcessing || dragStartTile) return;

    if (!selectedTile) {
        // First tile selected
        selectedTile = tile;
        tile.setStrokeStyle(3, 0xffff00, 1);
    } else {
        // Second tile selected
        if (selectedTile === tile) {
            // Clicked same tile, deselect
            selectedTile.setStrokeStyle(3, 0xffffff, 0.8);
            selectedTile = null;
        } else if (areAdjacent(selectedTile, tile)) {
            // Tiles are adjacent, attempt swap
            selectedTile.setStrokeStyle(3, 0xffffff, 0.8);
            swapTiles(scene, selectedTile, tile);
            selectedTile = null;
        } else {
            // Not adjacent, change selection
            selectedTile.setStrokeStyle(3, 0xffffff, 0.8);
            selectedTile = tile;
            tile.setStrokeStyle(3, 0xffff00, 1);
        }
    }
}

/**
 * Check if two tiles are adjacent (horizontal or vertical only)
 */
function areAdjacent(tile1, tile2) {
    const rowDiff = Math.abs(tile1.gridRow - tile2.gridRow);
    const colDiff = Math.abs(tile1.gridCol - tile2.gridCol);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Swap two tiles with animation
 */
function swapTiles(scene, tile1, tile2) {
    isProcessing = true;

    // Swap positions in grid
    const tempRow = tile1.gridRow;
    const tempCol = tile1.gridCol;
    tile1.gridRow = tile2.gridRow;
    tile1.gridCol = tile2.gridCol;
    tile2.gridRow = tempRow;
    tile2.gridCol = tempCol;

    grid[tile1.gridRow][tile1.gridCol] = tile1;
    grid[tile2.gridRow][tile2.gridCol] = tile2;

    // Animate swap
    scene.tweens.add({
        targets: tile1,
        x: tile2.x,
        y: tile2.y,
        duration: SWAP_DURATION,
        ease: 'Power2'
    });

    scene.tweens.add({
        targets: tile2,
        x: tile1.x,
        y: tile1.y,
        duration: SWAP_DURATION,
        ease: 'Power2',
        onComplete: () => {
            // Check for matches after swap
            const matches = findAllMatches();

            if (matches.length === 0) {
                // No matches, swap back
                swapBackTiles(scene, tile1, tile2);
            } else {
                // Valid move, process matches
                processMatches(scene, matches);
            }
        }
    });
}

/**
 * Swap tiles back if no match was created
 */
function swapBackTiles(scene, tile1, tile2) {
    // Swap grid positions back
    const tempRow = tile1.gridRow;
    const tempCol = tile1.gridCol;
    tile1.gridRow = tile2.gridRow;
    tile1.gridCol = tile2.gridCol;
    tile2.gridRow = tempRow;
    tile2.gridCol = tempCol;

    grid[tile1.gridRow][tile1.gridCol] = tile1;
    grid[tile2.gridRow][tile2.gridCol] = tile2;

    // Animate swap back
    scene.tweens.add({
        targets: tile1,
        x: tile2.x,
        y: tile2.y,
        duration: SWAP_DURATION,
        ease: 'Power2'
    });

    scene.tweens.add({
        targets: tile2,
        x: tile1.x,
        y: tile1.y,
        duration: SWAP_DURATION,
        ease: 'Power2',
        onComplete: () => {
            isProcessing = false;
        }
    });
}

/**
 * Find all matches (3+ in a row) on the grid
 */
function findAllMatches() {
    const matches = [];
    const matched = new Set();

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 2; col++) {
            const color = grid[row][col].colorIndex;
            let matchLength = 1;

            for (let i = col + 1; i < GRID_SIZE; i++) {
                if (grid[row][i].colorIndex === color) {
                    matchLength++;
                } else {
                    break;
                }
            }

            if (matchLength >= 3) {
                for (let i = col; i < col + matchLength; i++) {
                    matched.add(`${row},${i}`);
                }
            }
        }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            const color = grid[row][col].colorIndex;
            let matchLength = 1;

            for (let i = row + 1; i < GRID_SIZE; i++) {
                if (grid[i][col].colorIndex === color) {
                    matchLength++;
                } else {
                    break;
                }
            }

            if (matchLength >= 3) {
                for (let i = row; i < row + matchLength; i++) {
                    matched.add(`${i},${col}`);
                }
            }
        }
    }

    // Convert set to array of tiles
    matched.forEach(key => {
        const [row, col] = key.split(',').map(Number);
        matches.push(grid[row][col]);
    });

    return matches;
}

/**
 * Process and remove matched tiles
 */
function processMatches(scene, matches) {
    // Calculate score based on match size
    const matchScore = calculateScore(matches.length);
    score += matchScore;
    scoreText.setText(`Score: ${score}`);

    // Remove matched tiles with animation
    matches.forEach(tile => {
        scene.tweens.add({
            targets: tile,
            alpha: 0,
            scale: 0,
            duration: REMOVE_DURATION,
            ease: 'Power2'
        });
    });

    // Wait for animation, then remove tiles and apply gravity
    scene.time.delayedCall(REMOVE_DURATION, () => {
        matches.forEach(tile => {
            grid[tile.gridRow][tile.gridCol] = null;
            tile.destroy();
        });

        applyGravity(scene);
    });
}

/**
 * Calculate score based on number of matched tiles
 */
function calculateScore(matchCount) {
    if (matchCount === 3) return 100;
    if (matchCount === 4) return 200;
    return 400; // 5 or more
}

/**
 * Apply gravity - make tiles fall to fill empty spaces
 */
function applyGravity(scene) {
    let moved = false;

    // Process each column from bottom to top
    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (grid[row][col] === null) {
                // Find tile above to fall down
                for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                    if (grid[aboveRow][col] !== null) {
                        const tile = grid[aboveRow][col];
                        grid[row][col] = tile;
                        grid[aboveRow][col] = null;

                        tile.gridRow = row;

                        const startX = 20;
                        const startY = 120;
                        const newY = startY + row * TILE_SIZE + TILE_SIZE / 2;

                        scene.tweens.add({
                            targets: tile,
                            y: newY,
                            duration: FALL_DURATION,
                            ease: 'Bounce.easeOut'
                        });

                        moved = true;
                        break;
                    }
                }
            }
        }
    }

    // After gravity, spawn new tiles
    scene.time.delayedCall(FALL_DURATION, () => {
        spawnNewTiles(scene);
    });
}

/**
 * Spawn new tiles from the top to fill empty spaces
 */
function spawnNewTiles(scene) {
    const startX = 20;
    const startY = 120;
    let spawned = false;

    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE; row++) {
            if (grid[row][col] === null) {
                const colorIndex = Phaser.Math.Between(0, TILE_COLORS.length - 1);
                const tile = createTile(scene, col, row, colorIndex, startX, startY);

                // Start above the grid
                tile.y = startY - TILE_SIZE;
                tile.alpha = 0;

                grid[row][col] = tile;

                const targetY = startY + row * TILE_SIZE + TILE_SIZE / 2;

                scene.tweens.add({
                    targets: tile,
                    y: targetY,
                    alpha: 1,
                    duration: FALL_DURATION,
                    ease: 'Bounce.easeOut'
                });

                spawned = true;
            }
        }
    }

    // Check for cascading matches
    if (spawned) {
        scene.time.delayedCall(FALL_DURATION + 100, () => {
            checkCascadingMatches(scene);
        });
    } else {
        isProcessing = false;
    }
}

/**
 * Check for cascading matches after tiles have fallen
 */
function checkCascadingMatches(scene) {
    const matches = findAllMatches();

    if (matches.length > 0) {
        // More matches found, process them
        processMatches(scene, matches);
    } else {
        // No more matches, game ready for next move
        isProcessing = false;
    }
}

/**
 * Restart the game
 */
function restartGame(scene) {
    if (isProcessing) return;

    // Clear existing grid
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col]) {
                grid[row][col].destroy();
            }
        }
    }

    // Reset game state
    grid = [];
    selectedTile = null;
    dragStartTile = null;
    score = 0;
    scoreText.setText('Score: 0');
    isProcessing = false;

    // Reinitialize grid
    initializeGrid(scene);
}
