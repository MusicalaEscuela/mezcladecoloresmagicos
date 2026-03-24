/* =========================================================
   MUSI · MEZCLA MÁGICA
   ui-controller.js
   Controlador de interfaz del minijuego
========================================================= */

import {
  rgbToCss,
  getContrastTextColor,
  getRecipeLabel
} from "./color-engine.js";

/* =========================================================
   CONFIG
========================================================= */

const DEFAULT_FEEDBACK =
  "Empieza mezclando pigmentos para acercarte al color objetivo.";

const FEEDBACK_CLASSES = ["is-success", "is-warning", "is-error"];

const COLOR_LABELS = {
  red: "Rojo",
  blue: "Azul",
  yellow: "Amarillo"
};

const RECIPE_TITLES = {
  red: "Rojo esencial",
  blue: "Azul profundo",
  yellow: "Luz dorada",
  "red+blue": "Bruma violeta",
  "blue+red": "Bruma violeta",
  "red+yellow": "Destello naranja",
  "yellow+red": "Destello naranja",
  "blue+yellow": "Verde selvático",
  "yellow+blue": "Verde selvático",
  "red+blue+yellow": "Tono ancestral",
  "red+yellow+blue": "Tono ancestral",
  "blue+red+yellow": "Tono ancestral",
  "blue+yellow+red": "Tono ancestral",
  "yellow+red+blue": "Tono ancestral",
  "yellow+blue+red": "Tono ancestral"
};

/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector, root = document) {
  return root.querySelector(selector);
}

function setText(el, value = "") {
  if (!el) return;
  el.textContent = String(value);
}

function setHTML(el, value = "") {
  if (!el) return;
  el.innerHTML = String(value);
}

function removeClasses(el, classes = []) {
  if (!el) return;
  el.classList.remove(...classes);
}

function toggleDisabled(el, disabled = false) {
  if (!el) return;
  el.disabled = Boolean(disabled);
}

function getById(id) {
  return document.getElementById(id);
}

/* =========================================================
   GENERIC HELPERS
========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRecipeKey(recipeKey = "") {
  return String(recipeKey)
    .split("+")
    .filter(Boolean)
    .sort()
    .join("+");
}

function getRecipeTitle(recipeKey = "") {
  const normalized = normalizeRecipeKey(recipeKey);
  return RECIPE_TITLES[normalized] || "Receta descubierta";
}

function getSlotLabel(colorKey = "") {
  return COLOR_LABELS[colorKey] || colorKey || "?";
}

function getSlotClass(colorKey = "") {
  if (!colorKey) return "mix-slot empty";
  return `mix-slot slot-${colorKey}`;
}

function getAccessibleColorLabel(rgb = []) {
  if (!Array.isArray(rgb) || rgb.length !== 3) {
    return "Color no disponible";
  }

  const [r, g, b] = rgb.map((value) => clamp(Number(value) || 0, 0, 255));
  return `Color rgb ${r}, ${g}, ${b}`;
}

/* =========================================================
   COLOR
========================================================= */

export function setColor(el, rgb) {
  if (!el || !Array.isArray(rgb) || rgb.length !== 3) return;

  const safeRgb = rgb.map((value) => clamp(Number(value) || 0, 0, 255));
  const cssColor = rgbToCss(safeRgb);
  const textColor = getContrastTextColor(safeRgb);

  el.style.background = `
    linear-gradient(160deg, rgba(255,255,255,0.42), rgba(255,255,255,0.06)),
    ${cssColor}
  `;
  el.style.color = textColor;
  el.setAttribute("aria-label", getAccessibleColorLabel(safeRgb));
  el.dataset.rgb = safeRgb.join(",");
}

export function resetColor(el) {
  if (!el) return;

  el.style.background = `
    linear-gradient(160deg, rgba(255,255,255,0.42), rgba(255,255,255,0.06)),
    linear-gradient(135deg, #ffffff, #eef3ff)
  `;
  el.style.color = "#24304A";
  el.setAttribute("aria-label", "Color vacío");
  delete el.dataset.rgb;
}

/* =========================================================
   FEEDBACK
========================================================= */

export function setFeedback(text, stateClass = "") {
  const feedbackEl = $("#feedback");
  if (!feedbackEl) return;

  setText(feedbackEl, text || DEFAULT_FEEDBACK);
  removeClasses(feedbackEl, FEEDBACK_CLASSES);

  if (stateClass && FEEDBACK_CLASSES.includes(stateClass)) {
    feedbackEl.classList.add(stateClass);
  }
}

export function clearFeedback(defaultText = DEFAULT_FEEDBACK) {
  setFeedback(defaultText);
}

/* =========================================================
   HUD
========================================================= */

export function updateHUD({
  level = 1,
  score = 0,
  attempts = 0,
  recipes = 0
} = {}) {
  setText($("#levelValue"), level);
  setText($("#scoreValue"), score);
  setText($("#attemptsValue"), attempts);
  setText($("#recipesValue"), recipes);
}

