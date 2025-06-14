class PokemonGame {
    constructor() {
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
        this.currentCard = null;
        
        // Preloading system
        this.preloadedPokemon = [];
        this.isPreloading = false;
        this.preloadCount = 5;
        
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
        
        // Global mouse events for desktop
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    async preloadNextPokemon() {
        if (this.isPreloading || this.preloadedPokemon.length >= this.preloadCount) {
            return;
        }
        
        this.isPreloading = true;
        const nextIndex = this.preloadedPokemon.length + 1; // +1 because we want the next Pokemon after current
        console.log(`Preloading Pokemon at index ${nextIndex}...`);
        
        try {
            const response = await fetch(`/api/next-pokemon/${nextIndex}`);
            if (response.ok) {
                const pokemon = await response.json();
                
                // Preload the image
                const img = new Image();
                img.onload = () => {
                    console.log(`Preloaded: ${pokemon.name} (index ${nextIndex})`);
                    this.preloadedPokemon.push(pokemon);
                    this.isPreloading = false;
                    
                    // Continue preloading if we need more
                    if (this.preloadedPokemon.length < this.preloadCount) {
                        this.preloadNextPokemon();
                    }
                };
                img.onerror = () => {
                    console.log(`Failed to preload image for: ${pokemon.name}`);
                    this.isPreloading = false;
                };
                img.src = pokemon.image_url;
            } else {
                console.log(`No more Pokemon to preload at index ${nextIndex}`);
                this.isPreloading = false;
            }
        } catch (error) {
            console.error('Error preloading Pokemon:', error);
            this.isPreloading = false;
        }
    }
    
    getPreloadedPokemon() {
        if (this.preloadedPokemon.length > 0) {
            const pokemon = this.preloadedPokemon.shift();
            console.log(`Using preloaded Pokemon: ${pokemon.name}`);
            
            // Start preloading the next one
            this.preloadNextPokemon();
            
            return pokemon;
        }
        return null;
    }
    
    createNewCard() {
        // Clear the entire container first
        this.cardContainer.innerHTML = '';
        
        // Create new card
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.id = 'pokemon-card';
        
        card.innerHTML = `
            <div class="card-content">
                <div class="pokemon-image-container">
                    <img id="pokemon-image" src="" alt="Pokemon" class="pokemon-image">
                </div>
                <div class="pokemon-info">
                    <h2 id="pokemon-name" class="pokemon-name">Loading...</h2>
                    <p id="pokemon-id" class="pokemon-id">#000</p>
                </div>
            </div>
            <div class="card-overlay pass-overlay">
                <span>PASS</span>
            </div>
            <div class="card-overlay smash-overlay">
                <span>SMASH</span>
            </div>
        `;
        
        // Add event listeners to the new card
        card.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        card.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        card.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        card.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        
        // Add card to container
        this.cardContainer.appendChild(card);
        this.currentCard = card;
        
        // Update references to the new elements
        this.pokemonImage = card.querySelector('#pokemon-image');
        this.pokemonName = card.querySelector('#pokemon-name');
        this.pokemonId = card.querySelector('#pokemon-id');
        
        return card;
    }
    
    async loadCurrentPokemon() {
        try {
            // Check if we have a preloaded Pokemon
            const preloadedPokemon = this.getPreloadedPokemon();
            
            if (preloadedPokemon) {
                // Use preloaded Pokemon (instant display)
                this.createNewCard();
                this.displayPokemon(preloadedPokemon);
                this.updateStats();
                
                // Start preloading for the next batch
                this.preloadNextPokemon();
                return;
            }
            
            // Fallback to loading from API
            this.showLoading(true);
            console.log('Loading current Pokemon from API...');
            
            const response = await fetch('/api/current-pokemon');
            console.log('API response status:', response.status);
            
            if (response.status === 404) {
                console.log('No Pokemon left, showing round complete modal');
                this.showLoading(false);
                this.showRoundCompleteModal();
                return;
            }
            
            const pokemon = await response.json();
            console.log('Loaded Pokemon from API:', pokemon);
            
            // Create new card and display Pokemon
            this.createNewCard();
            this.displayPokemon(pokemon);
            this.updateStats();
            this.showLoading(false);
            
            // Start preloading for next batch
            this.preloadNextPokemon();
            
        } catch (error) {
            console.error('Error loading Pokemon:', error);
            this.showError('Failed to load Pokemon: ' + error.message);
            this.showLoading(false);
        }
    }
    
    displayPokemon(pokemon) {
        console.log('Displaying Pokemon:', pokemon.name);
        
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
                
                // Animate current card out
                this.currentCard.classList.add('passed');
                
                // Wait for animation to complete, then load next
                setTimeout(() => {
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
                
                // Animate current card out
                this.currentCard.classList.add('smashed');
                
                // Wait for animation to complete, then load next
                setTimeout(() => {
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
                
                // Clear preloaded Pokemon for new round
                this.preloadedPokemon = [];
                this.isPreloading = false;
                
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
                
                // Clear preloaded Pokemon for new game
                this.preloadedPokemon = [];
                this.isPreloading = false;
                
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
            console.log(`Preloaded Pokemon: ${this.preloadedPokemon.length}/${this.preloadCount}`);
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
            this.currentCard.style.transform = '';
            this.currentCard.classList.remove('swiping-left', 'swiping-right');
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
            this.currentCard.style.transform = '';
            this.currentCard.classList.remove('swiping-left', 'swiping-right');
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
        
        this.currentCard.style.transform = `translate(${deltaX}px, ${limitedDeltaY}px) rotate(${rotation}deg)`;
        
        // Update overlay visibility
        this.currentCard.classList.remove('swiping-left', 'swiping-right');
        if (deltaX > 50) {
            this.currentCard.classList.add('swiping-right');
        } else if (deltaX < -50) {
            this.currentCard.classList.add('swiping-left');
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