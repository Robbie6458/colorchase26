# Daily Stats Feature - Setup Instructions

The daily stats feature (collection count, best player names, countdown timer) requires a new database table to be created in Supabase.

## What You Need to Do

### Option A: Apply Migration via Supabase Dashboard (Recommended)

1. Go to [app.supabase.com](https://app.supabase.com) and open your Color Chase project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/004_create_daily_palettes_table.sql`
5. Click **Run**
6. Confirm the query executed successfully

### What This Migration Does

Creates a new `daily_palettes` table with:
- `id` (UUID primary key)
- `date` (TEXT, unique - one palette per day)
- `colors` (TEXT[] - array of 5 hex color strings)
- `scheme` (TEXT - the color harmony scheme)
- `created_at` (TIMESTAMP - when the palette was generated)

This table stores the daily palette. When the first player plays each day, the `/api/palettes/daily-stats` endpoint automatically generates and stores the palette, ensuring all players that day get the same one.

## How It Works

### Palette Generation
1. On first game load each day, the footer calls `/api/palettes/daily-stats`
2. If no palette exists for today's date, the API generates one using your seeding logic
3. The palette is stored in the database
4. All subsequent players get the same palette

### Stats Calculation
The API endpoint aggregates today's saved palettes to calculate:
- **Collection Count**: Unique users who saved today's palette
- **Best Performance**: The lowest guess count achieved
- **Best Player Names**: All players who achieved that lowest count (rotates every 2 seconds)
- **Countdown**: Time remaining until 9am UTC tomorrow (when next palette appears)

### Footer Display
The `DailyStats` component displays:
```
🎨 5 collected today
🏆 Sarah got it in 3
⏱️ New palette in 18:45
```

If multiple players tie for best, their names rotate every 2 seconds.

## Verification

After applying the migration, you should see:
1. ✅ New `daily_palettes` table in Supabase
2. ✅ Footer stats visible on the game page
3. ✅ Collection count increases as players save palettes
4. ✅ Countdown timer updates every minute

## Notes

- The palette resets at **9am UTC** every day (you can change the `resetHour` variable in `/api/palettes/daily-stats/route.ts` if needed)
- Player names are pulled from the `profiles` table's `username` field
- The rotation of tied player names happens client-side (every 2 seconds) and is purely visual
- The countdown updates once per minute (sufficient for a countdown timer)
