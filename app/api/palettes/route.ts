import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// API route to fetch user's palettes with metadata from daily_palettes
// Version 2.0 - Fixed metadata fetching
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized', version: '2.0' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's palettes from database using UUID from auth
    const { data: palettesData, error } = await supabase
      .from('palettes')
      .select('*')
      .eq('user_id', user.id)  // user.id is the UUID from auth
      .order('date', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('Palettes found:', palettesData?.length || 0);

    // Fetch metadata from daily_palettes for each date
    const dates = palettesData?.map(p => p.date) || [];
    
    let metadataMap = new Map();
    
    if (dates.length > 0) {
      const { data: dailyPalettesData, error: metadataError } = await supabase
        .from('daily_palettes')
        .select('date, palette_name, palette_description, best_used_for')
        .in('date', dates);

      if (metadataError) {
        console.error('Metadata query error:', metadataError);
      } else {
        console.log('Metadata found for', dailyPalettesData?.length || 0, 'dates');
        // Create a map for quick lookup
        dailyPalettesData?.forEach(dp => {
          metadataMap.set(dp.date, {
            palette_name: dp.palette_name,
            palette_description: dp.palette_description,
            best_used_for: dp.best_used_for,
          });
        });
      }
    }

    // Transform database format to match expected format
    const palettes = palettesData?.map((p: any) => {
      const metadata = metadataMap.get(p.date);
      return {
        id: p.id,
        date: p.date,
        colors: p.colors || [],
        scheme: p.scheme,
        isFavorite: p.is_favorite,
        won: p.won,
        guessCount: p.guess_count,
        palette_name: metadata?.palette_name,
        palette_description: metadata?.palette_description,
        best_used_for: metadata?.best_used_for,
      };
    }) || [];

    console.log('Returning', palettes.length, 'palettes');
    return NextResponse.json({ palettes, version: '2.0' });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message, version: '2.0' }, { status: 500 });
  }
}
