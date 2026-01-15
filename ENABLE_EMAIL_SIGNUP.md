# 🚨 URGENT: Enable Email Signup in Supabase

## ❌ Current Error

```
AuthApiError: Email signups are disabled
```

## ✅ Fix This NOW:

### Step 1: Enable Email Provider

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/dahvxddpirhfxpwmoxol
2. Click **Authentication** (left sidebar)
3. Click **Providers** tab
4. Find **"Email"** in the list
5. Click to **enable it** (toggle should be ON/green)

### Step 2: Disable Email Confirmation

1. While still in **Authentication** → **Providers** → **Email**
2. Scroll down to find **"Confirm email"** setting
3. **TURN OFF** the "Confirm email" toggle
4. Click **Save** button

### Step 3: Verify Settings

Your Email provider settings should look like this:

- ✅ **Email provider: ENABLED** (green/on)
- ❌ **Confirm email: DISABLED** (off)
- ✅ **Autoconfirm: ON** (if available)

### Step 4: Run the Database Setup SQL

After enabling email signup, run this SQL in your Supabase SQL Editor:

1. Go to: **SQL Editor** tab
2. Click **"+ New Query"**
3. Copy the **entire file**: `supabase/migrations/00_complete_database_setup.sql`
4. Paste and click **Run**

This will:

- Create all tables (profiles, messages, likes, passes)
- Set up auto-profile creation trigger
- Auto-confirm emails on signup

### Step 5: Test Signup Again

1. Stop your Expo server (Ctrl+C)
2. Restart with cache clear:
   ```bash
   npx expo start --clear
   ```
3. Try signing up again!

---

## 🎯 Expected Result

After these fixes, when you sign up:

- ✅ No "Email signups are disabled" error
- ✅ Account created immediately
- ✅ Profile auto-created in database
- ✅ Redirected to account setup (no email verification screen)

---

## 🐛 If You Still Get Errors

### "User already registered"

Delete the test user in Supabase:

```sql
DELETE FROM auth.users WHERE email = 'kenpatrickgarcia123@gmail.com';
```

### "Network request failed"

Check your `.env` file has correct values:

```
EXPO_PUBLIC_SUPABASE_URL=https://dahvxddpirhfxpwmoxol.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then restart Expo with cache clear.

---

## 📸 Visual Guide

### Email Provider Location:

```
Supabase Dashboard
  └─ Authentication (sidebar)
      └─ Providers (tab)
          └─ Email (click to expand)
              ├─ [Toggle] Enable Email provider ← TURN ON
              └─ [Toggle] Confirm email ← TURN OFF
```

---

**🚀 Do these steps now and your signup will work!**
