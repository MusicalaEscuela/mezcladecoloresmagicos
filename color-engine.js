/* =========================================================
   MUSI · MEZCLA MÁGICA
   color-engine.js
   Utilidades de mezcla, comparación y análisis de color
========================================================= */

/* =========================================================
   CONFIG BASE
========================================================= */

export const BASE_COLORS = {
  red: [255, 0, 0],
  blue: [0, 102, 255],
  yellow: [255, 214, 64]
};

export const COLOR_META = {
  red: {
    key: "red",
    name: "Rojo",
    description: "Calor y energía"
  },
  blue: {
    key: "blue",
    name: "Azul",
    description: "Agua y cielo"
  },
  yellow: {
    key: "yellow",
    name: "Amarillo",
    description: "Luz y brillo"
  }
};

const DEFAULT_EMPTY_COLOR = [255, 255, 255];
const MAX_RGB_DISTANCE = 765;

/* =========================================================
   HELPERS INTERNOS
========================================================= */

function isValidRgb(rgb) {
  return (
    Array.isArray(rgb) &&
    rgb.length === 3 &&
    rgb.every(
      value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 255
    )
  );
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function normalizeColorKey(colorKey) {
  return String(colorKey || "").trim().toLowerCase();
}

function safeRgbFromKey(colorKey) {
  const normalizedKey = normalizeColorKey(colorKey);
  return BASE_COLORS[normalizedKey] || null;
}

/* =========================================================
   LOOKUPS PÚBLICOS
========================================================= */

export function getBaseColor(colorKey) {
  const rgb = safeRgbFromKey(colorKey);
  return rgb ? [...rgb] : null;
}

export function getColorMeta(colorKey) {
  const normalizedKey = normalizeColorKey(colorKey);
  return COLOR_META[normalizedKey] || null;
}

export function getColorName(colorKey) {
  return getColorMeta(colorKey)?.name || normalizeColorKey(colorKey) || "Desconocido";
}

export function getAvailableColorKeys() {
  return Object.keys(BASE_COLORS);
}

/* =========================================================
   CONVERSIONES
========================================================= */

export function rgbToCss(rgb) {
  const safe = normalizeRgb(rgb);
  return `rgb(${safe[0]}, ${safe[1]}, ${safe[2]})`;
}

export function rgbToHex(rgb) {
  const safe = normalizeRgb(rgb);
  return (
    "#" +
    safe
      .map(channel => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function normalizeRgb(rgb) {
  if (!Array.isArray(rgb)) return [...DEFAULT_EMPTY_COLOR];

  const normalized = [
    clampChannel(Number(rgb[0] ?? 255)),
    clampChannel(Number(rgb[1] ?? 255)),
    clampChannel(Number(rgb[2] ?? 255))
  ];

  return normalized;
}

/* =========================================================
   MEZCLA DE COLORES
========================================================= */

export function mixColors(colors = []) {
  if (!Array.isArray(colors) || colors.length === 0) {
    return [...DEFAULT_EMPTY_COLOR];
  }

  const validColors = colors
    .map(color => safeRgbFromKey(color))
    .filter(Boolean);

  if (!validColors.length) {
    return [...DEFAULT_EMPTY_COLOR];
  }

  const totals = validColors.reduce(
    (acc, [r, g, b]) => {
      acc[0] += r;
      acc[1] += g;
      acc[2] += b;
      return acc;
    },
    [0, 0, 0]
  );

  return totals.map(channel => clampChannel(channel / validColors.length));
}

export function mixColorsWeighted(colorEntries = []) {
  if (!Array.isArray(colorEntries) || !colorEntries.length) {
    return [...DEFAULT_EMPTY_COLOR];
  }

  let totalWeight = 0;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  colorEntries.forEach(entry => {
    const key =
      typeof entry === "string"
        ? entry
        : normalizeColorKey(entry?.color);

    const weight =
      typeof entry === "string"
        ? 1
        : Number(entry?.weight ?? 1);

    const rgb = safeRgbFromKey(key);

    if (!rgb || weight <= 0 || !Number.isFinite(weight)) return;

    totalWeight += weight;
    totalR += rgb[0] * weight;
    totalG += rgb[1] * weight;
    totalB += rgb[2] * weight;
  });

  if (totalWeight <= 0) {
    return [...DEFAULT_EMPTY_COLOR];
  }

  return [
    clampChannel(totalR / totalWeight),
    clampChannel(totalG / totalWeight),
    clampChannel(totalB / totalWeight)
  ];
}

/* =========================================================
   ANÁLISIS Y COMPARACIÓN
========================================================= */

export function getColorDistance(c1, c2) {
  const rgb1 = normalizeRgb(c1);
  const rgb2 = normalizeRgb(c2);

  return rgb1.reduce((acc, value, index) => {
    return acc + Math.abs(value - rgb2[index]);
  }, 0);
}

export function compareColors(c1, c2, tolerance = 80) {
  return getColorDistance(c1, c2) <= tolerance;
}

export function getColorAccuracy(c1, c2) {
  const distance = getColorDistance(c1, c2);
  const accuracy = 100 - (distance / MAX_RGB_DISTANCE) * 100;
  return clampChannel(Math.max(0, Math.min(100, accuracy)));
}

export function getColorMatchTier(c1, c2) {
  const distance = getColorDistance(c1, c2);

  if (distance <= 30) {
    return {
      key: "perfect",
      label: "Perfecto",
      stars: 3
    };
  }

  if (distance <= 90) {
    return {
      key: "close",
      label: "Cerca",
      stars: 2
    };
  }

  if (distance <= 160) {
    return {
      key: "partial",
      label: "Parcial",
      stars: 1
    };
  }

  return {
    key: "miss",
    label: "Lejos",
    stars: 0
  };
}

export function analyzeColorMatch(c1, c2, tolerance = 80) {
  const rgb1 = normalizeRgb(c1);
  const rgb2 = normalizeRgb(c2);

  const distance = getColorDistance(rgb1, rgb2);
  const accuracy = getColorAccuracy(rgb1, rgb2);
  const tier = getColorMatchTier(rgb1, rgb2);
  const isMatch = distance <= tolerance;

  return {
    colorA: rgb1,
    colorB: rgb2,
    distance,
    accuracy,
    isMatch,
    tolerance,
    tier
  };
}

/* =========================================================
   DESCRIPCIÓN DE RECETAS
========================================================= */

export function getRecipeKey(colors = []) {
  if (!Array.isArray(colors)) return "";
  return colors
    .map(normalizeColorKey)
    .filter(Boolean)
    .sort()
    .join("+");
}

export function getRecipeLabel(colors = []) {
  if (!Array.isArray(colors) || !colors.length) {
    return "Sin mezcla";
  }

  return colors.map(getColorName).join(" + ");
}

/* =========================================================
   BRILLO Y CONTRASTE
========================================================= */

export function getRelativeBrightness(rgb) {
  const [r, g, b] = normalizeRgb(rgb).map(channel => channel / 255);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function getContrastTextColor(rgb) {
  const brightness = getRelativeBrightness(rgb);
  return brightness > 0.64 ? "#24304A" : "#FFFFFF";
}

/* =========================================================
   VALIDACIONES DE APOYO
========================================================= */

export function isKnownColor(colorKey) {
  return !!safeRgbFromKey(colorKey);
}

export function isValidColorArray(rgb) {
  return isValidRgb(rgb);
}