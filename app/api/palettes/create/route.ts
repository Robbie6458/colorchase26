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
      .select('id')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('palettes')
        .update({
          colors,
          scheme,
          guess_count: guessCount,
          won,
          saved_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to update palette: ${updateError.message}` },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, created: false });
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
