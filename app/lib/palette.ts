// Utility palette generation functions extracted from the original script.js

export function getTodaySeed(): string {
  const now = new Date();
  // 9am PST = 17:00 UTC (PST is UTC-8, so 9 + 8 = 17)
  // During PDT (daylight saving), 9am PDT = 16:00 UTC
  // Using 17 to match standard time schedule
  const resetHour = 17;
  let seedDate = new Date(now);
  if (now.getUTCHours() < resetHour) {
    seedDate.setUTCDate(seedDate.getUTCDate() - 1);
  }
  return `${seedDate.getUTCFullYear()}-${String(seedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(seedDate.getUTCDate()).padStart(2, '0')}`;
}

export function createSeededRNG(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  let state = hash;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

export function seededRandom(seed: string) {
  const rng = createSeededRNG(seed);
  return rng();
}

export const PALETTE_FAMILIES: Record<string, any> = {
  warm: { hueRange: [0, 60], satRange: [65, 85], lightRange: [45, 60], name: "Warm Sunset" },
  cool: { hueRange: [180, 270], satRange: [50, 75], lightRange: [40, 60], name: "Cool Ocean" },
  pastel: { hueRange: [0, 360], satRange: [40, 60], lightRange: [70, 85], name: "Soft Pastel" },
  jewel: { hueRange: [0, 360], satRange: [70, 95], lightRange: [35, 50], name: "Jewel Tones" },
  earth: { hueRange: [20, 50], satRange: [30, 55], lightRange: [35, 55], name: "Earth & Clay" },
  vibrant: { hueRange: [0, 360], satRange: [80, 100], lightRange: [50, 60], name: "Vibrant Pop" },
  muted: { hueRange: [0, 360], satRange: [25, 45], lightRange: [45, 65], name: "Muted Modern" },
  forest: { hueRange: [80, 160], satRange: [40, 70], lightRange: [30, 55], name: "Forest Grove" },
  sunset: { hueRange: [330, 60], satRange: [70, 90], lightRange: [50, 65], name: "Golden Hour" },
  ocean: { hueRange: [170, 220], satRange: [55, 80], lightRange: [40, 60], name: "Deep Sea" },
  berry: { hueRange: [280, 350], satRange: [50, 75], lightRange: [35, 55], name: "Berry Harvest" },
  citrus: { hueRange: [30, 90], satRange: [75, 95], lightRange: [55, 70], name: "Citrus Burst" }
};

export const TONE_TREATMENTS: Record<string, any> = {
  tint: { satMod: -15, lightMod: 20, name: "Light & Airy" },
  tone: { satMod: -20, lightMod: 0, name: "Muted & Balanced" },
  shade: { satMod: 5, lightMod: -15, name: "Deep & Rich" },
  vivid: { satMod: 15, lightMod: 5, name: "Bold & Bright" },
  neutral: { satMod: -30, lightMod: 10, name: "Soft & Subtle" }
};

function clamp(v: number, a = 0, b = 100) { return Math.max(a, Math.min(b, v)); }

export function hslToHex(h: number, s: number, l: number) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s);
  l = clamp(l);
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function hexToHsl(hex: string) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function colorDistance(hex1: string, hex2: string) {
  const c1 = hexToHsl(hex1);
  const c2 = hexToHsl(hex2);
  let hueDiff = Math.abs(c1.h - c2.h);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;
  const hueWeight = 2.0;
  const satDiff = Math.abs(c1.s - c2.s);
  const lightDiff = Math.abs(c1.l - c2.l);
  return Math.sqrt(
    Math.pow(hueDiff * hueWeight, 2) +
    Math.pow(satDiff, 2) +
    Math.pow(lightDiff * 1.5, 2)
  );
}

function isTooClose(newColor: string, existingColors: string[], minDistance: number) {
  for (const existing of existingColors) {
    if (colorDistance(newColor, existing) < minDistance) return true;
  }
  return false;
}

// Check if a palette has sufficient visual contrast
function hasGoodContrast(colors: string[]): boolean {
  let minDistance = Infinity;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const dist = colorDistance(colors[i], colors[j]);
      minDistance = Math.min(minDistance, dist);
    }
  }
  // Require at least 20 units of distance between colors
  return minDistance >= 20;
}

