
function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function initializeEditor() {
    const storyData = document.getElementById("story-data");

    if (!storyData) {
        return;
    }

    const story = JSON.parse(storyData.textContent);
    const titleInput = document.getElementById("story-title");
    const descriptionInput = document.getElementById("story-description");
    const scenesContainer = document.getElementById("scene-list");
    const addSceneButton = document.getElementById("add-scene");
    const saveButton = document.getElementById("save-story");
    const validateButton = document.getElementById("validate-story");
    const validationResults = document.getElementById("validation-results");
    const messageElement = document.getElementById("editor-message");

    if (
        !titleInput ||
        !descriptionInput ||
        !scenesContainer ||
        !addSceneButton ||
        !saveButton ||
        !validateButton ||
        !validationResults ||
        !messageElement
    ) {
        console.error("Some editor elements are missing.");
        return;
    }

    function renderScenes() {
        scenesContainer.replaceChildren();

        Object.entries(story.scenes).forEach(([sceneId, scene]) => {
            const panel = createElement("div", "editor-panel");
            const heading = createElement("h3", "", sceneId);

            const title = document.createElement("input");
            title.type = "text";
            title.value = scene.title || "";
            title.placeholder = "Scene title";

            const text = document.createElement("textarea");
            text.value = scene.text || "";
            text.placeholder = "Write your scene...";
            text.rows = 5;

            const endingLabel = createElement("label");
            const ending = document.createElement("input");

            ending.type = "checkbox";
            ending.checked = Boolean(scene.ending);

            endingLabel.append(
                ending,
                document.createTextNode(" Ending scene")
            );

            title.addEventListener("input", () => {
                scene.title = title.value;
            });

            text.addEventListener("input", () => {
                scene.text = text.value;
            });

            ending.addEventListener("change", () => {
                scene.ending = ending.checked;
            });

            const choicesHeading = createElement("h4", "", "Choices");
            const choicesContainer = createElement("div", "choices-editor");

            scene.choices = scene.choices || [];

            scene.choices.forEach((choice, index) => {
                const choicePanel = createElement("div", "choice-editor");

                const label = document.createElement("input");
                label.type = "text";
                label.value = choice.label || "";
                label.placeholder = "Choice text";

                const target = document.createElement("input");
                target.type = "text";
                target.value = choice.target_scene || "";
                target.placeholder = "Target scene ID";

                const removeChoiceButton = createElement(
                    "button",
                    "button button-secondary",
                    "Remove Choice"
                );

                removeChoiceButton.type = "button";

                label.addEventListener("input", () => {
                    choice.label = label.value;
                });

                target.addEventListener("input", () => {
                    choice.target_scene = target.value.trim();
                });

                removeChoiceButton.addEventListener("click", () => {
                    scene.choices.splice(index, 1);
                    renderScenes();
                });

                choicePanel.append(
                    label,
                    target,
                    removeChoiceButton
                );

                choicesContainer.appendChild(choicePanel);
            });

            const addChoiceButton = createElement(
                "button",
                "button button-secondary",
                "Add Choice"
            );

            addChoiceButton.type = "button";

            addChoiceButton.addEventListener("click", () => {
                scene.choices.push({
                    label: "New choice",
                    target_scene: ""
                });

                renderScenes();
            });

            const removeSceneButton = createElement(
                "button",
                "button button-secondary",
                "Remove Scene"
            );

            removeSceneButton.type = "button";

            removeSceneButton.addEventListener("click", () => {
                if (sceneId === story.start_scene) {
                    alert("You cannot remove the starting scene.");
                    return;
                }

                if (!confirm("Are you sure you want to remove this scene?")) {
                    return;
                }

                delete story.scenes[sceneId];

                Object.values(story.scenes).forEach(otherScene => {
                    otherScene.choices = (otherScene.choices || []).filter(
                        choice => choice.target_scene !== sceneId
                    );
                });

                renderScenes();
            });

            panel.append(
                heading,
                createElement("label", "", "Scene Title"),
                title,
                createElement("label", "", "Scene Text"),
                text,
                endingLabel,
                choicesHeading,
                choicesContainer,
                addChoiceButton,
                removeSceneButton
            );

            scenesContainer.appendChild(panel);
        });
    }

    function updateStoryInformation() {
        story.title = titleInput.value.trim();
        story.description = descriptionInput.value.trim();
    }

    async function saveStory(showMessage = true) {
        updateStoryInformation();

        try {
            const response = await fetch(`/story/${story.id}/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(story)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to save story.");
            }

            if (showMessage) {
                messageElement.textContent = "Story saved successfully!";
            }

            return true;
        } catch (error) {
            messageElement.textContent = error.message;
            return false;
        }
    }

    addSceneButton.addEventListener("click", () => {
        let sceneId = `scene_${Object.keys(story.scenes).length + 1}`;

        while (story.scenes[sceneId]) {
            sceneId = `scene_${Math.floor(Math.random() * 100000)}`;
        }

        story.scenes[sceneId] = {
            title: "New Scene",
            text: "",
            choices: [],
            ending: false
        };

        renderScenes();
        messageElement.textContent = "New scene added.";
    });

    saveButton.addEventListener("click", async () => {
        messageElement.textContent = "Saving story...";
        await saveStory();
    });

    validateButton.addEventListener("click", async () => {
        validationResults.replaceChildren();
        messageElement.textContent = "Checking story...";

        const saved = await saveStory(false);

        if (!saved) {
            return;
        }

        try {
            const response = await fetch(`/story/${story.id}/validate`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error("Unable to validate story.");
            }

            validationResults.replaceChildren();

            if (result.errors.length > 0) {
                validationResults.appendChild(
                    createElement("h3", "", "Errors")
                );

                result.errors.forEach(error => {
                    validationResults.appendChild(
                        createElement("p", "error-message", error)
                    );
                });
            }

            if (result.warnings.length > 0) {
                validationResults.appendChild(
                    createElement("h3", "", "Warnings")
                );

                result.warnings.forEach(warning => {
                    validationResults.appendChild(
                        createElement("p", "warning-message", warning)
                    );
                });
            }

            if (!result.errors.length && !result.warnings.length) {
                validationResults.appendChild(
                    createElement(
                        "p",
                        "success-message",
                        "Your story looks good!"
                    )
                );
            }

            messageElement.textContent = "Story validation completed.";
        } catch (error) {
            messageElement.textContent = error.message;
        }
    });

    renderScenes();
}

function initializePlayer() {
    const storyData = document.getElementById("play-story-data");

    if (!storyData) {
        return;
    }

    let story;

    try {
        story = JSON.parse(storyData.textContent);
    } catch (error) {
        console.error("Unable to read story data:", error);
        return;
    }

    if (!story || !story.id || !story.scenes || !story.start_scene) {
        console.error("Story data is incomplete.");
        return;
    }

    const titleElement = document.getElementById("scene-title");
    const textElement = document.getElementById("scene-text");
    const numberElement = document.getElementById("scene-number");
    const choicesElement = document.getElementById("scene-choices");
    const restartButton = document.getElementById("restart-story");
    const resumePrompt = document.getElementById("resume-prompt");
    const resumeButton = document.getElementById("resume-progress");
    const startOverButton = document.getElementById("start-over");

    if (
        !titleElement ||
        !textElement ||
        !numberElement ||
        !choicesElement ||
        !restartButton
    ) {
        console.error("Required story player elements are missing.");
        return;
    }

    const progressKey = `storyforge-progress-${story.id}`;

    let currentScene = story.start_scene;
    let visitedScenes = [];

    function saveProgress() {
        localStorage.setItem(
            progressKey,
            JSON.stringify({
                current_scene: currentScene,
                visited_scenes: visitedScenes
            })
        );
    }

    function showScene(sceneId) {
        const scene = story.scenes[sceneId];

        if (!scene) {
            titleElement.textContent = "Scene not found";
            textElement.textContent = "This scene does not exist.";
            numberElement.textContent = "";
            choicesElement.replaceChildren();
            return;
        }

        currentScene = sceneId;
        visitedScenes.push(sceneId);

        saveProgress();

        numberElement.textContent = `SCENE ${visitedScenes.length}`;
        titleElement.textContent = scene.title;
        textElement.textContent = scene.text;
        choicesElement.replaceChildren();

        if (scene.ending) {
            choicesElement.appendChild(
                createElement("p", "ending-message", "THE END")
            );
            return;
        }

        (scene.choices || []).forEach(choice => {
            const button = createElement(
                "button",
                "choice-button",
                choice.label
            );

            button.type = "button";

            button.addEventListener("click", () => {
                showScene(choice.target_scene);
            });

            choicesElement.appendChild(button);
        });
    }

    function startStory() {
        visitedScenes = [];
        localStorage.removeItem(progressKey);

        if (resumePrompt) {
            resumePrompt.hidden = true;
        }

        showScene(story.start_scene);
    }

    function resumeStory() {
        let savedProgress = null;

        try {
            savedProgress = JSON.parse(
                localStorage.getItem(progressKey)
            );
        } catch (error) {
            localStorage.removeItem(progressKey);
        }

        if (
            savedProgress &&
            story.scenes[savedProgress.current_scene] &&
            Array.isArray(savedProgress.visited_scenes)
        ) {
            visitedScenes = savedProgress.visited_scenes.filter(
                sceneId => story.scenes[sceneId]
            );

            if (
                visitedScenes[visitedScenes.length - 1] ===
                savedProgress.current_scene
            ) {
                visitedScenes.pop();
            }

            showScene(savedProgress.current_scene);
        } else {
            startStory();
        }

        if (resumePrompt) {
            resumePrompt.hidden = true;
        }
    }

    restartButton.addEventListener("click", startStory);

    if (startOverButton) {
        startOverButton.addEventListener("click", startStory);
    }

    if (resumeButton) {
        resumeButton.addEventListener("click", resumeStory);
    }

    let savedProgress = null;

    try {
        savedProgress = JSON.parse(
            localStorage.getItem(progressKey)
        );
    } catch (error) {
        localStorage.removeItem(progressKey);
    }

    if (
        savedProgress &&
        story.scenes[savedProgress.current_scene] &&
        Array.isArray(savedProgress.visited_scenes)
    ) {
        if (resumePrompt) {
            resumePrompt.hidden = false;
        }
    } else {
        startStory();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    initializePlayer();
});
