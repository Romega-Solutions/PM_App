# 🔧 PINAYMATE REFACTORING PLAN

## Feature-First Modular Design

**Last Updated:** January 21, 2026  
**Architecture:** Feature-First Organization  
**Principles:** SOLID, DRY, KISS  
**Goal:** 100% Testable, Modular, Documented, <500 lines per file

---

## 🎯 ARCHITECTURE PHILOSOPHY

### **Core Principles**

1. ✅ **Feature-First Organization**
   - Each feature is a self-contained folder
   - Everything related to a feature stays together
   - Easy to find and modify code
   - Easy to add/remove features

2. ✅ **SOLID Principles**
   - **S**ingle Responsibility - Each file does ONE thing
   - **O**pen/Closed - Open for extension, closed for modification
   - **I**nterface Segregation - Specific, minimal interfaces
   - **D**ependency Inversion - Depend on abstractions, not implementations

3. ✅ **DRY (Don't Repeat Yourself)**
   - Extract reusable logic into hooks
   - Create shared components
   - No code duplication

4. ✅ **KISS (Keep It Simple, Stupid)**
   - Clear naming conventions
   - Single-purpose functions
   - Minimal complexity

5. ✅ **Zustand State Management**
   - Centralized global state
   - Persistent auth state (AsyncStorage)
   - Immutable state updates
   - Devtools integration for debugging
   - Type-safe with TypeScript

6. ✅ **Security Best Practices**
   - Never store sensitive data in AsyncStorage (only tokens)
   - Use Supabase Row Level Security (RLS)
   - Token refresh mechanism
   - Secure API endpoints
   - Input validation & sanitization
   - HTTPS only communication

7. ✅ **Riverpod State Management**
   - Immutable state updates
   - Automatic dependency tracking
   - Type-safe providers
   - Testable business logic
   - Data persistence with shared_preferences

8. ✅ **Security Best Practices**
   - Secure token storage (flutter_secure_storage)
   - Never store sensitive data in plain SharedPreferences
   - Automatic token refresh
   - Proper session management
   - Row Level Security (RLS) on Supabase

---

## 📊 CURRENT STATE (Updated: January 21, 2026)

### **✅ COMPLETED REFACTORING**

#### **1. Discover/Swipe Screen - FULLY REFACTORED ✅**

```
app/(main)/index.tsx
  BEFORE: 1,836 lines (monolithic)
  AFTER:  28 lines (thin wrapper)

  SPLIT INTO 7 MODULAR FILES:
  ✅ src/features/matching/hooks/useSwipeGesture.ts (151 lines)
  ✅ src/features/matching/components/ProfileCard.tsx (338 lines)
  ✅ src/features/matching/components/ActionButtons.tsx (138 lines)
  ✅ src/features/matching/components/ProfileDetailsModal.tsx (429 lines)
  ✅ src/features/matching/components/MatchModal.tsx (211 lines)
  ✅ src/features/matching/screens/DiscoverScreen.tsx (412 lines)
  ✅ app/(main)/index.tsx (28 lines)

  TOTAL: 1,707 lines across 7 files (avg 244 lines/file)
  ALL FILES UNDER 500 LINES ✅
```

#### **2. Database Integration - 100% COMPLETE ✅**

```
✅ app/(main)/messages.tsx - useConversations hook (Real DB)
✅ src/features/messaging/screens/ChatScreen.tsx - useMessages hook (Real DB)
✅ app/(main)/likes.tsx - getMatches API (Real DB, loading fixed)
✅ app/(main)/index.tsx - fetchDiscoverProfiles API (Real DB)
✅ ALL MOCK DATA REMOVED (0 fallbacks)
```

### **⚠️ FILES STILL NEEDING REFACTORING**

```
❌ app/(main)/profile.tsx - 561 lines (NEED TO SPLIT)
❌ src/features/account/api/accountApi.ts - 548 lines (NEED TO SPLIT)
❌ app/(main)/messages.tsx - 608 lines (NEED TO SPLIT)
```

### **Mock Data Status**

```
✅ app/(main)/index.tsx - REMOVED all mock data (filipinaProfiles, maleProfiles, getProfilesForUserType)
✅ app/(main)/messages.tsx - REMOVED all mock data (activeUsers, conversations)
✅ app/(main)/likes.tsx - REMOVED all mock data (filipinaMatches, maleMatches, getMatchesForUserType)
✅ src/features/messaging/screens/ChatScreen.tsx - REMOVED all mock messages and setTimeout simulations
```

### **Files Over 500 Lines (CRITICAL)**

```
❌ app/(main)/index.tsx              - 2,048 lines (MASSIVE)
❌ app/(main)/messages.tsx            - 1,105 lines
❌ src/features/messaging/screens/ChatScreen.tsx - 1,066 lines
❌ app/(main)/likes.tsx               - 792 lines
❌ app/(main)/profile.tsx             - 561 lines
❌ src/features/account/api/accountApi.ts - 548 lines
❌ src/features/matching/api/matchingApi.ts - 538 lines
```

### **Mock Data Locations Found**

```
📍 app/(main)/index.tsx
   - filipinaProfiles[] (180+ lines of hardcoded data)
   - maleProfiles[] (180+ lines of hardcoded data)
   - getProfilesForUserType() - fallback to mock data

📍 app/(main)/likes.tsx
   - filipinaMatches[] (80+ lines)
   - maleMatches[] (80+ lines)
   - getMatchesForUserType() - fallback to mock data

📍 app/(main)/messages.tsx
   - activeUsers[] (60+ lines)
   - conversations[] (100+ lines)
   - NO database integration

📍 src/features/messaging/screens/ChatScreen.tsx
   - Mock messages array
   - Simulated auto-replies
   - No Supabase integration
   - Image upload commented out
```

### **Architecture Violations**

```
❌ Business logic in UI components
❌ Direct Supabase calls in screen files
❌ No separation of concerns
❌ Massive component files
❌ Mixed responsibilities (data + UI + logic)
❌ No error boundary components
❌ No loading state components
❌ Hardcoded styles in components
```

---

## 🎯 REFACTORING STRATEGY

### **Core Principles**

1. ✅ **Single Responsibility Principle** - Each file does ONE thing
2. ✅ **DRY (Don't Repeat Yourself)** - No duplicate code
3. ✅ **Separation of Concerns** - UI / Logic / Data layers
4. ✅ **Dependency Injection** - Testable, modular code
5. ✅ **<500 lines per file** - Maximum modularity
6. ✅ **Zero mock data** - 100% database-driven

---

## 🏗️ FEATURE-FIRST FOLDER STRUCTURE

### **Simple & Organized Directory Structure**

```
src/
├── features/                       # Feature modules (self-contained)
│   │
│   ├── matching/                   # ✅ REFACTORED & DOCUMENTED
│   │   ├── api/                    # Database operations
│   │   │   └── matchingApi.ts      # fetchProfiles, like, pass, superLike
│   │   ├── hooks/                  # Business logic
│   │   │   └── useSwipeGesture.ts  # Gesture handling (151 lines)
│   │   ├── components/             # UI components
│   │   │   ├── ProfileCard.tsx     # (338 lines)
│   │   │   ├── ActionButtons.tsx   # (138 lines)
│   │   │   ├── ProfileDetailsModal.tsx (429 lines)
│   │   │   └── MatchModal.tsx      # (211 lines)
│   │   ├── screens/                # Main screens
│   │   │   └── DiscoverScreen.tsx  # (412 lines)
│   │   └── types/                  # TypeScript types
│   │       └── matching.types.ts   # Profile, Match types
│   │
│   ├── messaging/                  # 🔄 NEEDS REFACTORING
│   ├── messaging/
│   │   ├── api/
│   │   ├── api/
│   │   │   ├── messagesApi.ts          # sendMessage, getMessages, deleteMessage
│   │   │   └── conversationsApi.ts     # getConversations, createConversation
│   │   ├── hooks/
│   │   │   ├── useMessages.ts          # Message state & operations
│   │   │   ├── useConversations.ts     # Conversation list logic
│   │   │   └── useChatRealtime.ts      # Real-time message updates
│   │   ├── components/
│   │   │   ├── MessagesList.tsx        # Message list display
│   │   │   ├── MessageBubble.tsx       # Single message bubble
│   │   │   ├── MessageInput.tsx        # Text input + emoji
│   │   │   ├── ConversationList.tsx    # Conversations grid
│   │   │   └── ConversationCard.tsx    # Single conversation card
│   │   ├── screens/
│   │   │   ├── MessagesScreen.tsx      # Conversation list
│   │   │   └── ChatScreen.tsx          # Active chat
│   │   └── types/
│   │       └── messaging.types.ts      # Message, Conversation types
│   │
│   ├── profile/                    # ⏳ TODO
│   │   ├── api/
│   │   │   ├── profileApi.ts           # getProfile, updateProfile
│   │   │   └── photosApi.ts            # uploadPhoto, deletePhoto
│   │   ├── hooks/
│   │   │   ├── useProfile.ts           # Profile state & updates
│   │   │   └── usePhotoUpload.ts       # Photo upload logic
│   │   ├── components/
│   │   │   ├── ProfileView.tsx         # Display profile
│   │   │   ├── ProfileEdit.tsx         # Edit form
│   │   │   └── PhotoGallery.tsx        # Photo grid
│   │   ├── screens/
│   │   │   └── ProfileScreen.tsx       # Main profile screen
│   │   └── types/
│   │       └── profile.types.ts        # Profile types
│   │
│   └── account/                    # ⏳ TODO
│       ├── api/
│       │   └── accountApi.ts           # Account settings & preferences
│       ├── hooks/
│       │   └── useAccount.ts           # Account state
│       ├── components/
│       │   └── SettingsForm.tsx        # Settings UI
│       └── types/
│           └── account.types.ts        # Account types
│
├── stores/                         # ✅ Zustand Global State (COMPLETED)
│   ├── authStore.ts                # Auth state (user, session, tokens)
│   ├── profileStore.ts             # Current user profile
│   ├── matchingStore.ts            # Matching preferences & filters
│   └── chatStore.ts                # Conversations & unread counts
│
├── components/                     # Shared components
│   ├── ui/                         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   └── layout/
│       └── ScreenWrapper.tsx
│
├── hooks/                          # ✅ Shared hooks
│   ├── useDebounce.ts
│   ├── useAsyncState.ts
│   └── useAuthPersistence.ts       # ✅ Session restore (COMPLETED)
│
├── utils/                          # ✅ Utilities
│   ├── formatters.ts               # Date, text formatting
│   ├── validators.ts               # Input validation
│   └── security.ts                 # ✅ Validation & sanitization (COMPLETED)
│
├── types/                          # Shared TypeScript types
│   └── common.types.ts
│
└── config/                         # Configuration
    ├── supabase.ts                 # Supabase client
    └── constants.ts                # App constants
```

---

## 🔐 STATE MANAGEMENT & SECURITY

### **Zustand State Management Architecture** ✅ COMPLETED

**Why Zustand?**

- ✅ Simple and unopinionated (minimal boilerplate)
- ✅ TypeScript-first with excellent type safety
- ✅ Works perfectly with React Native
- ✅ Built-in persistence with AsyncStorage
- ✅ Easy to test and debug
- ✅ No context providers needed
- ✅ Automatic re-renders only when subscribed data changes

**Store Organization:**

```typescript
src/stores/
├── authStore.ts        # ✅ Authentication & session management
├── profileStore.ts     # ✅ Current user profile data
├── matchingStore.ts    # ✅ Discovery filters & preferences
└── chatStore.ts        # ✅ Active conversations & unread counts
```

**Store Pattern Example:**

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/config/supabase';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()()
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      setSession: (session) => set({
        session,
        user: session?.user || null,
        isAuthenticated: !!session
      }),

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          set({ session, user: session.user, isAuthenticated: true });
        }
      },

      refreshSession: async () => {
        const { data: { session } } = await supabase.auth.refreshSession();
        if (session) set({ session, user: session.user });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // SECURITY: Only persist session, not sensitive data
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
```

**Using Zustand in Components:**

```typescript
// Use entire store
import { useAuthStore } from '@/src/stores/authStore';

function ProfileScreen() {
  const { user, isAuthenticated, signOut } = useAuthStore();

  return (
    <View>
      <Text>{user?.email}</Text>
      <Button onPress={signOut}>Sign Out</Button>
    </View>
  );
}

// Or select specific values (optimized re-renders)
import { useAuthStore } from '@/src/stores/authStore';

function UserGreeting() {
  const user = useAuthStore((state) => state.user);
  return <Text>Welcome, {user?.email}</Text>;
}
```

**Using Zustand in Feature Hooks:**

```typescript
// src/features/messaging/hooks/useConversations.ts
import { useChatStore } from "@/src/stores/chatStore";
import { getConversations } from "../api/conversationsApi";

export function useConversations() {
  const { activeConversations, setActiveConversations, totalUnreadCount } =
    useChatStore();

  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const conversations = await getConversations();
      setActiveConversations(conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations: activeConversations,
    totalUnread: totalUnreadCount,
    loading,
    refresh: loadConversations,
  };
}
```

### **Data Persistence Strategy** ✅ IMPLEMENTED

**1. Persistent State (AsyncStorage via Zustand)**

```typescript
// ✅ SAFE TO PERSIST:
- Session tokens (encrypted by OS)
- User preferences (theme, language)
- Matching filters (age range, distance)
- UI state (last viewed screen)

// ❌ NEVER PERSIST:
- Passwords or credentials
- Credit card information
- Sensitive personal data
- API keys or secrets
```

**2. Database Persistence (Supabase)**

```typescript
// All user data stored in Supabase with Row Level Security (RLS)
✅ Profiles, messages, matches - encrypted at rest
✅ Automatic backups by Supabase
✅ Real-time synchronization
```

**3. AsyncStorage Structure** ✅ IMPLEMENTED

```typescript
// Zustand automatically handles persistence
AsyncStorage Keys:
├── 'auth-storage'       → { session, isAuthenticated }
├── 'profile-storage'    → { profile }
├── 'matching-storage'   → { filters, isFilterActive }
└── (No 'chat-storage')  → Chat state is temporary (not persisted)

// Access pattern:
const { session } = useAuthStore();  // Auto-loads from AsyncStorage
```

### **Auth Persistence & Auto-Login** ✅ IMPLEMENTED

```typescript
// src/hooks/useAuthPersistence.ts (147 lines)
import { useEffect } from "react";
import { useAuthStore } from "@/src/stores/authStore";
import { supabase } from "@/src/config/supabase";

export function useAuthPersistence() {
  const { initialize, refreshSession, setSession } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // 1. Initialize auth on app start
  useEffect(() => {
    const init = async () => {
      await initialize(); // Restores session from AsyncStorage
      setIsReady(true);
    };
    init();
  }, []);

  // 2. Listen to Supabase auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") setSession(session);
      if (event === "SIGNED_OUT") setSession(null);
      if (event === "TOKEN_REFRESHED") setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 3. Auto-refresh token every 55 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshSession();
      },
      55 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  return { isReady };
}
```

**Usage in App Root:**

```typescript
// app/_layout.tsx
import { useAuthPersistence } from '@/src/hooks/useAuthPersistence';
import { SplashScreen } from 'expo-splash-screen';

