
# StoryForge
### An Interactive Branching Mystery Story Creator and Player

StoryForge is a web-based application that allows users to create, edit, and play interactive mystery stories. Readers can make decisions throughout a story, explore different paths, discover clues, and experience multiple endings depending on their choices.

The project combines creative storytelling with interactive web development using Python, Flask, HTML, CSS, and JavaScript.

## Features

### Story Creation and Editing
- Create new mystery stories.
- Edit story titles and descriptions.
- Add, edit, and remove scenes.
- Add multiple choices to each scene.
- Connect choices to different scenes.
- Mark scenes as endings.

### Interactive Story Player
- Play stories through an interactive interface.
- Make choices that determine the next scene.
- Explore different story paths.
- Discover multiple possible endings.
- Restart a story at any time.

### Reading Progress
- Automatically save reading progress in the browser.
- Continue reading from the previous scene.
- Start over and clear previous reading progress.

### Story Management
- Browse available stories in the Story Library.
- Open stories to play or edit them.
- Delete stories from the library.

### Story Validation
- Check for missing scene references.
- Identify invalid story choices.
- Detect unreachable scenes.
- Check for incomplete story information.

## Built With

- **Python** - Main programming language.
- **Flask** - Web application framework.
- **HTML5** - Web page structure.
- **CSS3** - Styling and responsive design.
- **JavaScript** - Interactive story functionality.
- **JSON** - Story data storage.
- **Local Storage** - Saving reading progress in the browser.

## Installation and Setup

### Requirements

- Python 3
- pip
- A web browser

### 1. Clone the repository

```bash
git clone https://github.com/kaungsusan/StoryForge.git
```

### 2. Open the project folder

```bash
cd StoryForge
```

### 3. Install Flask

```bash
python -m pip install Flask
```

### 4. Run the application

```bash
python app.py
```

### 5. Open StoryForge

Open your browser and visit:

http://127.0.0.1:5000

## How to Use

1. Open StoryForge in your browser.
2. Browse existing stories through the Story Library.
3. Select a story to start playing.
4. Read each scene and choose an available action.
5. Explore different paths to discover different endings.
6. Use Restart Story to begin again.
7. Select Create a Story to build your own interactive mystery.
8. Use the Story Editor to add scenes and choices.
9. Save your story and use Check Story to validate it.

## Included Stories

### 1. The Last Night at Blackwood Manor
A detective investigates the mysterious disappearance of Lord Blackwood from an isolated mansion. Follow clues throughout the manor and uncover the truth behind his disappearance.

### 2. The 11:47 Train
A passenger mysteriously disappears from a locked train compartment during a midnight journey. Investigate the passengers, discover hidden evidence, and uncover the truth before the train reaches its destination.

### 3. The Missing Manuscript
A priceless historical manuscript disappears from a university library. Investigate the suspects, uncover hidden motives, and discover what happened to the missing manuscript.

## Project Structure

```text
StoryForge/
│
├── app.py
├── story_engine.py
├── README.md
│
├── stories/
│   ├── sample-mystery.json
│   ├── 11-47-train.json
│   └── missing-manuscript.json
│
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── library.html
│   ├── editor.html
│   ├── play.html
│   └── 404.html
│
└── static/
    ├── css/
    │   └── style.css
    │
    └── js/
        └── app.js
```

## Data Storage

Story information is stored in JSON files. Each story contains:

- A unique story ID
- A title and description
- A starting scene
- Multiple scenes
- Choices connecting scenes
- Ending information

Reading progress is stored locally in the user's browser using Local Storage.

## Future Improvements

- Allow users to share stories with other people.
- Add more mystery story templates.
- Introduce additional story customization options.
- Add user accounts and online story storage.

## Author

Developed as an individual Open Source Software course project.
