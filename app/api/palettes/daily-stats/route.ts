import { createServerClient } from "@/app/lib/supabase";
import { getTodaySeed } from "@/app/lib/palette";

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();

    // Get today's date
    const now = new Date();
    // 9am PST = 17:00 UTC (PST is UTC-8, so 9 + 8 = 17)
    const resetHour = 17;
    let seedDate = new Date(now);
    if (now.getUTCHours() < resetHour) {
      seedDate.setUTCDate(seedDate.getUTCDate() - 1);
    }
    const today = `${seedDate.getUTCFullYear()}-${String(
      seedDate.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(seedDate.getUTCDate()).padStart(2, "0")}`;

    // Fetch daily palette from database (now always exists!)
    const { data: dailyPalette, error: fetchError } = await supabase
      .from("daily_palettes")
      .select("*")
      .eq("date", today)
      .single();

    if (!dailyPalette) {
      return Response.json(
        { error: "Daily palette not available" },
        { status: 500 }
      );
    }

    // Get player stats for today
    const { data: todaysPalettes } = await supabase
      .from("palettes")
      .select("user_id, guess_count, won")
      .eq("date", today);

    // Calculate stats
    const uniquePlayers = new Set(todaysPalettes?.map(p => p.user_id) || []).size;
    
    const winningPlays = todaysPalettes?.filter(p => p.won) || [];
    const lowestGuess = winningPlays.length > 0
      ? Math.min(...winningPlays.map(p => p.guess_count))
      : null;

    // Get player names with best guesses
    let bestPlayerNames: string[] = [];
    if (lowestGuess) {
      const bestPlayerIds = winningPlays
        .filter(p => p.guess_count === lowestGuess)
        .map(p => p.user_id);

      if (bestPlayerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", bestPlayerIds);

        bestPlayerNames = (profiles || []).map(p => p.username || "Player");
      }
    }

    // Calculate countdown to next reset
    const nextReset = new Date(seedDate);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    nextReset.setUTCHours(resetHour, 0, 0, 0);
    const timeToNextReset = Math.max(0, Math.floor((nextReset.getTime() - now.getTime()) / 1000));

    return Response.json({
      date: today,
      palette: dailyPalette.hidden_palette,
      scheme: dailyPalette.scheme,
      collectionCount: uniquePlayers,
      bestGuessCount: lowestGuess,
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
