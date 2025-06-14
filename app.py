from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from datetime import datetime
import json
import os
import requests
import random

app = Flask(__name__)
app.secret_key = 'pokemon_swipe_game_secret_key'

# Game state file
GAME_STATE_FILE = 'game_state.json'

def load_game_state():
    if os.path.exists(GAME_STATE_FILE):
        with open(GAME_STATE_FILE, 'r') as f:
            return json.load(f)
    return {
        'current_round': 1,
        'remaining_pokemon': [],
        'passed_pokemon': [],
        'game_history': []
    }

def save_game_state(game_state):
    with open(GAME_STATE_FILE, 'w') as f:
        json.dump(game_state, f, indent=2)

def get_all_pokemon():
    """Fetch all Pokemon from PokeAPI"""
    try:
        response = requests.get('https://pokeapi.co/api/v2/pokemon?limit=151')
        data = response.json()
        pokemon_list = []
        
        for pokemon in data['results']:
            pokemon_id = pokemon['url'].split('/')[-2]
            pokemon_list.append({
                'id': int(pokemon_id),
                'name': pokemon['name'].title(),
                'image_url': f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pokemon_id}.png'
            })
        
        return pokemon_list
    except:
        # Fallback to a small list if API fails
        return [
            {'id': 1, 'name': 'Bulbasaur', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'},
            {'id': 4, 'name': 'Charmander', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png'},
            {'id': 7, 'name': 'Squirtle', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png'},
            {'id': 25, 'name': 'Pikachu', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'},
        ]

def initialize_new_round():
    """Initialize a new round with all Pokemon"""
    game_state = load_game_state()
    if game_state['current_round'] == 1:
        # First round: get all Pokemon
        game_state['remaining_pokemon'] = get_all_pokemon()
    else:
        # Subsequent rounds: use passed Pokemon from previous round
        game_state['remaining_pokemon'] = game_state['passed_pokemon'].copy()
    
    game_state['passed_pokemon'] = []
    game_state['game_history'].append({
        'round': game_state['current_round'],
        'total_pokemon': len(game_state['remaining_pokemon']),
        'started_at': datetime.now().isoformat()
    })
    
    save_game_state(game_state)
    return game_state

@app.route('/')
def index():
    game_state = load_game_state()
    
    # Initialize first round if needed
    if not game_state['remaining_pokemon']:
        game_state = initialize_new_round()
    
    return render_template('pokemon_game.html', game_state=game_state)

@app.route('/api/current-pokemon')
def get_current_pokemon():
    game_state = load_game_state()
    
    if not game_state['remaining_pokemon']:
        return jsonify({'error': 'No Pokemon left in this round'}), 404
    
    return jsonify(game_state['remaining_pokemon'][0])

@app.route('/api/pass-pokemon', methods=['POST'])
def pass_pokemon():
    game_state = load_game_state()
    
    if not game_state['remaining_pokemon']:
        return jsonify({'error': 'No Pokemon left'}), 404
    
    # Move current Pokemon to passed list
    passed_pokemon = game_state['remaining_pokemon'].pop(0)
    game_state['passed_pokemon'].append(passed_pokemon)
    
    save_game_state(game_state)
    
    return jsonify({
        'message': f'Passed {passed_pokemon["name"]}',
        'remaining_count': len(game_state['remaining_pokemon']),
        'passed_count': len(game_state['passed_pokemon'])
    })

@app.route('/api/smash-pokemon', methods=['POST'])
def smash_pokemon():
    game_state = load_game_state()
    
    if not game_state['remaining_pokemon']:
        return jsonify({'error': 'No Pokemon left'}), 404
    
    # Remove current Pokemon (smash it)
    smashed_pokemon = game_state['remaining_pokemon'].pop(0)
    
    save_game_state(game_state)
    
    return jsonify({
        'message': f'Smashed {smashed_pokemon["name"]}',
        'remaining_count': len(game_state['remaining_pokemon']),
        'passed_count': len(game_state['passed_pokemon'])
    })

@app.route('/api/next-round', methods=['POST'])
def next_round():
    game_state = load_game_state()
    
    if game_state['remaining_pokemon']:
        return jsonify({'error': 'Current round not finished'}), 400
    
    if not game_state['passed_pokemon']:
        return jsonify({'error': 'No Pokemon passed to continue'}), 400
    
    # Start new round
    game_state['current_round'] += 1
    game_state = initialize_new_round()
    
    return jsonify({
        'message': f'Round {game_state["current_round"]} started!',
        'pokemon_count': len(game_state['remaining_pokemon']),
        'current_round': game_state['current_round']
    })

@app.route('/api/reset-game', methods=['POST'])
def reset_game():
    # Reset game state
    game_state = {
        'current_round': 1,
        'remaining_pokemon': [],
        'passed_pokemon': [],
        'game_history': []
    }
    save_game_state(game_state)
    
    # Initialize first round
    game_state = initialize_new_round()
    
    return jsonify({
        'message': 'Game reset!',
        'pokemon_count': len(game_state['remaining_pokemon']),
        'current_round': game_state['current_round']
    })

@app.route('/api/game-state')
def get_game_state():
    game_state = load_game_state()
    return jsonify(game_state)

if __name__ == '__main__':
    app.run(debug=True) 