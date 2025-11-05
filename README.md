# 🏗️ PinayMate - Development Guide

> Dating app connecting Filipino women with foreign men using React Native + Supabase

---

## 🎯 Tech Stack

**Frontend:**

- React Native (Expo SDK 54+)
- TypeScript
- Expo Router (file-based routing)
- NativeWind (Tailwind CSS)
- React Query (data fetching)
- Zustand (state management)

**Backend:**

- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Row Level Security (RLS)
- Edge Functions (Deno)

---

## 📁 Project Structure

```
Pinaymate/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth flow (signup, signin, verify)
│   ├── (main)/                   # Main app (discover, likes, messages, profile)
│   └── (modals)/                 # Modal screens (filters, report, premium)
│
├── src/
│   ├── components/               # Reusable UI components
│   ├── features/                 # Feature-specific logic
│   │   ├── auth/                 # Auth (hooks, screens, api)
│   │   ├── account/              # Account setup (hooks, screens, api)
│   │   └── profile/              # Profile management
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API services
│   ├── config/                   # Config (supabase, deepLinking)
│   ├── utils/                    # Utilities & helpers
│   └── types/                    # TypeScript types
│
├── supabase/
│   ├── migrations/               # Database migrations
│   └── functions/                # Edge Functions
│
└── assets/                       # Images, fonts, icons
```

---

## 🗄️ Database Schema (Core Tables)

```sql
-- Profiles (extends auth.users)
profiles (id, email, first_name, last_name, date_of_birth, gender, bio,
          location_city, latitude, longitude, user_type, is_verified,
          age_min, age_max, distance_max, last_active_at)

-- Photos
photos (id, user_id, url, thumbnail_url, position, is_primary, is_verified)

-- Swipes (likes/passes)
swipes (id, swiper_id, swiped_id, action) -- action: 'like', 'pass', 'superlike'

-- Matches (mutual likes)
matches (id, user1_id, user2_id, match_score, is_active)

-- Messages
messages (id, conversation_id, sender_id, content, message_type,
          media_url, read_at, created_at)

-- Conversations
conversations (id, match_id, participant1_id, participant2_id,
               last_message, last_message_at)
```

**Auto-Match Trigger:**

```sql
-- Creates match automatically when mutual like detected
CREATE TRIGGER check_mutual_like_trigger
  AFTER INSERT ON swipes
  FOR EACH ROW EXECUTE FUNCTION check_mutual_like();
```

---

## 🧠 Matching Algorithm

**Scoring System (0-100):**

- Location Score (25%) - Distance-based decay
- Age Score (15%) - Age preference match
- Interests Score (30%) - Jaccard similarity
- Activity Score (10%) - Recent user activity
- Preference Score (20%) - Gender/orientation match

```typescript
// Weighted formula:
totalScore =
  locationScore * 0.25 +
  ageScore * 0.15 +
  interestsScore * 0.3 +
  activityScore * 0.1 +
  preferenceScore * 0.2;
```

---

## 🔐 Authentication Flow

1. **User Type Selection** → Choose "Filipina" or "Foreign Man"
2. **Sign Up** → Email + Password + Basic Info
3. **Email Verification** → Click link in email
4. **Account Setup** → Complete profile (photos, location, preferences)
5. **Session Persisted** → AsyncStorage + Supabase session

**Key Features:**

- Email/password auth
- Social login (Google, Apple)
- Password reset
- Email verification required
- Auto-logout on token expiry

---

## 🔌 Real-Time Features

**WebSocket Subscriptions:**

```typescript
// Real-time messages
subscribeToMessages(conversationId, onNewMessage);

// Real-time matches
subscribeToMatches(userId, onNewMatch);

// Online presence
trackPresence(userId);

// Typing indicators
subscribeToTyping(conversationId, onTypingChange);
```

---

## 📦 File Upload

**Profile Photos:**

- Max 6 photos per user
- Auto-resize to 1080px width
- Generate thumbnails (300x300)
- Compress to 80% quality
- Store in Supabase Storage

**Chat Media:**

- Images (JPEG, PNG)
- GIFs
- Audio messages (future)

---

## 🚀 Development Commands

```bash
# Start development
npm start

# Run on devices
npm run ios
npm run android

# Build for production
eas build --platform all --profile production

# Publish OTA update
eas update --branch production

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 📊 Key Features Implemented

✅ **Auth System:**

- Sign up with email verification
- User type selection (Filipina/Foreign)
- Session persistence with AsyncStorage
- Deep linking for email verification

✅ **Account Setup Flow:**

- Basic info (name, age, gender)
- Profile photos (upload, reorder, delete)
- Location selection
- Preferences (age range, distance)
- Interests/hobbies

✅ **Matching System:**

- Swipe cards (like/pass/superlike)
- Multi-factor scoring algorithm
- Auto-match on mutual like
- Match notifications

✅ **Messaging:**

- Real-time chat
- Typing indicators
- Read receipts
- Image sharing
- Conversation list

---

## 🔒 Security

**Row Level Security (RLS):**

- Users can only view active profiles
- Users can only edit their own data
- Messages restricted to conversation participants
- Photo moderation status enforced

**Input Validation:**

- Yup schema validation
- XSS prevention (sanitize inputs)
- Rate limiting on API calls
- Secure storage for tokens

---

## 🚧 TODO / Roadmap

- [ ] Video profile verification
- [ ] In-app purchases (premium features)
- [ ] Push notifications
- [ ] Voice/video calls
- [ ] Advanced filters
- [ ] Block/report users
- [ ] Admin dashboard
- [ ] Analytics dashboard

---

## 📱 Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup Supabase
# - Create project at supabase.com
# - Copy .env.example to .env
# - Add SUPABASE_URL and SUPABASE_ANON_KEY

# 3. Run migrations
supabase db push

# 4. Start development
npm start
```

---

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ by PinayMate Team**