export default function RootLayout() {
  const { isReady } = useAuthPersistence();

  if (!isReady) {
    return <SplashScreen />;
  }

  return <Stack />;
}
        isAuthenticated: true,
      };

      // Start token refresh timer
      this.startTokenRefresh();
    } catch (error) {
      // Token invalid, clear storage
      await secureStorage.clearAuth();
      state = { ...state, isLoading: false };
    }
  }

  async login(email: string, password: string): Promise<void> {
    const { user, session } = await authApi.login(email, password);

    // Save tokens securely
    await secureStorage.saveAuthToken(session.access_token);
    await secureStorage.saveRefreshToken(session.refresh_token);

    state = {
      user,
      session,
      isLoading: false,
      isAuthenticated: true,
    };

    this.startTokenRefresh();
  }

  async logout(): Promise<void> {
    await authApi.logout();
    await secureStorage.clearAuth();

    state = {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  // Auto-refresh token every 50 minutes (tokens expire in 60)
  private startTokenRefresh(): void {
    setInterval(async () => {
      try {
        const refreshToken = await secureStorage.getRefreshToken();
        const { session } = await authApi.refreshToken(refreshToken);

        await secureStorage.saveAuthToken(session.access_token);
        state = { ...state, session };
      } catch (error) {
        // Refresh failed, logout user
        await this.logout();
      }
    }, 50 * 60 * 1000); // 50 minutes
  }
}

export const authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return new AuthNotifier();
});
```

### **Security Best Practices**

#### **1. Secure Token Storage ✅**

```typescript
// ❌ NEVER DO THIS
await AsyncStorage.setItem("token", token); // Plain text storage!

