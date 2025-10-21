# Match-3 Puzzle Game

A classic match-3 puzzle game built with Phaser 3, playable directly in the browser and hosted on GitHub Pages.

## Play the Game

🎮 **[Play Now on GitHub Pages](https://ziipo.github.io/hopscotch2/)**

## Game Features

- **8x8 Grid**: Classic match-3 gameplay on a square grid
- **6 Colorful Tiles**: Match 3 or more tiles of the same color
- **Intuitive Controls**: Click to select, click again to swap with adjacent tiles
- **Smart Matching**: Only allows swaps that create valid matches
- **Smooth Animations**: Satisfying tile swapping, falling, and removal effects
- **Scoring System**:
  - 3 tiles matched = 100 points
  - 4 tiles matched = 200 points
  - 5+ tiles matched = 400 points
- **Cascading Matches**: Chain reactions when falling tiles create new matches
- **Restart Button**: Start a fresh game anytime

## How to Play

1. Click on any tile to select it (it will be highlighted in yellow)
2. Click on an adjacent tile (horizontally or vertically) to swap them
3. If the swap creates a match of 3 or more tiles of the same color, they'll be removed and you'll score points
4. New tiles will fall from the top to fill empty spaces
5. Keep matching tiles to increase your score!

**Note**: If a swap doesn't create a match, the tiles will swap back automatically.

## Local Development

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (optional, but recommended)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ziipo/hopscotch2.git
cd hopscotch2
```

2. Open the game:

**Option A - Direct file access** (may have CORS issues):
```bash
open index.html
```

**Option B - Using Python's built-in server** (recommended):
```bash
# Python 3
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

**Option C - Using Node.js http-server**:
```bash
npx http-server -p 8000

# Then open http://localhost:8000 in your browser
```

## Project Structure

```
hopscotch2/
├── index.html          # Main HTML file with Phaser 3 CDN
├── game.js             # All game logic and mechanics
└── README.md           # This file
```

## Deploying to GitHub Pages

The game is already configured to work with GitHub Pages. To deploy your own version:

1. Fork or clone this repository
2. Go to your repository settings on GitHub
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select the branch you want to deploy (usually `main`)
5. Click "Save"
6. Your game will be available at `https://YOUR-USERNAME.github.io/hopscotch2/`

## Technical Details

- **Framework**: Phaser 3.70.0 (loaded via CDN)
- **No build process required**: Just HTML and JavaScript
- **No external assets**: All tiles are procedurally generated using Phaser's graphics
- **Responsive design**: Game automatically centers on screen

## Code Architecture

The game is built with modularity in mind:

- **Configuration**: All constants (grid size, colors, timings) at the top of `game.js`
- **Tile Creation**: Separate function for creating tile objects
- **Match Detection**: Dedicated algorithm for finding horizontal and vertical matches
- **Swap Logic**: Validates moves and handles animations
- **Gravity System**: Makes tiles fall smoothly to fill gaps
- **Cascade Handler**: Automatically detects and processes chain reactions
- **Scoring**: Modular scoring function for easy adjustment

## Future Enhancement Ideas

- Add special tiles (bombs, wildcards, etc.)
- Implement combo multipliers
- Add move counter or time limit
- Create different game modes
- Add sound effects and music
- Save high scores to localStorage
- Add particle effects for matches
- Mobile touch optimization

## License

MIT License - Feel free to use and modify as you wish!

## Credits

Built with ❤️ using [Phaser 3](https://phaser.io/)
