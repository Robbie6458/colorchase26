# 🎮 Setting Up Automated Daily Palette Generation - Beginner Guide

## What You're Building

Every day at **9:00 AM UTC**, a bot will automatically:
1. Generate a random 12-color wheel
2. Pick 5 colors from that wheel (the hidden pattern)
3. Save it to your database
4. Players can then play and save their results linked to that day

---

## 📋 Prerequisite Checklist

Before starting, you need:
- ✅ A Supabase account
- ✅ Your Supabase project created
- ✅ Access to Supabase Dashboard
- ✅ Access to your Next.js project code

---

## 🚀 Step-by-Step Setup

### STEP 1: Create the Database Tables (5 minutes)

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard/projects)**
2. Click on your project name
3. On the left sidebar, click **"SQL Editor"**
4. Click **"New Query"** button
5. Copy the entire contents from `SUPABASE_SETUP.sql` and paste it into the editor
6. Click **"Run"** button (top right)
7. You should see a message saying the tables were created

**What this did:**
- Created `daily_palettes` table (stores 1 palette per day)
- Updated `palettes` table (stores player results)
- Created indexes (speeds up database queries)

---

### STEP 2: Create the Edge Function (10 minutes)

An "Edge Function" is a small program that runs in Supabase.

1. In your local computer, navigate to your project folder
   ```
   cd c:\Users\Employee\Documents\GitHub\colorchase26
   ```

2. Create this folder structure if it doesn't exist:
   ```
   supabase/
   └── functions/
       └── generate-daily-palette/
           └── index.ts
   ```

3. Copy the entire contents from `EDGE_FUNCTION_CODE.ts`

4. Paste it into `supabase/functions/generate-daily-palette/index.ts`

5. Deploy the Edge Function to Supabase using the Supabase CLI:
   ```powershell
   # Install Supabase CLI if you haven't already
   npm install -g supabase

   # Deploy the function
   supabase functions deploy generate-daily-palette
   ```

   You should see output like:
   ```
   ✓ Function deployed successfully to generate-daily-palette
   ```

**What this does:**
- When called, it generates a random palette and stores it in the database
- Contains all the color generation logic from your `palette.ts` file
- Runs in Supabase's cloud, not your computer

---

### STEP 3: Set Up the Cron Job (5 minutes)

A "Cron job" is like a scheduled task that runs automatically at specific times.

1. Go back to **Supabase SQL Editor**
2. Click **"New Query"** again
3. Copy the contents from `SUPABASE_CRON_SETUP.sql` and paste it
4. **Important**: Find this line and replace it with your actual info:
   ```sql
   -- OLD (REPLACE THIS):
   'https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-daily-palette',

   -- NEW (Your actual values):
   'https://[YOUR-PROJECT-ID].supabase.co/functions/v1/generate-daily-palette',
   ```

   To find your project ID:
   - Look at the URL in Supabase: `https://app.supabase.com/project/[THIS-IS-YOUR-ID]/...`

5. Also replace:
   ```sql
   'Bearer YOUR_ANON_KEY'
   ```
   With your actual public key:
   - Go to **Settings → API** in Supabase
   - Copy the "anon" key (the public one)
   - Paste it: `'Bearer eyJhbGc...'`

6. Click **"Run"**

**What this does:**
- Creates a scheduled task that runs at 9:00 AM UTC every day
- Calls your Edge Function
- Logs what happened in the audit_log table

---

### STEP 4: Update Your Next.js Code (10 minutes)

Now your Next.js app needs to fetch the palette from the database instead of generating it on-the-fly.

