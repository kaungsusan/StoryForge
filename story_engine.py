import json
from pathlib import Path
from uuid import uuid4

STORIES_DIR = Path(__file__).parent / "stories"
STORIES_DIR.mkdir(exist_ok=True)


def load_stories():
    stories = []

    for file_path in STORIES_DIR.glob("*.json"):
        try:
            with file_path.open("r", encoding="utf-8") as file:
                stories.append(json.load(file))
        except (json.JSONDecodeError, OSError):
            continue

    return stories


def get_story(story_id):
    file_path = STORIES_DIR / f"{story_id}.json"

    if not file_path.exists():
        return None

    try:
        with file_path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return None


def save_story(story):
    story_id = story.get("id")

    if not story_id:
        story_id = uuid4().hex[:8]
        story["id"] = story_id

    file_path = STORIES_DIR / f"{story_id}.json"

    with file_path.open("w", encoding="utf-8") as file:
        json.dump(story, file, indent=4, ensure_ascii=False)

    return story


def create_story():
    story_id = uuid4().hex[:8]

    story = {
        "id": story_id,
        "title": "Untitled Mystery",
        "description": "A new mystery waiting to be written.",
        "start_scene": "start",
        "scenes": {
            "start": {
                "title": "The Beginning",
                "text": "Your mystery begins here.",
                "choices": [],
                "ending": True
            }
        }
    }

    return save_story(story)


def validate_story(story):
    errors = []
    warnings = []

    scenes = story.get("scenes", {})
    start_scene = story.get("start_scene")

    if not scenes:
        errors.append("The story does not contain any scenes.")
        return {"errors": errors, "warnings": warnings}

    if start_scene not in scenes:
        errors.append("The starting scene does not exist.")
        return {"errors": errors, "warnings": warnings}

    for scene_id, scene in scenes.items():
        if not scene.get("title", "").strip():
            errors.append(f"Scene '{scene_id}' has no title.")

        if not scene.get("text", "").strip():
            errors.append(f"Scene '{scene_id}' has no story text.")

        choices = scene.get("choices", [])

        if not isinstance(choices, list):
            errors.append(f"Scene '{scene_id}' has an invalid choices list.")
            continue

        if not choices and not scene.get("ending", False):
            warnings.append(
                f"Scene '{scene_id}' has no choices and is not marked as an ending."
            )

        for choice in choices:
            target = choice.get("target_scene")

            if target not in scenes:
                errors.append(
                    f"Scene '{scene_id}' links to missing scene '{target}'."
                )

    visited = set()
    pending = [start_scene]

    while pending:
        current = pending.pop()

        if current in visited or current not in scenes:
            continue

        visited.add(current)

        for choice in scenes[current].get("choices", []):
            target = choice.get("target_scene")

            if target in scenes and target not in visited:
                pending.append(target)

    unreachable = set(scenes) - visited

    for scene_id in sorted(unreachable):
        warnings.append(f"Scene '{scene_id}' cannot be reached from the start.")

    return {
        "errors": errors,
        "warnings": warnings
    }