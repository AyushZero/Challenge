# Pokemon Swipe Game

A fun card-swiping game featuring Pokemon! Swipe right to pass Pokemon to the next round, or swipe left to smash them and eliminate them from the game.

## How to Play

1. **First Round**: All Pokemon (151 total) are available
2. **Swipe Right (Pass)**: Pokemon survives and moves to the next round
3. **Swipe Left (Smash)**: Pokemon is eliminated from the game
4. **Next Rounds**: Only Pokemon that were passed in the previous round continue
5. **Game Over**: When no Pokemon are left to pass, the game ends

## Controls

- **Mouse/Touch**: Click and drag the card left or right
- **Keyboard**: 
  - `A` or `←` to smash (left)
  - `D` or `→` to pass (right)
- **Buttons**: Click the Pass (👎) or Smash (💥) buttons

## Features

- Beautiful card animations with smooth transitions
- Responsive design for mobile and desktop
- Real Pokemon data from PokeAPI
- Game state persistence
- Round progression system
- Statistics tracking

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

3. Open your browser and go to `http://localhost:5000`

## Game Mechanics

- **Round 1**: All 151 Pokemon from the original games
- **Subsequent Rounds**: Only Pokemon that were "passed" in the previous round
- **Elimination**: Pokemon that are "smashed" are permanently removed
- **Victory**: The last Pokemon standing wins!

## Technical Details

- **Backend**: Flask with RESTful API
- **Frontend**: Vanilla JavaScript with modern CSS
- **Data Source**: PokeAPI for Pokemon information
- **State Management**: JSON file-based persistence
- **Animations**: CSS transforms and transitions

## API Endpoints

- `GET /api/current-pokemon` - Get current Pokemon
- `POST /api/pass-pokemon` - Pass current Pokemon
- `POST /api/smash-pokemon` - Smash current Pokemon
- `POST /api/next-round` - Start next round
- `POST /api/reset-game` - Reset game state
- `GET /api/game-state` - Get current game state

Enjoy playing with your favorite Pokemon! 