// Palette metadata generation utility

export interface PaletteMetadata {
  name: string;
  description: string;
  bestUsedFor: string[];
}

const PALETTE_DESCRIPTORS: Record<string, string[]> = {
  warm: ['Sunset', 'Ember', 'Flame', 'Desert', 'Autumn'],
  cool: ['Ocean', 'Glacier', 'Twilight', 'Arctic', 'Stream'],
  pastel: ['Dream', 'Whisper', 'Cloud', 'Cotton', 'Soft'],
  jewel: ['Royal', 'Treasure', 'Crown', 'Gemstone', 'Luxe'],
  earth: ['Clay', 'Terra', 'Moss', 'Stone', 'Forest'],
  vibrant: ['Electric', 'Neon', 'Pop', 'Vivid', 'Burst'],
  muted: ['Zen', 'Calm', 'Subtle', 'Quiet', 'Serene'],
  forest: ['Grove', 'Woodland', 'Canopy', 'Fern', 'Spruce'],
  sunset: ['Golden', 'Honey', 'Amber', 'Glow', 'Radiance'],
  ocean: ['Abyss', 'Depth', 'Wave', 'Tide', 'Reef'],
  berry: ['Berry', 'Plum', 'Wine', 'Fruit', 'Harvest'],
  citrus: ['Citrus', 'Zest', 'Bright', 'Fresh', 'Squeeze'],
};

const SCHEME_MODIFIERS: Record<string, string> = {
  complementary: 'Contrast',
  triadic: 'Trinity',
  analogous: 'Harmony',
  'split-complementary': 'Split',
  tetradic: 'Quartet',
  square: 'Balance',
  rectangular: 'Duality',
  accent: 'Accent',
};

const USAGE_CATEGORIES: Record<string, string[]> = {
  warm: ['Brand design', 'Food & beverage', 'Energy & sports'],
  cool: ['Tech & innovation', 'Health & wellness', 'Corporate'],
  pastel: ['Baby products', 'Beauty & cosmetics', 'Spring campaigns'],
  jewel: ['Luxury brands', 'Fashion', 'Premium products'],
  earth: ['Natural products', 'Eco-friendly brands', 'Artisanal goods'],
  vibrant: ['Youth marketing', 'Entertainment', 'Creative industries'],
  muted: ['Minimalist design', 'Scandinavian aesthetics', 'Professional services'],
  forest: ['Outdoor brands', 'Environmental causes', 'Nature products'],
  sunset: ['Premium brands', 'Autumn campaigns', 'Harvest themes'],
  ocean: ['Marine businesses', 'Travel & tourism', 'Wellness brands'],
  berry: ['Food & beverage', 'Beauty products', 'Feminine brands'],
  citrus: ['Summer campaigns', 'Fresh brands', 'Energy products'],
};

export const SCHEME_EXPLANATIONS: Record<string, { title: string; description: string; colorTheory: string }> = {
  complementary: {
    title: 'Complementary',
    description: 'Colors opposite each other on the color wheel.',
    colorTheory: 'Complementary colors create maximum contrast and visual tension. When placed side by side, they make each other appear more vibrant. Perfect for drawing attention and creating dynamic designs.',
  },
  triadic: {
    title: 'Triadic',
    description: 'Three colors evenly spaced around the color wheel.',
    colorTheory: 'Triadic schemes offer vibrant, balanced palettes with rich visual contrast. The equal spacing creates harmony while maintaining energy. Popular in playful, bold designs.',
  },
  analogous: {
    title: 'Analogous',
    description: 'Colors that sit next to each other on the wheel.',
    colorTheory: 'Analogous palettes are harmonious and pleasing to the eye. They create smooth color transitions and serene atmospheres. One color dominates, the second supports, and the third accents.',
  },
  'split-complementary': {
    title: 'Split-Complementary',
    description: 'A base color plus the two adjacent to its complement.',
    colorTheory: 'This scheme offers strong visual contrast like complementary colors, but with more nuance. The split provides more variety while maintaining tension. Easier to balance than pure complementary.',
  },
  tetradic: {
    title: 'Tetradic (Double-Complementary)',
    description: 'Two pairs of complementary colors.',
    colorTheory: 'Tetradic schemes are rich and complex, offering plenty of color variety. The key is to let one color dominate and balance warm and cool tones. Used in sophisticated, layered designs.',
  },
  square: {
    title: 'Square',
    description: 'Four colors evenly spaced around the wheel.',
    colorTheory: 'Square schemes provide perfect balance with four distinct colors. Works best when one color dominates and others accent. Creates vibrant yet balanced compositions.',
  },
  rectangular: {
    title: 'Rectangular (Tetradic Rectangle)',
    description: 'Two complementary pairs with unequal spacing.',
    colorTheory: 'Similar to square but with varied spacing, offering more flexibility. Provides multiple layers of contrast and harmony. Great for creating depth and complexity.',
  },
  accent: {
    title: 'Accent',
    description: 'A dominant color with strategic accent colors.',
    colorTheory: 'Accent schemes use a primary color family with one or more contrasting colors for emphasis. The accent draws the eye and creates focal points. Essential for guiding visual hierarchy.',
  },
};

/**
 * Generate a palette name and metadata based on family, scheme, and date
 * Uses the date as a seed for deterministic name generation
 */
export function generatePaletteName(
  familyKey: string,
  scheme: string,
  date: string
): PaletteMetadata {
  // Use date as seed for deterministic selection
  const seedNum = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const descriptors = PALETTE_DESCRIPTORS[familyKey] || ['Mystery'];
  const descriptorIndex = seedNum % descriptors.length;
  const descriptor = descriptors[descriptorIndex];
  
  const modifier = SCHEME_MODIFIERS[scheme] || '';
  
  const name = modifier ? `${descriptor} ${modifier}` : descriptor;
  
  const usages = USAGE_CATEGORIES[familyKey] || ['General design', 'Creative projects', 'Visual communication'];
  
  const descriptions = [
    `A ${familyKey} palette with ${scheme} harmony.`,
    `${descriptor} tones arranged in ${scheme} formation.`,
    `${SCHEME_EXPLANATIONS[scheme]?.title || scheme} palette with ${familyKey} character.`,
  ];
  
  const description = descriptions[seedNum % descriptions.length];
  
  return {
    name,
    description,
    bestUsedFor: usages,
  };
}
