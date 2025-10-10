# 🏗️ PinayMate - Complete Architecture & Development Guide

> **Full-Stack Development Blueprint** • From concept to production deployment with best practices and scalable architecture.

---

## 📋 Table of Contents

1. [Tech Stack Decision Tree](#tech-stack-decision-tree)
2. [Project Structure & File Organization](#project-structure--file-organization)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Database Design](#database-design)
6. [Matching Algorithm](#matching-algorithm)
7. [Real-Time Features](#real-time-features)
8. [Authentication & Security](#authentication--security)
9. [File Storage & CDN](#file-storage--cdn)
10. [API Design](#api-design)
11. [State Management](#state-management)
12. [UI/UX Implementation](#uiux-implementation)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Pipeline](#deployment-pipeline)
15. [Monitoring & Analytics](#monitoring--analytics)
16. [Development Workflow](#development-workflow)

---

## 🎯 Tech Stack Decision Tree

### **Backend Stack (Recommended)**

```
Option A: Node.js + Express (Recommended for Solo Dev)
├── Runtime: Node.js 20 LTS
├── Framework: Express.js / Fastify
├── Language: TypeScript
├── Database: PostgreSQL 15+ (Primary)
├── Cache: Redis 7+
├── ORM: Prisma / Drizzle ORM
├── Real-time: Socket.io / Supabase Realtime
└── File Storage: AWS S3 / Cloudflare R2

Option B: Supabase (Fastest to MVP)
├── Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
├── Functions: Supabase Edge Functions (Deno)
├── Auth: Built-in Supabase Auth
├── Storage: Supabase Storage
└── Real-time: Supabase Realtime (built-in)

Option C: Firebase (Good for scaling)
├── Backend: Firebase (NoSQL + Auth + Storage + Realtime)
├── Functions: Cloud Functions
├── Database: Firestore
├── Auth: Firebase Auth
└── Storage: Firebase Storage

**RECOMMENDATION: Start with Supabase for MVP, migrate to custom Node.js later if needed**
```

### **Frontend Stack (Already Decided)**

```
✅ React Native (Expo SDK 54+)
✅ TypeScript
✅ Expo Router (File-based routing)
✅ NativeWind (Tailwind CSS)
✅ React Native Reanimated
✅ Expo Image (optimized images)
✅ React Query / TanStack Query (data fetching)
```

### **Why Supabase for Solo Developer?**

1. **Built-in Auth** - No need to build from scratch
2. **PostgreSQL** - Production-ready relational database
3. **Real-time subscriptions** - WebSocket built-in
4. **Row Level Security** - Database-level security
5. **Storage** - File uploads handled
6. **Edge Functions** - Serverless functions
7. **Free tier** - Generous limits for development

---

## 📁 Project Structure & File Organization

### **Complete Project Structure**

```
pinaymate-monorepo/
│
├── apps/
│   ├── mobile/                          # React Native App
│   │   ├── app/                         # Expo Router structure
│   │   │   ├── _layout.tsx              # Root layout
│   │   │   ├── index.tsx                # Entry redirect
│   │   │   ├── +not-found.tsx           # 404 page
│   │   │   │
│   │   │   ├── (auth)/                  # Auth flow group
│   │   │   │   ├── _layout.tsx          # Auth stack
│   │   │   │   ├── welcome.tsx          # Onboarding
│   │   │   │   ├── signin.tsx           # Sign in
│   │   │   │   ├── signup.tsx           # Sign up
│   │   │   │   ├── verify-email.tsx     # Email verification
│   │   │   │   └── forgot-password.tsx  # Password reset
│   │   │   │
│   │   │   ├── (main)/                  # Main app group (protected)
│   │   │   │   ├── _layout.tsx          # Tab navigation
│   │   │   │   ├── (discover)/          # Discover stack
│   │   │   │   │   ├── index.tsx        # Swipe cards
│   │   │   │   │   └── profile/[id].tsx # User profile detail
│   │   │   │   ├── (likes)/             # Likes stack
│   │   │   │   │   ├── index.tsx        # Likes & matches
│   │   │   │   │   └── matches.tsx      # Matched users
│   │   │   │   ├── (messages)/          # Messages stack
│   │   │   │   │   ├── index.tsx        # Chat list
│   │   │   │   │   └── chat/[id].tsx    # Chat screen
│   │   │   │   └── (profile)/           # Profile stack
│   │   │   │       ├── index.tsx        # User profile
│   │   │   │       ├── edit.tsx         # Edit profile
│   │   │   │       ├── settings.tsx     # Settings
│   │   │   │       └── preferences.tsx  # Match preferences
│   │   │   │
│   │   │   └── (modals)/                # Modal screens
│   │   │       ├── _layout.tsx          # Modal stack
│   │   │       ├── filters.tsx          # Search filters
│   │   │       ├── report-user.tsx      # Report modal
│   │   │       └── subscription.tsx     # Premium modal
│   │   │
│   │   ├── src/
│   │   │   ├── components/              # Reusable components
│   │   │   │   ├── ui/                  # Base UI components
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── Avatar.tsx
│   │   │   │   ├── features/            # Feature-specific
│   │   │   │   │   ├── SwipeCard.tsx
│   │   │   │   │   ├── ChatBubble.tsx
│   │   │   │   │   ├── ProfileCard.tsx
│   │   │   │   │   └── MatchModal.tsx
│   │   │   │   └── layout/              # Layout components
│   │   │   │       ├── SafeArea.tsx
│   │   │   │       └── KeyboardAvoid.tsx
│   │   │   │
│   │   │   ├── hooks/                   # Custom React hooks
│   │   │   │   ├── useAuth.ts           # Authentication
│   │   │   │   ├── useMatches.ts        # Matching logic
│   │   │   │   ├── useMessages.ts       # Real-time chat
│   │   │   │   ├── useProfile.ts        # Profile data
│   │   │   │   └── useLocation.ts       # Geolocation
│   │   │   │
│   │   │   ├── lib/                     # Third-party configs
│   │   │   │   ├── supabase.ts          # Supabase client
│   │   │   │   ├── queryClient.ts       # React Query
│   │   │   │   └── analytics.ts         # Analytics setup
│   │   │   │
│   │   │   ├── services/                # API services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── profile.service.ts
│   │   │   │   ├── matching.service.ts
│   │   │   │   ├── message.service.ts
│   │   │   │   └── upload.service.ts
│   │   │   │
│   │   │   ├── utils/                   # Utility functions
│   │   │   │   ├── validation.ts        # Form validation
│   │   │   │   ├── formatting.ts        # Date/text formatters
│   │   │   │   ├── constants.ts         # App constants
│   │   │   │   └── helpers.ts           # Helper functions
│   │   │   │
│   │   │   ├── types/                   # TypeScript types
│   │   │   │   ├── database.types.ts    # Supabase generated
│   │   │   │   ├── api.types.ts         # API types
│   │   │   │   ├── models.types.ts      # Data models
│   │   │   │   └── navigation.types.ts  # Navigation types
│   │   │   │
│   │   │   └── styles/                  # Shared styles
│   │   │       ├── theme.ts             # Theme config
│   │   │       └── animations.ts        # Reanimated configs
│   │   │
│   │   ├── assets/                      # Static assets
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── lottie/                  # Lottie animations
│   │   │
│   │   ├── app.json                     # Expo config
│   │   ├── eas.json                     # EAS config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                             # Web-specific (optional)
│       └── (similar structure to mobile)
│
├── packages/                            # Shared packages (optional)
│   ├── shared-types/                    # Shared TypeScript types
│   ├── shared-utils/                    # Shared utilities
│   └── eslint-config/                   # Shared ESLint config
│
├── supabase/                            # Supabase backend
│   ├── migrations/                      # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_matching.sql
│   │   └── 003_add_messaging.sql
│   │
│   ├── functions/                       # Edge Functions
│   │   ├── calculate-match-score/
│   │   ├── send-notification/
│   │   └── process-verification/
│   │
│   ├── seed/                            # Seed data
│   │   └── seed.sql
│   │
│   └── config.toml                      # Supabase config
│
├── docs/                                # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── .github/                             # GitHub configs
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .vscode/                             # VS Code configs
│   ├── settings.json
│   └── extensions.json
│
├── .gitignore
├── README.md
├── package.json                         # Root package.json
├── turbo.json                           # Turborepo config (optional)
└── pnpm-workspace.yaml                  # pnpm workspaces (optional)
```

---

## 🗄️ Database Design

### **PostgreSQL Schema (Supabase)**

```sql
-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Basic Info
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
  
  -- Profile Details
  bio TEXT,
  occupation TEXT,
  education TEXT,
  location_city TEXT,
  location_country TEXT DEFAULT 'Philippines',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Preferences
  looking_for TEXT[] DEFAULT ARRAY['relationship'],
  interested_in TEXT[] DEFAULT ARRAY['female'],
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 50,
  distance_max INTEGER DEFAULT 50, -- in km
  
  -- Profile Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  
  -- Privacy Settings
  show_age BOOLEAN DEFAULT TRUE,
  show_distance BOOLEAN DEFAULT TRUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  profile_completion INTEGER DEFAULT 0, -- 0-100%
  
  -- Search Optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(bio, '') || ' ' || coalesce(occupation, ''))
  ) STORED
);

-- Index for full-text search
CREATE INDEX profiles_search_idx ON profiles USING GIN (search_vector);
CREATE INDEX profiles_location_idx ON profiles USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX profiles_last_active_idx ON profiles(last_active_at DESC);

-- ============================================
-- PHOTOS TABLE
-- ============================================

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  
  position INTEGER DEFAULT 0, -- Order of photos
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  
  -- Metadata
  width INTEGER,
  height INTEGER,
  mime_type TEXT
);

CREATE INDEX photos_user_idx ON photos(user_id, position);
CREATE INDEX photos_primary_idx ON photos(user_id, is_primary) WHERE is_primary = TRUE;

-- ============================================
-- INTERESTS/HOBBIES
-- ============================================

CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  icon TEXT
);

CREATE TABLE user_interests (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, interest_id)
);

-- ============================================
-- MATCHING SYSTEM
-- ============================================

-- Swipe actions (likes/passes)
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'superlike')),
  
  UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX swipes_swiper_idx ON swipes(swiper_id, created_at DESC);
CREATE INDEX swipes_swiped_idx ON swipes(swiped_id, action);

-- Matches (mutual likes)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  match_score DECIMAL(5, 2), -- Compatibility score 0-100
  
  -- Match metadata
  is_active BOOLEAN DEFAULT TRUE,
  unmatched_by UUID REFERENCES profiles(id),
  unmatched_at TIMESTAMPTZ,
  
  CHECK (user1_id < user2_id), -- Ensure consistent ordering
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX matches_user1_idx ON matches(user1_id, created_at DESC);
CREATE INDEX matches_user2_idx ON matches(user2_id, created_at DESC);
CREATE INDEX matches_active_idx ON matches(is_active) WHERE is_active = TRUE;

-- ============================================
-- MESSAGING SYSTEM
-- ============================================

-- Conversations (derived from matches)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  last_message_at TIMESTAMPTZ,
  last_message TEXT,
  
  -- Participant IDs (denormalized for quick access)
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX conversations_participant1_idx ON conversations(participant1_id, last_message_at DESC);
CREATE INDEX conversations_participant2_idx ON conversations(participant2_id, last_message_at DESC);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif', 'audio')),
  
  -- Media attachments
  media_url TEXT,
  media_thumbnail TEXT,
  
  -- Read status
  read_at TIMESTAMPTZ,
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id, created_at DESC);
CREATE INDEX messages_sender_idx ON messages(sender_id);
CREATE INDEX messages_unread_idx ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- MATCHING ALGORITHM DATA
-- ============================================

-- User activity tracking for algorithm
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  activity_type TEXT NOT NULL,
  metadata JSONB,
  
  -- Examples: 'login', 'profile_view', 'message_sent', 'swipe'
  activity_score DECIMAL(5, 2) -- Used for ranking active users
);

CREATE INDEX user_activity_user_idx ON user_activity(user_id, created_at DESC);
CREATE INDEX user_activity_type_idx ON user_activity(activity_type);

-- Match score factors (for ML/algorithm tuning)
CREATE TABLE match_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Scoring factors (0-100 each)
  location_score DECIMAL(5, 2),
  age_score DECIMAL(5, 2),
  interests_score DECIMAL(5, 2),
  activity_score DECIMAL(5, 2),
  preference_score DECIMAL(5, 2),
  
  -- Overall score
  total_score DECIMAL(5, 2),
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (user1_id < user2_id),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX match_factors_user1_idx ON match_factors(user1_id, total_score DESC);

-- ============================================
-- PREMIUM FEATURES
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'quarterly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Payment info
  stripe_subscription_id TEXT UNIQUE,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD'
);

CREATE INDEX subscriptions_user_idx ON subscriptions(user_id, status);
CREATE INDEX subscriptions_expires_idx ON subscriptions(expires_at);

-- ============================================
-- REPORTING & MODERATION
-- ============================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  reason TEXT NOT NULL,
  description TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

CREATE INDEX reports_reported_idx ON reports(reported_id, status);
CREATE INDEX reports_status_idx ON reports(status, created_at);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'match', 'message', 'like', 'superlike'
  title TEXT NOT NULL,
  body TEXT,
  
  -- Related entities
  related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  related_entity_id UUID, -- match_id, message_id, etc.
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Push notification
  sent_via_push BOOLEAN DEFAULT FALSE
);

CREATE INDEX notifications_user_idx ON notifications(user_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create match when mutual like detected
CREATE OR REPLACE FUNCTION check_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'like' THEN
    -- Check if the other user also liked
    IF EXISTS (
      SELECT 1 FROM swipes
      WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND action IN ('like', 'superlike')
    ) THEN
      -- Create match
      INSERT INTO matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_mutual_like_trigger
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION check_mutual_like();

-- Update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_at = NEW.created_at,
    last_message = SUBSTRING(NEW.content, 1, 100),
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all active profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (account_status = 'active');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Photos: Users can only manage their own photos
CREATE POLICY "Users can view all approved photos"
  ON photos FOR SELECT
  USING (moderation_status = 'approved');

CREATE POLICY "Users can manage own photos"
  ON photos FOR ALL
  USING (auth.uid() = user_id);

-- Messages: Users can only see messages in their conversations
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (conversations.participant1_id = auth.uid() 
          OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
        AND (conversations.participant1_id = auth.uid() 
          OR conversations.participant2_id = auth.uid())
    )
  );

-- Matches: Users can only see their own matches
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Swipes: Users can only create and view their own swipes
CREATE POLICY "Users can manage own swipes"
  ON swipes FOR ALL
  USING (swiper_id = auth.uid());
```

---

## 🧠 Matching Algorithm

### **Multi-Factor Scoring System**

```typescript
// src/services/matching.service.ts

interface MatchScore {
  locationScore: number;
  ageScore: number;
  interestsScore: number;
  activityScore: number;
  preferenceScore: number;
  totalScore: number;
}

interface UserProfile {
  id: string;
  age: number;
  location: { lat: number; lon: number };
  interests: string[];
  lastActiveAt: Date;
  preferences: {
    ageMin: number;
    ageMax: number;
    distanceMax: number;
    interestedIn: string[];
  };
}

/**
 * Calculate compatibility score between two users
 * Returns score from 0-100
 */
export function calculateMatchScore(
  user1: UserProfile,
  user2: UserProfile
): MatchScore {
  const scores = {
    locationScore: calculateLocationScore(user1, user2),
    ageScore: calculateAgeScore(user1, user2),
    interestsScore: calculateInterestsScore(user1, user2),
    activityScore: calculateActivityScore(user1, user2),
    preferenceScore: calculatePreferenceScore(user1, user2),
    totalScore: 0,
  };

  // Weighted average (adjust weights based on importance)
  const weights = {
    location: 0.25,      // 25% - Geographic proximity
    age: 0.15,          // 15% - Age compatibility
    interests: 0.30,    // 30% - Common interests (highest weight)
    activity: 0.10,     // 10% - User activity/engagement
    preference: 0.20,   // 20% - Preference match
  };

  scores.totalScore = 
    scores.locationScore * weights.location +
    scores.ageScore * weights.age +
    scores.interestsScore * weights.interests +
    scores.activityScore * weights.activity +
    scores.preferenceScore * weights.preference;

  return scores;
}

/**
 * Location Score: Based on distance between users
 * Closer = Higher score
 */
function calculateLocationScore(user1: UserProfile, user2: UserProfile): number {
  const distance = calculateDistance(
    user1.location.lat,
    user1.location.lon,
    user2.location.lat,
    user2.location.lon
  );

  const maxDistance = Math.max(
    user1.preferences.distanceMax,
    user2.preferences.distanceMax
  );

  // Linear decay: score decreases as distance increases
  if (distance > maxDistance) return 0;
  
  return Math.max(0, 100 * (1 - distance / maxDistance));
}

/**
 * Age Score: Based on age preference match
 */
function calculateAgeScore(user1: UserProfile, user2: UserProfile): number {
  const user1InRange = 
    user2.age >= user1.preferences.ageMin &&
    user2.age <= user1.preferences.ageMax;

  const user2InRange = 
    user1.age >= user2.preferences.ageMin &&
    user1.age <= user2.preferences.ageMax;

  if (!user1InRange || !user2InRange) return 0;

  // Calculate how close to ideal age range
  const user1Ideal = (user1.preferences.ageMin + user1.preferences.ageMax) / 2;
  const user2Ideal = (user2.preferences.ageMin + user2.preferences.ageMax) / 2;

  const user1Distance = Math.abs(user2.age - user1Ideal);
  const user2Distance = Math.abs(user1.age - user2Ideal);

  const avgDistance = (user1Distance + user2Distance) / 2;
  const maxRange = Math.max(
    user1.preferences.ageMax - user1.preferences.ageMin,
    user2.preferences.ageMax - user2.preferences.ageMin
  );

  return Math.max(0, 100 * (1 - avgDistance / maxRange));
}

/**
 * Interests Score: Based on common interests
 * Uses Jaccard similarity coefficient
 */
function calculateInterestsScore(user1: UserProfile, user2: UserProfile): number {
  const interests1 = new Set(user1.interests);
  const interests2 = new Set(user2.interests);

  const intersection = new Set(
    [...interests1].filter(x => interests2.has(x))
  );
  const union = new Set([...interests1, ...interests2]);

  if (union.size === 0) return 0;

  // Jaccard similarity: intersection / union
  const jaccardScore = intersection.size / union.size;

  // Boost score if they have many common interests
  const commonCount = intersection.size;
  const boost = Math.min(commonCount / 5, 1) * 20; // Up to 20% boost

  return Math.min(100, jaccardScore * 100 + boost);
}

/**
 * Activity Score: Based on recent user activity
 * More active users get higher scores
 */
function calculateActivityScore(user1: UserProfile, user2: UserProfile): number {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const user1DaysInactive = (now.getTime() - user1.lastActiveAt.getTime()) / dayMs;
  const user2DaysInactive = (now.getTime() - user2.lastActiveAt.getTime()) / dayMs;

  const avgDaysInactive = (user1DaysInactive + user2DaysInactive) / 2;

  // Exponential decay: very active = 100, 7 days = 50, 30 days = ~10
  return Math.max(0, 100 * Math.exp(-avgDaysInactive / 7));
}

/**
 * Preference Score: Do both users match each other's looking_for criteria
 */
function calculatePreferenceScore(user1: UserProfile, user2: UserProfile): number {
  // Check gender/orientation match
  const user1InterestedInUser2 = user1.preferences.interestedIn.includes(
    user2.gender || 'other'
  );
  const user2InterestedInUser1 = user2.preferences.interestedIn.includes(
    user1.gender || 'other'
  );

  if (!user1InterestedInUser2 || !user2InterestedInUser1) return 0;

  // If both preferences match, full score
  return 100;
}

/**
 * Haversine formula: Calculate distance between two coordinates
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get recommended profiles for a user
 * Uses efficient SQL queries with scoring
 */
export async function getRecommendedProfiles(
  userId: string,
  limit: number = 20
): Promise<UserProfile[]> {
  // SQL query that pre-filters and scores candidates
  const query = `
    WITH user_prefs AS (
      SELECT 
        age_min, age_max, distance_max, interested_in,
        latitude, longitude,
        EXTRACT(YEAR FROM AGE(date_of_birth)) as user_age
      FROM profiles
      WHERE id = $1
    )
    SELECT DISTINCT p.*,
      -- Calculate distance score
      (
        CASE 
          WHEN earth_distance(
            ll_to_earth(up.latitude, up.longitude),
            ll_to_earth(p.latitude, p.longitude)
          ) / 1000 <= up.distance_max
          THEN 100 * (1 - (earth_distance(
            ll_to_earth(up.latitude, up.longitude),
            ll_to_earth(p.latitude, p.longitude)
          ) / 1000) / up.distance_max)
          ELSE 0
        END
      ) as location_score,
      -- Calculate age score
      (
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(p.date_of_birth)) BETWEEN up.age_min AND up.age_max
          THEN 100
          ELSE 0
        END
      ) as age_score
    FROM profiles p, user_prefs up
    WHERE p.id != $1
      AND p.account_status = 'active'
      AND p.is_verified = true
      -- Must match gender preferences
      AND p.gender = ANY(up.interested_in)
      -- Must be within age range
      AND EXTRACT(YEAR FROM AGE(p.date_of_birth)) BETWEEN up.age_min AND up.age_max
      -- Must be within distance
      AND earth_distance(
        ll_to_earth(up.latitude, up.longitude),
        ll_to_earth(p.latitude, p.longitude)
      ) / 1000 <= up.distance_max
      -- Exclude already swiped users
      AND NOT EXISTS (
        SELECT 1 FROM swipes s
        WHERE s.swiper_id = $1 AND s.swiped_id = p.id
      )
    ORDER BY 
      p.last_active_at DESC,
      location_score DESC
    LIMIT $2
  `;

  // Execute query and calculate full scores in application
  // (Full calculation done client-side for flexibility)
  return executeQuery(query, [userId, limit]);
}
```

---

## 🔌 Real-Time Features

### **WebSocket Implementation with Supabase**

```typescript
// src/lib/realtime.ts

import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Real-time message subscription
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Real-time match notifications
 */
export function subscribeToMatches(
  userId: string,
  onNewMatch: (match: Match) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`matches:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `or(user1_id.eq.${userId},user2_id.eq.${userId})`,
      },
      (payload) => {
        onNewMatch(payload.new as Match);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Online presence tracking
 */
export function trackPresence(userId: string): RealtimeChannel {
  const channel = supabase.channel('online-users', {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  // Track user as online
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Online users:', Object.keys(state));
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      }
    });

  return channel;
}

/**
 * Typing indicators
 */
export function subscribeToTyping(
  conversationId: string,
  onTypingChange: (userId: string, isTyping: boolean) => void
): RealtimeChannel {
  const channel = supabase.channel(`typing:${conversationId}`, {
    config: {
      broadcast: {
        self: false, // Don't receive own broadcasts
      },
    },
  });

  channel
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      onTypingChange(payload.userId, payload.isTyping);
    })
    .subscribe();

  return channel;
}

export function sendTypingIndicator(
  channel: RealtimeChannel,
  userId: string,
  isTyping: boolean
) {
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, isTyping },
  });
}

/**
 * Cleanup function
 */
export async function unsubscribe(channel: RealtimeChannel) {
  await supabase.removeChannel(channel);
}
```

---

## 🔐 Authentication & Security

### **Supabase Auth Implementation**

```typescript
// src/services/auth.service.ts

import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up new user
 */
export async function signUp(data: SignUpData) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
      },
      emailRedirectTo: 'pinaymate://verify-email',
    },
  });

  if (authError) throw authError;

  // 2. Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user!.id,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    date_of_birth: data.dateOfBirth,
    gender: data.gender,
  });

  if (profileError) throw profileError;

  return authData;
}

