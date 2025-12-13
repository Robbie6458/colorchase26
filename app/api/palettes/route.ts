import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
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
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's palettes from database using UUID from auth
    const { data, error } = await supabase
      .from('palettes')
      .select('*')
      .eq('user_id', user.id)  // user.id is the UUID from auth
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform database format to match expected format
    const palettes = data?.map((p: any) => ({
      id: p.id,
      date: p.date,
      colors: p.colors,
      scheme: p.scheme,
      isFavorite: p.favorite,
      won: p.won,
      guessCount: p.guess_count
    })) || [];

    return NextResponse.json(palettes);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
