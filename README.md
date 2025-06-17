# Shiny Pokémon Tournament

A Flask web app for running a tournament-style bracket with shiny Pokémon! Each round, you choose between two shiny Pokémon. The winner advances, and the process repeats until a single champion remains.

## Features
- All Pokémon are shiny (special color variants)
- Tournament bracket: choose between two Pokémon at a time
- Winners advance to the next round
- Responsive, modern UI
- Keyboard shortcuts for fast play

## Setup

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd ChallengeZero
   ```

2. **Create a virtual environment:**
   ```sh
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On Windows CMD:
   venv\Scripts\activate.bat
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

4. **Run the app:**
   ```sh
   python app.py
   ```
   The app will be available at [http://localhost:5000](http://localhost:5000)

## Gameplay
- Each match shows two shiny Pokémon side-by-side.
- Click on your favorite (or use keyboard shortcuts: `1`/`←` for left, `2`/`→` for right).
- The winner advances to the next round.
- Continue until only one Pokémon remains — the champion!

## Notes
- If you get a `ModuleNotFoundError`, make sure your virtual environment is activated and dependencies are installed.
- If you want to reset the tournament, use the "New Tournament" button in the UI.

## License
MIT 