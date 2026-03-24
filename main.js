import { state } from "./game-state.js";
import { mixColors, compareColors } from "./color-engine.js";
import { getRandomTarget } from "./pattern-generator.js";
import { setColor, setFeedback } from "./ui-controller.js";
import { saveScore, getScore } from "./storage.js";

/* =========================================================
   DOM
========================================================= */

const dom = {
  targetEl: document.getElementById("targetColor"),
  mixEl: document.getElementById("mixColor"),

  levelValueEl: document.getElementById("levelValue"),
  scoreValueEl: document.getElementById("scoreValue"),
  attemptsValueEl: document.getElementById("attemptsValue"),
  recipesValueEl: document.getElementById("recipesValue"),

  targetNameEl: document.getElementById("targetName"),
  mixFormulaEl: document.getElementById("mixFormula"),
  mixSlotsEl: document.getElementById("mixSlots"),
  recipeListEl: document.getElementById("recipeList"),
  missionTextEl: document.getElementById("missionText"),
  feedbackEl: document.getElementById("feedback"),

  clearBtn: document.getElementById("clearBtn"),
  checkBtn: document.getElementById("checkBtn"),
  newTargetBtn: document.getElementById("newTargetBtn"),

  paletteButtons: [...document.querySelectorAll(".palette button[data-color]")]
};

/* =========================================================
   CONFIG
========================================================= */

const MAX_MIX_SLOTS = 3;
const MAX_LEVEL = 99;
const ROUND_AUTONEXT_DELAY = 1200;

const COLOR_NAMES = {
  red: "Rojo",
  blue: "Azul",
  yellow: "Amarillo"
};

const TARGET_LABELS = {
  "red+blue": "Bruma violeta",
  "red+yellow": "Destello naranja",
  "blue+yellow": "Verde selvático",
  "red+blue+yellow": "Tono ancestral",
  red: "Rojo esencial",
  blue: "Azul profundo",
  yellow: "Luz dorada"
};

const MISSIONS = [
  "Musi encontró un pigmento misterioso. Observa el color objetivo e intenta recrearlo mezclando los pigmentos mágicos disponibles.",
  "Una chispa de color se ha perdido en el laboratorio. Descubre la receta correcta para restaurarla.",
  "La energía cromática del mundo está inestable. Mezcla con cuidado y recupera el tono faltante.",
  "Cada mezcla acertada devuelve vida a un rincón del mapa. Encuentra la combinación más cercana posible."
];

const FEEDBACK_CLASSES = ["is-success", "is-warning", "is-error"];

/* =========================================================
   ESTADO LOCAL EXTENDIDO
========================================================= */

function normalizeState() {
  if (!Array.isArray(state.mix)) state.mix = [];
  if (!Array.isArray(state.targetRecipe)) state.targetRecipe = [];
  if (!Array.isArray(state.discoveredRecipes)) state.discoveredRecipes = [];

  if (!Array.isArray(state.targetColor)) state.targetColor = mixColors([]);
  if (typeof state.level !== "number" || Number.isNaN(state.level)) state.level = 1;
  if (typeof state.score !== "number" || Number.isNaN(state.score)) state.score = getScore();
  if (typeof state.attempts !== "number" || Number.isNaN(state.attempts)) state.attempts = 0;
  if (typeof state.roundResolved !== "boolean") state.roundResolved = false;
  if (typeof state.isLocked !== "boolean") state.isLocked = false;
}

/* =========================================================
   HELPERS
========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isRoundLocked() {
  return state.isLocked || state.roundResolved;
}

function getRecipeKey(recipe = []) {
  return [...recipe].sort().join("+");
}

function getPrettyRecipe(recipe = []) {
  if (!recipe.length) return "Sin mezcla todavía";
  return recipe.map((color) => COLOR_NAMES[color] || color).join(" + ");
}

function getTargetLabel(recipe = []) {
  const key = getRecipeKey(recipe);
  return TARGET_LABELS[key] || "Pigmento misterioso";
}

function getColorDistance(c1 = [], c2 = []) {
  if (!Array.isArray(c1) || !Array.isArray(c2) || c1.length !== c2.length) {
    return 765;
  }

  return c1.reduce((acc, value, index) => acc + Math.abs(value - c2[index]), 0);
}

function getAccuracyData(mixRgb, targetRgb) {
  const distance = getColorDistance(mixRgb, targetRgb);
  const maxDistance = 765;
  const rawPercent = 100 - (distance / maxDistance) * 100;
  const percent = clamp(Math.round(rawPercent), 0, 100);

  let tier = "miss";
  let stars = 0;
  let message = "Todavía estás lejos. Ajusta tu mezcla e inténtalo otra vez.";
  let feedbackClass = "is-error";
  let points = 5;

  if (distance <= 30 || compareColors(mixRgb, targetRgb)) {
    tier = "perfect";
    stars = 3;
    points = 120;
    message = "✨ ¡Perfecto! Lograste una mezcla casi exacta.";
    feedbackClass = "is-success";
  } else if (distance <= 90) {
    tier = "close";
    stars = 2;
    points = 70;
    message = "🌟 Muy cerca. Tu mezcla casi alcanza el color objetivo.";
    feedbackClass = "is-warning";
  } else if (distance <= 160) {
    tier = "partial";
    stars = 1;
    points = 30;
    message = "🪄 Vas bien, pero aún le falta precisión a la mezcla.";
    feedbackClass = "is-warning";
  }

  return {
    distance,
    percent,
    tier,
    stars,
    message,
    feedbackClass,
    points
  };
}

function clearFeedbackClasses() {
  if (!dom.feedbackEl) return;
  dom.feedbackEl.classList.remove(...FEEDBACK_CLASSES);
}

function setFeedbackState(message, stateClass = "") {
  setFeedback(message);

  if (!dom.feedbackEl) return;

  clearFeedbackClasses();

  if (stateClass) {
    dom.feedbackEl.classList.add(stateClass);
  }
}

function generateTargetRecipe() {
  const combo = getRandomTarget();
  return Array.isArray(combo) && combo.length ? combo : ["red", "blue"];
}

function getMissionByLevel(level) {
  const index = (level - 1) % MISSIONS.length;
  return MISSIONS[index];
}

/* =========================================================
   RENDER
========================================================= */

