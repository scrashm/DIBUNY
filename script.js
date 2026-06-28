(function () {
  "use strict";

  var STORAGE_KEY = "escape_from_dibuny_save";
  var TYPEWRITER_DELAY = 28;

  var scenes = [];
  var sceneMap = {};
  var state = {
    sceneId: "start",
    flags: {}
  };

  var isTyping = false;
  var typewriterTimer = null;

  var bgEl = document.getElementById("background");
  var bgImageEl = document.getElementById("bg-image");
  var overlayEl = document.getElementById("scene-overlay");
  var speakerEl = document.getElementById("speaker");
  var portraitEl = document.getElementById("portrait");
  var textEl = document.getElementById("text");
  var choicesEl = document.getElementById("choices");
  var errorEl = document.getElementById("error");
  var dialogueBoxEl = document.getElementById("dialogue-box");

  var currentTypewriterText = "";
  var currentTypewriterComplete = null;
  var currentSceneForChoices = null;

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }

  function loadSave() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || typeof data.sceneId !== "string") return false;
      state.sceneId = data.sceneId;
      state.flags = data.flags && typeof data.flags === "object" ? data.flags : {};
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveGame() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sceneId: state.sceneId, flags: state.flags })
      );
    } catch (e) {
      /* ignore quota errors */
    }
  }

  function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
    state.sceneId = "start";
    state.flags = {};
  }

  function getScene(id) {
    return sceneMap[id] || null;
  }

  var BG_FILES = {
    station: "assets/images/dibuny_station.jpg",
    forest: "assets/images/forest_station.jpg",
    polyana: "assets/images/Polana.jpg",
    dot: "assets/images/DOT.jpg"
  };

  var BG_CLASSES = ["bg-station", "bg-forest", "bg-polyana", "bg-dot"];

  var PORTRAIT_FILES = {
    "Лёха": "assets/images/Lepeha.png",
    "Леха": "assets/images/Lepeha.png",
    "Миша": "assets/images/Misha.png",
    "Малой": "assets/images/Maloy.png"
  };

  function setSpeaker(speaker) {
    if (!speaker) {
      speakerEl.textContent = "";
      speakerEl.classList.add("hidden");
      portraitEl.classList.add("hidden");
      portraitEl.removeAttribute("src");
      return;
    }

    speakerEl.textContent = speaker;
    speakerEl.classList.remove("hidden");

    var portraitPath = PORTRAIT_FILES[speaker];
    if (portraitPath) {
      portraitEl.alt = speaker;
      if (portraitEl.getAttribute("src") === portraitPath && portraitEl.complete) {
        portraitEl.classList.remove("hidden");
      } else {
        portraitEl.onload = function () {
          portraitEl.classList.remove("hidden");
        };
        portraitEl.onerror = function () {
          portraitEl.classList.add("hidden");
          portraitEl.removeAttribute("src");
        };
        portraitEl.src = portraitPath;
      }
    } else {
      portraitEl.classList.add("hidden");
      portraitEl.removeAttribute("src");
    }
  }

  function setBackground(bgName) {
    var name = bgName || "station";
    BG_CLASSES.forEach(function (cls) {
      bgEl.classList.remove(cls);
    });
    bgEl.classList.add("bg-" + name);

    var imagePath = BG_FILES[name];
    if (!imagePath) {
      bgImageEl.classList.add("hidden");
      bgImageEl.removeAttribute("src");
      return;
    }

    bgImageEl.onload = function () {
      bgImageEl.classList.remove("hidden");
    };
    bgImageEl.onerror = function () {
      bgImageEl.classList.add("hidden");
      bgImageEl.removeAttribute("src");
    };
    bgImageEl.src = imagePath;
  }

  function clearTypewriter() {
    if (typewriterTimer !== null) {
      clearTimeout(typewriterTimer);
      typewriterTimer = null;
    }
    isTyping = false;
  }

  function hideChoices() {
    choicesEl.classList.add("hidden");
    choicesEl.innerHTML = "";
  }

  function flagMatches(flags, condition) {
    if (!condition || typeof condition !== "object") return true;
    return Object.keys(condition).every(function (key) {
      return flags[key] === condition[key];
    });
  }

  function filterChoices(choices) {
    if (!choices) return [];
    return choices.filter(function (choice) {
      if (choice.requires && !flagMatches(state.flags, choice.requires)) {
        return false;
      }
      if (choice.unless && flagMatches(state.flags, choice.unless)) {
        return false;
      }
      return true;
    });
  }

  function resolveSceneId(sceneId) {
    var safety = 0;

    while (safety < 10) {
      var scene = getScene(sceneId);
      if (!scene) return sceneId;

      var redirected = false;

      if (scene.alternate && Array.isArray(scene.alternate)) {
        for (var i = 0; i < scene.alternate.length; i++) {
          var alt = scene.alternate[i];
          if (flagMatches(state.flags, alt.requires)) {
            sceneId = alt.redirect;
            redirected = true;
            break;
          }
        }
      }

      if (redirected) {
        safety += 1;
        continue;
      }

      if (scene.requires && !flagMatches(state.flags, scene.requires)) {
        if (scene.redirect) {
          sceneId = scene.redirect;
          safety += 1;
          continue;
        }
      }

      if (scene.redirect && !scene.text) {
        sceneId = scene.redirect;
        safety += 1;
        continue;
      }

      return sceneId;
    }

    return sceneId;
  }

  function getVisibleChoices(scene) {
    return filterChoices(scene.choices || []);
  }

  function showChoices(scene) {
    choicesEl.innerHTML = "";
    var visible = getVisibleChoices(scene);

    if (visible.length === 0) {
      var restartBtn = document.createElement("button");
      restartBtn.type = "button";
      restartBtn.className = "restart-btn";
      restartBtn.textContent = "Начать заново";
      restartBtn.addEventListener("click", function () {
        clearSave();
        transitionToScene("start");
      });
      choicesEl.appendChild(restartBtn);
      choicesEl.classList.remove("hidden");
      return;
    }

    visible.forEach(function (choice) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice.text;
      btn.addEventListener("click", function () {
        if (isTyping) {
          skipTypewriter();
          return;
        }
        applyChoice(choice);
      });
      choicesEl.appendChild(btn);
    });

    choicesEl.classList.remove("hidden");
  }

  function applyChoice(choice) {
    if (choice.set && typeof choice.set === "object") {
      Object.keys(choice.set).forEach(function (key) {
        state.flags[key] = choice.set[key];
      });
    }
    transitionToScene(choice.next);
  }

  function skipTypewriter() {
    if (!isTyping) return;
    clearTypewriter();
    textEl.textContent = currentTypewriterText;
    textEl.classList.add("done");
    if (currentTypewriterComplete) {
      var done = currentTypewriterComplete;
      currentTypewriterComplete = null;
      done();
    }
  }

  function typewriter(text, onComplete) {
    clearTypewriter();
    hideChoices();
    textEl.textContent = "";
    textEl.classList.remove("done");
    isTyping = true;
    currentTypewriterText = text;
    currentTypewriterComplete = onComplete;

    var index = 0;

    function tick() {
      if (index < text.length) {
        textEl.textContent += text.charAt(index);
        index += 1;
        typewriterTimer = setTimeout(tick, TYPEWRITER_DELAY);
      } else {
        typewriterTimer = null;
        isTyping = false;
        currentTypewriterComplete = null;
        textEl.classList.add("done");
        if (onComplete) onComplete();
      }
    }

    tick();
  }

  function renderScene(scene, animate) {
    if (!scene) {
      showError("Сцена не найдена: " + state.sceneId);
      return;
    }

    function display() {
      setBackground(scene.bg);

      setSpeaker(scene.speaker);
      currentSceneForChoices = scene;

      typewriter(scene.text || "", function () {
        showChoices(scene);
      });

      saveGame();
    }

    if (animate) {
      overlayEl.classList.remove("fade-in");
      overlayEl.classList.add("fade-out");
      bgEl.classList.remove("fade-in");
      bgEl.classList.add("fade-out");

      setTimeout(function () {
        display();
        overlayEl.classList.remove("fade-out");
        overlayEl.classList.add("fade-in");
        bgEl.classList.remove("fade-out");
        bgEl.classList.add("fade-in");
      }, 400);
    } else {
      display();
    }
  }

  function transitionToScene(sceneId) {
    state.sceneId = resolveSceneId(sceneId);
    var scene = getScene(state.sceneId);
    renderScene(scene, true);
  }

  function normalizeScenes(scenesData) {
    if (Array.isArray(scenesData)) {
      return scenesData;
    }
    if (scenesData && typeof scenesData === "object") {
      return Object.keys(scenesData).map(function (key) {
        return scenesData[key];
      });
    }
    return [];
  }

  function buildSceneMap(list) {
    sceneMap = {};
    list.forEach(function (scene) {
      sceneMap[scene.id] = scene;
    });
  }

  function init(scenesData) {
    scenes = normalizeScenes(scenesData);

    if (scenes.length === 0) {
      showError("Файл сцен пуст или имеет неверный формат.");
      return;
    }

    buildSceneMap(scenes);

    if (!sceneMap.start) {
      showError('Начальная сцена "start" не найдена в scenes.json.');
      return;
    }

    loadSave();

    state.sceneId = resolveSceneId(state.sceneId);

    var initial = getScene(state.sceneId);
    if (!initial) {
      state.sceneId = "start";
      initial = getScene("start");
    }

    renderScene(initial, false);
  }

  function bootstrap() {
    fetch("data/scenes.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then(init)
      .catch(function (err) {
        showError(
          "Не удалось загрузить data/scenes.json (" + err.message + "). " +
            "Запустите локальный сервер из папки игры:\n" +
            "python -m http.server 8080\n" +
            "Затем откройте http://localhost:8080"
        );
      });
  }

  bootstrap();

  if (dialogueBoxEl) {
    dialogueBoxEl.addEventListener("click", function () {
      skipTypewriter();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && isTyping) {
      e.preventDefault();
      skipTypewriter();
    }
  });
})();
