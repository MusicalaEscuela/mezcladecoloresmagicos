/* =========================================================
   MUSI · MEZCLA MÁGICA
   storage.js
   Persistencia en localStorage
========================================================= */

/* =========================================================
   CONFIG
========================================================= */

const STORAGE_KEYS = {
  SCORE: "musi_color_score",
  LEVEL: "musi_color_level",
  RECIPES: "musi_color_recipes",
  SETTINGS: "musi_color_settings",
  STATS: "musi_color_stats"
};

/* =========================================================
   HELPERS BASE
========================================================= */

function safeParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function setItem(key, value) {
  try {
    const str = typeof value === "string" ? value : safeStringify(value);
    if (str !== null) {
      localStorage.setItem(key, str);
    }
  } catch (err) {
    console.warn("Storage error (setItem):", err);
  }
}

function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;

    // intentar parsear JSON, si falla devolver string
    const parsed = safeParse(raw, "__INVALID__");
    return parsed === "__INVALID__" ? raw : parsed;
  } catch (err) {
    console.warn("Storage error (getItem):", err);
    return fallback;
  }
}

function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("Storage error (removeItem):", err);
  }
}

/* =========================================================
   SCORE
========================================================= */

export function saveScore(score = 0) {
  setItem(STORAGE_KEYS.SCORE, Number(score) || 0);
}

export function getScore() {
  return Number(getItem(STORAGE_KEYS.SCORE, 0)) || 0;
}

/* =========================================================
   LEVEL
========================================================= */

export function saveLevel(level = 1) {
  setItem(STORAGE_KEYS.LEVEL, Number(level) || 1);
}

export function getLevel() {
  return Number(getItem(STORAGE_KEYS.LEVEL, 1)) || 1;
}

/* =========================================================
   RECETAS DESCUBIERTAS
========================================================= */

export function saveRecipes(recipes = []) {
  if (!Array.isArray(recipes)) return;
  setItem(STORAGE_KEYS.RECIPES, recipes);
}

export function getRecipes() {
  const data = getItem(STORAGE_KEYS.RECIPES, []);
  return Array.isArray(data) ? data : [];
}

export function addRecipe(recipeKey) {
  if (!recipeKey) return getRecipes();

  const recipes = getRecipes();

  if (!recipes.includes(recipeKey)) {
    recipes.push(recipeKey);
    recipes.sort();
    saveRecipes(recipes);
  }

  return recipes;
}

/* =========================================================
   SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {
  sound: true,
  music: true,
  difficulty: "auto"
};

export function saveSettings(settings = {}) {
  const current = getSettings();
  const merged = { ...current, ...settings };
  setItem(STORAGE_KEYS.SETTINGS, merged);
}

export function getSettings() {
  const data = getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...data };
}

/* =========================================================
   STATS
========================================================= */

const DEFAULT_STATS = {
  totalAttempts: 0,
  totalRounds: 0,
  perfectMatches: 0,
  bestScore: 0
};

export function saveStats(stats = {}) {
  const current = getStats();
  const merged = { ...current, ...stats };
  setItem(STORAGE_KEYS.STATS, merged);
}

export function getStats() {
  const data = getItem(STORAGE_KEYS.STATS, DEFAULT_STATS);
  return { ...DEFAULT_STATS, ...data };
}

export function updateStats(partial = {}) {
  const stats = getStats();

  const updated = {
    ...stats,
    ...partial,
    totalAttempts:
      (stats.totalAttempts || 0) + (partial.totalAttempts || 0),
    totalRounds:
      (stats.totalRounds || 0) + (partial.totalRounds || 0),
    perfectMatches:
      (stats.perfectMatches || 0) + (partial.perfectMatches || 0),
    bestScore: Math.max(
      stats.bestScore || 0,
      partial.bestScore || 0
    )
  };

  saveStats(updated);
  return updated;
}

/* =========================================================
   RESET
========================================================= */

export function resetProgress() {
  Object.values(STORAGE_KEYS).forEach(removeItem);
}

/* =========================================================
   DEBUG
========================================================= */

export function getFullStorageSnapshot() {
  return {
    score: getScore(),
    level: getLevel(),
    recipes: getRecipes(),
    settings: getSettings(),
    stats: getStats()
  };
}