function updateMissionText() {
  if (!dom.missionTextEl) return;
  dom.missionTextEl.textContent = getMissionByLevel(state.level);
}

function updateHUD() {
  if (dom.levelValueEl) dom.levelValueEl.textContent = String(state.level);
  if (dom.scoreValueEl) dom.scoreValueEl.textContent = String(state.score);
  if (dom.attemptsValueEl) dom.attemptsValueEl.textContent = String(state.attempts);
  if (dom.recipesValueEl) dom.recipesValueEl.textContent = String(state.discoveredRecipes.length);
}

function updateTargetInfo() {
  if (!dom.targetNameEl) return;
  dom.targetNameEl.textContent = getTargetLabel(state.targetRecipe);
}

function updateMixFormula() {
  if (!dom.mixFormulaEl) return;
  dom.mixFormulaEl.textContent = getPrettyRecipe(state.mix);
}

function updateButtonsState() {
  const hasMix = state.mix.length > 0;
  const locked = isRoundLocked();

  if (dom.checkBtn) {
    dom.checkBtn.disabled = !hasMix || locked;
  }

  if (dom.clearBtn) {
    dom.clearBtn.disabled = !hasMix || locked;
  }

  if (dom.newTargetBtn) {
    dom.newTargetBtn.disabled = state.isLocked;
  }

  dom.paletteButtons.forEach((button) => {
    const paletteShouldDisable = locked || state.mix.length >= MAX_MIX_SLOTS;
    button.disabled = paletteShouldDisable;
  });
}

function renderMixSlots() {
  if (!dom.mixSlotsEl) return;

  const slotsMarkup = Array.from({ length: MAX_MIX_SLOTS }, (_, index) => {
    const color = state.mix[index];

    if (!color) {
      return `<div class="mix-slot empty" aria-label="Espacio vacío">?</div>`;
    }

    const colorName = COLOR_NAMES[color] || color;

    return `
      <div class="mix-slot" title="${colorName}" aria-label="Pigmento ${colorName}">
        ${colorName}
      </div>
    `;
  }).join("");

  dom.mixSlotsEl.innerHTML = slotsMarkup;
}

function renderDiscoveredRecipes() {
  if (!dom.recipeListEl) return;

  if (!state.discoveredRecipes.length) {
    dom.recipeListEl.innerHTML = `
      <div class="empty-state">
        Aún no has descubierto ninguna receta mágica.
      </div>
    `;
    return;
  }

  dom.recipeListEl.innerHTML = state.discoveredRecipes
    .map((recipeKey) => {
      const recipe = recipeKey.split("+").filter(Boolean);
      const label = TARGET_LABELS[recipeKey] || "Receta descubierta";

      return `
        <article class="color-card">
          <div class="card-head">
            <h3>${label}</h3>
            <span class="card-tag">Descubierta</span>
          </div>
          <p class="color-caption">${getPrettyRecipe(recipe)}</p>
        </article>
      `;
    })
    .join("");
}

function renderTargetColor() {
  setColor(dom.targetEl, state.targetColor);
}

function renderMixColor() {
  const rgb = mixColors(state.mix);
  setColor(dom.mixEl, rgb);
}

function renderBoard() {
  renderTargetColor();
  renderMixColor();
  updateTargetInfo();
  updateMixFormula();
  renderMixSlots();
  updateButtonsState();
}

function renderAll() {
  updateHUD();
  updateMissionText();
  renderDiscoveredRecipes();
  renderBoard();
}

/* =========================================================
   ESTADO / GAME FLOW
========================================================= */

function saveScoreState() {
  saveScore(state.score);
}

function awardPoints(points) {
  const safePoints = Number.isFinite(points) ? points : 0;
  state.score += safePoints;
  saveScoreState();
  updateHUD();
}

