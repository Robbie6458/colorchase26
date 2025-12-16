// ============================================
// STEP 2: Create this file in your project
// Location: supabase/functions/generate-daily-palette/index.ts
// ============================================

// This runs in Supabase at 9 AM every day
// It generates today's color palette and stores it

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Create a connection to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date (same format as the client: YYYY-MM-DD)
    const now = new Date();
    const resetHour = 9;
    let seedDate = new Date(now);
    
    // If it's before 9 AM, we actually want yesterday's date
    if (now.getUTCHours() < resetHour) {
      seedDate.setUTCDate(seedDate.getUTCDate() - 1);
    }

    const today =
      `${seedDate.getUTCFullYear()}-${String(
        seedDate.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(seedDate.getUTCDate()).padStart(2, "0")}`;

    console.log(`Generating palette for date: ${today}`);

    // Check if palette already exists for today
    const { data: existing } = await supabase
      .from("daily_palettes")
      .select("id")
      .eq("date", today)
      .single();

    if (existing) {
      console.log(`Palette already exists for ${today}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Palette already exists for today",
          date: today,
        })
      );
    }

    // ============================================
    // NOW WE GENERATE THE PALETTE
    // All this code is copied from your palette.ts
    // ============================================

    // Color generation functions (copied from your palette.ts)
    function createSeededRNG(seed: string) {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
      }
      let state = hash;
      return function () {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
      };
    }

    function hslToHex(h: number, s: number, l: number): string {
      h = ((h % 360) + 360) % 360;
      s = Math.max(0, Math.min(100, s));
      l = Math.max(0, Math.min(100, l));
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    }

    function hexToHsl(hex: string) {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0,
        s = 0,
        l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    }

    function colorDistance(hex1: string, hex2: string): number {
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

    function isTooClose(
      newColor: string,
      existingColors: string[],
      minDistance: number
    ): boolean {
      for (const existing of existingColors) {
        if (colorDistance(newColor, existing) < minDistance) return true;
      }
      return false;
    }

    function hasGoodContrast(colors: string[]): boolean {
      let minDistance = Infinity;
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          const dist = colorDistance(colors[i], colors[j]);
          minDistance = Math.min(minDistance, dist);
        }
      }
      return minDistance >= 20;
    }

    // Palette families and treatments (from your palette.ts)
    const PALETTE_FAMILIES: Record<string, any> = {
      warm: {
        hueRange: [0, 60],
        satRange: [65, 85],
        lightRange: [45, 60],
        name: "Warm Sunset",
      },
      cool: {
        hueRange: [180, 270],
        satRange: [50, 75],
        lightRange: [40, 60],
        name: "Cool Ocean",
      },
      pastel: {
        hueRange: [0, 360],
        satRange: [40, 60],
        lightRange: [70, 85],
        name: "Soft Pastel",
      },
      jewel: {
        hueRange: [0, 360],
        satRange: [70, 95],
        lightRange: [35, 50],
        name: "Jewel Tones",
      },
      earth: {
        hueRange: [20, 50],
        satRange: [30, 55],
        lightRange: [35, 55],
        name: "Earth & Clay",
      },
      vibrant: {
        hueRange: [0, 360],
        satRange: [80, 100],
        lightRange: [50, 60],
        name: "Vibrant Pop",
      },
      muted: {
        hueRange: [0, 360],
        satRange: [25, 45],
        lightRange: [45, 65],
        name: "Muted Modern",
      },
      forest: {
        hueRange: [80, 160],
        satRange: [40, 70],
        lightRange: [30, 55],
        name: "Forest Grove",
      },
      sunset: {
        hueRange: [330, 60],
        satRange: [70, 90],
        lightRange: [50, 65],
        name: "Golden Hour",
      },
      ocean: {
        hueRange: [170, 220],
        satRange: [55, 80],
        lightRange: [40, 60],
        name: "Deep Sea",
      },
      berry: {
        hueRange: [280, 350],
        satRange: [50, 75],
        lightRange: [35, 55],
        name: "Berry Harvest",
      },
      citrus: {
        hueRange: [30, 90],
        satRange: [75, 95],
        lightRange: [55, 70],
        name: "Citrus Burst",
      },
    };

    const TONE_TREATMENTS: Record<string, any> = {
      tint: { satMod: -15, lightMod: 20, name: "Light & Airy" },
      tone: { satMod: -20, lightMod: 0, name: "Muted & Balanced" },
      shade: { satMod: 5, lightMod: -15, name: "Deep & Rich" },
      vivid: { satMod: 15, lightMod: 5, name: "Bold & Bright" },
      neutral: { satMod: -30, lightMod: 10, name: "Soft & Subtle" },
    };

    // Generate the color wheel (12 colors)
    function generateDailyColorWheel(seed: string) {
      const rng = createSeededRNG(seed + "wheel");
      const familyKeys = Object.keys(PALETTE_FAMILIES);
      const familyIndex = Math.floor(rng() * familyKeys.length);
      const family = PALETTE_FAMILIES[familyKeys[familyIndex]];
      const treatmentKeys = Object.keys(TONE_TREATMENTS);
      const treatmentIndex = Math.floor(rng() * treatmentKeys.length);
      const treatment = TONE_TREATMENTS[treatmentKeys[treatmentIndex]];
      const wheelColors: string[] = [];
      const MIN_COLOR_DISTANCE = 25;

      const isFullSpectrum =
        family.hueRange[1] - family.hueRange[0] >= 300 ||
        (family.hueRange[0] === 0 && family.hueRange[1] === 360);

      if (isFullSpectrum) {
        const baseHueShift = Math.floor(rng() * 360);
        for (let i = 0; i < 12; i++) {
          const hue = (i * 30 + baseHueShift) % 360;
          let attempts = 0;
          let color = "#000000";
          do {
            const satVariance = (rng() - 0.5) * 20;
            const lightVariance = (rng() - 0.5) * 12;
            let saturation =
              family.satRange[0] +
              rng() * (family.satRange[1] - family.satRange[0]);
            let lightness =
              family.lightRange[0] +
              rng() * (family.lightRange[1] - family.lightRange[0]);
            saturation = Math.max(
              50,
              Math.min(100, saturation + treatment.satMod + satVariance)
            );
            lightness = Math.max(
              25,
              Math.min(80, lightness + treatment.lightMod + lightVariance)
            );
            color = hslToHex(hue, saturation, lightness);
            attempts++;
          } while (
            isTooClose(color, wheelColors, MIN_COLOR_DISTANCE) &&
            attempts < 10
          );
          wheelColors.push(color);
        }
      } else {
        let hueStart = family.hueRange[0];
        let hueEnd = family.hueRange[1];
        let hueRange: number;
        if (hueStart > hueEnd)
          hueRange = 360 - hueStart + hueEnd;
        else
          hueRange = hueEnd - hueStart;
        const isNarrowRange = hueRange < 100;
        const satSpread = isNarrowRange ? 50 : 25;
        const lightSpread = isNarrowRange ? 45 : 25;
        const baseSat =
          (family.satRange[0] + family.satRange[1]) / 2 + treatment.satMod;
        const baseLight =
          (family.lightRange[0] + family.lightRange[1]) / 2 +
          treatment.lightMod;
        const satLightCombos: { sat: number; light: number }[] = [];

        for (let si = 0; si < 4; si++) {
          for (let li = 0; li < 3; li++) {
            const sat = baseSat - satSpread / 2 + (si / 3) * satSpread;
            const light = baseLight - lightSpread / 2 + (li / 2) * lightSpread;
            satLightCombos.push({ sat, light });
          }
        }

        for (let i = satLightCombos.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [satLightCombos[i], satLightCombos[j]] = [
            satLightCombos[j],
            satLightCombos[i],
          ];
        }

        const hueStep = hueRange / 12;
        const jitter = Math.floor(rng() * hueRange * 0.1);
        const satBoost = isNarrowRange ? 15 : 0;

        for (let i = 0; i < 12; i++) {
          let attempts = 0;
          let color = "#000000";
          do {
            let hue =
              hueStart +
              i * hueStep +
              jitter +
              (rng() - 0.5) * (hueStep * 0.3);
            if (hueStart > hueEnd)
              hue = ((hue % 360) + 360) % 360;
            else
              hue = Math.max(hueStart, Math.min(hueEnd, hue));

            const combo = satLightCombos[i % satLightCombos.length];
            const satVariance = (rng() - 0.5) * 10;
            const lightVariance = (rng() - 0.5) * 8;
            let saturation = combo.sat + satVariance + satBoost;
            let lightness = combo.light + lightVariance;
            saturation = Math.max(45, Math.min(100, saturation));
            lightness = Math.max(20, Math.min(85, lightness));
            color = hslToHex(hue, saturation, lightness);
            attempts++;
          } while (
            isTooClose(color, wheelColors, MIN_COLOR_DISTANCE) &&
            attempts < 15
          );
          wheelColors.push(color);
        }
      }

      return {
        colors: wheelColors,
        familyName: family.name,
        treatmentName: treatment.name,
        familyKey: familyKeys[familyIndex],
        treatmentKey: treatmentKeys[treatmentIndex],
      };
    }

    // Generate the 5-color hidden palette from the 12-color wheel
    function generatePaletteByScheme(
      scheme: string,
      wheelColors: string[],
      seed: string
    ) {
      function seededRandom(seed: string) {
        const rng = createSeededRNG(seed);
        return rng();
      }

      const rng = createSeededRNG(seed + "pattern");
      const baseIndex = Math.floor(rng() * 12);
      let indices: number[] = [];

      switch (scheme) {
        case "complementary":
          indices = [baseIndex, (baseIndex + 6) % 12];
          indices.push(
            (baseIndex + 1) % 12,
            (baseIndex + 5) % 12,
            (baseIndex + 7) % 12
          );
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
            (baseIndex + 2) % 12,
          ];
          break;
        case "split-complementary":
          indices = [baseIndex, (baseIndex + 5) % 12, (baseIndex + 7) % 12];
          indices.push((baseIndex + 1) % 12, (baseIndex + 6) % 12);
          break;
        case "tetradic":
          indices = [
            baseIndex,
            (baseIndex + 3) % 12,
            (baseIndex + 6) % 12,
            (baseIndex + 9) % 12,
          ];
          indices.push((baseIndex + 1) % 12);
          break;
        case "square":
          indices = [
            baseIndex,
            (baseIndex + 3) % 12,
            (baseIndex + 6) % 12,
            (baseIndex + 9) % 12,
          ];
          indices.push((baseIndex + 2) % 12);
          break;
        case "rectangular":
          indices = [
            baseIndex,
            (baseIndex + 2) % 12,
            (baseIndex + 6) % 12,
            (baseIndex + 8) % 12,
          ];
          indices.push((baseIndex + 4) % 12);
          break;
        case "accent":
          indices = [
            baseIndex,
            (baseIndex + 1) % 12,
            (baseIndex + 2) % 12,
          ];
          indices.push((baseIndex + 7) % 12, (baseIndex + 10) % 12);
          break;
        default:
          indices = [0, 2, 4, 6, 8];
      }

      indices = indices.slice(0, 5);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(
          seededRandom(seed + "shuffle" + i) * (i + 1)
        );
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      let palette = indices.map((i) => wheelColors[i]);

      if (!hasGoodContrast(palette)) {
        indices = [];
        const step = Math.floor(12 / 5);
        for (let i = 0; i < 5; i++) {
          indices.push((baseIndex + i * step) % 12);
        }
        palette = indices.map((i) => wheelColors[i]);
      }

      return palette;
    }

    // ============================================
    // Generate today's palette
    // ============================================
    const wheelData = generateDailyColorWheel(today);
    const schemeNames = [
      "complementary",
      "triadic",
      "analogous",
      "split-complementary",
      "tetradic",
      "square",
      "rectangular",
      "accent",
    ];

    // Deterministic scheme selection
    const schemeIndex = parseInt(today.replace(/-/g, "")) % schemeNames.length;
    const scheme = schemeNames[schemeIndex];

    const hiddenPalette = generatePaletteByScheme(scheme, wheelData.colors, today);

    // ============================================
    // Store in Supabase
    // ============================================
    const { data, error } = await supabase
      .from("daily_palettes")
      .insert([
        {
          date: today,
          wheel_colors: wheelData.colors,
          hidden_palette: hiddenPalette,
          scheme: scheme,
          family_name: wheelData.familyName,
          treatment_name: wheelData.treatmentName,
          family_key: wheelData.familyKey,
          treatment_key: wheelData.treatmentKey,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting palette:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 500 }
      );
    }

    console.log(`✅ Successfully generated palette for ${today}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Palette generated successfully",
        date: today,
        scheme: scheme,
        wheelColors: wheelData.colors,
        hiddenPalette: hiddenPalette,
      })
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
});
