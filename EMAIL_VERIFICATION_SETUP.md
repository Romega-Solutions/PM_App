# 📧 Email Verification Setup with Redirect URLs

## 🔗 Your Redirect URLs for Supabase

### For Development (Expo Go):

```
exp://192.168.1.2:8081/--/(auth)/verification-success
```

**Note:** The IP address `192.168.1.2` is your computer's local IP. It changes based on your network.

### For Production (After Build):

```
pinaymate://(auth)/verification-success
```

---

## ⚙️ Supabase Dashboard Setup Steps

### 1️⃣ Enable Email Provider

1. Go to: https://supabase.com/dashboard/project/dahvxddpirhfxpwmoxol
2. Click **Authentication** → **Providers**
3. Find **"Email"** and **ENABLE** it
4. **ENABLE "Confirm email"** (we want email verification!)
5. Click **Save**

### 2️⃣ Add Redirect URLs

1. In Supabase Dashboard, go to: **Authentication** → **URL Configuration**
2. In **"Redirect URLs"** section, click **"Add URL"**
3. Add these URLs (one at a time):

   **For Expo Go (Development):**

   ```
   exp://*
   ```

   **For Production:**

   ```
   pinaymate://*
   ```

   **Localhost (for testing):**

   ```
   http://localhost:3000/*
   ```

4. Your **Site URL** should be:

   ```
   http://localhost:3000
   ```

5. Click **Save changes**

---

## 📱 Your Redirect URLs Screenshot

Based on your screenshot, configure it like this:

```
┌─────────────────────────────────────────┐
│ Site URL                                │
│ http://localhost:3000                   │ ← Change this
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Redirect URLs                           │
│ • exp://*                               │
│ • pinaymate://*                         │
│ • http://localhost:3000/*               │
└─────────────────────────────────────────┘
```

---

## 🗄️ Run Database Setup SQL

1. Go to: **SQL Editor** in Supabase
2. Click **"+ New Query"**
3. Copy the **entire file**: `supabase/migrations/00_complete_database_setup.sql`
4. Paste and click **Run**

**What this does:**

- ✅ Creates `profiles` table
- ✅ Creates trigger to create profile AFTER email is verified
- ✅ Sets up messages, likes, passes tables
- ✅ Configures security policies

---

## 🧪 Testing the Email Flow

### Step 1: Sign Up

1. Restart Expo: `npx expo start --clear`
2. Select user type (Filipina or Foreigner)
3. Fill in signup form
4. Click "Create Account"
5. You should see: "Verification email sent"

### Step 2: Check Email

1. Open your email inbox
2. Look for email from Supabase
3. Click the verification link

### Step 3: Redirect Back to App

**Expected behavior:**

- ✅ Link opens in browser
- ✅ Browser redirects to your Expo app
- ✅ App navigates to verification-success screen
- ✅ Profile is created in database

---

## 🔍 Verify It Works

After clicking the email link, run this in Supabase SQL Editor:

```sql
-- Check if user was verified
SELECT
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users
WHERE email = 'kenpatrickgarcia123@gmail.com';

-- Check if profile was created
SELECT
  id,
  email,
  first_name,
  user_type,
  gender,
  created_at
FROM public.profiles
WHERE email = 'kenpatrickgarcia123@gmail.com';
```

You should see:

- ✅ User with `email_confirmed_at` filled
- ✅ Profile created with correct data

---

## 📱 How the Flow Works

```
1. User signs up
   ↓
2. Supabase sends verification email
   ↓
3. User clicks link in email
   ↓
4. Supabase verifies email
   ↓
5. Database trigger creates profile
   ↓
6. User redirected to: exp://192.168.1.2:8081/--/(auth)/verification-success
   ↓
7. App opens verification-success screen
   ↓
8. User continues to account setup
```

---

## 🐛 Troubleshooting

### Issue: "Email signups are disabled"

**Fix:** Enable Email provider in Supabase (Step 1 above)

### Issue: Email link doesn't open app

**Fix:**

- Make sure you added redirect URLs in Supabase
- Restart Expo with `--clear` flag
- On iOS: Deep links work automatically
- On Android: May need to enable deep linking in device settings

### Issue: Profile not created after verification

**Fix:**

- Check if database setup SQL was run
- Check trigger exists:
  ```sql
  SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```

### Issue: "Invalid redirect URL"

**Fix:**

- Add `exp://*` to Redirect URLs in Supabase
- Make sure wildcard `*` is included

---

## 📋 Complete Checklist

- [ ] Enabled Email provider in Supabase
- [ ] Enabled "Confirm email" setting
- [ ] Set Site URL to `http://localhost:3000`
- [ ] Added redirect URLs: `exp://*`, `pinaymate://*`, `http://localhost:3000/*`
- [ ] Ran database setup SQL
- [ ] Deleted test user (if needed)
- [ ] Restarted Expo with `--clear`
- [ ] Tested signup → email → verification flow

---

## 🎯 Final Result

**When working correctly:**

1. ✅ User signs up → sees "Check your email" screen
2. ✅ User receives verification email
3. ✅ User clicks link → app opens automatically
4. ✅ User sees "Email verified!" screen
5. ✅ User continues to account setup
6. ✅ Profile is created in database

**🚀 You're ready to go!**