// ✅ ALWAYS DO THIS
await secureStorage.saveAuthToken(token); // Encrypted storage
```

#### **2. Row Level Security (RLS) on Supabase ✅**

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see messages in their conversations
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );
```

#### **3. Input Validation ✅**

```typescript
// Validate all user inputs
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("Must contain uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Must contain lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Must contain number");
    return { valid: errors.length === 0, errors };
  },
};
```

#### **4. API Request Security ✅**

```typescript
// Always include auth token in requests
export const createApiClient = (token: string) => {
  return {
    get: async (url: string) => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Token expired, trigger logout
        throw new AuthError("Session expired");
      }

      return response.json();
    },
  };
};
```

---

## � SECURITY BEST PRACTICES

### **1. Authentication Security**

```typescript
// ✅ GOOD: Use Supabase auth with secure token handling
import { useAuthStore } from "@/src/stores/authStore";

// Tokens are stored in AsyncStorage (encrypted by OS)
// Session auto-refreshes before expiry
// RLS policies protect database access
```

### **2. Data Validation**

```typescript
// ✅ GOOD: Validate and sanitize all inputs
import { z } from "zod";

const messageSchema = z.object({
  text: z.string().min(1).max(1000),
  conversationId: z.string().uuid(),
});

export const sendMessage = async (data: unknown) => {
  const validated = messageSchema.parse(data); // Throws if invalid
  // Safe to use validated data
};
```

### **3. Row Level Security (RLS)**

```sql
-- ✅ GOOD: Use RLS policies in Supabase

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only send messages in conversations they're part of
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT sender_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT recipient_id FROM conversations WHERE id = conversation_id
    )
  );
```

### **4. Sensitive Data Handling**

```typescript
// ❌ BAD: Storing sensitive data in AsyncStorage
await AsyncStorage.setItem('password', userPassword);
await AsyncStorage.setItem('creditCard', cardNumber);

// ✅ GOOD: Never store sensitive data locally
// Only store session tokens (handled by Supabase)
// Use Zustand persist for non-sensitive UI state only
export const usePreferencesStore = create<PreferencesState>()()
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      // Safe to persist UI preferences
    }),
    { name: 'preferences-storage' }
  )
);
```

### **5. API Security**

```typescript
// ✅ GOOD: Use Supabase client with RLS
import { supabase } from "@/src/config/supabase";

// Supabase automatically includes auth headers
// RLS policies enforce access control
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId);

// ❌ BAD: Direct API calls without authentication
fetch("https://api.example.com/profiles"); // No auth header
```

### **6. Input Sanitization**

```typescript
// ✅ GOOD: Sanitize user inputs
import DOMPurify from "isomorphic-dompurify";

export const sanitizeMessage = (text: string): string => {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [],
  });
};
```

---

## �📋 REFACTORING ROADMAP

### **PHASE 0: Setup State Management & Security 🔄 IN PROGRESS**

#### **Task 0.1: Install Zustand & Dependencies**

```bash
npm install zustand
npm install @react-native-async-storage/async-storage
npm install zod  # For input validation
npm install isomorphic-dompurify  # For sanitization
```

#### **Task 0.2: Create Auth Store**

**File:** `src/stores/authStore.ts` (150 lines)

- [ ] Create Zustand store with persistence
- [ ] Add session management
- [ ] Add token refresh logic
- [ ] Add sign out functionality
- [ ] Integrate with Supabase auth

#### **Task 0.3: Create Profile Store**

**File:** `src/stores/profileStore.ts` (120 lines)

- [ ] Current user profile state
- [ ] Profile update actions
- [ ] Photo management
- [ ] Preferences state

#### **Task 0.4: Create Security Utilities**

**File:** `src/utils/security.ts` (100 lines)

- [ ] Input validation schemas (Zod)
- [ ] Sanitization functions
- [ ] Token validation helpers

#### **Task 0.5: Setup Auth Persistence**

**File:** `src/hooks/useAuthPersistence.ts` (80 lines)

- [ ] Restore session on app start
- [ ] Handle token expiry
- [ ] Auto-refresh tokens
- [ ] Redirect to signin if expired

---

### **PHASE 1: Core Features ✅ COMPLETED**

#### **✅ Task 1.1: Discover/Swipe Screen - COMPLETED**

**Status:** ✅ DONE (January 21, 2026)

**Before:**

- File: `app/(main)/index.tsx` - 1,836 lines
- Issues: Monolithic, mixed concerns, poor testability

**After:**

- 7 modular files, all under 500 lines
- SOLID principles applied
- Fully documented (see [INDEX_REFACTORING_SUMMARY.md](./INDEX_REFACTORING_SUMMARY.md))
- 100% testable

**Files Created:**

1. `useSwipeGesture.ts` (151 lines) - Single Responsibility: Gesture logic
2. `ProfileCard.tsx` (338 lines) - Single Responsibility: Card UI
3. `ActionButtons.tsx` (138 lines) - Interface Segregation: Specific callbacks
4. `ProfileDetailsModal.tsx` (429 lines) - Single Responsibility: Details view
5. `MatchModal.tsx` (211 lines) - Single Responsibility: Match celebration
6. `DiscoverScreen.tsx` (412 lines) - Dependency Inversion: Uses abstractions
7. `app/(main)/index.tsx` (28 lines) - Thin wrapper

**Documentation:**

- ✅ Component-level JSDoc comments
- ✅ Inline code documentation
- ✅ Architecture explanation in file headers
- ✅ Full refactoring summary document

---

#### **✅ Task 1.2: Database Integration - COMPLETED**

**Status:** ✅ DONE

- ✅ Removed ALL mock data (filipinaProfiles, maleProfiles, etc.)
- ✅ Integrated fetchDiscoverProfiles API
- ✅ Integrated getMatches API
- ✅ Fixed useConversations hook
- ✅ Fixed useMessages hook
- ✅ Fixed likes screen loading state

---

### **PHASE 2: Messaging Feature 🔄 IN PROGRESS**

#### **Task 2.1: Refactor Messages Screen**

