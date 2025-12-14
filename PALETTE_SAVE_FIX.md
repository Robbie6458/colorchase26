# Palette Save Error - Troubleshooting Guide

## Error Message
```
An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.
```

## Root Causes

This error typically occurs when one of the following is missing:

1. **Palettes table doesn't exist** - The table was never created in your Supabase database
2. **User ID mismatch** - The table has `bigint user_id` but your auth uses UUID
3. **RLS policies missing or misconfigured** - Row Level Security blocks the insert operation
4. **User profile doesn't exist** - The user exists in auth but not in the `users` table

## Steps to Fix

### Step 1: Verify the Palettes Table Exists

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** (or **Database** → **Tables** to view via UI)
3. Check if a table named `palettes` exists
4. If it does, click on it and verify the schema matches the expected structure

**Expected schema:**
```
- id (uuid, primary key)
- user_id (uuid, references users.id)
- date (text)
- colors (text[])
- scheme (text)
- guess_count (integer)
- won (boolean)
- saved_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### Step 2: Apply the Migration

If the table is missing or has incorrect schema:

1. In Supabase → **SQL Editor**, create a new query
2. Copy the entire contents of `supabase/migrations/003_ensure_palettes_table.sql`
3. Paste it into the SQL Editor
4. **IMPORTANT**: If you have existing data, comment out the `DROP TABLE` line before executing
5. Click **Execute**

### Step 3: Verify RLS Policies

1. In Supabase, go to **Authentication** → **Policies** (or Table view)
2. Find the `palettes` table
3. Verify these 4 policies exist:
   - ✅ "Users can view their own palettes" (SELECT)
   - ✅ "Users can insert their own palettes" (INSERT)
   - ✅ "Users can update their own palettes" (UPDATE)
   - ✅ "Users can delete their own palettes" (DELETE)

### Step 4: Verify User Profile Exists

When a user signs up, their profile should be created automatically. To check:

1. In Supabase → **SQL Editor**, run this query:
```sql
SELECT * FROM public.users WHERE email = 'user@example.com';
```

2. Replace `'user@example.com'` with your test user's email
3. If no results appear, the user profile wasn't created. Re-authenticate or use the `handle_new_user` trigger to fix it.

## Testing the Fix

### 1. Log into the game
### 2. Play a game and win or lose
### 3. Click "Save Today's Palette"
### 4. The palette should save without error and redirect to your collection

## If You Still Get Errors

### Check Server-Side Logs

1. In Supabase → **Logs** section, check for database errors
2. Look for SQL errors related to RLS or foreign keys

### Debug in Development

1. Modify `app/lib/server-actions.ts` temporarily to add more error details:

```typescript
if (insertError) {
  console.error('Insert error details:', insertError);
  throw new Error(`Failed to save palette: ${insertError.message}`);
}
```

2. Check the browser console for the actual error message

### Common Issues

| Issue | Solution |
|-------|----------|
| `user_id` is NULL when inserting | Ensure `auth.uid()` is captured correctly - you must be authenticated |
| Foreign key violation | User ID doesn't exist in `users` table. Check `handle_new_user` trigger |
| RLS policy denies insert | The `auth.uid()` doesn't match `user_id` being inserted |
| Unique constraint violation | A palette already exists for that user on that date. The code should update instead. |

## After Fixing

Once the palettes table is created with correct RLS policies, the save operation should work immediately. No code changes needed - the existing code in `savePalette()` will work correctly.
