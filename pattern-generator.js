/* =========================================================
   MUSI · MEZCLA MÁGICA
   pattern-generator.js
   Generador de recetas / targets del juego
========================================================= */

/* =========================================================
   CONFIG BASE
========================================================= */

const BASE_RECIPES = [
  ["red"],
  ["blue"],
  ["yellow"],

  ["red", "blue"],     // morado
  ["red", "yellow"],   // naranja
  ["blue", "yellow"],  // verde

  ["red", "blue", "yellow"] // mezcla compleja
];

const DIFFICULTY_CONFIG = {
  easy: {
    minColors: 1,
    maxColors: 2
  },
  medium: {
    minColors: 2,
    maxColors: 3
  },
  hard: {
    minColors: 3,
    maxColors: 3
  }
};

/* =========================================================
   ESTADO INTERNO
========================================================= */

let lastRecipeKey = null;

/* =========================================================
   HELPERS
========================================================= */

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getRecipeKey(recipe) {
  return [...recipe].sort().join("+");
}

function filterByDifficulty(recipes, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;

  return recipes.filter(recipe => {
    return (
      recipe.length >= config.minColors &&
      recipe.length <= config.maxColors
    );
  });
}

function avoidImmediateRepeat(recipes) {
  if (!lastRecipeKey) return recipes;

  const filtered = recipes.filter(
    recipe => getRecipeKey(recipe) !== lastRecipeKey
  );

  return filtered.length ? filtered : recipes;
}

/* =========================================================
   GENERADOR PRINCIPAL
========================================================= */

export function getRandomTarget(options = {}) {
  const {
    level = 1,
    difficulty = getDifficultyFromLevel(level),
    discoveredRecipes = []
  } = options;

  let candidates = [...BASE_RECIPES];

  // Ajuste por dificultad
  candidates = filterByDifficulty(candidates, difficulty);

  // Evitar repetir la misma receta seguida
  candidates = avoidImmediateRepeat(candidates);

  // Ligera priorización de recetas no descubiertas
  const undiscovered = candidates.filter(recipe => {
    const key = getRecipeKey(recipe);
    return !discoveredRecipes.includes(key);
  });

  const pool = undiscovered.length > 0 ? undiscovered : candidates;

  const chosen = shuffle(pool)[getRandomInt(pool.length)];

  lastRecipeKey = getRecipeKey(chosen);

  return [...chosen];
}

/* =========================================================
   DIFICULTAD DINÁMICA
========================================================= */

export function getDifficultyFromLevel(level = 1) {
  if (level <= 2) return "easy";
  if (level <= 5) return "medium";
  return "hard";
}

/* =========================================================
   GENERADORES AVANZADOS (FUTURO)
========================================================= */

export function generateRecipeFromPalette(palette = ["red", "blue", "yellow"], length = 2) {
  const shuffled = shuffle(palette);
  return shuffled.slice(0, length);
}

export function generateProgressiveRecipe(level = 1) {
  const difficulty = getDifficultyFromLevel(level);
  const config = DIFFICULTY_CONFIG[difficulty];

  const length =
    config.minColors +
    Math.floor(Math.random() * (config.maxColors - config.minColors + 1));

  return generateRecipeFromPalette(["red", "blue", "yellow"], length);
}

/* =========================================================
   UTILIDADES
========================================================= */

export function getAllBaseRecipes() {
  return BASE_RECIPES.map(recipe => [...recipe]);
}

export function getRecipeComplexity(recipe = []) {
  return recipe.length;
}

export function isValidRecipe(recipe) {
  return Array.isArray(recipe) && recipe.length > 0;
}