**File:** `app/(main)/messages.tsx` (608 lines → <30
├── signin.tsx (100 lines) - Import SignInScreen
└── signup.tsx (100 lines) - Import SignUpScreen

````

**Architecture Benefits:**

- ✅ **Feature Isolation** - Each feature is self-contained
- ✅ **Easy Testing** - Test features independently
- ✅ **Scalability** - Add new features without touching others
- ✅ **Code Ownership** - Clear responsibility boundaries
- ✅ **Import Clarity** - `@/src/features/messaging/hooks/useMessages`

---

## 📋 IMPLEMENTATION PHASES

## **PHASE 1: Remove Mock Data (Priority: CRITICAL)**

**Target: 2-3 days**

### **Task 1.1: Fix Messages Screen**

**File:** `app/(main)/messages.tsx` (1,105 lines → 250 lines)

**Current Issues:**

- ❌ 60+ lines of hardcoded `activeUsers` array
- ❌ 100+ lines of hardcoded `conversations` array
- ❌ No database queries

**Actions:**

```typescript
// BEFORE (messages.tsx)
const conversations = [
  { id: 1, name: "Maria", lastMessage: "Hi...", ... },
  { id: 2, name: "Angel", lastMessage: "Hello...", ... },
  // ... 100+ lines
];

// AFTER (using hooks)
import { useConversations } from '@/src/hooks/useConversations';

function MessagesScreen() {
  const { conversations, loading, error } = useConversations();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!conversations.length) return <EmptyState />;

  return <ConversationList conversations={conversations} />;
}
````

**Files to Create:**

1. `src/hooks/useConversations.ts` (150 lines)
2. `src/api/conversations.api.ts` (100 lines)
3. `src/components/messaging/ConversationList.tsx` (200 lines)
4. `src/components/messaging/ConversationCard.tsx` (150 lines)
5. `src/components/ui/LoadingState.tsx` (80 lines)
6. `src/components/ui/ErrorState.tsx` (100 lines)
7. `src/components/ui/EmptyState.tsx` (80 lines)

---

### **Task 1.2: Fix Discover/Home Screen**

**File:** `app/(main)/index.tsx` (2,048 lines → 300 lines)

**Current Issues:**

- ❌ 360+ lines of hardcoded profile arrays
- ❌ All UI + logic + data in ONE file
- ❌ Fallback to mock data on errors

**Already Refactored! ✅**

This is **DONE** - See the completed refactoring:

- `src/features/matching/screens/DiscoverScreen.tsx` (412 lines)
- `src/features/matching/components/ProfileCard.tsx` (338 lines)
- `src/features/matching/components/ActionButtons.tsx` (138 lines)
- `src/features/matching/hooks/useSwipeGesture.ts` (151 lines)
- 7 total files, all under 500 lines ✅

**File:** `app/(main)/likes.tsx` (792 lines → 200 lines)

**Current Issues:**

- ❌ 160+ lines of hardcoded match arrays
- ❌ Fallback to mock data

**Actions:**

```typescript
// BEFORE
const filipinaMatches: Match[] = [ /* 80 lines */ ];
const maleMatches: Match[] = [ /* 80 lines */ ];

// AFTER
import { useMatches } from '@/src/hooks/useMatches';

function MatchesScreen() {
  const { matches, loading, error } = useMatches();

  return <MatchesGrid matches={matches} />;
}
```

**Files to Create:**

1. `src/hooks/useMatches.ts` (150 lines)
2. `src/api/matches.api.ts` (120 lines)
3. `src/components/matching/MatchesGrid.tsx` (180 lines)
4. `src/components/matching/MatchCard.tsx` (150 lines)

---

### **Task 1.4: Fix Chat Screen (CRITICAL - No Backend Connection)**

**File:** `src/features/messaging/screens/ChatScreen.tsx` (1,066 lines → 250 lines)

**Clready Integrated! ✅**

Database integration is **DONE**:

- Uses `getMatches` API from `matchingApi.ts`
- No mock data
- Loading state fixed
- Needs refactoring to split into smaller files (608 lines currently
  // Fake auto-reply after 2 seconds
  setTimeout(() => {
  const fakeReply = {
  id: Date.now(),
  text: "That sounds perfect! Looking forward to it 💕",
  senderId: params.userId
  };
  setMessages(prev => [...prev, fakeReply]);
  }, 2000);
  }, [messages]);

// AFTER (real Supabase integration with realtime)
import { useMessages } from '@/src/features/messaging/hooks/useMessages';
import { useChatRealtime } from '@/src/features/messaging/hooks/useChatRealtime';
import { useMessageUpload } from '@/src/features/messaging/hooks/useMessageUpload';

function ChatScreen({ conversationId, recipientId }) {
const {
messages,
sendTextMessage,
markAsRead,
deleteMessage,
loading,
error
} = useMessages(conversationId, recipientId);

// Automatically subscribes to realtime updates
useChatRealtime(conversationId, recipientId);

const { uploadImage, uploading } = useMessageUpload();

const handleSend = async (text: string) => {
await sendTextMessage(text);
};

const handleImageSend = async (uri: string) => {
const imageUrl = await uploadImage(uri, conversationId);
await sendImageMessage(imageUrl);
};

if (loading) return <LoadingState type="chat" />;
if (error) return <ErrorState error={error} />;

return (
<MessagesList
      messages={messages}
      onSend={handleSend}
      onImageSend={handleImageSend}
      onDelete={deleteMessage}
    />
);
}

````

**Database Schema Updates Required:**

```sql
-- Add missing columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
  CHECK (message_type IN ('text', 'image', 'voice', 'video'));

ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent'
  CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed'));

ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID[];

-- Rename receiver_id to recipient_id for consistency
ALTER TABLE messages RENAME COLUMN receiver_id TO recipient_id;

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', false);

-- Storage policy: Users can upload to their own chat folders
CREATE POLICY "Users can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: Users can read images from conversations they're in
CREATE POLICY "Users can view chat images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-images'
    AND auth.uid() IN (
      SELECT sender_id FROM messages WHERE conversation_id = (storage.foldername(name))[1]
      UNION
      SELECT recipient_id FROM messages WHERE conversation_id = (storage.foldername(name))[1]
    )
  );
````

**Files to Create:**

1. **API Layer**
   - `src/features/messaging/api/messages.api.ts` (250 lines)
     - `sendTextMessage()` - Insert text message
     - `sendImageMessage()` - Insert image message
     - `getMessages()` - Fetch conversation history
     - `markAsRead()` - Update message status
     - `deleteMessage()` - Soft delete message
   - `src/features/messaging/api/realtime.api.ts` (180 lines)
     - `subscribeToMessages()` - Listen for new messages
     - `subscribeToTyping()` - Typing indicators
     - `subscribeToReadReceipts()` - Read status updates
     - `unsubscribeAll()` - Cleanup subscriptions

2. **Business Logic Hooks**
   - `src/features/messaging/hooks/useMessages.ts` (200 lines)
     - Manage message state
     - Send/receive messages
     - Optimistic updates
     - Error handling
   - `src/features/messaging/hooks/useChatRealtime.ts` (150 lines)
     - Setup realtime subscription
     - Handle incoming messages
     - Auto-cleanup on unmount
   - `src/features/messaging/hooks/useMessageUpload.ts` (120 lines)
     - Upload images to Supabase Storage
     - Progress tracking
     - Error handling

3. **UI Components**
   - `src/features/messaging/components/MessagesList.tsx` (200 lines)
     - Render message list
     - Auto-scroll to bottom
     - Pull-to-refresh
   - `src/features/messaging/components/MessageBubble.tsx` (120 lines)
     - Single message display
     - Text or image message
     - Status indicators
   - `src/features/messaging/components/MessageInput.tsx` (180 lines)
     - Text input with emoji
     - Image picker button
     - Send button
   - `src/features/messaging/components/ChatHeader.tsx` (120 lines)
     - User info
     - Online status
     - Call buttons
   - `src/features/messaging/components/TypingIndicator.tsx` (60 lines)
     - Animated "..." indicator
   - `src/features/messaging/components/MessageStatus.tsx` (80 lines)
     - Sent/delivered/read checkmarks

**Critical Implementation Notes:**

⚠️ **Remove ALL setTimeout() simulations**
⚠️ **Remove ALL mock message arrays**
⚠️ **Remove ALL fake auto-replies**
⚠️ **Uncomment and implement ALL Supabase code**
⚠️ **Test with REAL database before marking complete**

---

## **PHASE 2: Fix Architecture Violations**

**Target: 3-4 days**

### **Task 2.1: Extract Business Logic to Hooks**

**Current Problem:**

```typescript
// BAD: Business logic in component
function DiscoverScreen() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true);
      // ... complex logic here
    };
    fetchData();
  }, []);

  const handleLike = async (profileId) => {
    // ... more business logic
  };

  // ... hundreds of lines
}
```

**Solution:**

```typescript
// GOOD: Hook encapsulates all logic
// hooks/useDiscoverProfiles.ts (200 lines)
export function useDiscoverProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfiles = async () => {
    // All logic here
  };

  const like = async (id) => {
    // Like logic
  };

  return { profiles, like, pass, superLike, loading, error };
}

// Screen is now clean (<100 lines)
function DiscoverScreen() {
  const discover = useDiscoverProfiles();
  return <ProfileStack {...discover} />;
}
```

