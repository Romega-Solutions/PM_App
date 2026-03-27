# 🎯 Complete Supabase Setup Checklist

## ⚠️ DO THESE IN ORDER:

### ☑️ Step 1: Enable Email Signup (CRITICAL!)

**Go to Supabase Dashboard now:** https://supabase.com/dashboard/project/dahvxddpirhfxpwmoxol

1. Click **Authentication** (left sidebar)
2. Click **Providers** tab
3. Find **"Email"** provider
4. **ENABLE it** (toggle ON)
5. **DISABLE "Confirm email"** (toggle OFF)
6. Click **Save**

⏰ **This takes 30 seconds - do it now!**

---

### ☑️ Step 2: Run Database Setup SQL

1. Go to: **SQL Editor** in Supabase
2. Click **"+ New Query"**
3. Open this file in VS Code: `supabase/migrations/00_complete_database_setup.sql`
4. **Copy ALL the content** (Ctrl+A, Ctrl+C)
5. **Paste into SQL Editor**
6. Click **Run** (or Ctrl+Enter)
7. Wait for ✅ "Success. No rows returned"

This creates:

- ✅ `profiles` table
- ✅ `messages` table
- ✅ `likes` table
- ✅ `passes` table
- ✅ Auto-profile creation trigger
- ✅ Auto-email verification trigger

---

### ☑️ Step 3: (Optional) Clean Up Test User

If you already tried signing up, delete the test user:

1. Go to **SQL Editor** in Supabase
2. Open this file: `supabase/migrations/cleanup_test_users.sql`
3. Copy and run it
4. This deletes `kenpatrickgarcia123@gmail.com` user

---

### ☑️ Step 4: Verify Everything Works

Run this in SQL Editor to check:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'messages', 'likes', 'passes');

-- Check if trigger exists
SELECT tgname
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

You should see:

- ✅ 4 tables listed
- ✅ 1 trigger listed

---

### ☑️ Step 5: Restart Your App

```bash
# Stop the current Expo server (Ctrl+C)
# Then run:
npx expo start --clear
```

---

### ☑️ Step 6: Test Signup Flow

1. Open app on your device/emulator
2. Select user type (Filipina or Foreigner)
3. Fill in signup form:
   - First name: Ken
   - Email: kenpatrickgarcia123@gmail.com (or any email)
   - Password: Test1234 (or any password)
4. Click **"Create Account"**

**Expected result:**

- ✅ No errors
- ✅ Immediately redirected to "Basic Info" screen
- ✅ No email verification screen

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ No "Email signups are disabled" error
2. ✅ Signup completes successfully
3. ✅ You see console logs:
   ```
   ✅ Supabase signup successful
   🎉 Account created! Proceeding to account setup...
   ```
4. ✅ App navigates to "Basic Info" screen
5. ✅ User and profile created in database

---

## 🐛 Troubleshooting

### Error: "Email signups are disabled"

→ **You skipped Step 1!** Go enable email provider in Supabase dashboard

### Error: "User already registered"

→ Run the cleanup SQL to delete the test user

### Error: "Network request failed"

→ Check `.env` file and restart Expo with `--clear` flag

### Error: "relation 'profiles' does not exist"

→ Run the database setup SQL (Step 2)

---

## 📁 Files Reference

- **Database setup**: `supabase/migrations/00_complete_database_setup.sql`
- **Cleanup script**: `supabase/migrations/cleanup_test_users.sql`
- **Full instructions**: `SUPABASE_SETUP_INSTRUCTIONS.md`
- **Quick fix guide**: `ENABLE_EMAIL_SIGNUP.md`

---

## ⏱️ Total Time: ~5 minutes

1. Enable email signup: 30 seconds
2. Run SQL setup: 1 minute
3. Clean up test user: 30 seconds
4. Restart app: 1 minute
5. Test signup: 1 minute

**🚀 Start with Step 1 NOW!**