Update your `/api/today-palette/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase';
import { getTodaySeed } from '@/app/lib/palette';

/**
 * GET /api/today-palette
 * Returns today's color wheel and hidden palette from the database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get today's date
    const today = getTodaySeed();

    // Fetch from database instead of generating
    const { data: dailyPalette, error } = await supabase
      .from('daily_palettes')
      .select('*')
      .eq('date', today)
      .single();

    if (error || !dailyPalette) {
      return NextResponse.json(
        { error: 'Palette not found for today' },
        { status: 404 }
      );
    }

    // Return the palette
    return NextResponse.json({
      date: today,
      wheelColors: dailyPalette.wheel_colors,
      hiddenPalette: dailyPalette.hidden_palette,
      family: dailyPalette.family_name,
      treatment: dailyPalette.treatment_name,
      scheme: dailyPalette.scheme,
    });
  } catch (error) {
    console.error('Error fetching palette:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Also update `/api/palettes/daily-stats/route.ts` to use the database palette:

```typescript
import { createServerClient } from "@/app/lib/supabase";
import { getTodaySeed } from "@/app/lib/palette";

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();

    // Get today's date
    const now = new Date();
    const resetHour = 9;
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
```

---

## ✅ How to Verify It's Working

### Test 1: Check the Cron Job

1. Go to Supabase SQL Editor
2. Run this query:
   ```sql
   SELECT * FROM cron.job;
   ```
3. You should see a row with `generate_daily_palette_job`

### Test 2: Manually Trigger the Edge Function

1. Go to Supabase Dashboard → **Functions**
2. Click on `generate-daily-palette`
3. Click the **"Invoke"** button
4. You should see a response like:
   ```json
   {
     "success": true,
     "message": "Palette generated successfully",
     "date": "2025-12-15"
   }
   ```

### Test 3: Check the Database

1. Go to **Table Editor** in Supabase
2. Click on `daily_palettes` table
3. You should see a row for today's date with:
   - 12 colors in `wheel_colors`
   - 5 colors in `hidden_palette`
   - scheme, family_name, treatment_name filled in

### Test 4: Play the Game

1. Start your Next.js app: `npm run dev`
2. Open the game
3. It should load the palette from the database
4. Play and save your result
5. Check the `palettes` table - you should see your result with:
   - Your user_id
   - Today's date
   - The 5 colors you guessed
   - Your guess_count and won status

---

## 🔧 Troubleshooting

### "Palette not found" error
- The Edge Function hasn't run yet
- Click **"Invoke"** on the function manually to generate it once
- Then wait until tomorrow at 9 AM UTC

### "Connection failed" error in the cron job
- Double-check your project ID and API key
- Make sure you copied the "anon" key, not the "service role" key

### Function deployment failed
- Make sure you're in the right directory: `c:\Users\Employee\Documents\GitHub\colorchase26`
- Run: `supabase functions list` to see if the function exists
- If it does, you can update it with: `supabase functions deploy generate-daily-palette --force-update`

### Database tables don't exist
- Run the SQL from `SUPABASE_SETUP.sql` again
- Make sure you didn't get any error messages

---

## 📅 What Happens Every Day

**9:00 AM UTC:**
1. Supabase detects it's time to run the cron job
2. Calls your Edge Function
3. Edge Function generates colors and stores in `daily_palettes`

**Throughout the day:**
1. Players open your game
2. Game fetches palette from `daily_palettes`
3. Players guess and eventually win or lose
4. When they click "Save Palette", it's stored in `palettes` table
5. Footer stats show: players, best guess, countdown (from database time)

**9:00 AM next day:**
1. Cron job runs again, generates new palette
2. Old palette is still in database (history)
3. Players can only see new palette in the game

---

## 🎯 Summary

You now have:
- ✅ Automated daily palette generation at 9 AM UTC
- ✅ Palettes stored in database guaranteed to exist
- ✅ Player results linked to palettes by date
- ✅ Player stats (guesses, favorite, time played) tracked
- ✅ Cron job that runs without your intervention

---

## Next Steps

1. ✅ Create the database tables (SUPABASE_SETUP.sql)
2. ✅ Create the Edge Function (EDGE_FUNCTION_CODE.ts)
3. ✅ Set up the Cron job (SUPABASE_CRON_SETUP.sql)
4. ✅ Update your Next.js code (see Step 4 above)
5. Test everything works
6. Deploy your app to Vercel

Good luck! 🚀
