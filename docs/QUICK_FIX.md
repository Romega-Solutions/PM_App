# Quick Fix: Verify User Manually in Supabase

## 🚀 **Steps to Manually Verify a User:**

### 1. Open Supabase SQL Editor

- Go to https://supabase.com/dashboard
- Select your project
- Click **SQL Editor** in the left sidebar
- Click **New Query**

### 2. Run This SQL Command

```sql
-- Replace with your actual email
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE
  email = 'kenpatrickag21@gmail.com'
  AND email_confirmed_at IS NULL;

-- Verify it worked
SELECT
  id,
  email,
  email_confirmed_at,
  'User is now verified!' as status
FROM auth.users
WHERE email = 'kenpatrickag21@gmail.com';
```

### 3. In Your App - TWO OPTIONS:

#### Option A: **Automatic Detection** (RECOMMENDED)

- Just wait 5-10 seconds after running the SQL
- The app auto-checks every 5 seconds
- It will automatically detect verification and advance!

#### Option B: **Manual Check Button**

- Click the **"🔄 Check if verified manually"** button
- App will detect you're verified
- Enter your password when prompted
- Continue to verification-success!

## ✅ **What This Does:**

1. Sets `email_confirmed_at` to current timestamp
2. Marks the user as verified in Supabase
3. App automatically detects it (auto-polling every 5 seconds)
4. Or you can manually trigger check with the button

## 📝 **Note:**

This is only needed for development testing with Expo Go. In production builds, email verification links will work automatically.

---

## Alternative: Check All Users

```sql
-- See all users and their verification status
SELECT
  id,
  email,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Verified'
    ELSE '❌ Not Verified'
  END as status,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```
