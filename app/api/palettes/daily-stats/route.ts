import { createClient } from "@/app/lib/supabase";
import { getTodaySeed, generateDailyColorWheel, generatePaletteByScheme } from "@/app/lib/palette";

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Get today's date string (same logic as getTodaySeed)
    const now = new Date();
    const resetHour = 9;
    let seedDate = new Date(now);
    if (now.getHours() < resetHour) {
      seedDate.setDate(seedDate.getDate() - 1);
    }
    const today = `${seedDate.getFullYear()}-${String(seedDate.getMonth() + 1).padStart(2, '0')}-${String(seedDate.getDate()).padStart(2, '0')}`;

    // Check if daily palette exists for today
    let { data: dailyPalette, error: fetchError } = await supabase
      .from("daily_palettes")
      .select("*")
      .eq("date", today)
      .single();

    // If not, generate and store it (using service role to bypass RLS)
    if (!dailyPalette) {
      const wheelData = generateDailyColorWheel(today);
      const scheme = "vibrant"; // Default scheme for daily palette
      const colors = generatePaletteByScheme(scheme, wheelData.colors, today);

      const { data: inserted, error: insertError } = await supabase
        .from("daily_palettes")
        .insert([
          {
            date: today,
            colors: colors,
            scheme: scheme
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting daily palette:", insertError);
        return Response.json(
          { error: "Failed to generate daily palette" },
          { status: 500 }
        );
      }

      dailyPalette = inserted;
    }

    // Get collection stats for today
    const { data: todaysPalettes, error: statsError } = await supabase
      .from("palettes")
      .select("user_id, guess_count")
      .eq("date", today)
      .order("guess_count", { ascending: true });

    if (statsError) {
      console.error("Error fetching today's palettes:", statsError);
      return Response.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    // Calculate stats
    const collectionCount = new Set(todaysPalettes.map(p => p.user_id)).size;
    const lowestGuessCount = todaysPalettes.length > 0 ? todaysPalettes[0].guess_count : null;
    
    // Get all players with the lowest guess count
    const bestPlayers = lowestGuessCount !== null
      ? todaysPalettes
          .filter(p => p.guess_count === lowestGuessCount)
          .map(p => p.user_id)
      : [];

    // Get player names for the best players
    let bestPlayerNames: string[] = [];
    if (bestPlayers.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", bestPlayers);

      if (!profileError && profiles) {
        bestPlayerNames = profiles.map(p => p.username || "Anonymous");
      }
    }

    // Calculate time to next palette (9am tomorrow in UTC)
    const nextReset = new Date(seedDate);
    nextReset.setDate(nextReset.getDate() + 1);
    nextReset.setHours(resetHour, 0, 0, 0);
    const timeToNextReset = Math.max(0, Math.floor((nextReset.getTime() - now.getTime()) / 1000 / 60)); // In minutes

    return Response.json({
      date: today,
      palette: dailyPalette.colors,
      scheme: dailyPalette.scheme,
      collectionCount,
      bestGuessCount: lowestGuessCount,
      bestPlayerNames,
      timeToNextReset,
      resetHour
    });
  } catch (error: any) {
    console.error("Error in daily-stats endpoint:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