**Hooks to Create:**

- `useDiscoverProfiles.ts` - Discovery feed logic
- `useMatches.ts` - Matches management
- `useConversations.ts` - Conversations list
- `useMessages.ts` - Chat messages
- `useChatRealtime.ts` - Realtime subscriptions
- `useProfile.ts` - User profile management

---

### **Task 2.2: Create Pure API Layer**

**Current Problem:**

```typescript
// BAD: Direct Supabase calls everywhere
function SomeComponent() {
  const { data } = await supabase.from("profiles").select("*");
}
```

\*\*Ssrc/features/matching/hooks/useDiscoverProfiles.ts
export function useDiscoverProfiles() {
const [profiles, setProfiles] = useState([]);
const [loading, setLoading] = useState(true);

const fetchProfiles = async () => {
const { data } = await matchingApi.fetchDiscoverProfiles(userId);
setProfiles(data);
};

const like = async (id) => {
await matchingApi.likeProfile(userId, id);
};

return { profiles, like, pass, superLike, loading };
}

// Screen uses hook
// src/features/matching/screens/DiscoverScreen.tsx
function DiscoverScreen() {
const { profiles, like, pass } = useSwipeGesture({
onSwipeLeft: handlePass,
onSwipeRight: handleLike
});

return <ProfileCard profile={profiles[0]} onLike={like} />;
}

````

**Hooks Pattern:**

Each feature has its own hooks folder:
- `src/features/matching/hooks/` - Swipe, discover logic
- `src/features/messaging/hooks/` - Messages, conversations
- `src/features/profile/hooks/` - P
**File:** `src/features/messaging/api/realtime.api.ts` (180 lines)

```typescript
import { supabase } from '@/src/config/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type MessageCallback = (message: any) => void;
export type TypingCallback = (userId: string, isTyping: boolean) => void;
export type ReadReceiptCallback = (messageIds: string[]) => void;

class RealtimeAPI {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * SubsFeature-based API
// src/features/matching/api/matchingApi.ts
export const matchingApi = {
  fetchDiscoverProfiles: async (userId: string, limit = 20) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .neq("id", userId)
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  },

  likeProfile: async (userId: string, profileId: string) => {
    // Like logic
  },
};
````

**API Organization:**

Each feature has its own api folder:

```
src/features/matching/api/matchingApi.ts     # Swipe, like, match
src/features/messaging/api/messagesApi.ts    # Send, get messages
src/features/messaging/api/conversationsApi.ts # Conversations
src/features/profile/api/profileApi.ts       # Profile CRUD
src/features/profile/api/photosApi.ts        # Photo upload
```

      .subscribe((status) => {
        console.log(`📡 Subscription status for ${channelName}:`, status);
      });

    this.channels.set(channelName, channel);

    // Return cleanup function
    return () => this.unsubscribe(channelName);

}

/\*\*

- Subscribe to typing indicators
  \*/
  subscribeToTyping(
  conversationId: string,
  callback: TypingCallback
  ): () => void {
  const channelName = `typing:${conversationId}`;

  const channel = supabase
  .channel(channelName)
  .on('broadcast', { event: 'typing' }, (payload) => {
  callback(payload.payload.userId, payload.payload.isTyping);
  })
  .subscribe();

  this.channels.set(channelName, channel);
  return () => this.unsubscribe(channelName);

}

/\*\*

- Broadcast typing status
  \*/
  async broadcastTyping(
  conversationId: string,
  userId: string,
  isTyping: boolean
  ): Promise<void> {
  const channelName = `typing:${conversationId}`;
  let channel = this.channels.get(channelName);

  if (!channel) {
  channel = supabase.channel(channelName).subscribe();
  this.channels.set(channelName, channel);
  }

  await channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId, isTyping }
  });

}

/\*\*

- Subscribe to read receipts
  \*/
  subscribeToReadReceipts(
  conversationId: string,
  callback: ReadReceiptCallback
  ): () => void {
  const channelName = `read-receipts:${conversationId}`;

  const channel = supabase
  .channel(channelName)
  .on(
  'postgres_changes',
  {
  event: 'UPDATE',
  schema: 'public',
  table: 'messages',
  filter: `conversation_id=eq.${conversationId}`
  },
  (payload) => {
  if (payload.new.status === 'read') {
  callback([payload.new.id]);
  }
  }
  )
  .subscribe();

  this.channels.set(channelName, channel);
  return () => this.unsub (Updated with Priorities)

### **🔴 CRITICAL PATH: Database Integration Status**

**✅ COMPLETED:**

- [x] Chat Screen - Using useMessages hook with real-time subscriptions
- [x] Messages Screen - Using useConversations hook
- [x] Likes Screen - Using getMatches API
- [x] Discover/Home Screen - Using fetchDiscoverProfiles API
- [x] Removed ALL mock data fallbacks
- [x] Removed ALL setTimeout() fake simulations
- [x] Removed ALL hardcoded profile/match arrays

**🟡 IN PROGRESS:**

- [ ] Split index.tsx (1836 → <500 lines per file)
- [ ] Split profile.tsx (561 → <400 lines)
- [ ] Split accountApi.ts (548 → <400 lines)

**Day 1: Database Setup & Message API**

- [ ] Run database migration (fix_missing_columns_and_tables.sql)
- [ ] Add missing columns to messages table:
  - [ ] `message_type` (text/image)
  - [ ] `image_url`
  - [ ] `status` (sending/sent/delivered/read)
  - [ ] `is_deleted`
  - [ ] Rename `receiver_id` → `recipient_id`
- [ ] Create storage bucket: `chat-images`
- [ ] Set up storage policies
- [ ] Create `src/features/messaging/api/messages.api.ts` (250 lines)
  - `sendTextMessage()`
  - `sendImageMessage()`
  - `getMessages()`
  - `markAsRead()`
  - `deleteMessage()`
- [ ] Test API functions in isolation

**Day 2: Realtime & Hooks**

- [ ] Create `src/features/messaging/api/realtime.api.ts` (180 lines)
  - `subscribeToMessages()`
  - `subscribeToTyping()`
  - `broadcastTyping()`
- [ ] Create `src/features/messaging/hooks/useMessages.ts` (200 lines)
  - Load messages from database
  - Send messages with optimistic updates
  - Handle errors gracefully
- [ ] Create `src/features/messaging/hooks/useChatRealtime.ts` (150 lines)
  - Subscribe to new messages
  - Auto-cleanup on unmount
- [ ] Create `src/features/messaging/hooks/useMessageUpload.ts` (120 lines)
  - Upload images to Storage
  - Track upload progress

**Day 3: Integrate Chat Screen**

- [ ] Update `ChatScreen.tsx` - REMOVE ALL:
  - ❌ Mock messages array (lines 67-101)
  - ❌ setTimeout auto-reply (lines 201-224)
  - ❌ Simulated delays (lines 185-201)
- [ ] Integrate hooks:
  - `useMessages()` for state management
  - `useChatRealtime()` for live updates
  - `useMessageUpload()` for images
- [ ] Test end-to-end:
  - [ ] Send text message
  - [ ] Receive message in real-time
  - [ ] Send image message
  - [ ] Messages persist after app restart
  - [ ] Typing indicators work
  - [ ] Read receipts update

---

### **🟡 HIGH PRIORITY: Messages List Screen (Days 4-5)**

**Day 4: Conversations API & Hook**

- [ ] Create `src/features/messaging/api/conversations.api.ts` (180 lines)
  - `getConversations()` - Get all user conversations
  - `getOrCreateConversation()` - Start new chat
  - `updateLastMessage()` - Update on new message
- [ ] Create `src/features/messaging/hooks/useConversations.ts` (150 lines)
  - Load conversation list
  - Real-time updates on new messages
  - Unread count tracking

**Day 5: Update Messages Screen**

- [ ] Remove mock data from `app/(main)/messages.tsx`:
  - ❌ `activeUsers` array (lines 43-117)
  - ❌ `conversations` array (lines 119-293)
- [ ] Create `src/features/messaging/components/ConversationList.tsx` (200 lines)
- [ ] Create `src/features/messaging/components/ConversationCard.tsx` (150 lines)
- [ ] Integrate database queries
- [ ] Test conversation list loads correctly

---

### **🟢 MEDIUM PRIORITY: Discover Screen (Days 6-8)**

**Day 6: Profiles API**

- [ ] Create `src/features/matching/api/profiles.api.ts` (180 lines)
- [ ] Create `src/features/matching/api/swipes.api.ts` (150 lines)

**Day 7: Discover Hook & Components**

- [ ] Create `src/features/matching/hooks/useDiscoverProfiles.ts` (200 lines)
- [ ] Create `src/features/matching/hooks/useSwipeActions.ts` (180 lines)
- [ ] Split ProfileCard into smaller components

**Day 8: Remove Mock Data from Discover**

- [ ] Remove from `app/(main)/index.tsx`:
  - ❌ `filipinaProfiles` array (lines 70-180)
  - ❌ `maleProfiles` array (lines 182-290)
  - ❌ `getProfilesForUserType()` fallback
- [ ] Integrate real database queries
- [ ] Test swipe actions save to database

---

### **🔵 STANDARD PRIORITY: Matches Screen (Days 9-10)**

**Day 9: Matches API & Hook**

- [ ] Create `src/features/matching/api/matches.api.ts` (120 lines)
- [ ] Create `src/features/matching/hooks/useMatches.ts` (150 lines)

**Day 10: Remove Mock Data from Matches**

- [ ] Remove from `app/(main)/likes.tsx`:
  - ❌ `filipinaMatches` array (lines 52-133)
  - ❌ `maleMatches` array (lines 136-294)
- [ ] Create match components
- [ ] Test matches load from database

---

### **Week 3: Architecture Cleanup**

- [ ] Extract all business logic to hooks
- [ ] Create shared UI components library
- [ ] Split files over 500 lines
- [ ] Add comprehensive error handling
- [ ] Add loading states everywhere
- [ ] Write unit tests for hooks and APIs

---

### **Week 4: Polish & Testing**

- [ ] Add offline support
- [ ] Implement retry logic
- [ ] Add analytics tracking
- [ ] Performance optimization
- [ ] Integration tests
- [ ] User acceptance testing
      userId: string,
      onPresenceChange: (users: any[]) => void
      ): () => void {
      const channelName = `presence:${roomId}`;

      const channel = supabase
        .channel(channelName)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const users = Object.values(state).flat();
          onPresenceChange(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ userId, online_at: new Date().toISOString() });
          }
        });

      this.channels.set(channelName, channel);
      return () => this.unsubscribe(channelName);

  }

  /\*\*
  - Unsubscribe from a specific channel
    \*/
    unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
    supabase.removeChannel(channel);
    this.channels.delete(channelName);
    console.log(`🔌 Unsubscribed from ${channelName}`);
    }
    }

  /\*\*
  - Unsubscribe from all channels
    \*/
    unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
    supabase.removeChannel(channel);
    console.log(`🔌 Unsubscribed from ${name}`);
    });
    this.channels.clear();
    }
    }

export const realtimeApi = new RealtimeAPI();

````

**Usage in Hook:**

```typescript
// src/features/messaging/hooks/useChatRealtime.ts
import { useEffect } from 'react';
import { realtimeApi } from '../api/realtime.api';

