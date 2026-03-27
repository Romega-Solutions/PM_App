# Fix Database Errors - Missing Columns and Tables

## Problem Summary

Your app is showing these errors:

1. ❌ **`column profiles.is_active does not exist`** - Missing column in profiles table
2. ❌ **`Could not find the table 'public.likes'`** - Likes table doesn't exist in database
3. ❌ **No profiles/conversations/matches showing** - Database queries failing due to missing schema

## Solution: Run Database Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"** button

### Step 2: Run the Migration Script

1. Open the file: `supabase/migrations/fix_missing_columns_and_tables.sql`
2. Copy **ALL the contents** of the file
3. Paste into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify Success

You should see output like:

```
NOTICE: Added is_active column to profiles table
SUCCESS: Affected rows: X
```

### Step 4: Restart Your Expo App

1. In your terminal, press `r` to reload the app
2. Or restart the Metro bundler completely:
   ```bash
   # Stop current process (Ctrl+C)
   npx expo start --clear
   ```

## What This Migration Does

### ✅ Adds Missing Column

- Adds `is_active BOOLEAN DEFAULT TRUE` to profiles table
- Creates index for better query performance

### ✅ Creates Missing Tables

- Creates `likes` table for storing swipes and matches
- Creates `passes` table for storing rejected profiles
- Adds proper foreign key relationships

### ✅ Sets Up Security

- Enables Row Level Security (RLS) on new tables
- Creates policies so users can only see their own data

### ✅ Updates Existing Data

- Sets all existing profiles to `is_active = TRUE`

## Expected Result After Migration

Once the migration runs successfully:

1. **Home/Discover Tab** ✅
   - Will show real profiles from your database
   - Smart matching algorithm will work
   - Swiping will save to database

2. **Likes Tab** ✅
   - Will show your matched profiles from database
   - Can view mutual likes and one-way likes

3. **Messages Tab** ✅
   - Will show conversations from database
   - Can see online status of matched users

## Troubleshooting

### If you get "relation already exists" errors:

This is OKAY - it means some tables already existed. The migration uses `IF NOT EXISTS` checks.

### If queries still fail after migration:

1. Check the Supabase logs for specific errors
2. Verify the migration ran by checking Tables in Supabase dashboard:
   - Should see `profiles` table with `is_active` column
   - Should see `likes` and `passes` tables

### If you need to reset everything:

Run the main setup migration first:

1. Open `supabase/migrations/00_complete_database_setup.sql`
2. Run it in Supabase SQL Editor
3. Then run the fix migration

## Database Schema Reference

After migration, your tables should have:

**profiles table:**

- All user profile data
- `is_active` column (BOOLEAN) - whether profile is active
- `verification_completed` - whether user verified ID
- Location, preferences, photos, etc.

**likes table:**

- `from_user_id` - who sent the like
- `to_user_id` - who received the like
- `is_match` - true if mutual like
- `matched_at` - timestamp of match

**passes table:**

- `from_user_id` - who passed
- `to_user_id` - who was passed
- Used to exclude profiles from discovery

## Need More Help?

If errors persist after running the migration:

1. Check Supabase Dashboard → Database → Tables to verify structure
2. Check Supabase Dashboard → API Docs to test queries
3. Look at browser console / Metro logs for specific error messages