export function generateDailyColorWheel(seed: string) {
  const rng = createSeededRNG(seed + "wheel");
  const familyKeys = Object.keys(PALETTE_FAMILIES);
  const familyIndex = Math.floor(rng() * familyKeys.length);
  const family = PALETTE_FAMILIES[familyKeys[familyIndex]];
  const treatmentKeys = Object.keys(TONE_TREATMENTS);
  const treatmentIndex = Math.floor(rng() * treatmentKeys.length);
  const treatment = TONE_TREATMENTS[treatmentKeys[treatmentIndex]];
  const wheelColors: string[] = [];
  const MIN_COLOR_DISTANCE = 25;
  const isFullSpectrum = (family.hueRange[1] - family.hueRange[0]) >= 300 || (family.hueRange[0] === 0 && family.hueRange[1] === 360);
  if (isFullSpectrum) {
    const baseHueShift = Math.floor(rng() * 360);
    for (let i = 0; i < 12; i++) {
      const hue = (i * 30 + baseHueShift) % 360;
      let attempts = 0;
      let color = '#000000';
      do {
        const satVariance = (rng() - 0.5) * 20;  // Increased variance for more pop
        const lightVariance = (rng() - 0.5) * 12;
        let saturation = family.satRange[0] + rng() * (family.satRange[1] - family.satRange[0]);
        let lightness = family.lightRange[0] + rng() * (family.lightRange[1] - family.lightRange[0]);
        saturation = Math.max(50, Math.min(100, saturation + treatment.satMod + satVariance));  // Higher floor: 50 instead of 25
        lightness = Math.max(25, Math.min(80, lightness + treatment.lightMod + lightVariance));
        color = hslToHex(hue, saturation, lightness);
        attempts++;
      } while (isTooClose(color, wheelColors, MIN_COLOR_DISTANCE) && attempts < 10);
      wheelColors.push(color);
    }
  } else {
    let hueStart = family.hueRange[0];
    let hueEnd = family.hueRange[1];
    let hueRange: number;
    if (hueStart > hueEnd) hueRange = (360 - hueStart) + hueEnd; else hueRange = hueEnd - hueStart;
    const isNarrowRange = hueRange < 100;
    const satSpread = isNarrowRange ? 50 : 25;
    const lightSpread = isNarrowRange ? 45 : 25;
    const baseSat = (family.satRange[0] + family.satRange[1]) / 2 + treatment.satMod;
    const baseLight = (family.lightRange[0] + family.lightRange[1]) / 2 + treatment.lightMod;
    const satLightCombos: {sat:number, light:number}[] = [];
    for (let si = 0; si < 4; si++) {
      for (let li = 0; li < 3; li++) {
        const sat = baseSat - satSpread/2 + (si / 3) * satSpread;
        const light = baseLight - lightSpread/2 + (li / 2) * lightSpread;
        satLightCombos.push({ sat, light });
      }
    }
    for (let i = satLightCombos.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [satLightCombos[i], satLightCombos[j]] = [satLightCombos[j], satLightCombos[i]];
    }
    const hueStep = hueRange / 12;
    const jitter = Math.floor(rng() * hueRange * 0.1);
    // Boost saturation for narrow-range families to avoid muddiness
    const satBoost = isNarrowRange ? 15 : 0;
    for (let i = 0; i < 12; i++) {
      let attempts = 0;
      let color = '#000000';
      do {
        let hue = hueStart + (i * hueStep) + jitter + (rng() - 0.5) * (hueStep * 0.3);
        if (hueStart > hueEnd) hue = ((hue % 360) + 360) % 360; else hue = Math.max(hueStart, Math.min(hueEnd, hue));
        const combo = satLightCombos[i % satLightCombos.length];
        const satVariance = (rng() - 0.5) * 10;  // Increased variance
        const lightVariance = (rng() - 0.5) * 8;  // Increased for better spread
        let saturation = combo.sat + satVariance + satBoost;
        let lightness = combo.light + lightVariance;
        saturation = Math.max(45, Math.min(100, saturation));  // Higher floor: 45 instead of 20
        lightness = Math.max(20, Math.min(85, lightness));  // Slightly wider range for more variety
        color = hslToHex(hue, saturation, lightness);
        attempts++;
      } while (isTooClose(color, wheelColors, MIN_COLOR_DISTANCE) && attempts < 15);
      wheelColors.push(color);
    }
  }
  return {
    colors: wheelColors,
    familyName: family.name,
    treatmentName: treatment.name,
    familyKey: familyKeys[familyIndex],
    treatmentKey: treatmentKeys[treatmentIndex]
  };
}

export function generatePaletteByScheme(scheme: string, wheelColors: string[], seed: string) {
  const rng = createSeededRNG(seed + "pattern");
  const baseIndex = Math.floor(rng() * 12);
  let indices: number[] = [];
  switch (scheme) {
    case "complementary":
      indices = [baseIndex, (baseIndex + 6) % 12];
      indices.push((baseIndex + 1) % 12, (baseIndex + 5) % 12, (baseIndex + 7) % 12);
      break;
    case "triadic":
      indices = [baseIndex, (baseIndex + 4) % 12, (baseIndex + 8) % 12];
      indices.push((baseIndex + 2) % 12, (baseIndex + 6) % 12);
      break;
    case "analogous":
      indices = [
        (baseIndex - 2 + 12) % 12,
        (baseIndex - 1 + 12) % 12,
        baseIndex,
        (baseIndex + 1) % 12,
        (baseIndex + 2) % 12
      ];
      break;
    case "split-complementary":
      indices = [baseIndex, (baseIndex + 5) % 12, (baseIndex + 7) % 12];
      indices.push((baseIndex + 1) % 12, (baseIndex + 6) % 12);
      break;
    case "tetradic":
      indices = [baseIndex, (baseIndex + 3) % 12, (baseIndex + 6) % 12, (baseIndex + 9) % 12];
      indices.push((baseIndex + 1) % 12);
      break;
    case "square":
      indices = [baseIndex, (baseIndex + 3) % 12, (baseIndex + 6) % 12, (baseIndex + 9) % 12];
      indices.push((baseIndex + 2) % 12);
      break;
    case "rectangular":
      indices = [baseIndex, (baseIndex + 2) % 12, (baseIndex + 6) % 12, (baseIndex + 8) % 12];
      indices.push((baseIndex + 4) % 12);
      break;
    case "accent":
      indices = [baseIndex, (baseIndex + 1) % 12, (baseIndex + 2) % 12];
      indices.push((baseIndex + 7) % 12, (baseIndex + 10) % 12);
      break;
    default:
      indices = [0, 2, 4, 6, 8];
  }
  
  indices = indices.slice(0, 5);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + "shuffle" + i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  let palette = indices.map(i => wheelColors[i]);
  
  // If contrast is poor, try different indices with better spread
  if (!hasGoodContrast(palette)) {
    indices = [];
    const step = Math.floor(12 / 5);
    for (let i = 0; i < 5; i++) {
      indices.push((baseIndex + i * step) % 12);
    }
    palette = indices.map(i => wheelColors[i]);
  }
  
  return palette;
}