export function useChatRealtime(
  conversationId: string,
  userId: string,
  recipientId: string,
  onNewMessage: (message: any) => void
) {
  useEffect(() => {
    // Subscribe to messages
    const unsubscribeMessages = realtimeApi.subscribeToMessages(
      conversationId,
      userId,
      recipientId,
      onNewMessage
    );

    // Subscribe to typing
    const unsubscribeTyping = realtimeApi.subscribeToTyping(
      conversationId,
      (userId, isTyping) => {
        console.log(`${userId} is ${isTyping ? 'typing' : 'not typing'}`);
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [conversationId, userId, recipientId]);
}Split into:**

````

app/(main)/index.tsx (300 lines)
↓ imports from:

src/screens/DiscoverScreen.tsx (250 lines)
↓ uses:

src/hooks/useDiscoverProfiles.ts (200 lines)
↓ calls:

src/api/profiles.api.ts (180 lines)
src/api/matches.api.ts (120 lines)
↓ renders:

src/components/discover/ProfileStack.tsx (250 lines)
├── ProfileCard.tsx (300 lines)
│ ├── ProfileImage.tsx (120 lines)
│ ├── ProfileInfo.tsx (150 lines)
│ └── ProfileActions.tsx (180 lines)
│
├── SwipeGesture.tsx (200 lines)
└── MatchModal.tsx (200 lines)

```

#### **2. src/features/messaging/screens/ChatScreen.tsx (1066 → 250 lines)**

**Split into:**

```

src/screens/ChatScreen.tsx (250 lines)
↓ uses:

src/hooks/useMessages.ts (200 lines)
src/hooks/useChatRealtime.ts (150 lines)
↓ calls:

src/api/messages.api.ts (250 lines)
src/api/realtime.api.ts (180 lines)
↓ renders:

src/components/messaging/
├── ChatHeader.tsx (120 lines)
├── MessagesList.tsx (200 lines)
│ ├── MessageBubble.tsx (120 lines)
│ ├── MessageStatus.tsx (80 lines)
│ └── TypingIndicator.tsx (60 lines)
│
├── MessageInput.tsx (180 lines)
│ ├── EmojiPicker.tsx (150 lines)
│ └── ImagePicker.tsx (120 lines)
│
└── ChatActions.tsx (150 lines)

```

#### **3. app/(main)/messages.tsx (1105 → 200 lines)**

**Split into:**

```

app/(main)/messages.tsx (200 lines)
↓ uses:

src/hooks/useConversations.ts (150 lines)
↓ calls:

src/api/conversations.api.ts (180 lines)
↓ renders:

src/components/messaging/
├── ConversationList.tsx (200 lines)
├── ConversationCard.tsx (150 lines)
├── ActiveUsersList.tsx (120 lines)
└── ActiveUserBadge.tsx (80 lines)

```

#### **4. app/(main)/likes.tsx (792 → 200 lines)**

**Split into:**

```

app/(main)/likes.tsx (200 lines)
↓ uses:

src/hooks/useMatches.ts (150 lines)
↓ calls:

src/api/matches.api.ts (120 lines)
↓ renders:

src/components/matching/
├── MatchesGrid.tsx (180 lines)
├── MatchCard.tsx (150 lines)
├── MatchFilter.tsx (120 lines)
└── MatchActions.tsx (100 lines)

````

---

## **PHASE 4: Add Missing Features**

**Target: 2-3 days**

### **Task 4.1: Implement Realtime Subscriptions**

```typescript
// src/api/realtime.api.ts
export const realtimeApi = {
  subscribeToMessages: (conversationId: string, callback: Function) => {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback,
      )
      .subscribe();
  },� DOCUMENTATION STANDARDS

### **Required Documentation for Each Feature**

#### **1. Feature README.md**
Each feature must have a README explaining:
- **Purpose**: What problem does this feature solve?
- **Architecture**: How is it structured?
- **Components**: What are the main building blocks?
- **Usage**: How to use this feature?
- **Testing**: How to test it?

**Example:** `src/features/matching/README.md`

#### **2. File-Level Documentation**
Every file must include:
```typescript
/**
 * ComponentName / HookName / API Name
 *
 * PURPOSE: Brief description of what this file does
 *
 * SOLID PRINCIPLES APPLIED:
 * - Single Responsibility: Specific responsibility
 * - Open/Closed: How it's extensible
 * - [Other applicable principles]
 *
 * USAGE:
 * ```typescript
 * // Example code
 * ```
 *
 * @filesize ~XXX lines (under 500 limit)
 */
```

#### **3. Function/Component Documentation**
```typescript
/**
 * Function/Component description
 *
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 *
 * @example
 * ```typescript
 * const result = functionName(param);
 * ```
 */
```

#### **4. Inline Comments**
- Explain WHY, not WHAT
- Complex logic requires explanation
- Document edge cases

---

## 🧪 TESTING STRATEGY

### **Testing Pyramid**

```
---

## 🎯 NEXT STEPS & PRIORITIES

### **HIGH PRIORITY: Complete Core Features**

#### **Week 1-2: Messages Feature Refactoring**
- [ ] **Day 1-2**: Refactor `app/(main)/messages.tsx`
  - [ ] Create `MessagesScreen.tsx` (250 lines)
  - [ ] Create `ConversationList.tsx` (200 lines)
  - [ ] Create `ConversationCard.tsx` (150 lines)
  - [ ] Document architecture
  - [ ] Add unit tests

- [ ] **Day 3-4**: Refactor Profile Screen
  - [ ] Split `profile.tsx` (561 → <300 lines)
  - [ ] Create `ProfileScreen.tsx` (250 lines)
  - [ ] Create `ProfileView.tsx` (200 lines)
  - [ ] Create `ProfileEdit.tsx` (180 lines)
  - [ ] Document components
  - [ ] Add tests

- [ ] **Day 5**: Refactor AccountAPI
  - [ ] Split `accountApi.ts` (548 → <300 lines)
  - [ ] Create `basicInfo.api.ts` (150 lines)
  - [ ] Create `preferences.api.ts` (150 lines)
  - [ ] Create `photos.api.ts` (120 lines)
  - [ ] Document APIs
  - [ ] Add tests

#### **Week 3: Testing & Documentation**
- [ ] Write unit tests for all hooks (70% coverage target)
- [ ] Write component tests (20% coverage target)
- [ ] Write integration tests (10% coverage target)
- [ ] Create README.md for each feature
- [ ] Add JSDoc comments everywhere
- [ ] Create architecture diagrams

#### **Week 4: Polish & Quality**
- [ ] Run ESLint and fix all warnings
- [ ] Run TypeScript strict mode
- [ ] Remove all `any` types
---

## ✅ REFACTORING CHECKLIST

### **Per-Feature Validation**

Before marking any feature as complete, verify ALL of the following:

#### **1. Code Quality ✅**
- [ ] No files over 500 lines
- [ ] Components under 300 lines preferred
- [ ] Hooks under 250 lines preferred
- [ ] APIs under 200 lines preferred
- [ ] Stores under 150 lines preferred
- [ ] TypeScript strict mode (no `any` types)
- [ ] ESLint warnings resolved
- [ ] Consistent naming conventions
- [ ] All inputs validated with Zod schemas
- [ ] All user inputs sanitized

#### **2. Architecture ✅**
- [ ] SOLID principles applied and documented
- [ ] UI components only render (no business logic)
- [ ] Business logic in hooks
- [ ] Data access in API layer
- [ ] No direct Supabase calls in components
- [ ] Dependency Inversion (abstractions, not implementations)
- [ ] Clear separation of concerns

#### **3. Data Management ✅**
- [ ] Zero mock data
- [ ] No hardcoded arrays
- [ ] No simulated delays (setTimeout)
- [ ] No fallback mock data on errors
- [ ] 100% database-driven
- [ ] Proper error handling
- [ ] Loading states on all async operations
- [ ] Empty states for no data scenarios

#### **4. Testing ✅**
- [ ] Unit tests for hooks (90%+ coverage)
- [ ] Component tests (80%+ coverage)
- [ ] Integration tests for critical flows
- [ ] Test file for each component/hook
- [ ] Mock external dependencies
- [ ] Test error scenarios
- [ ] Test loading states

#### **5. Documentation ✅**
- [ ] Feature README.md created
- [ ] File-level documentation (purpose, architecture)
- [ ] SOLID principles documented in file headers
- [ ] JSDoc comments on all exports
- [ ] Inline comments for complex logic
- [ ] Usage examples in documentation
- [ ] Architecture diagrams (if complex)

#### **6. Performance ✅**
- [ ] No unnecessary re-renders
- [ ] Memoization where needed (useMemo, useCallback)
- [ ] Lazy loading for heavy components
- [ ] Image optimization
- [ ] List virtualization for long lists
- [ ] Debouncing for search/input

#### **7. User Experience ✅**
- [ ] Loading indicators during async operations
- [ ] Error messages are user-friendly
- [ ] Empty states are informative
- [ ] Smooth animations (60fps)
- [ ] Accessibility labels on interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader compatible

#### **8. Security ✅**
- [ ] No sensitive data in AsyncStorage
- [ ] All API calls authenticated (Supabase RLS)
- [ ] Input validation on all forms
- [ ] User inputs sanitized
- [ ] Session tokens securely stored
- [ ] Auto token refresh implemented
- [ ] Proper error messages (no data leakage)
- [ ] HTTPS only communication

---

## 📈 PROGRESS TRACKING

### **Completed Features ✅**

| Feature | Status | Lines Before | Lines After | Files Created | Tests | Docs |
|---------|--------|--------------|-------------|---------------|-------|------|
| **Discover/Swipe** | ✅ DONE | 1,836 | 1,707 (7 files) | 7 | ⏳ TODO | ✅ DONE |
| **Database Integration** | ✅ DONE | N/A | N/A | 0 | ⏳ TODO | ✅ DONE |

### **In Progress 🔄**

| Feature | Status | Target Date | Assignee |
|---------|--------|-------------|----------|
| Messages Screen | 🔄 Planned | Week 1-2 | - |
| Profile Screen | 🔄 Planned | Week 1-2 | - |
| Account API | 🔄 Planned | Week 1-2 | - |

### **Pending ⏳**

| Feature | Priority | Estimated Time |
|---------|----------|----------------|
| Testing (All Features) | HIGH | Week 3 |
| Documentation Completion | MEDIUM | Week 3 |
| Performance Optimization | MEDIUM | Week 4 |
| Accessibility Audit | LOW | Week 4 |

---

## 🎓 LESSONS LEARNED

### **What Worked Well ✅**

1. **Feature-First Approach**
   - Clear boundaries between features
   - Easy to understand and navigate
   - Self-contained modules

2. **SOLID Principles**
   - Single Responsibility made files easier to test
   - Interface Segregation reduced coupling
   - Dependency Inversion made components reusable

3. **Documentation-First**
   - Writing docs helped clarify architecture
   - Easier for team onboarding
   - Reduces technical debt

4. **Incremental Refactoring**
   - Less risky than big-bang rewrite
   - Can ship features as we go
   - Easier to track progress

### **Challenges Faced ⚠️**

1. **Large File Size**
   - Solution: Be aggressive about splitting early
   - Tip: If file >300 lines, consider splitting

2. **Testing Legacy Code**
   - Solution: Refactor for testability first
   - Tip: Extract logic to pure functions/hooks

3. **Maintaining Working State**
   - Solution: Keep backups, use git branches
   - Tip: Test frequently during refactoring

### **Best Practices Moving Forward 🚀**

1. **Never exceed 500 lines** - Split immediately when approaching 400
2. **Test as you build** - Don't defer testing to later
3. **Document while fresh** - Write docs as you code
4. **Review before merging** - Get peer review on architecture
5. **Measure what matters** - Track file sizes, test coverage, complexity

---

## 📝 CONTRIBUTION GUIDELINES

### **Adding a New Feature**

1. **Create feature directory**
   ```
   src/features/[feature-name]/
   ├── api/
   ├── hooks/
   ├── components/
   ├── screens/
   ├── types/
   └── README.md
   ```

2. **Follow file size limits**
   - Components: <300 lines
   - Hooks: <250 lines
   - APIs: <200 lines
   - Max: <500 lines

3. **Apply SOLID principles**
   - Document which principles you applied
   - Explain in file header

4. **Write tests first (TDD)**
   - Write test
   - Make it pass
   - Refactor

5. **Document thoroughly**
   - Feature README
   - File headers
   - JSDoc on exports
   - Inline comments

6. **Get code review**
   - Architecture review
   - Code quality check
   - Test coverage verification

---

## 🔗 RELATED DOCUMENTATION

- [INDEX_REFACTORING_SUMMARY.md](./INDEX_REFACTORING_SUMMARY.md) - Detailed discover screen refactoring
- [INDEX_REFACTORING_VISUAL.md](./INDEX_REFACTORING_VISUAL.md) - Visual architecture diagrams
- [TESTING_GUIDE.md](./..\testing\TESTING_GUIDE.md) - Testing strategies and examples
- [SMART_MATCHING_ALGORITHM.md](./..\architecture\SMART_MATCHING_ALGORITHM.md) - Matching algorithm documentation

---

## 🎯 SUMMARY

**Mission:** Transform Pinaymate into a clean, modular, testable, and maintainable codebase using industry best practices.

**Status:**
- ✅ Core architecture defined
- ✅ Discover feature fully refactored
- ✅ Database integration complete
- 🔄 3 more features to refactor
- ⏳ Testing infrastructure to build
- ⏳ Documentation to complete

**Next Milestone:** Complete messages screen refactoring by end of Week 2

---

**Let's build something amazing! 🚀**ofiles to load
    await waitFor(() => {
      expect(getByText('Maria, 25')).toBeTruthy();
    });

    // Simulate like button press
    fireEvent.press(getByTestId('like-button'));

    // Verify API was called
    expect(matchingApi.likeProfile).toHaveBeenCalled();

    // Verify next profile is shown
    await waitFor(() => {
      expect(getByText('Angel, 23')).toBeTruthy();
    });
  });
});
```

### **Test Coverage Requirements**

```
✅ Hooks:      90%+ coverage
✅ Components: 80%+ coverage
✅ API Layer:  85%+ coverage
✅ Utils:      95%+ coverage
✅ Overall:    80%+ coverage
```

---

## 📊 METRICS & SUCCESS CRITERIA

### **Code Quality Metrics**

#### **Before Refactoring**
```
❌ Average file size:  900+ lines
❌ Largest file:       1,836 lines (index.tsx)
❌ Files over 500:     7 files
❌ Mock data:          600+ lines
❌ Test coverage:      0%
❌ Documentation:      Minimal
❌ Modularity:         2/10
❌ Maintainability:    3/10
❌ Testability:        1/10
```

#### **After Refactoring (Current State)**
```
✅ Average file size:  244 lines (matching feature)
✅ Largest file:       429 lines (ProfileDetailsModal)
✅ Files over 500:     3 files (messages.tsx, profile.tsx, accountApi.ts)
✅ Mock data:          0 lines (ZERO)
✅ Test coverage:      0% (tests pending)
✅ Documentation:      Comprehensive (see INDEX_REFACTORING_SUMMARY.md)
✅ Modularity:         9/10 (matching feature)
✅ Maintainability:    9/10 (matching feature)
✅ Testability:        9/10 (matching feature)
```

#### **Target State (Q1 2026)**
```
🎯 Average file size:  <300 lines
🎯 Largest file:       <450 lines
🎯 Files over 500:     0 files
🎯 Mock data:          0 lines
🎯 Test coverage:      80%+
🎯 Documentation:      100% (all features)
🎯 Modularity:         9/10 (all features)
🎯 Maintainability:    9/10 (all features)
🎯 Testability:        9/10 (all features)
### **Task 4.2: Add Error Handling**

