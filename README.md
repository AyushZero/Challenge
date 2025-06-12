# Task Manager

A simple and modern task management application built with Flask.

## Features

- Create, read, update, and delete tasks
- Mark tasks as completed
- Persistent storage using JSON file
- Modern and responsive UI
- Clean and intuitive design

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
.
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── tasks.json         # Task storage file (created automatically)
├── static/
│   ├── css/
│   │   └── style.css  # Application styles
│   └── js/
│       └── main.js    # Client-side JavaScript
└── templates/
    └── index.html     # Main HTML template
```

## Technologies Used

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- Storage: JSON file
- UI: Custom CSS with modern design principles 