'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get current user's profile
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return { ...user, profile };
}

/**
 * Update player name (username)
 */
export async function updatePlayerName(newName: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Check if name already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('player_name', newName)
    .neq('id', user.id)
    .single();

  if (existing) {
    throw new Error('Player name already taken');
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ player_name: newName })
    .eq('id', user.id);

  if (updateError) {
    throw new Error('Failed to update player name');
  }

  revalidatePath('/player');
  return { success: true, newName };
}

/**
 * Save a palette to user's collection
 */
export async function savePalette(
  date: string,
  colors: string[],
  scheme: string,
  guessCount: number,
  won: boolean
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
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
      console.error('Palette update error:', updateError);
      throw new Error(`Failed to update palette: ${updateError.message}`);
    }
    return { success: true, created: false };
  }

  // Create new record
  console.log('Saving palette with:', { user_id: user.id, date, colors, scheme, guess_count: guessCount, won });
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
    console.error('Palette insert error:', insertError);
    throw new Error(`Failed to save palette: ${insertError.message}`);
  }

  revalidatePath('/player');
  return { success: true, created: true };
}

/**
 * Get user's palette collection
 */
export async function getUserPalettes() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { data: palettes, error } = await supabase
    .from('palettes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch palettes');

  return palettes || [];
}

/**
 * Toggle favorite status on a palette
 */
export async function toggleFavoritePalette(paletteId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Get current favorite status
  const { data: palette } = await supabase
    .from('palettes')
    .select('is_favorite')
    .eq('id', paletteId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!palette) {
    throw new Error('Palette not found');
  }

  const { error: updateError } = await supabase
    .from('palettes')
    .update({ is_favorite: !palette.is_favorite })
    .eq('id', paletteId);

  if (updateError) throw new Error('Failed to update favorite status');

  revalidatePath('/player');
  return { success: true, isFavorite: !palette.is_favorite };
}

/**
 * Delete a palette from user's collection
 */
export async function deletePalette(paletteId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('palettes')
    .delete()
    .eq('id', paletteId)
    .eq('user_id', user.id);

  if (error) throw new Error('Failed to delete palette');

  revalidatePath('/player');
  return { success: true };
}

/**
 * Check if user is authenticated
 */
export async function checkAuth() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return !!user;
}