```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

export const errorHandler = {
  handle: (error: any) => {
    if (error.code === "42P01") {
      return new AppError("Table not found", "TABLE_NOT_FOUND", 404);
    }
    if (error.code === "42703") {
      return new AppError("Column not found", "COLUMN_NOT_FOUND", 404);
    }
    // ... more error types
    return new AppError("Unknown error", "UNKNOWN", 500);
  },
};
```

### **Task 4.3: Add Loading States**

```typescript
// src/components/ui/LoadingState.tsx
export function LoadingState({ type = 'spinner' }) {
  if (type === 'skeleton-profile') {
    return <SkeletonProfileCard />;
  }
  return <ActivityIndicator />;
}
```

---

## 📊 METRICS & SUCCESS CRITERIA

### **Before Refactoring**

```
❌ Lines per file:     500-2000+ lines
❌ Mock data:          600+ lines
❌ Files over 500:     7 files
❌ Test coverage:      0%
❌ Modularity score:   2/10
❌ Maintainability:    3/10
❌ Testability:        1/10
```

### **After Refactoring**

```
✅ Lines per file:     <500 lines each
✅ Mock data:          0 lines (ZERO)
✅ Files over 500:     0 files
✅ Test coverage:      70%+
✅ Modularity score:   9/10
✅ Maintainability:    9/10
✅ Testability:        9/10
```

