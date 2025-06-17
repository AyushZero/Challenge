async function loadMatch() {
    const res = await fetch('/api/current-match');
    if (!res.ok) {
        // Tournament over or round complete
        document.body.innerHTML = `
            <div style="color:white;text-align:center;font-size:2em;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
                <div>Tournament Complete!</div>
                <button id="restart-btn" style="margin-top:20px;padding:10px 20px;font-size:1em;background:#444;color:white;border:none;border-radius:5px;cursor:pointer;">Restart Tournament</button>
                <div style="margin-top:10px;font-size:0.5em;">Press 'R' to restart</div>
            </div>
        `;
        document.getElementById('restart-btn').addEventListener('click', restartTournament);
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') restartTournament();
        });
        return;
    }
    const data = await res.json();
    document.getElementById('left-pokemon').src = data.pokemon1.image_url;
    document.getElementById('right-pokemon').src = data.pokemon2.image_url;
    
    // Update round and matches info
    updateRoundInfo(data.current_round, data.remaining_matches);
    
    // Add auto-pick button if it doesn't exist
    if (!document.getElementById('auto-pick-btn')) {
        const autoBtn = document.createElement('button');
        autoBtn.id = 'auto-pick-btn';
        autoBtn.textContent = 'Auto Complete Round';
        autoBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        `;
        autoBtn.addEventListener('click', autoCompleteRound);
        document.body.appendChild(autoBtn);
    }
}

function updateRoundInfo(round, matchesLeft) {
    let roundInfo = document.getElementById('round-info');
    if (!roundInfo) {
        roundInfo = document.createElement('div');
        roundInfo.id = 'round-info';
        roundInfo.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 10px 15px;
            background: rgba(0,0,0,0.7);
            color: white;
            border-radius: 5px;
            font-size: 14px;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(roundInfo);
    }
    roundInfo.innerHTML = `Round ${round}<br>Matches: ${matchesLeft}`;
}

async function autoCompleteRound() {
    const btn = document.getElementById('auto-pick-btn');
    btn.disabled = true;
    btn.textContent = 'Completing...';
    
    try {
        let roundCount = 0;
        const maxRounds = 10; // Safety limit
        
        while (roundCount < maxRounds) {
            console.log(`Auto-completing round ${roundCount + 1}`);
            
            // Check current match
            const res = await fetch('/api/current-match');
            console.log('Current match response:', res.status);
            
            if (!res.ok) {
                console.log('No more matches in current round');
                
                // Check game state to see if tournament is over
                const gameStateRes = await fetch('/api/game-state');
                const gameState = await gameStateRes.json();
                console.log('Game state:', gameState);
                
                if (gameState.winners.length === 1) {
                    console.log('Tournament complete!');
                    loadMatch();
                    return;
                } else if (gameState.winners.length > 1) {
                    console.log('Starting next round...');
                    const nextRoundRes = await fetch('/api/next-round', { method: 'POST' });
                    if (nextRoundRes.ok) {
                        console.log('Next round started successfully');
                        loadMatch();
                        return;
                    } else {
                        console.error('Failed to start next round');
                        break;
                    }
                } else {
                    console.log('No winners, tournament should be complete');
                    loadMatch();
                    return;
                }
            }
            
            // Pick random Pokémon and continue
            const choice = Math.random() < 0.5 ? 'pokemon1' : 'pokemon2';
            console.log(`Choosing ${choice}`);
            
            const choiceRes = await fetch('/api/choose-pokemon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ choice })
            });
            
            if (!choiceRes.ok) {
                console.error('Failed to choose Pokémon');
                break;
            }
            
            roundCount++;
        }
        
        console.log('Auto-complete finished or hit safety limit');
        
    } catch (error) {
        console.error('Error in auto-complete:', error);
    } finally {
        // Reset button
        btn.disabled = false;
        btn.textContent = 'Auto Complete Round';
        loadMatch(); // Refresh the display
    }
}

async function restartTournament() {
    await fetch('/api/reset-game', { method: 'POST' });
    loadMatch();
}

async function choose(side) {
    await fetch('/api/choose-pokemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: side === 'left' ? 'pokemon1' : 'pokemon2' })
    });
    loadMatch();
}

document.addEventListener('DOMContentLoaded', () => {
    loadMatch();
    document.getElementById('left-half').addEventListener('mouseenter', () => {
        document.getElementById('left-pokemon').classList.remove('grayscale');
    });
    document.getElementById('left-half').addEventListener('mouseleave', () => {
        document.getElementById('left-pokemon').classList.add('grayscale');
    });
    document.getElementById('right-half').addEventListener('mouseenter', () => {
        document.getElementById('right-pokemon').classList.remove('grayscale');
    });
    document.getElementById('right-half').addEventListener('mouseleave', () => {
        document.getElementById('right-pokemon').classList.add('grayscale');
    });
    document.getElementById('left-half').addEventListener('click', () => choose('left'));
    document.getElementById('right-half').addEventListener('click', () => choose('right'));
}); 