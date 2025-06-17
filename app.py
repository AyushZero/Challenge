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
    """Fetch all Pokemon from PokeAPI with better error handling"""
    try:
        # Try to get Pokemon from API with timeout
        response = requests.get('https://pokeapi.co/api/v2/pokemon?limit=151', timeout=10)
        response.raise_for_status()
        data = response.json()
        pokemon_list = []
        
        for pokemon in data['results']:
            pokemon_id = pokemon['url'].split('/')[-2]
            pokemon_list.append({
                'id': int(pokemon_id),
                'name': pokemon['name'].title(),
                'image_url': f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/{pokemon_id}.png'
            })
        
        print(f"Successfully loaded {len(pokemon_list)} Shiny Pokemon from API")
        return pokemon_list
    except Exception as e:
        print(f"API failed, using fallback Shiny Pokemon: {e}")
        # Fallback to a comprehensive list if API fails - using shiny sprites
        return [
            {'id': 1, 'name': 'Bulbasaur', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png'},
            {'id': 2, 'name': 'Ivysaur', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/2.png'},
            {'id': 3, 'name': 'Venusaur', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/3.png'},
            {'id': 4, 'name': 'Charmander', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/4.png'},
            {'id': 5, 'name': 'Charmeleon', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/5.png'},
            {'id': 6, 'name': 'Charizard', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png'},
            {'id': 7, 'name': 'Squirtle', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/7.png'},
            {'id': 8, 'name': 'Wartortle', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/8.png'},
            {'id': 9, 'name': 'Blastoise', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/9.png'},
            {'id': 10, 'name': 'Caterpie', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/10.png'},
            {'id': 11, 'name': 'Metapod', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/11.png'},
            {'id': 12, 'name': 'Butterfree', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/12.png'},
            {'id': 13, 'name': 'Weedle', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/13.png'},
            {'id': 14, 'name': 'Kakuna', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/14.png'},
            {'id': 15, 'name': 'Beedrill', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/15.png'},
            {'id': 16, 'name': 'Pidgey', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/16.png'},
            {'id': 17, 'name': 'Pidgeotto', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/17.png'},
            {'id': 18, 'name': 'Pidgeot', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/18.png'},
            {'id': 19, 'name': 'Rattata', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/19.png'},
            {'id': 20, 'name': 'Raticate', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/20.png'},
            {'id': 21, 'name': 'Spearow', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/21.png'},
            {'id': 22, 'name': 'Fearow', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/22.png'},
            {'id': 23, 'name': 'Ekans', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/23.png'},
            {'id': 24, 'name': 'Arbok', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/24.png'},
            {'id': 25, 'name': 'Pikachu', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png'},
            {'id': 26, 'name': 'Raichu', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/26.png'},
            {'id': 27, 'name': 'Sandshrew', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/27.png'},
            {'id': 28, 'name': 'Sandslash', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/28.png'},
            {'id': 29, 'name': 'Nidoran♀', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/29.png'},
            {'id': 30, 'name': 'Nidorina', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/30.png'},
            {'id': 31, 'name': 'Nidoqueen', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/31.png'},
            {'id': 32, 'name': 'Nidoran♂', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/32.png'},
            {'id': 33, 'name': 'Nidorino', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/33.png'},
            {'id': 34, 'name': 'Nidoking', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/34.png'},
            {'id': 35, 'name': 'Clefairy', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/35.png'},
            {'id': 36, 'name': 'Clefable', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/36.png'},
            {'id': 37, 'name': 'Vulpix', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/37.png'},
            {'id': 38, 'name': 'Ninetales', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/38.png'},
            {'id': 39, 'name': 'Jigglypuff', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/39.png'},
            {'id': 40, 'name': 'Wigglytuff', 'image_url': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/40.png'},
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

@app.route('/api/next-pokemon/<int:index>')
def get_next_pokemon(index):
    """Get Pokemon at specific index for preloading"""
    game_state = load_game_state()
    
    if not game_state['remaining_pokemon'] or index >= len(game_state['remaining_pokemon']):
        return jsonify({'error': 'No Pokemon at that index'}), 404
    
    return jsonify(game_state['remaining_pokemon'][index])

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