function maybeLevelUp(tier) {
  if (tier === "perfect") {
    state.level = clamp(state.level + 1, 1, MAX_LEVEL);
  } else if (tier === "close" && state.level < MAX_LEVEL) {
    const bonusChance = state.attempts % 3 === 0;
    if (bonusChance) {
      state.level = clamp(state.level + 1, 1, MAX_LEVEL);
    }
  }

  updateHUD();
  updateMissionText();
}

function addDiscoveredRecipe(recipe) {
  const key = getRecipeKey(recipe);
  if (!key) return false;

  if (!state.discoveredRecipes.includes(key)) {
    state.discoveredRecipes.push(key);
    state.discoveredRecipes.sort();
    renderDiscoveredRecipes();
    updateHUD();
    return true;
  }

  return false;
}

function clearCurrentMix({ silent = false } = {}) {
  state.mix = [];
  renderMixColor();
  updateMixFormula();
  renderMixSlots();
  updateButtonsState();

  if (!silent) {
    setFeedbackState("La mezcla fue limpiada. Puedes empezar una nueva combinación.");
  }
}

function createNewRound({ silent = false } = {}) {
  state.targetRecipe = generateTargetRecipe();
  state.targetColor = mixColors(state.targetRecipe);
  state.mix = [];
  state.roundResolved = false;
  state.isLocked = false;

  renderAll();

  if (!silent) {
    setFeedbackState(
      "Nuevo reto listo. Observa bien el color objetivo y crea tu mezcla."
    );
  }
}

function queueNextRound() {
  state.isLocked = true;
  updateButtonsState();

  window.setTimeout(() => {
    createNewRound({ silent: false });
  }, ROUND_AUTONEXT_DELAY);
}

function validateMix() {
  if (state.isLocked) return;

  if (!state.mix.length) {
    setFeedbackState("Primero agrega al menos un pigmento a la mezcla.", "is-error");
    return;
  }

  state.attempts += 1;
  updateHUD();

  const mixedColor = mixColors(state.mix);
  const accuracy = getAccuracyData(mixedColor, state.targetColor);
  const extraText = ` Precisión aproximada: ${accuracy.percent}%.`;

  if (accuracy.tier === "perfect") {
    addDiscoveredRecipe(state.targetRecipe);
    awardPoints(accuracy.points);
    maybeLevelUp(accuracy.tier);
    state.roundResolved = true;

    setFeedbackState(
      `${accuracy.message}${extraText}`,
      accuracy.feedbackClass
    );

    queueNextRound();
    return;
  }

  if (accuracy.tier === "close" || accuracy.tier === "partial") {
    awardPoints(accuracy.points);
  }

  setFeedbackState(
    `${accuracy.message}${extraText}`,
    accuracy.feedbackClass
  );

  updateButtonsState();
}

function handlePigmentClick(color) {
  if (!color || state.isLocked) return;

  if (state.mix.length >= MAX_MIX_SLOTS) {
    setFeedbackState(
      `Solo puedes usar ${MAX_MIX_SLOTS} pigmentos por mezcla. Limpia o valida primero.`,
      "is-warning"
    );
    return;
  }

  state.mix.push(color);

  renderMixColor();
  updateMixFormula();
  renderMixSlots();
  updateButtonsState();

  setFeedbackState(
    `Añadiste ${COLOR_NAMES[color] || color}. Sigue construyendo tu receta.`
  );
}

/* =========================================================
   EVENTS
========================================================= */

function bindPaletteEvents() {
  dom.paletteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handlePigmentClick(button.dataset.color);
    });
  });
}

function bindActionEvents() {
  dom.clearBtn?.addEventListener("click", () => {
    clearCurrentMix();
  });

  dom.checkBtn?.addEventListener("click", () => {
    validateMix();
  });

  dom.newTargetBtn?.addEventListener("click", () => {
    if (state.isLocked) return;
    createNewRound();
  });
}

function bindKeyboardEvents() {
  document.addEventListener("keydown", (event) => {
    if (state.isLocked) return;

    const key = event.key.toLowerCase();

    if (key === "r") handlePigmentClick("red");
    if (key === "b") handlePigmentClick("blue");
    if (key === "y") handlePigmentClick("yellow");

    if (key === "enter") validateMix();
    if (key === "backspace" || key === "delete") clearCurrentMix();
  });
}

function bindEvents() {
  bindPaletteEvents();
  bindActionEvents();
  bindKeyboardEvents();
}

/* =========================================================
   INIT
========================================================= */

function validateCriticalDOM() {
  const required = [
    dom.targetEl,
    dom.mixEl,
    dom.feedbackEl
  ];

  return required.every(Boolean);
}

function init() {
  normalizeState();

  if (!validateCriticalDOM()) {
    console.error("Faltan elementos esenciales del DOM para iniciar Mezcla Mágica.");
    return;
  }

  bindEvents();
  renderDiscoveredRecipes();
  createNewRound({ silent: true });

  setFeedbackState(
    "Empieza mezclando pigmentos para acercarte al color objetivo."
  );
}

init();