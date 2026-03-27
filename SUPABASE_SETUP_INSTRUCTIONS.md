# 🚀 Pinaymate Supabase Database Setup Instructions

## ✅ What This Does

This setup will:

- Create a complete database schema with all necessary tables
- **Disable email verification** - users can sign up and log in immediately
- Auto-create profiles when users sign up
- Set up proper security policies (Row Level Security)
- Create tables for messages, likes, and matches

---

## 📋 Step-by-Step Setup

### 1️⃣ Reset Your Supabase Database (if needed)

If your database was paused and data was lost:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `dahvxddpirhfxpwmoxol`
3. Your database should auto-resume when you access it

---

### 2️⃣ Disable Email Confirmation in Supabase

**CRITICAL STEP - This allows users to sign up without email verification:**

1. In your Supabase dashboard, go to: **Authentication** → **Settings**
2. Scroll down to **Email Auth** section
3. **DISABLE** the toggle for **"Enable email confirmations"**
4. Click **Save**

![Disable Email Confirmations](https://i.imgur.com/example.png)

---

### 3️⃣ Run the Database Setup SQL

1. In your Supabase dashboard, go to: **SQL Editor**
2. Click **"+ New Query"**
3. Copy the **entire contents** of this file:
   ```
   supabase/migrations/00_complete_database_setup.sql
   ```
4. Paste it into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. Wait for the success message: ✅ "Success. No rows returned"

This will create:

- ✅ `profiles` table with all user data fields
- ✅ `messages` table for chat
- ✅ `likes` table for matching
- ✅ `passes` table for swipe history
- ✅ Trigger functions to auto-create profiles on signup
- ✅ Trigger to auto-verify email on signup (bypass email confirmation)
- ✅ Security policies (RLS) for data protection
- ✅ Indexes for fast queries

---

### 4️⃣ Verify the Setup

Run this query in SQL Editor to check if everything was created:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'messages', 'likes', 'passes');
```

You should see all 4 tables listed.

---

### 5️⃣ Test Your App

1. **Stop your Expo server** if it's running (press `Ctrl+C`)
2. **Clear cache and restart:**
   ```bash
   npx expo start --clear
   ```
3. **Test the signup flow:**
   - Select user type (Filipina or Foreigner)
   - Fill in signup form
   - Submit
   - ✅ You should be **immediately redirected to account setup** (no email verification!)

---

## 🔍 Database Schema Overview

### `profiles` Table

Stores all user profile information:

| Column                   | Type        | Description                       |
| ------------------------ | ----------- | --------------------------------- |
| `id`                     | UUID        | Primary key (links to auth.users) |
| `email`                  | TEXT        | User email                        |
| `first_name`             | TEXT        | First name                        |
| `last_name`              | TEXT        | Last name                         |
| `age`                    | INTEGER     | Age (18-70)                       |
| `gender`                 | TEXT        | 'male', 'female', 'other'         |
| `user_type`              | TEXT        | 'filipina' or 'foreigner'         |
| `photos`                 | TEXT[]      | Array of photo URLs               |
| `bio`                    | TEXT        | About me text                     |
| `country`                | TEXT        | Location country                  |
| `city`                   | TEXT        | Location city                     |
| `latitude`               | DOUBLE      | GPS latitude                      |
| `longitude`              | DOUBLE      | GPS longitude                     |
| `height_cm`              | INTEGER     | Height in cm                      |
| `body_type`              | TEXT        | Body type preference              |
| `education`              | TEXT        | Education level                   |
| `occupation`             | TEXT        | Job title                         |
| `relationship_goal`      | TEXT        | What they're looking for          |
| `languages`              | TEXT[]      | Spoken languages                  |
| `interests`              | TEXT[]      | Hobbies/interests                 |
| `looking_for_gender`     | TEXT        | Gender preference                 |
| `age_preference_min`     | INTEGER     | Min age preference                |
| `age_preference_max`     | INTEGER     | Max age preference                |
| `distance_preference_km` | INTEGER     | Max distance for matches          |
| `is_verified`            | BOOLEAN     | Account verified                  |
| `verification_status`    | TEXT        | 'pending', 'approved', 'rejected' |
| `is_active`              | BOOLEAN     | Account active                    |
| `is_premium`             | BOOLEAN     | Premium membership                |
| `basic_info_completed`   | BOOLEAN     | Setup step tracker                |
| `photos_completed`       | BOOLEAN     | Setup step tracker                |
| `location_completed`     | BOOLEAN     | Setup step tracker                |
| `preferences_completed`  | BOOLEAN     | Setup step tracker                |
| `profile_completed`      | BOOLEAN     | All setup complete                |
| `created_at`             | TIMESTAMPTZ | Account creation time             |
| `updated_at`             | TIMESTAMPTZ | Last update time                  |

### `messages` Table

Stores chat messages between users.

### `likes` Table

Stores likes/matches between users.

### `passes` Table

Stores when users pass/swipe left on profiles.

---

## 🔧 How the Auto-Signup Works

When a user signs up:

1. **Expo app** calls `supabase.auth.signUp()` with email, password, and metadata
2. **Supabase** creates user in `auth.users` table
3. **Database trigger** (`on_auth_user_created`) automatically:
   - ✅ Sets `email_confirmed_at = NOW()` (auto-verifies email)
   - ✅ Creates a profile in `profiles` table
   - ✅ Extracts `first_name` and `user_type` from signup metadata
   - ✅ Auto-assigns gender based on user_type
4. **User gets an active session immediately** - no email verification needed!

---

## 🧪 Testing & Debugging

### Check if a user was created correctly:

```sql
-- View all users
SELECT
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- View all profiles
SELECT
  id,
  email,
  first_name,
  user_type,
  gender,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
```

### Manually verify a user (if needed):

```sql
SELECT * FROM manual_verify_user('user@example.com');
```

### Delete test users:

```sql
-- ⚠️ CAREFUL - This deletes everything for a user
DELETE FROM auth.users WHERE email = 'test@example.com';
-- Profile will be auto-deleted due to CASCADE
```

---

## 🐛 Common Issues & Solutions

### Issue: Network request failed

**Solution:**

- Make sure `.env` file has correct Supabase URL and key
- Restart Expo with cache clear: `npx expo start --clear`

### Issue: "Email not confirmed" error

**Solution:**

- Make sure you **disabled email confirmations** in Supabase settings (Step 2)
- Run the SQL setup script to add the auto-verification trigger

### Issue: Profile not created after signup

**Solution:**

- Check if trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Re-run the setup SQL script

### Issue: Can't insert/update profile

**Solution:**

- Check RLS policies:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'profiles';
  ```
- Make sure user is authenticated

---

## 📞 Support

If you encounter any issues:

1. Check the console logs in your Expo app
2. Check the Supabase logs: **Dashboard** → **Logs** → **Postgres Logs**
3. Verify your `.env` file has correct credentials

---

## ✅ Checklist

- [ ] Disabled email confirmations in Supabase Settings
- [ ] Ran the complete SQL setup script
- [ ] Verified tables exist in Supabase
- [ ] Cleared Expo cache and restarted
- [ ] Tested signup flow - goes directly to account setup
- [ ] Verified user and profile created in database

---

**🎉 That's it! Your Pinaymate app should now work with auto-verified signups!**
