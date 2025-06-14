class PokemonGame {
    constructor() {
        this.card = document.getElementById('pokemon-card');
        this.cardContainer = document.getElementById('card-container');
        this.pokemonImage = document.getElementById('pokemon-image');
        this.pokemonName = document.getElementById('pokemon-name');
        this.pokemonId = document.getElementById('pokemon-id');
        this.passBtn = document.getElementById('pass-btn');
        this.smashBtn = document.getElementById('smash-btn');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.roundCompleteModal = document.getElementById('round-complete-modal');
        this.gameOverModal = document.getElementById('game-over-modal');
        
        // Stats elements
        this.currentRound = document.getElementById('current-round');
        this.remainingCount = document.getElementById('remaining-count');
        this.passedCount = document.getElementById('passed-count');
        
        // Modal buttons
        this.nextRoundBtn = document.getElementById('next-round-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.finalResetBtn = document.getElementById('final-reset-btn');
        
        // Touch/swipe variables
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.threshold = 100;
        
        this.initializeEventListeners();
        this.loadCurrentPokemon();
    }
    
    initializeEventListeners() {
        // Button clicks
        this.passBtn.addEventListener('click', () => this.passPokemon());
        this.smashBtn.addEventListener('click', () => this.smashPokemon());
        this.nextRoundBtn.addEventListener('click', () => this.nextRound());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.finalResetBtn.addEventListener('click', () => this.resetGame());
        
        // Touch events for mobile
        this.card.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.card.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.card.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Mouse events for desktop
        this.card.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    async loadCurrentPokemon() {
        try {
            this.showLoading(true);
            console.log('Loading current Pokemon...');
            
            const response = await fetch('/api/current-pokemon');
            console.log('API response status:', response.status);
            
            if (response.status === 404) {
                console.log('No Pokemon left, showing round complete modal');
                this.showLoading(false);
                this.showRoundCompleteModal();
                return;
            }
            
            const pokemon = await response.json();
            console.log('Loaded Pokemon:', pokemon);
            
            // Small delay to ensure smooth transition
            setTimeout(() => {
                this.displayPokemon(pokemon);
                this.updateStats();
                this.showLoading(false);
            }, 100);
            
        } catch (error) {
            console.error('Error loading Pokemon:', error);
            this.showError('Failed to load Pokemon: ' + error.message);
            this.showLoading(false);
        }
    }
    
    displayPokemon(pokemon) {
        console.log('Displaying Pokemon:', pokemon.name);
        
        // Reset card position and classes first
        this.card.style.transform = '';
        this.card.classList.remove('swiping-left', 'swiping-right', 'passed', 'smashed');
        
        // Set image with error handling
        this.pokemonImage.onerror = () => {
            console.log('Image failed to load, using fallback');
            this.pokemonImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        };
        
        // Set Pokemon data
        this.pokemonImage.src = pokemon.image_url;
        this.pokemonName.textContent = pokemon.name;
        this.pokemonId.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
        
        console.log('Pokemon displayed successfully:', pokemon.name);
    }
    
    async passPokemon() {
        if (this.isDragging) return;
        
        try {
            console.log('Passing Pokemon...');
            const response = await fetch('/api/pass-pokemon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Passed Pokemon:', result);
                
                // Add animation class
                this.card.classList.add('passed');
                
                // Wait for animation to complete, then reset and load next
                setTimeout(() => {
                    // Reset card position and classes
                    this.card.style.transform = '';
                    this.card.classList.remove('passed', 'swiping-left', 'swiping-right');
                    
                    // Load next Pokemon
                    this.loadCurrentPokemon();
                }, 600);
            } else {
                console.error('Failed to pass Pokemon:', response.status);
            }
        } catch (error) {
            console.error('Error passing Pokemon:', error);
        }
    }
    
    async smashPokemon() {
        if (this.isDragging) return;
        
        try {
            console.log('Smashing Pokemon...');
            const response = await fetch('/api/smash-pokemon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Smashed Pokemon:', result);
                
                // Add animation class
                this.card.classList.add('smashed');
                
                // Wait for animation to complete, then reset and load next
                setTimeout(() => {
                    // Reset card position and classes
                    this.card.style.transform = '';
                    this.card.classList.remove('smashed', 'swiping-left', 'swiping-right');
                    
                    // Load next Pokemon
                    this.loadCurrentPokemon();
                }, 600);
            } else {
                console.error('Failed to smash Pokemon:', response.status);
            }
        } catch (error) {
            console.error('Error smashing Pokemon:', error);
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
                this.loadCurrentPokemon();
            } else {
                console.error('Failed to start next round:', response.status);
            }
        } catch (error) {
            console.error('Error starting next round:', error);
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
                this.loadCurrentPokemon();
            } else {
                console.error('Failed to reset game:', response.status);
            }
        } catch (error) {
            console.error('Error resetting game:', error);
        }
    }
    
    async updateStats() {
        try {
            const response = await fetch('/api/game-state');
            const gameState = await response.json();
            
            this.currentRound.textContent = gameState.current_round;
            this.remainingCount.textContent = gameState.remaining_pokemon.length;
            this.passedCount.textContent = gameState.passed_pokemon.length;
            
            console.log('Updated stats:', gameState);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    showRoundCompleteModal() {
        const gameState = {
            remaining_pokemon: [],
            passed_pokemon: [],
            current_round: 1
        };
        
        // Get current game state
        fetch('/api/game-state')
            .then(response => response.json())
            .then(data => {
                gameState.current_round = data.current_round;
                gameState.passed_pokemon = data.passed_pokemon;
                
                const summary = document.getElementById('round-summary');
                if (gameState.passed_pokemon.length === 0) {
                    summary.textContent = 'All Pokemon have been eliminated!';
                    this.showModal(this.gameOverModal);
                } else {
                    summary.textContent = `Round ${gameState.current_round} complete! ${gameState.passed_pokemon.length} Pokemon survived and will continue to the next round.`;
                    this.showModal(this.roundCompleteModal);
                }
            });
    }
    
    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.isDragging = true;
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        this.currentX = touch.clientX;
        this.currentY = touch.clientY;
        
        this.updateCardPosition();
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        
        if (Math.abs(deltaX) > this.threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                this.passPokemon();
            } else {
                this.smashPokemon();
            }
        } else {
            // Reset card position
            this.card.style.transform = '';
            this.card.classList.remove('swiping-left', 'swiping-right');
        }
        
        this.isDragging = false;
    }
    
    // Mouse event handlers
    handleMouseDown(e) {
        e.preventDefault();
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isDragging = true;
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.clientX;
        this.currentY = e.clientY;
        
        this.updateCardPosition();
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        
        if (Math.abs(deltaX) > this.threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                this.passPokemon();
            } else {
                this.smashPokemon();
            }
        } else {
            // Reset card position
            this.card.style.transform = '';
            this.card.classList.remove('swiping-left', 'swiping-right');
        }
        
        this.isDragging = false;
    }
    
    // Keyboard event handler
    handleKeyPress(e) {
        if (this.isDragging) return;
        
        switch (e.key) {
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.passPokemon();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.smashPokemon();
                break;
        }
    }
    
    updateCardPosition() {
        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        
        // Limit vertical movement
        const limitedDeltaY = deltaY * 0.3;
        
        // Calculate rotation based on horizontal movement
        const rotation = (deltaX / this.threshold) * 15;
        
        this.card.style.transform = `translate(${deltaX}px, ${limitedDeltaY}px) rotate(${rotation}deg)`;
        
        // Update overlay visibility
        this.card.classList.remove('swiping-left', 'swiping-right');
        if (deltaX > 50) {
            this.card.classList.add('swiping-right');
        } else if (deltaX < -50) {
            this.card.classList.add('swiping-left');
        }
    }
    
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
        console.error('Game Error:', message);
        alert(message);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pokemon Game initializing...');
    new PokemonGame();
}); 