/**
 * Sign in existing user
 */
export async function signIn(data: SignInData) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw error;

  // Update last active
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', authData.user.id);

  return authData;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // Clear local storage
  await AsyncStorage.clear();
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Social auth (Google, Apple)
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'pinaymate://auth/callback',
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'pinaymate://auth/callback',
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Password reset
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'pinaymate://reset-password',
  });

  if (error) throw error;
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * Email verification check
 */
export async function checkEmailVerification() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email_confirmed_at !== null;
}
```

### **Security Best Practices**

```typescript
// src/utils/security.ts

/**
 * Input validation and sanitization
 */
import * as yup from 'yup';

export const signUpSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('Password is required'),
  firstName: yup
    .string()
    .min(2, 'First name too short')
    .max(50, 'First name too long')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name too short')
    .max(50, 'Last name too long')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters')
    .required('Last name is required'),
  dateOfBirth: yup
    .date()
    .max(new Date(Date.now() - 567648000000), 'Must be at least 18 years old') // 18 years
    .required('Date of birth is required'),
});

/**
 * XSS Prevention: Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Rate limiting for API calls
 */
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute',
});

export async function checkRateLimit(): Promise<boolean> {
  const remainingRequests = await limiter.removeTokens(1);
  return remainingRequests >= 0;
}

