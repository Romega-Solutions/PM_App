# ✅ FINAL SETUP - Email Verification Flow

## 🎯 How It Works Now

### User Journey:

```
1. User signs up
   ↓
2. User sees "Verify Email" screen (stays in app)
   ↓
3. User checks email and clicks verification link
   ↓
4. Link opens → Browser redirects back to app
   ↓
5. App shows "Email Verified!" screen
   ↓
6. Database trigger creates profile automatically
   ↓
7. User continues to "Account Setup" (Basic Info)
```

---

## ⚙️ Supabase Configuration

### 1. Enable Email Provider & Verification

Go to: **Authentication** → **Providers** → **Email**

- ✅ **ENABLE** Email provider
- ✅ **ENABLE** "Confirm email"
- Click **Save**

### 2. Add Redirect URLs

Go to: **Authentication** → **URL Configuration**

**Site URL:**

```
http://localhost:3000
```

**Redirect URLs (add these 3):**

```
exp://*
pinaymate://*
http://localhost:3000/*
```

---

## 🗄️ Database Setup

Run this SQL in Supabase SQL Editor:

**Copy from:** `supabase/migrations/00_complete_database_setup.sql`

**What it does:**

- ✅ Creates `profiles` table
- ✅ Creates trigger that runs when user's email is verified
- ✅ Trigger creates profile with data from signup metadata
- ✅ Sets up messages, likes, passes tables
- ✅ Configures security policies

**Important:** The trigger now runs **BOTH** on:

1. User insert (if email already confirmed)
2. User update (when email_confirmed_at changes from NULL to a timestamp)

This ensures profile is created as soon as email is verified!

---

## 🧪 Testing Flow

### Step 1: Sign Up

```bash
npx expo start --clear
```

1. Select user type
2. Fill signup form
3. Click "Create Account"
4. ✅ Should navigate to **"Verify Email"** screen
5. ✅ Console shows: "📧 Email not verified yet"

### Step 2: Check Email

1. Open your email inbox
2. Find Supabase verification email
3. Click the verification link

### Step 3: Verify in App

1. ✅ Browser opens and redirects to app
2. ✅ App shows **"Email Verified!"** screen
3. ✅ After 2 seconds, navigates to **"Basic Info"** screen
4. ✅ Profile created in database

---

## 🔍 Verify Database

After clicking email link, run this in Supabase SQL Editor:

```sql
-- Check user verification
SELECT
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users
WHERE email = 'your-email@example.com';

-- Check profile creation
SELECT
  id,
  email,
  first_name,
  user_type,
  gender,
  basic_info_completed,
  created_at
FROM public.profiles
WHERE email = 'your-email@example.com';
```

**Expected:**

- ✅ User has `email_confirmed_at` timestamp
- ✅ Profile exists with correct data
- ✅ `basic_info_completed` is `false` (not filled yet)

---

## 📱 App Flow Details

### verify-email Screen:

- Shows "Check your email" message
- Has "Resend email" button
- Has "I've verified in Supabase - Sign In" button (for manual testing)
- Polls every 5 seconds to check if email verified

### verification-success Screen:

- Shows "Email Verified!" message
- Checks if profile exists
- If no profile, creates it
- Checks which setup step is incomplete
- Auto-redirects to first incomplete step after 2 seconds

### account-setup/basic-info Screen:

- First step after email verification
- User fills: First Name, Last Name, Age
- Gender auto-assigned based on user_type
- Saves to `profiles` table
- Sets `basic_info_completed = true`
- Continues to next step (photos)

---

## 🐛 Troubleshooting

### Issue: "Email signups are disabled"

**Fix:** Enable Email provider in Supabase (Step 1)

### Issue: Email doesn't redirect back to app

**Fix:**

- Add `exp://*` to redirect URLs
- Restart Expo with `--clear`
- Make sure app is running when you click link

### Issue: Profile not created after verification

**Fix:**

- Re-run the database setup SQL
- Check triggers exist:

```sql
SELECT tgname FROM pg_trigger WHERE tgname IN ('on_auth_user_created', 'on_auth_user_verified');
```

### Issue: Goes directly to account setup without email

**Fix:**

- This means email confirmation is disabled
- Enable it in Supabase: Authentication → Providers → Email → Confirm email = ON

---

## 📋 Complete Checklist

- [ ] Enabled Email provider in Supabase
- [ ] **ENABLED** "Confirm email" setting
- [ ] Set Site URL to `http://localhost:3000`
- [ ] Added redirect URLs: `exp://*`, `pinaymate://*`, `http://localhost:3000/*`
- [ ] Ran complete database setup SQL
- [ ] Verified triggers exist (2 triggers)
- [ ] Deleted any test users
- [ ] Restarted Expo with `--clear`
- [ ] Tested: signup → verify-email screen → check email → click link → app opens → verification-success → basic-info

---

## 🎉 Success Indicators

You'll know everything works when:

1. ✅ Signup navigates to **verify-email screen** (not directly to account setup)
2. ✅ Email arrives in inbox
3. ✅ Click link → app opens automatically
4. ✅ **verification-success screen** shows briefly
5. ✅ Auto-redirects to **basic-info screen**
6. ✅ Profile exists in database with correct data

---

**🚀 Your email verification flow is now complete!**