/* =========================================================
   MISIÓN / TEXTO
========================================================= */

export function setMission(text = "") {
  setText($("#missionText"), text);
}

export function setTargetName(name = "Pigmento misterioso") {
  setText($("#targetName"), name);
}

export function setMixFormula(recipe = []) {
  const label =
    Array.isArray(recipe) && recipe.length
      ? getRecipeLabel(recipe)
      : "Sin mezcla todavía";

  setText($("#mixFormula"), label);
}

/* =========================================================
   SLOTS DE MEZCLA
========================================================= */

export function renderMixSlots(mix = [], maxSlots = 3) {
  const slotsEl = $("#mixSlots");
  if (!slotsEl) return;

  const safeMaxSlots = Math.max(1, Number(maxSlots) || 3);
  const safeMix = Array.isArray(mix) ? mix.slice(0, safeMaxSlots) : [];

  const markup = Array.from({ length: safeMaxSlots }, (_, index) => {
    const color = safeMix[index];
    const label = getSlotLabel(color);

    return `
      <div
        class="${getSlotClass(color)}"
        title="${label}"
        aria-label="${color ? `Pigmento ${label}` : "Espacio vacío"}"
      >
        ${label}
      </div>
    `;
  }).join("");

  setHTML(slotsEl, markup);
}

/* =========================================================
   RECETAS DESCUBIERTAS
========================================================= */

export function renderRecipeList(recipeKeys = []) {
  const recipeListEl = $("#recipeList");
  if (!recipeListEl) return;

  if (!Array.isArray(recipeKeys) || recipeKeys.length === 0) {
    setHTML(
      recipeListEl,
      `
        <div class="empty-state">
          Aún no has descubierto ninguna receta mágica.
        </div>
      `
    );
    return;
  }

  const markup = recipeKeys
    .map((recipeKey) => {
      const normalizedKey = normalizeRecipeKey(recipeKey);
      const recipe = normalizedKey.split("+").filter(Boolean);
      const title = getRecipeTitle(normalizedKey);
      const label = getRecipeLabel(recipe);

      return `
        <article class="color-card">
          <div class="card-head">
            <h3>${title}</h3>
            <span class="card-tag">Descubierta</span>
          </div>
          <p class="color-caption">${label}</p>
        </article>
      `;
    })
    .join("");

  setHTML(recipeListEl, markup);
}

/* =========================================================
   BOTONES / ESTADOS
========================================================= */

export function setButtonsState({
  canCheck = false,
  canClear = false,
  canGenerate = true,
  canUsePalette = true
} = {}) {
  const checkBtn = $("#checkBtn");
  const clearBtn = $("#clearBtn");
  const newTargetBtn = $("#newTargetBtn");
  const paletteButtons = [...document.querySelectorAll(".palette button[data-color]")];

  toggleDisabled(checkBtn, !canCheck);
  toggleDisabled(clearBtn, !canClear);
  toggleDisabled(newTargetBtn, !canGenerate);

  paletteButtons.forEach((button) => {
    toggleDisabled(button, !canUsePalette);
  });
}

export function setButtonLoading(
  buttonId,
  isLoading = false,
  loadingText = "Cargando..."
) {
  const button = getById(buttonId);
  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent || "";
  }

  if (isLoading) {
    button.disabled = true;
    button.textContent = loadingText;
    button.setAttribute("aria-busy", "true");
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || "";
    button.removeAttribute("aria-busy");
  }
}

/* =========================================================
   ESTADOS DE RONDA
========================================================= */

export function showRoundReady() {
  setFeedback("Nuevo reto listo. Observa el color objetivo y crea tu mezcla.");
}

export function showMixCleared() {
  setFeedback("La mezcla fue limpiada. Puedes empezar una nueva combinación.");
}

export function showMaxSlotsWarning(maxSlots = 3) {
  setFeedback(
    `Solo puedes usar ${maxSlots} pigmentos por mezcla. Limpia o valida primero.`,
    "is-warning"
  );
}

export function showEmptyMixWarning() {
  setFeedback("Primero agrega al menos un pigmento a la mezcla.", "is-error");
}

/* =========================================================
   RENDER GLOBAL SIMPLE
========================================================= */

export function renderGameUI({
  level = 1,
  score = 0,
  attempts = 0,
  discoveredRecipes = [],
  mission = "",
  targetName = "Pigmento misterioso",
  mix = [],
  maxMixSlots = 3,
  canCheck = false,
  canClear = false,
  canGenerate = true,
  canUsePalette = true
} = {}) {
  updateHUD({
    level,
    score,
    attempts,
    recipes: Array.isArray(discoveredRecipes) ? discoveredRecipes.length : 0
  });

  setMission(mission);
  setTargetName(targetName);
  setMixFormula(mix);
  renderMixSlots(mix, maxMixSlots);
  renderRecipeList(discoveredRecipes);

  setButtonsState({
    canCheck,
    canClear,
    canGenerate,
    canUsePalette
  });
}