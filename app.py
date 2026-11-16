from flask import Flask, abort, jsonify, redirect, render_template, request, url_for

from story_engine import (
    create_story,
    get_story,
    load_stories,
    save_story,
    validate_story
)

app = Flask(__name__)


@app.route("/")
def index():
    stories = load_stories()
    return render_template("index.html", stories=stories)


@app.route("/library")
def library():
    stories = load_stories()
    return render_template("library.html", stories=stories)


@app.route("/story/new", methods=["POST"])
def new_story():
    story = create_story()
    return redirect(url_for("edit_story", story_id=story["id"]))


@app.route("/story/<story_id>/edit")
def edit_story(story_id):
    story = get_story(story_id)

    if story is None:
        abort(404)

    return render_template("editor.html", story=story)


@app.route("/story/<story_id>/save", methods=["POST"])
def save_story_route(story_id):
    story = request.get_json(silent=True)

    if not isinstance(story, dict):
        return jsonify({"error": "Invalid story data."}), 400

    story["id"] = story_id
    saved_story = save_story(story)

    return jsonify({
        "message": "Story saved successfully.",
        "story": saved_story
    })


@app.route("/story/<story_id>/play")
def play_story(story_id):
    story = get_story(story_id)

    if story is None:
        abort(404)

    return render_template("play.html", story=story)


@app.route("/story/<story_id>/validate")
def validate_story_route(story_id):
    story = get_story(story_id)

    if story is None:
        abort(404)

    result = validate_story(story)
    return jsonify(result)


@app.errorhandler(404)
def page_not_found(error):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(debug=True)