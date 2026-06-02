(() => {
  "use strict";

  const MAX_DROPS = 6;
  const TOTAL_ROUNDS = 10;
  const STORAGE_KEY = "musi_color_magic_glowup_v1";

  const COLORS = {
    red: { name: "Rojo", css: "#f94158", rgb: [249, 65, 88] },
    yellow: { name: "Amarillo", css: "#ffd447", rgb: [255, 212, 71] },
    blue: { name: "Azul", css: "#2787ff", rgb: [39, 135, 255] },
    white: { name: "Blanco", css: "#ffffff", rgb: [255, 255, 255] },
    black: { name: "Negro", css: "#202332", rgb: [32, 35, 50] }
  };

  const SPEECHES = {
    start: "Vamos a recuperar el color perdido. Sin drama, con gotas.",
    add: "Bien. Una gota más al caldero cromático.",
    close: "Cerca. El color ya está respirando por ahí.",
    win: "Eso quedó poderoso. Musi aprueba esta mezcla.",
    miss: "Todavía no. El color objetivo no se va a copiar solo, tristemente.",
    hint: "Pista entregada. Ahora el caos tiene una dirección.",
    complete: "Mapa restaurado. La civilización cromática sobrevive otro día."
  };

  const CHALLENGES = [
    { id: "red", name: "Rojo chispa", level: "Principiante", drops: ["red"], color: "#f94158", hint: "Un color primario caliente." },
    { id: "yellow", name: "Luz dorada", level: "Principiante", drops: ["yellow"], color: "#ffd447", hint: "Un color primario luminoso." },
    { id: "blue", name: "Azul río", level: "Principiante", drops: ["blue"], color: "#2787ff", hint: "Un color primario fresco." },
    { id: "orange", name: "Naranja fogata", level: "Principiante", drops: ["red", "yellow"], color: "#ff8a3d", hint: "Nace al juntar calor y luz." },
    { id: "green", name: "Verde bosque", level: "Principiante", drops: ["blue", "yellow"], color: "#42c86f", hint: "Mezcla cielo con luz." },
    { id: "purple", name: "Violeta noche", level: "Principiante", drops: ["red", "blue"], color: "#8b5cf6", hint: "Se forma con energía y agua." },
    { id: "pink", name: "Rosa nube", level: "Aprendiz", drops: ["red", "white"], color: "#ff9db2", hint: "Suaviza el rojo con claridad." },
    { id: "sky", name: "Azul cielo", level: "Aprendiz", drops: ["blue", "white"], color: "#8ed6ff", hint: "Aclara el azul." },
    { id: "mint", name: "Menta mágica", level: "Aprendiz", drops: ["blue", "yellow", "white"], color: "#8ceec4", hint: "Verde, pero más suave." },
    { id: "lavender", name: "Lavanda lunar", level: "Aprendiz", drops: ["red", "blue", "white"], color: "#c9a0ff", hint: "Violeta con un toque de luz." },
    { id: "peach", name: "Durazno suave", level: "Artista", drops: ["red", "yellow", "white", "white"], color: "#ffc28b", hint: "Naranja muy aclarado." },
    { id: "turquoise", name: "Turquesa ola", level: "Artista", drops: ["blue", "blue", "yellow", "white"], color: "#49d7d1", hint: "Mucho azul, un poco de amarillo y luz." },
    { id: "fuchsia", name: "Fucsia eléctrico", level: "Artista", drops: ["red", "red", "blue", "white"], color: "#f05bc7", hint: "Más rojo que azul, con brillo." },
    { id: "olive", name: "Oliva secreto", level: "Artista", drops: ["yellow", "blue", "black"], color: "#7f8f35", hint: "Verde con sombra." },
    { id: "sunset", name: "Atardecer", level: "Mago", drops: ["red", "yellow", "yellow", "white"], color: "#ffb45f", hint: "Naranja luminoso, con más amarillo." },
    { id: "midnight", name: "Azul medianoche", level: "Mago", drops: ["blue", "blue", "black"], color: "#1d3f9d", hint: "Azul profundo con sombra." },
    { id: "rosewood", name: "Madera rosa", level: "Mago", drops: ["red", "red", "yellow", "black", "white"], color: "#bd5c5f", hint: "Rojo cálido, oscuro y suavizado." },
    { id: "jungle", name: "Selva profunda", level: "Mago", drops: ["blue", "yellow", "yellow", "black"], color: "#3f7d3c", hint: "Verde intenso con más amarillo y sombra." }
  ];

  const state = {
    current: null,
    currentIndex: 0,
    round: 1,
    score: 0,
    level: 1,
    streak: 0,
    mix: [],
    discovered: [],
    completedIds: [],
    hintsUsed: 0,
    hasCheckedCurrent: false,
    bestScore: 0,
    locked: false
  };

  const dom = {
    app: document.getElementById("app"),
    startBtn: document.getElementById("startBtn"),
    howToBtn: document.getElementById("howToBtn"),
    howToPanel: document.getElementById("howToPanel"),
    musiSpeech: document.getElementById("musiSpeech"),
    levelValue: document.getElementById("levelValue"),
    scoreValue: document.getElementById("scoreValue"),
    roundValue: document.getElementById("roundValue"),
    totalRoundsValue: document.getElementById("totalRoundsValue"),
    streakValue: document.getElementById("streakValue"),
    progressLabel: document.getElementById("progressLabel"),
    progressBar: document.getElementById("progressBar"),
    progressFill: document.getElementById("progressFill"),
    difficultyLabel: document.getElementById("difficultyLabel"),
    targetDropsLabel: document.getElementById("targetDropsLabel"),
    currentDropsLabel: document.getElementById("currentDropsLabel"),
    targetColor: document.getElementById("targetColor"),
    mixColor: document.getElementById("mixColor"),
    emptyBowlText: document.getElementById("emptyBowlText"),
    targetName: document.getElementById("targetName"),
    targetHint: document.getElementById("targetHint"),
    mixName: document.getElementById("mixName"),
    mixAdvice: document.getElementById("mixAdvice"),
    palette: document.getElementById("palette"),
    dropsTray: document.getElementById("dropsTray"),
    recipeText: document.getElementById("recipeText"),
    hintBtn: document.getElementById("hintBtn"),
    undoBtn: document.getElementById("undoBtn"),
    clearBtn: document.getElementById("clearBtn"),
    checkBtn: document.getElementById("checkBtn"),
    nextBtn: document.getElementById("nextBtn"),
    feedback: document.getElementById("feedback"),
    recipeList: document.getElementById("recipeList"),
    recipesCount: document.getElementById("recipesCount"),
    bestScoreValue: document.getElementById("bestScoreValue"),
    resetProgressBtn: document.getElementById("resetProgressBtn"),
    resultModal: document.getElementById("resultModal"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    modalText: document.getElementById("modalText"),
    finalScoreValue: document.getElementById("finalScoreValue"),
    playAgainBtn: document.getElementById("playAgainBtn")
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn("No se pudo leer el progreso", error);
      return {};
    }
  }

  function saveProgress() {
    const payload = {
      bestScore: state.bestScore,
      discovered: state.discovered,
      completedIds: state.completedIds
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("No se pudo guardar el progreso", error);
    }
  }

  function setSpeech(text) {
    dom.musiSpeech.textContent = text;
  }

  function countDrops(drops) {
    return drops.reduce((map, color) => {
      map[color] = (map[color] || 0) + 1;
      return map;
    }, {});
  }

  function recipeKey(drops) {
    return Object.entries(countDrops(drops))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([color, count]) => `${color}:${count}`)
      .join("|");
  }

  function recipeLabel(drops) {
    if (!drops.length) return "Vacía";

    const counts = countDrops(drops);
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([color, count]) => `${COLORS[color]?.name || color}${count > 1 ? ` x${count}` : ""}`)
      .join(" + ");
  }

  function pluralDrops(number) {
    return `${number} ${number === 1 ? "gota" : "gotas"}`;
  }

  function setSwatch(element, color) {
    if (!element) return;
    element.style.background = `linear-gradient(145deg, rgba(255,255,255,0.40), rgba(255,255,255,0.08)), ${color}`;
    element.setAttribute("aria-label", `Color ${color}`);
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return [0, 2, 4].map((start) => parseInt(clean.slice(start, start + 2), 16));
  }

  function rgbToHex(rgb) {
    return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mixDrops(drops) {
    if (!drops.length) return "#ffffff";

    const exact = CHALLENGES.find((challenge) => recipeKey(challenge.drops) === recipeKey(drops));
    if (exact) return exact.color;

    const baseDrops = drops.filter((color) => color !== "white" && color !== "black");
    const whites = drops.filter((color) => color === "white").length;
    const blacks = drops.filter((color) => color === "black").length;
    const sourceDrops = baseDrops.length ? baseDrops : drops;

    let rgb = sourceDrops.reduce(
      (acc, color) => {
        const source = COLORS[color]?.rgb || [255, 255, 255];
        acc[0] += source[0];
        acc[1] += source[1];
        acc[2] += source[2];
        return acc;
      },
      [0, 0, 0]
    ).map((channel) => channel / sourceDrops.length);

    for (let index = 0; index < whites; index += 1) {
      rgb = rgb.map((channel) => channel + (255 - channel) * 0.38);
    }

    for (let index = 0; index < blacks; index += 1) {
      rgb = rgb.map((channel) => channel * 0.58);
    }

    return rgbToHex(rgb.map((channel) => clamp(channel, 0, 255)));
  }

  function colorDistance(hexA, hexB) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return a.reduce((sum, channel, index) => sum + Math.abs(channel - b[index]), 0);
  }

  function getAccuracy() {
    if (!state.current) return 0;
    const mixColor = mixDrops(state.mix);
    const distance = colorDistance(mixColor, state.current.color);
    return clamp(Math.round(100 - (distance / 765) * 100), 0, 100);
  }

  function getAvailableChallenges() {
    const completed = new Set(state.completedIds);
    const remaining = CHALLENGES.filter((challenge) => !completed.has(challenge.id));
    return remaining.length ? remaining : clone(CHALLENGES);
  }

  function pickChallenge() {
    const available = getAvailableChallenges();
    const preferredLevel = state.round <= 3
      ? ["Principiante"]
      : state.round <= 6
        ? ["Principiante", "Aprendiz"]
        : state.round <= 8
          ? ["Aprendiz", "Artista"]
          : ["Artista", "Mago"];

    const pool = available.filter((challenge) => preferredLevel.includes(challenge.level));
    const choices = pool.length ? pool : available;
    return clone(choices[Math.floor(Math.random() * choices.length)]);
  }

  function updateLevel() {
    state.level = state.round <= 3 ? 1 : state.round <= 6 ? 2 : state.round <= 8 ? 3 : 4;
  }

  function resetRoundData() {
    state.current = pickChallenge();
    state.mix = [];
    state.hintsUsed = 0;
    state.hasCheckedCurrent = false;
    state.locked = false;
    updateLevel();
  }

  function startGame({ keepScore = false } = {}) {
    if (!keepScore) {
      state.round = 1;
      state.score = 0;
      state.streak = 0;
    }

    resetRoundData();
    render();
    setFeedback("Nuevo reto listo. Mira el color objetivo y prepara la receta.", "");
    setSpeech(SPEECHES.start);
  }

  function nextRound() {
    if (state.round >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }

    state.round += 1;
    resetRoundData();
    render();
    setFeedback("Siguiente reto listo. El laboratorio sigue vivo.", "");
    setSpeech("Nuevo color perdido detectado. Qué conveniente para el juego.");
  }

  function finishGame() {
    state.bestScore = Math.max(state.bestScore, state.score);
    saveProgress();
    dom.finalScoreValue.textContent = String(state.score);
    dom.modalText.textContent = `Completaste ${TOTAL_ROUNDS} retos, descubriste ${state.discovered.length} recetas y alcanzaste una racha de ${state.streak}.`;
    setSpeech(SPEECHES.complete);

    if (typeof dom.resultModal.showModal === "function") {
      dom.resultModal.showModal();
    } else {
      alert(`Partida terminada. Puntaje final: ${state.score}`);
    }
  }

  function setFeedback(message, type = "") {
    dom.feedback.textContent = message;
    dom.feedback.className = `feedback ${type}`.trim();
  }

  function renderHUD() {
    const progress = Math.round(((state.round - 1) / TOTAL_ROUNDS) * 100);

    dom.levelValue.textContent = String(state.level);
    dom.scoreValue.textContent = String(state.score);
    dom.roundValue.textContent = String(state.round);
    dom.totalRoundsValue.textContent = String(TOTAL_ROUNDS);
    dom.streakValue.textContent = String(state.streak);
    dom.progressLabel.textContent = `${progress}%`;
    dom.progressFill.style.width = `${progress}%`;
    dom.progressBar.setAttribute("aria-valuenow", String(progress));
    dom.bestScoreValue.textContent = String(state.bestScore);
  }

  function renderChallenge() {
    if (!state.current) return;

    setSwatch(dom.targetColor, state.current.color);
    setSwatch(dom.mixColor, mixDrops(state.mix));

    dom.difficultyLabel.textContent = state.current.level;
    dom.targetDropsLabel.textContent = pluralDrops(state.current.drops.length);
    dom.currentDropsLabel.textContent = pluralDrops(state.mix.length);
    dom.targetName.textContent = state.current.name;
    dom.targetHint.textContent = state.hintsUsed > 0 ? state.current.hint : "Mira el color y prepara tu receta.";
    dom.mixName.textContent = state.mix.length ? "Mezcla en proceso" : "Sin mezcla todavía";
    dom.mixAdvice.textContent = state.mix.length ? `Precisión visual aproximada: ${getAccuracy()}%.` : "Puedes usar una gota varias veces.";
    dom.emptyBowlText.hidden = state.mix.length > 0;
    dom.recipeText.textContent = recipeLabel(state.mix);
  }

  function renderDropsTray() {
    if (!state.mix.length) {
      dom.dropsTray.innerHTML = `<span class="tray-placeholder">Aún no has agregado gotas.</span>`;
      return;
    }

    dom.dropsTray.innerHTML = state.mix
      .map((color, index) => {
        const label = COLORS[color]?.name || color;
        return `<span class="drop-chip ${color}" title="Gota ${index + 1}: ${label}" aria-label="Gota ${index + 1}: ${label}"></span>`;
      })
      .join("");
  }

  function renderRecipes() {
    dom.recipesCount.textContent = String(state.discovered.length);

    if (!state.discovered.length) {
      dom.recipeList.innerHTML = `<div class="empty-state">Aún no hay recetas descubiertas.</div>`;
      return;
    }

    const known = state.discovered
      .map((id) => CHALLENGES.find((challenge) => challenge.id === id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));

    dom.recipeList.innerHTML = known.map((recipe) => `
      <article class="recipe-item">
        <span class="recipe-swatch" style="background: linear-gradient(145deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05)), ${recipe.color}"></span>
        <div>
          <strong>${recipe.name}</strong>
          <span>${recipeLabel(recipe.drops)}</span>
        </div>
      </article>
    `).join("");
  }

  function renderButtons() {
    const hasMix = state.mix.length > 0;
    const isMaxed = state.mix.length >= MAX_DROPS;

    dom.undoBtn.disabled = !hasMix || state.locked;
    dom.clearBtn.disabled = !hasMix || state.locked;
    dom.checkBtn.disabled = !hasMix || state.locked;
    dom.nextBtn.disabled = false;
    dom.hintBtn.disabled = !state.current || state.hintsUsed >= 2 || state.locked;

    dom.palette.querySelectorAll("button[data-color]").forEach((button) => {
      button.disabled = isMaxed || state.locked;
    });
  }

  function render() {
    renderHUD();
    renderChallenge();
    renderDropsTray();
    renderRecipes();
    renderButtons();
  }

  function addDrop(color) {
    if (!COLORS[color] || state.locked) return;

    if (state.mix.length >= MAX_DROPS) {
      setFeedback(`Solo puedes usar hasta ${MAX_DROPS} gotas por mezcla. Quita una o valida.`, "warning");
      return;
    }

    state.mix.push(color);
    render();
    popMixBowl();
    setFeedback(`Agregaste ${COLORS[color].name}.`, "");
    setSpeech(SPEECHES.add);
  }

  function undoDrop() {
    if (!state.mix.length || state.locked) return;
    const removed = state.mix.pop();
    render();
    setFeedback(`Quitaste ${COLORS[removed]?.name || "una gota"}.`, "");
  }

  function clearMix() {
    if (state.locked) return;
    state.mix = [];
    render();
    setFeedback("Mezcla limpiada. Otra vez al laboratorio.", "");
  }

  function showHint() {
    if (!state.current || state.locked) return;

    state.hintsUsed += 1;
    const counts = countDrops(state.current.drops);
    const entries = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
    const firstHint = state.current.hint;
    const secondHint = `Receta sugerida: ${entries.map(([color, count]) => `${COLORS[color].name}${count > 1 ? ` x${count}` : ""}`).join(" + ")}.`;

    setFeedback(state.hintsUsed === 1 ? firstHint : secondHint, "warning");
    setSpeech(SPEECHES.hint);
    render();
  }

  function validateMix() {
    if (!state.current || state.locked) return;

    if (!state.mix.length) {
      setFeedback("Primero agrega al menos una gota.", "error");
      shake();
      return;
    }

    const targetDrops = state.current.drops;
    const targetKey = recipeKey(targetDrops);
    const mixKey = recipeKey(state.mix);
    const accuracy = getAccuracy();

    state.hasCheckedCurrent = true;

    if (mixKey === targetKey) {
      const hintPenalty = state.hintsUsed * 12;
      const streakBonus = state.streak * 8;
      const dropsBonus = Math.max(0, 20 - Math.abs(state.mix.length - targetDrops.length) * 4);
      const roundPoints = Math.max(45, 120 + streakBonus + dropsBonus - hintPenalty);

      state.score += roundPoints;
      state.streak += 1;
      state.locked = true;
      unlockRecipe(state.current.id);
      rememberCompleted(state.current.id);
      state.bestScore = Math.max(state.bestScore, state.score);
      saveProgress();
      render();
      setFeedback(`¡Correcto! ${state.current.name} descubierto. +${roundPoints} puntos.`, "success");
      setSpeech(SPEECHES.win);
      celebrate();
      window.setTimeout(() => nextRound(), 900);
      return;
    }

    state.streak = 0;

    if (state.mix.length < targetDrops.length) {
      setFeedback(`Te faltan ${targetDrops.length - state.mix.length} ${targetDrops.length - state.mix.length === 1 ? "gota" : "gotas"}. Vas en ${accuracy}% de cercanía visual.`, "warning");
      setSpeech(SPEECHES.close);
    } else if (state.mix.length > targetDrops.length) {
      setFeedback(`Te sobran ${state.mix.length - targetDrops.length} ${state.mix.length - targetDrops.length === 1 ? "gota" : "gotas"}. Limpia o quita la última para ajustar.`, "warning");
      setSpeech(SPEECHES.miss);
    } else {
      const advice = compareCounts(state.mix, targetDrops);
      setFeedback(`${advice} Cercanía visual: ${accuracy}%.`, accuracy >= 80 ? "warning" : "error");
      setSpeech(accuracy >= 80 ? SPEECHES.close : SPEECHES.miss);
    }

    render();
    shake();
  }

  function compareCounts(mix, target) {
    const mixCounts = countDrops(mix);
    const targetCounts = countDrops(target);
    const colors = Object.keys(COLORS);
    const missing = [];
    const extra = [];

    colors.forEach((color) => {
      const diff = (targetCounts[color] || 0) - (mixCounts[color] || 0);
      if (diff > 0) missing.push(`${COLORS[color].name}${diff > 1 ? ` x${diff}` : ""}`);
      if (diff < 0) extra.push(`${COLORS[color].name}${Math.abs(diff) > 1 ? ` x${Math.abs(diff)}` : ""}`);
    });

    if (missing.length && extra.length) {
      return `Cambia ${extra.join(", ")} por ${missing.join(", ")}.`;
    }
    if (missing.length) return `Falta ${missing.join(", ")}.`;
    if (extra.length) return `Sobra ${extra.join(", ")}.`;
    return "La receta está muy cerca, pero revisa el orden de selección.";
  }

  function unlockRecipe(id) {
    if (!state.discovered.includes(id)) {
      state.discovered.push(id);
    }
  }

  function rememberCompleted(id) {
    if (!state.completedIds.includes(id)) {
      state.completedIds.push(id);
    }
  }

  function popMixBowl() {
    dom.mixColor.classList.remove("pop");
    window.requestAnimationFrame(() => {
      dom.mixColor.classList.add("pop");
    });
  }

  function shake() {
    dom.app.classList.remove("screen-shake");
    window.requestAnimationFrame(() => dom.app.classList.add("screen-shake"));
  }

  function celebrate() {
    const colors = ["#ff8fb4", "#ffdd65", "#23c7b7", "#7c5cff", "#2787ff"];
    for (let index = 0; index < 24; index += 1) {
      const dot = document.createElement("span");
      dot.className = "confetti-dot";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.background = colors[index % colors.length];
      dot.style.animationDelay = `${Math.random() * 0.18}s`;
      document.body.appendChild(dot);
      window.setTimeout(() => dot.remove(), 1200);
    }
  }

  function resetSavedProgress() {
    state.bestScore = 0;
    state.discovered = [];
    state.completedIds = [];
    saveProgress();
    render();
    setFeedback("Progreso reiniciado. La memoria cromática quedó en blanco.", "warning");
  }

  function loadInitialProgress() {
    const saved = readProgress();
    state.bestScore = Number(saved.bestScore || 0);
    state.discovered = Array.isArray(saved.discovered) ? saved.discovered.filter((id) => CHALLENGES.some((challenge) => challenge.id === id)) : [];
    state.completedIds = Array.isArray(saved.completedIds) ? saved.completedIds.filter((id) => CHALLENGES.some((challenge) => challenge.id === id)) : [];
  }

  function bindEvents() {
    dom.palette.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-color]");
      if (!button) return;
      addDrop(button.dataset.color);
    });

    dom.startBtn.addEventListener("click", () => startGame());
    dom.howToBtn.addEventListener("click", () => dom.howToPanel.scrollIntoView({ behavior: "smooth", block: "center" }));
    dom.hintBtn.addEventListener("click", showHint);
    dom.undoBtn.addEventListener("click", undoDrop);
    dom.clearBtn.addEventListener("click", clearMix);
    dom.checkBtn.addEventListener("click", validateMix);
    dom.nextBtn.addEventListener("click", nextRound);
    dom.playAgainBtn.addEventListener("click", () => {
      dom.resultModal.close();
      startGame();
    });
    dom.modalCloseBtn.addEventListener("click", () => dom.resultModal.close());
    dom.resetProgressBtn.addEventListener("click", resetSavedProgress);

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key === "1") addDrop("red");
      if (key === "2") addDrop("yellow");
      if (key === "3") addDrop("blue");
      if (key === "4") addDrop("white");
      if (key === "5") addDrop("black");
      if (key === "enter") validateMix();
      if (key === "backspace") undoDrop();
      if (key === "escape") clearMix();
    });
  }

  function init() {
    loadInitialProgress();
    bindEvents();
    startGame();
  }

  init();
})();
