async function loadMatch() {
    const res = await fetch('/api/current-match');
    if (!res.ok) {
        // Tournament over or round complete
        document.body.innerHTML = '<div style="color:white;text-align:center;font-size:2em;display:flex;align-items:center;justify-content:center;height:100vh;">Tournament Complete!</div>';
        return;
    }
    const data = await res.json();
    document.getElementById('left-pokemon').src = data.pokemon1.image_url;
    document.getElementById('right-pokemon').src = data.pokemon2.image_url;
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