/**
 * Secure storage for sensitive data
 */
import * as SecureStore from 'expo-secure-store';

export async function securelyStore(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

export async function securelyRetrieve(key: string) {
  return await SecureStore.getItemAsync(key);
}

export async function securelyDelete(key: string) {
  await SecureStore.deleteItemAsync(key);
}
```

---

## 📦 File Storage & CDN

### **Supabase Storage Setup**

```typescript
// src/services/upload.service.ts

import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(
  userId: string,
  uri: string,
  position: number = 0
): Promise<string> {
  try {
    // 1. Compress and resize image
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }], // Max width 1080px
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2. Read file as base64
    const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 3. Generate unique filename
    const fileName = `${userId}/${Date.now()}-${position}.jpg`;

    // 4. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(data.path);

    // 6. Create thumbnail
    const thumbnailUrl = await createThumbnail(userId, manipulatedImage.uri);

    // 7. Save to database
    await supabase.from('photos').insert({
      user_id: userId,
      url: urlData.publicUrl,
      thumbnail_url: thumbnailUrl,
      storage_path: data.path,
      position,
      is_primary: position === 0,
    });

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Create thumbnail (300x300)
 */
async function createThumbnail(
  userId: string,
  uri: string
): Promise<string> {
  const thumbnail = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 300, height: 300 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(thumbnail.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fileName = `${userId}/thumb_${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete photo
 */
export async function deletePhoto(photoId: string, storagePath: string) {
  // 1. Delete from storage
  const { error: storageError } = await supabase.storage
    .from('profile-photos')
    .remove([storagePath]);

  if (storageError) throw storageError;

  // 2. Delete from database
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (dbError) throw dbError;
}

/**
 * Reorder photos
 */
export async function reorderPhotos(
  userId: string,
  photoIds: string[]
) {
  const updates = photoIds.map((id, index) => ({
    id,
    position: index,
    is_primary: index === 0,
  }));

  const { error } = await supabase
    .from('photos')
    .upsert(updates);

  if (error) throw error;
}

/**
 * Upload chat media
 */
export async function uploadChatMedia(
  conversationId: string,
  uri: string,
  type: 'image' | 'audio'
): Promise<string> {
  const fileName = `${conversationId}/${Date.now()}.${type === 'image' ? 'jpg' : 'mp3'}`;

  let fileData: string;
  if (type === 'image') {
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    fileData = await FileSystem.readAsStringAsync(compressed.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else {
    fileData = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const { data, error } = await supabase.storage
    .from('chat-media')
    .upload(fileName, decode(fileData), {
      contentType: type === 'image' ? 'image/jpeg' : 'audio/mpeg',
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('chat-media')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
```

---

## 🌐 API Design

### **API Routes Structure**

```typescript
// Supabase automatically provides these endpoints via PostgREST:

/**
 * Authentication Endpoints
 */
POST   /auth/v1/signup              // Create new user
POST   /auth/v1/token               // Sign in (get JWT)
POST   /auth/v1/logout              // Sign out
POST   /auth/v1/recover             // Password reset request
PUT    /auth/v1/user                // Update user (password, email)
GET    /auth/v1/user                // Get current user

/**
 * Profile Endpoints
 */
GET    /rest/v1/profiles            // List profiles (with filters)
GET    /rest/v1/profiles?id=eq.{id} // Get specific profile
PATCH  /rest/v1/profiles?id=eq.{id} // Update profile
DELETE /rest/v1/profiles?id=eq.{id} // Delete profile

/**
 * Photos Endpoints
 */
GET    /rest/v1/photos?user_id=eq.{id}              // Get user photos
POST   /rest/v1/photos                               // Upload photo
PATCH  /rest/v1/photos?id=eq.{id}                   // Update photo
DELETE /rest/v1/photos?id=eq.{id}                   // Delete photo

/**
 * Matching Endpoints
 */
GET    /rest/v1/rpc/get_recommended_profiles        // Get match recommendations
POST   /rest/v1/swipes                              // Create swipe (like/pass)
GET    /rest/v1/matches?or=(user1_id.eq.{id},user2_id.eq.{id}) // Get matches
DELETE /rest/v1/matches?id=eq.{id}                  // Unmatch

/**
 * Messaging Endpoints
 */
GET    /rest/v1/conversations?or=(participant1_id.eq.{id},participant2_id.eq.{id}) // Get conversations
GET    /rest/v1/messages?conversation_id=eq.{id}    // Get messages
POST   /rest/v1/messages                            // Send message
PATCH  /rest/v1/messages?id=eq.{id}                 // Mark as read

/**
 * Storage Endpoints
 */
POST   /storage/v1/object/profile-photos/{path}     // Upload file
GET    /storage/v1/object/public/profile-photos/{path} // Get file
DELETE /storage/v1/object/profile-photos/{path}     // Delete file
```

### **Custom API Service Layer**

```typescript
// src/services/api.service.ts

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Match = Database['public']['Tables']['matches']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

/**
 * API Service Class
 * Wraps Supabase queries with type safety and error handling
 */
class ApiService {
  /**
   * Profile APIs
   */
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, photos(*), user_interests(interest:interests(*))')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async searchProfiles(query: string, filters?: any): Promise<Profile[]> {
    let queryBuilder = supabase
      .from('profiles')
      .select('*, photos!inner(*)')
      .eq('account_status', 'active')
      .eq('is_verified', true);

    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query);
    }

    if (filters?.ageMin) {
      queryBuilder = queryBuilder.gte('date_of_birth', 
        new Date(Date.now() - filters.ageMin * 365.25 * 24 * 60 * 60 * 1000).toISOString()
      );
    }

    if (filters?.gender) {
      queryBuilder = queryBuilder.eq('gender', filters.gender);
    }

    const { data, error } = await queryBuilder.limit(50);

    if (error) throw error;
    return data;
  }

  /**
   * Matching APIs
   */
  async getRecommendedProfiles(userId: string, limit: number = 20): Promise<Profile[]> {
    const { data, error } = await supabase.rpc('get_recommended_profiles', {
      user_id: userId,
      limit_count: limit,
    });

    if (error) throw error;
    return data;
  }

  async swipeProfile(swiperId: string, swipedId: string, action: 'like' | 'pass' | 'superlike') {
    const { data, error} = await supabase
      .from('swipes')
      .insert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        action,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMatches(userId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:profiles!user1_id(*,photos(*)),
        user2:profiles!user2_id(*,photos(*))
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async unmatch(matchId: string, userId: string) {
    const { error } = await supabase
      .from('matches')
      .update({
        is_active: false,
        unmatched_by: userId,
        unmatched_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    if (error) throw error;
  }

  /**
   * Messaging APIs
   */
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        match:matches(
          user1:profiles!user1_id(*,photos(*)),
          user2:profiles!user2_id(*,photos(*))
        )
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getMessages(conversationId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*,photos(*))')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.reverse(); // Return oldest first
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'gif' | 'audio' = 'text',
    mediaUrl?: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        media_url: mediaUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null);

    if (error) throw error;
  }

  /**
   * Notifications APIs
   */
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, related_user:profiles(*,photos(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }
}

export const api = new ApiService();
```

---

## 🎨 State Management

### **React Query Setup (Recommended)**

```typescript
// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api.service';

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => api.getProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) =>
      api.updateProfile(userId, updates),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(['profile', variables.userId], data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// src/hooks/useMatches.ts
export function useMatches(userId: string) {
  return useQuery({
    queryKey: ['matches', userId],
    queryFn: () => api.getMatches(userId),
    enabled: !!userId,
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ swiperId, swipedId, action }: any) =>
      api.swipeProfile(swiperId, swipedId, action),
    onSuccess: () => {
      // Invalidate matches to check for new mutual likes
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

// src/hooks/useMessages.ts
export function useConversations(userId: string) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => api.getConversations(userId),
    enabled: !!userId,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.getMessages(conversationId),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, senderId, content, type, mediaUrl }: any) =>
      api.sendMessage(conversationId, senderId, content, type, mediaUrl),
    onSuccess: (data, variables) => {
      // Optimistically update messages
      queryClient.invalidateQueries({ 
        queryKey: ['messages', variables.conversationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['conversations'] 
      });
    },
  });
}
```

### **Global State with Zustand (Optional for UI state)**

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  session: any | null;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      logout: () => set({ user: null, session: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

// src/store/uiStore.ts
interface UIState {
  isLoading: boolean;
  error: string | null;
  filters: any;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: any) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  error: null,
  filters: {},
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
}));
```

---

## 🎨 UI/UX Implementation

### **Core Components**

```typescript
// src/components/ui/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchable = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false 
}: ButtonProps) {
  const baseClasses = 'rounded-full items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-500',
    secondary: 'bg-gray-700',
    outline: 'border-2 border-pink-500',
  };

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <StyledTouchable
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <StyledText 
          className={`text-white font-semibold ${textSizeClasses[size]}`}
        >
          {title}
        </StyledText>
      )}
    </StyledTouchable>
  );
}

