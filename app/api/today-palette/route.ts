import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase';
import { getTodaySeed, generateDailyColorWheel, generatePaletteByScheme } from '@/app/lib/palette';

/**
 * GET /api/today-palette
 * Returns today's color wheel and hidden palette
 * Only accessible to authenticated users
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabase = createServerClient();

    // Verify the token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate today's palette
    const today = getTodaySeed();
    const wheelData = generateDailyColorWheel(today);

    // Select a harmony scheme based on the seed
    const schemeNames = [
      'complementary',
      'triadic',
      'analogous',
      'split-complementary',
      'tetradic',
      'square',
      'rectangular',
      'accent',
    ];

    // Deterministic scheme selection from seed
    const schemeIndex = parseInt(today.replace(/-/g, '')) % schemeNames.length;
    const scheme = schemeNames[schemeIndex];

    const palette = generatePaletteByScheme(scheme, wheelData.colors, today);

    return NextResponse.json({
      date: today,
      wheelColors: wheelData.colors,
      hiddenPalette: palette,
      family: wheelData.familyName,
      treatment: wheelData.treatmentName,
      scheme,
    });
  } catch (error) {
    console.error('Error generating palette:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
