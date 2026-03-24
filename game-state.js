/* =========================================================
   MUSI · MEZCLA MÁGICA
   game-state.js
   Estado central del minijuego
========================================================= */

export const DEFAULT_STATE = {
  /* -----------------------------------------
     Estado de ronda actual
  ----------------------------------------- */
  targetColor: null,
  targetRecipe: [],
  mix: [],
  roundResolved: false,

  /* -----------------------------------------
     Progreso del jugador
  ----------------------------------------- */
  level: 1,
  score: 0,
  attempts: 0,
  roundsPlayed: 0,
  roundsWon: 0,

  /* -----------------------------------------
     Descubrimientos
  ----------------------------------------- */
  discoveredRecipes: [],
  discoveredColors: [],

  /* -----------------------------------------
     Contexto / narrativa
  ----------------------------------------- */
  currentMission: "",
  currentRegion: "laboratorio",
  currentTargetName: "Pigmento misterioso",

  /* -----------------------------------------
     Métricas de rendimiento
  ----------------------------------------- */
  bestAccuracy: 0,
  lastAccuracy: 0,
  lastDistance: 0,
  lastResultTier: "none",

  /* -----------------------------------------
     Configuración de partida
  ----------------------------------------- */
  maxMixSlots: 3,
  maxAttemptsPerRound: null,

  /* -----------------------------------------
     Historial simple
  ----------------------------------------- */
  history: []
};

export const state = createInitialState();

/* =========================================================
   CREACIÓN / RESET
========================================================= */

export function createInitialState() {
  return structuredClone(DEFAULT_STATE);
}

export function resetState() {
  const freshState = createInitialState();

  Object.keys(state).forEach(key => {
    delete state[key];
  });

  Object.assign(state, freshState);

  return state;
}

export function resetRoundState() {
  state.targetColor = null;
  state.targetRecipe = [];
  state.mix = [];
  state.roundResolved = false;
  state.currentTargetName = "Pigmento misterioso";
  state.lastAccuracy = 0;
  state.lastDistance = 0;
  state.lastResultTier = "none";

  return state;
}

/* =========================================================
   HELPERS DE ESTADO
========================================================= */

export function addToMix(colorKey) {
  if (!colorKey) return state.mix;

  if (state.mix.length >= state.maxMixSlots) {
    return state.mix;
  }

  state.mix.push(colorKey);
  return [...state.mix];
}

export function clearMix() {
  state.mix = [];
  return state.mix;
}

export function setTarget(recipe = [], color = null, label = "Pigmento misterioso") {
  state.targetRecipe = Array.isArray(recipe) ? [...recipe] : [];
  state.targetColor = Array.isArray(color) ? [...color] : null;
  state.currentTargetName = label || "Pigmento misterioso";

  return {
    targetRecipe: [...state.targetRecipe],
    targetColor: state.targetColor ? [...state.targetColor] : null,
    currentTargetName: state.currentTargetName
  };
}

export function incrementAttempts() {
  state.attempts += 1;
  return state.attempts;
}

export function incrementRoundsPlayed() {
  state.roundsPlayed += 1;
  return state.roundsPlayed;
}

export function incrementRoundsWon() {
  state.roundsWon += 1;
  return state.roundsWon;
}

export function addScore(points = 0) {
  const safePoints = Number(points) || 0;
  state.score += safePoints;
  return state.score;
}

export function levelUp(amount = 1) {
  const safeAmount = Math.max(1, Number(amount) || 1);
  state.level += safeAmount;
  return state.level;
}

export function setMission(text = "") {
  state.currentMission = String(text || "");
  return state.currentMission;
}

export function setRegion(region = "laboratorio") {
  state.currentRegion = String(region || "laboratorio");
  return state.currentRegion;
}

export function setRoundResolved(value = true) {
  state.roundResolved = Boolean(value);
  return state.roundResolved;
}

/* =========================================================
   DESCUBRIMIENTOS
========================================================= */

export function addDiscoveredRecipe(recipeKey) {
  const safeKey = String(recipeKey || "").trim();
  if (!safeKey) return [...state.discoveredRecipes];

  if (!state.discoveredRecipes.includes(safeKey)) {
    state.discoveredRecipes.push(safeKey);
    state.discoveredRecipes.sort();
  }

  return [...state.discoveredRecipes];
}

export function addDiscoveredColor(colorLabel) {
  const safeLabel = String(colorLabel || "").trim();
  if (!safeLabel) return [...state.discoveredColors];

  if (!state.discoveredColors.includes(safeLabel)) {
    state.discoveredColors.push(safeLabel);
    state.discoveredColors.sort((a, b) => a.localeCompare(b, "es"));
  }

  return [...state.discoveredColors];
}

/* =========================================================
   MÉTRICAS
========================================================= */

export function setLastResult({
  accuracy = 0,
  distance = 0,
  tier = "none"
} = {}) {
  const safeAccuracy = Math.max(0, Math.min(100, Number(accuracy) || 0));
  const safeDistance = Math.max(0, Number(distance) || 0);
  const safeTier = String(tier || "none");

  state.lastAccuracy = safeAccuracy;
  state.lastDistance = safeDistance;
  state.lastResultTier = safeTier;

  if (safeAccuracy > state.bestAccuracy) {
    state.bestAccuracy = safeAccuracy;
  }

  return {
    lastAccuracy: state.lastAccuracy,
    lastDistance: state.lastDistance,
    lastResultTier: state.lastResultTier,
    bestAccuracy: state.bestAccuracy
  };
}

/* =========================================================
   HISTORIAL
========================================================= */

export function pushHistoryEntry(entry = {}) {
  const safeEntry = {
    timestamp: new Date().toISOString(),
    level: state.level,
    score: state.score,
    attempts: state.attempts,
    ...entry
  };

  state.history.unshift(safeEntry);

  if (state.history.length > 25) {
    state.history = state.history.slice(0, 25);
  }

  return [...state.history];
}

/* =========================================================
   SNAPSHOT
========================================================= */

export function getStateSnapshot() {
  return structuredClone(state);
}