// src/components/features/SwipeCard.tsx
import { useRef } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  profile: any;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function SwipeCard({ profile, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) < SWIPE_THRESHOLD) {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else if (event.translationX > 0) {
        // Swipe right (like)
        translateX.value = withSpring(SCREEN_WIDTH + 100);
        runOnJS(onSwipeRight)();
      } else {
        // Swipe left (pass)
        translateX.value = withSpring(-SCREEN_WIDTH - 100);
        runOnJS(onSwipeLeft)();
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = `${(translateX.value / SCREEN_WIDTH) * 25}deg`;
    
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: Math.max(0, translateX.value / SWIPE_THRESHOLD),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: Math.max(0, -translateX.value / SWIPE_THRESHOLD),
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[cardStyle]}
        className="w-full h-[600px] rounded-3xl overflow-hidden bg-gray-800 shadow-2xl"
      >
        <Image
          source={{ uri: profile.photos[0]?.url }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Like overlay */}
        <Animated.View
          style={[likeOpacity]}
          className="absolute top-10 left-10 border-4 border-green-500 rounded-2xl px-6 py-3 rotate-[-15deg]"
        >
          <Text className="text-green-500 text-4xl font-bold">LIKE</Text>
        </Animated.View>

        {/* Nope overlay */}
        <Animated.View
          style={[nopeOpacity]}
          className="absolute top-10 right-10 border-4 border-red-500 rounded-2xl px-6 py-3 rotate-[15deg]"
        >
          <Text className="text-red-500 text-4xl font-bold">NOPE</Text>
        </Animated.View>

        {/* Profile info */}
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <Text className="text-white text-3xl font-bold">
            {profile.first_name}, {profile.age}
          </Text>
          <Text className="text-gray-300 text-lg mt-1">
            {profile.occupation}
          </Text>
          <Text className="text-gray-400 mt-2">
            📍 {profile.location_city} • {profile.distance}km away
          </Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

// src/components/features/ChatBubble.tsx
import { View, Text, Image } from 'react-native';
import { format } from 'date-fns';

interface ChatBubbleProps {
  message: any;
  isOwnMessage: boolean;
}

export function ChatBubble({ message, isOwnMessage }: ChatBubbleProps) {
  return (
    <View
      className={`flex-row mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwnMessage && (
        <Image
          source={{ uri: message.sender.photos[0]?.thumbnail_url }}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
            : 'bg-gray-700'
        }`}
      >
        {message.message_type === 'image' ? (
          <Image
            source={{ uri: message.media_url }}
            className="w-48 h-48 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-white text-base">{message.content}</Text>
        )}
        
        <Text className="text-gray-300 text-xs mt-1">
          {format(new Date(message.created_at), 'p')}
        </Text>
      </View>
    </View>
  );
}
```

### **Screen Implementations**

```typescript
// app/(main)/(discover)/index.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { SwipeCard } from '@/components/features/SwipeCard';
import { useRecommendations } from '@/hooks/useMatches';
import { useSwipe } from '@/hooks/useMatches';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function DiscoverScreen() {
  const { user } = useAuthStore();
  const { data: profiles, isLoading } = useRecommendations(user?.id);
  const swipeMutation = useSwipe();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = profiles?.[currentIndex];

  const handleSwipeLeft = () => {
    if (currentProfile) {
      swipeMutation.mutate({
        swiperId: user.id,
        swipedId: currentProfile.id,
        action: 'pass',
      });
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentProfile) {
      swipeMutation.mutate({
        swiperId: user.id,
        swipedId: currentProfile.id,
        action: 'like',
      });
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSuperLike = () => {
    if (currentProfile) {
      swipeMutation.mutate({
        swiperId: user.id,
        swipedId: currentProfile.id,
        action: 'superlike',
      });
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg">Finding matches...</Text>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-2xl font-bold">No more profiles</Text>
        <Text className="text-gray-400 mt-2">Check back later!</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900 pt-safe">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-white">Discover</Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Swipe cards */}
      <View className="flex-1 items-center justify-center px-6">
        <SwipeCard
          profile={currentProfile}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>

      {/* Action buttons */}
      <View className="px-6 py-8 flex-row items-center justify-center gap-6">
        <TouchableOpacity
          onPress={handleSwipeLeft}
          className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center shadow-lg"
        >
          <Ionicons name="close" size={32} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSuperLike}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 items-center justify-center shadow-xl"
        >
          <Ionicons name="star" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSwipeRight}
          className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center shadow-lg"
        >
          <Ionicons name="heart" size={32} color="#22c55e" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// app/(main)/(messages)/chat/[id].tsx
import { View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ChatBubble } from '@/components/features/ChatBubble';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';
import { subscribeToMessages } from '@/lib/realtime';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { data: messages, refetch } = useMessages(conversationId as string);
  const sendMutation = useSendMessage();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = subscribeToMessages(
      conversationId as string,
      (newMessage) => {
        refetch();
        flatListRef.current?.scrollToEnd();
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMutation.mutate({
        conversationId: conversationId as string,
        senderId: user.id,
        content: inputText.trim(),
        type: 'text',
      });
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isOwnMessage={item.sender_id === user.id}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input bar */}
      <View className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex-row items-center gap-3">
        <TouchableOpacity className="p-2">
          <Ionicons name="add-circle-outline" size={28} color="#8B5CF6" />
        </TouchableOpacity>

        <TextInput
          className="flex-1 bg-gray-700 rounded-full px-4 py-3 text-white"
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          onPress={handleSend}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 items-center justify-center"
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
```

---

## 🧪 Testing Strategy

### **Testing Setup**

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

```typescript
// __tests__/matching.test.ts
import { calculateMatchScore } from '@/services/matching.service';

describe('Matching Algorithm', () => {
  it('should calculate correct location score', () => {
    const user1 = {
      id: '1',
      age: 25,
      location: { lat: 14.5995, lon: 120.9842 }, // Manila
      interests: ['travel', 'food'],
      lastActiveAt: new Date(),
      preferences: {
        ageMin: 21,
        ageMax: 30,
        distanceMax: 50,
        interestedIn: ['female'],
      },
    };

    const user2 = {
      ...user1,
      id: '2',
      location: { lat: 14.6091, lon: 121.0223 }, // Makati (nearby)
    };

    const score = calculateMatchScore(user1, user2);
    expect(score.locationScore).toBeGreaterThan(80);
  });

  it('should return 0 for users outside distance range', () => {
    const user1 = {
      location: { lat: 14.5995, lon: 120.9842 },
      preferences: { distanceMax: 10 },
    };

    const user2 = {
      location: { lat: 16.4023, lon: 120.5960 }, // Baguio (~200km)
      preferences: { distanceMax: 10 },
    };

    const score = calculateMatchScore(user1 as any, user2 as any);
    expect(score.locationScore).toBe(0);
  });
});

// __tests__/components/SwipeCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeCard } from '@/components/features/SwipeCard';

describe('SwipeCard', () => {
  it('renders profile information correctly', () => {
    const profile = {
      id: '1',
      first_name: 'Maria',
      age: 25,
      occupation: 'Engineer',
      photos: [{ url: 'https://example.com/photo.jpg' }],
    };

    const { getByText } = render(
      <SwipeCard
        profile={profile}
        onSwipeLeft={jest.fn()}
        onSwipeRight={jest.fn()}
      />
    );

    expect(getByText('Maria, 25')).toBeTruthy();
    expect(getByText('Engineer')).toBeTruthy();
  });
});
```

---

## 🚀 Deployment Pipeline

### **EAS Configuration**

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "123456789",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "production"
      }
    }
  },
  "update": {
    "development": {
      "channel": "development"
    },
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

### **GitHub Actions CI/CD**

```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build on EAS
        if: github.ref == 'refs/heads/main'
        run: eas build --platform all --non-interactive --no-wait
```

### **Deployment Steps**

```bash
# 1. Build for production
eas build --platform all --profile production

# 2. Submit to stores
eas submit --platform ios
eas submit --platform android

# 3. Publish OTA update
eas update --branch production --message "Bug fixes and improvements"

# 4. Deploy web version
npx expo export --platform web
vercel --prod dist/
```

---

## 📊 Monitoring & Analytics

### **Analytics Setup**

```typescript
// src/lib/analytics.ts
import * as Analytics from 'expo-firebase-analytics';

export const analytics = {
  logEvent: async (name: string, params?: any) => {
    await Analytics.logEvent(name, params);
  },

  logScreenView: async (screenName: string) => {
    await Analytics.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName,
    });
  },

  setUserId: async (userId: string) => {
    await Analytics.setUserId(userId);
  },

  setUserProperties: async (properties: any) => {
    await Analytics.setUserProperties(properties);
  },
};

// Track key events
export const trackSwipe = (action: 'like' | 'pass' | 'superlike') => {
  analytics.logEvent('swipe_action', { action });
};

export const trackMatch = () => {
  analytics.logEvent('new_match');
};

export const trackMessageSent = () => {
  analytics.logEvent('message_sent');
};

export const trackProfileView = (profileId: string) => {
  analytics.logEvent('profile_view', { profile_id: profileId });
};
```

---

## 🔄 Development Workflow

### **Daily Development Cycle**

```bash
# 1. Start development
git checkout develop
git pull origin develop
npm install

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Start dev server
npm start

# 4. Test on devices
# iOS: Press 'i' in terminal
# Android: Press 'a' in terminal
# Web: Press 'w' in terminal

# 5. Make changes and test
# Edit files, save, and see changes via Fast Refresh

# 6. Commit changes
git add .
git commit -m "feat: add new feature"

# 7. Push and create PR
git push origin feature/new-feature
# Create Pull Request on GitHub

# 8. After PR approval, merge to develop
git checkout develop
git pull origin develop

# 9. Test in preview
eas build --platform all --profile preview

# 10. When ready for production
git checkout main
git merge develop
git push origin main

# 11. Deploy to