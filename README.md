# 🌸 PinayMate - Dating App

> React Native dating app connecting Filipino women with foreign men

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run on devices
npm run ios
npm run android
```

---

## 🔧 Environment Setup

Create `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://apqrumcmvgyjoklzbmti.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Add `.env` to `.gitignore`

---

## 🏗️ Tech Stack

- **Framework:** React Native + Expo SDK 54+
- **Router:** expo-router (file-based)
- **Styling:** NativeWind (Tailwind CSS)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State:** Zustand

---

## 📁 Project Structure

```
app/
  (auth)/           # Auth screens (signup, verify, signin)
  (main)/           # Main app (discover, likes, messages, profile)
  (modals)/         # Modal screens (filters)

src/
  components/       # Reusable UI components
  features/         # Feature logic (auth, account, profile, messaging)
  config/           # Supabase config, deep linking
  stores/           # Zustand stores

supabase/
  migrations/       # Database SQL setup
```

---

## 🔐 Auth Flow

1. **User Type Selection** → Filipina or Foreign Man
2. **Sign Up** → Email + Password
3. **Email Verification** → Verify via email link (or skip)
4. **Account Setup** → Complete profile (photos, location, preferences)
5. **Main App** → Discover, match, chat

**Features:**

- Email verification with deep linking
- Skip verification option
- Auto sign-out before signup to prevent conflicts
- Session persistence with AsyncStorage

---

## 🗄️ Database Tables

```sql
profiles          # User profiles (extends auth.users)
photos            # Profile photos
swipes            # Like/pass actions
matches           # Mutual likes
conversations     # Chat threads
messages          # Chat messages
```

**Auto-match trigger:** Creates match when both users like each other

---

## 💬 Real-Time Features

- Live messaging with typing indicators
- Online presence tracking
- Match notifications
- Read receipts

---

## 📸 File Uploads

- **Profile Photos:** Max 6 photos, auto-resize to 1080px, generate thumbnails
- **Chat Media:** Images, GIFs
- **Storage:** Supabase Storage

---

## ✅ Current Status

✅ Complete auth system with email verification  
✅ Account setup flow (basic info, photos, location, preferences)  
✅ Swipe/match system  
✅ Real-time messaging  
✅ Profile management

---

## 🔗 Deep Linking

- **Development:** `exp://192.168.1.2:8081/--/(auth)/verification-success`
- **Production:** `pinaymate://(auth)/verification-success`

---

## 📚 Documentation

All documentation lives under [`docs/`](docs/README.md). Setup guides:

- `docs/setup/SUPABASE_SETUP_INSTRUCTIONS.md` - Database setup guide
- `docs/setup/EMAIL_VERIFICATION_SETUP.md` - Email verification config
- `docs/setup/REDIRECT_URLS_QUICK.md` - Deep linking setup
- `docs/setup/SETUP_CHECKLIST.md` - Complete setup steps
- `docs/design/DESIGN_SYSTEM_AUDIT_2026-06-01.md` - Design system / theme audit

---

**Built with ❤️ for connecting hearts across borders**
