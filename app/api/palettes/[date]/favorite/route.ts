import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
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

    const { date } = await params;

    // Get the current palette record
    const { data: palette, error: fetchError } = await supabase
      .from('palettes')
      .select('id, is_favorite')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to fetch palette: ${fetchError.message}` },
        { status: 400 }
      );
    }

    if (!palette) {
      return NextResponse.json(
        { error: 'Palette not found' },
        { status: 404 }
      );
    }

    // Toggle the favorite status
    const newFavoriteStatus = !palette.is_favorite;

    const { error: updateError } = await supabase
      .from('palettes')
      .update({ is_favorite: newFavoriteStatus })
      .eq('id', palette.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update favorite: ${updateError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      isFavorite: newFavoriteStatus 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
