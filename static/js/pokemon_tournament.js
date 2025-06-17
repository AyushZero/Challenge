class PokemonTournament {
    constructor() {
        this.matchContainer = document.getElementById('match-container');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.roundCompleteModal = document.getElementById('round-complete-modal');
        this.gameOverModal = document.getElementById('game-over-modal');
        
        // Stats elements
        this.currentRound = document.getElementById('current-round');
        this.remainingMatches = document.getElementById('remaining-matches');
        this.winnersCount = document.getElementById('winners-count');
        
        // Modal buttons
        this.nextRoundBtn = document.getElementById('next-round-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.finalResetBtn = document.getElementById('final-reset-btn');
        
        // Choose buttons
        this.choosePokemon1Btn = document.getElementById('choose-pokemon1-btn');
        this.choosePokemon2Btn = document.getElementById('choose-pokemon2-btn');
        
        // Current match data
        this.currentMatch = null;
        this.isChoosing = false;
        
        this.initializeEventListeners();
        this.loadCurrentMatch();
    }
    
    initializeEventListeners() {
        // Choose buttons
        this.choosePokemon1Btn.addEventListener('click', () => this.choosePokemon('pokemon1'));
        this.choosePokemon2Btn.addEventListener('click', () => this.choosePokemon('pokemon2'));
        
        // Modal buttons
        this.nextRoundBtn.addEventListener('click', () => this.nextRound());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.finalResetBtn.addEventListener('click', () => this.resetGame());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    async loadCurrentMatch() {
        try {
            this.showLoading(true);
            
            const response = await fetch('/api/current-match');
            console.log('API response status:', response.status);
            
            if (response.status === 404) {
                console.log('No more matches, showing round complete modal');
                this.showLoading(false);
                this.showRoundCompleteModal();
                return;
            }
            
            this.currentMatch = await response.json();
            console.log('Loaded match from API:', this.currentMatch);
            
            this.displayMatch();
            this.updateStats();
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading match:', error);
            this.showError('Failed to load match: ' + error.message);
            this.showLoading(false);
        }
    }
    
    displayMatch() {
        if (!this.currentMatch) return;
        
        this.matchContainer.innerHTML = `
            <div class="pokemon-card" id="pokemon1-card">
                <div class="pokemon-image-container">
                    <img src="${this.currentMatch.pokemon1.image_url}" alt="${this.currentMatch.pokemon1.name}" class="pokemon-image">
                </div>
                <div class="pokemon-info">
                    <h2 class="pokemon-name">${this.currentMatch.pokemon1.name}</h2>
                    <p class="pokemon-id">#${this.currentMatch.pokemon1.id.toString().padStart(3, '0')}</p>
                </div>
            </div>
            
            <div class="vs-badge">VS</div>
            
            <div class="pokemon-card" id="pokemon2-card">
                <div class="pokemon-image-container">
                    <img src="${this.currentMatch.pokemon2.image_url}" alt="${this.currentMatch.pokemon2.name}" class="pokemon-image">
                </div>
                <div class="pokemon-info">
                    <h2 class="pokemon-name">${this.currentMatch.pokemon2.name}</h2>
                    <p class="pokemon-id">#${this.currentMatch.pokemon2.id.toString().padStart(3, '0')}</p>
                </div>
            </div>
        `;
        
        // Add click handlers to cards
        const pokemon1Card = document.getElementById('pokemon1-card');
        const pokemon2Card = document.getElementById('pokemon2-card');
        
        pokemon1Card.addEventListener('click', () => this.choosePokemon('pokemon1'));
        pokemon2Card.addEventListener('click', () => this.choosePokemon('pokemon2'));
    }
    
    async choosePokemon(choice) {
        if (this.isChoosing) return;
        
        this.isChoosing = true;
        
        try {
            // Visual feedback
            const winnerCard = document.getElementById(`${choice}-card`);
            const loserCard = document.getElementById(choice === 'pokemon1' ? 'pokemon2-card' : 'pokemon1-card');
            
            winnerCard.classList.add('selected', 'winner-animation');
            loserCard.style.opacity = '0.5';
            
            // Disable buttons
            this.choosePokemon1Btn.disabled = true;
            this.choosePokemon2Btn.disabled = true;
            
            // Send choice to server
            const response = await fetch('/api/choose-pokemon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ choice })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Choice result:', result);
                
                // Update stats
                this.updateStats();
                
                // Wait a shorter moment then load next match
                setTimeout(() => {
                    this.loadCurrentMatch();
                    this.isChoosing = false;
                }, 400);
                
            } else {
                const error = await response.json();
                console.error('Error choosing Pokemon:', error);
                this.showError('Failed to choose Pokemon: ' + error.error);
                this.isChoosing = false;
            }
            
        } catch (error) {
            console.error('Error choosing Pokemon:', error);
            this.showError('Failed to choose Pokemon: ' + error.message);
            this.isChoosing = false;
        }
    }
    
    async nextRound() {
        try {
            console.log('Starting next round...');
            const response = await fetch('/api/next-round', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Next round started:', result);
                
                this.hideModal(this.roundCompleteModal);
                this.loadCurrentMatch();
            } else {
                const error = await response.json();
                console.error('Error starting next round:', error);
                this.showError('Failed to start next round: ' + error.error);
            }
        } catch (error) {
            console.error('Error starting next round:', error);
            this.showError('Failed to start next round: ' + error.message);
        }
    }
    
    async resetGame() {
        try {
            console.log('Resetting game...');
            const response = await fetch('/api/reset-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Game reset:', result);
                
                this.hideModal(this.roundCompleteModal);
                this.hideModal(this.gameOverModal);
                this.loadCurrentMatch();
            } else {
                const error = await response.json();
                console.error('Error resetting game:', error);
                this.showError('Failed to reset game: ' + error.error);
            }
        } catch (error) {
            console.error('Error resetting game:', error);
            this.showError('Failed to reset game: ' + error.message);
        }
    }
    
    async updateStats() {
        try {
            const response = await fetch('/api/game-state');
            const gameState = await response.json();
            
            this.currentRound.textContent = gameState.current_round;
            this.remainingMatches.textContent = Math.floor(gameState.current_pokemon.length / 2);
            this.winnersCount.textContent = gameState.winners.length;
            
            console.log('Updated stats:', gameState);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    showRoundCompleteModal() {
        // Get current game state
        fetch('/api/game-state')
            .then(response => response.json())
            .then(data => {
                const summary = document.getElementById('round-summary');
                
                if (data.winners.length === 0) {
                    summary.textContent = 'All Pokemon have been eliminated!';
                    this.showModal(this.gameOverModal);
                } else if (data.winners.length === 1) {
                    summary.textContent = `Tournament complete! ${data.winners[0].name} is the champion!`;
                    this.showModal(this.gameOverModal);
                } else {
                    summary.textContent = `Round ${data.current_round} complete! ${data.winners.length} Pokemon advance to the next round.`;
                    this.showModal(this.roundCompleteModal);
                }
            });
    }
    
    // Utility methods
    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    showModal(modal) {
        modal.style.display = 'flex';
    }
    
    hideModal(modal) {
        modal.style.display = 'none';
    }
    
    showError(message) {
        alert('Error: ' + message);
    }
    
    handleKeyPress(e) {
        if (this.isChoosing) return;
        
        switch(e.key) {
            case '1':
            case 'ArrowLeft':
                this.choosePokemon('pokemon1');
                break;
            case '2':
            case 'ArrowRight':
                this.choosePokemon('pokemon2');
                break;
            case 'Enter':
                if (this.roundCompleteModal.style.display === 'flex') {
                    this.nextRound();
                } else if (this.gameOverModal.style.display === 'flex') {
                    this.resetGame();
                }
                break;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PokemonTournament();
}); 