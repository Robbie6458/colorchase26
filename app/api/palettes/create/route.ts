import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface SavePaletteBody {
  date: string;
  colors: string[];
  scheme: string;
  guessCount: number;
  won: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SavePaletteBody = await request.json();
    const { date, colors, scheme, guessCount, won } = body;

    // Validate input
    if (!date || !colors || !scheme) {
      return NextResponse.json(
        { error: 'Missing required fields: date, colors, scheme' },
        { status: 400 }
      );
    }

    // Check if palette for this date already exists
    const { data: existing } = await supabase
      .from('palettes')
      .select('id, guess_count, won')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      // Don't update - keep the first attempt only
      return NextResponse.json({ 
        success: true, 
        created: false,
        message: 'Palette already saved. Only your first attempt counts!',
        existingResult: {
          guessCount: existing.guess_count,
          won: existing.won
        }
      });
    }

    // Create new record
    const { error: insertError } = await supabase.from('palettes').insert({
      user_id: user.id,
      date,
      colors,
      scheme,
      guess_count: guessCount,
      won,
      saved_at: new Date().toISOString(),
    });

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to save palette: ${insertError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, created: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