### **File Count Changes**

```
BEFORE:  ~15 large files
AFTER:   ~60 small, focused files

Example:
- 1 file (2048 lines) → 15 files (<300 lines each)
- 1 file (1066 lines) → 12 files (<250 lines each)
- 1 file (1105 lines) → 10 files (<200 lines each)
```

---

## 🎯 IMMEDIATE ACTION PLAN

### **Day 1-2: Phase 1.1 - Fix Messages**

- [ ] Create `src/hooks/useConversations.ts`
- [ ] Create `src/api/conversations.api.ts`
- [ ] Create conversation components
- [ ] Remove ALL mock data from messages.tsx
- [ ] Test with real database

### **Day 3-4: Phase 1.2 - Fix Discover**

- [ ] Create `src/hooks/useDiscoverProfiles.ts`
- [ ] Create `src/api/profiles.api.ts`
- [ ] Create discover components
- [ ] Remove ALL mock data from index.tsx
- [ ] Test swipe functionality

### **Day 5-6: Phase 1.3 - Fix Chat**

- [ ] Create `src/hooks/useMessages.ts`
- [ ] Create `src/api/messages.api.ts`
- [ ] Implement realtime subscriptions
- [ ] Remove ALL mock data from ChatScreen
- [ ] Test message sending/receiving

### **Week 2: Phases 2-3**

- [ ] Extract remaining business logic to hooks
- [ ] Create pure API layer
- [ ] Split all files over 500 lines
- [ ] Create reusable components

### **Week 3: Phase 4**

- [ ] Add comprehensive error handling
- [ ] Add loading states everywhere
- [ ] Add empty states
- [ ] Write unit tests

---

## 🔍 VALIDATION CHECKLIST

Before marking refactoring as complete, verify:

### **Zero Mock Data**

- [ ] No hardcoded profile arrays
- [ ] No hardcoded message arrays
- [ ] No simulated delays/responses
- [ ] No fallback mock data on errors
- [ ] All data from Supabase

### **File Size Compliance**

- [ ] No files over 500 lines
- [ ] Components under 300 lines
- [ ] Hooks under 200 lines
- [ ] APIs under 200 lines

### **Architecture**

- [ ] UI components only render
- [ ] Business logic in hooks
- [ ] Data access in API layer
- [ ] No direct Supabase calls in components
- [ ] Proper error handling everywhere
- [ ] Loading states on all async operations

### **Code Quality**

- [ ] TypeScript strict mode enabled
- [ ] No `any` types
- [ ] Proper error types
- [ ] JSDoc comments on public APIs
- [ ] Consistent naming conventions

---

## 📝 NOTES

**Important Decisions:**

1. **No Mock Data Exception** - Even during errors, show error state instead of fallback data
2. **Strict 500 Line Limit** - If approaching limit, split immediately
3. **Test-Driven Refactoring** - Write tests as we refactor
4. **Incremental Migration** - One screen at a time, deploy frequently

**Risk Mitigation:**

- Keep old files as `.backup` during migration
- Feature flags for new components
- Gradual rollout screen by screen
- Comprehensive testing at each phase

---

## 🚀 LET'S BEGIN!

**First Target:** `app/(main)/messages.tsx`
**Estimated Time:** 6-8 hours
**Files to Create:** 7 new files
**Lines to Remove:** 600+ lines of mock data
**Result:** Clean, database-driven messages screen <200 lines

Ready to start? 💪
````
