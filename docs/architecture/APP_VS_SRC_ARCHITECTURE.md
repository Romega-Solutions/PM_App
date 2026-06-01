# 📁 App vs Src Folder Architecture - Analysis & Recommendations

**Date:** January 21, 2026  
**Project:** Pinaymate Mobile  
**Architecture:** Feature-First Design with Expo Router

---

## 🎯 Purpose & Responsibilities

### **`app/` Folder - Routes Only**

**Purpose:** Expo Router file-based routing  
**Responsibility:** Define navigation structure, nothing else

**Should Contain:**

- ✅ Route files (thin wrappers, <30 lines each)
- ✅ Layout files (\_layout.tsx)
- ✅ Imports from `src/` features
- ✅ Simple wrapper components

**Should NOT Contain:**

- ❌ Business logic
- ❌ UI components
- ❌ State management
- ❌ API calls
- ❌ Complex styling
- ❌ Data fetching
- ❌ Form validation

**Example (Good):**

```typescript
// app/(main)/profile.tsx
import { ProfileScreen } from '@/src/features/profile/screens/ProfileScreen';

export default function Profile() {
  return <ProfileScreen />;
}
```

---

### **`src/` Folder - Everything Else**

**Purpose:** All application logic and features  
**Responsibility:** Business logic, UI, state, APIs, utilities

**Should Contain:**

- ✅ Feature modules (matching, messaging, profile, auth, account)
- ✅ Reusable components
- ✅ Zustand stores
- ✅ API services
- ✅ Hooks
- ✅ Utilities
- ✅ Types
- ✅ Configuration

**Organization:**

```
src/
├── features/         # Feature modules (self-contained)
├── components/       # Shared UI components
├── stores/          # Zustand global state
├── hooks/           # Shared custom hooks
├── utils/           # Utility functions
├── config/          # App configuration
├── services/        # External services
└── theme/           # Styling & theming
```

---

## 📊 Current State Analysis

### **✅ PROPERLY REFACTORED (Following Best Practices)**

#### **1. Messages Screen** ✅

- **Route:** `app/(main)/messages.tsx` - 28 lines (thin wrapper)
- **Implementation:** `src/features/messaging/`
  - `screens/MessagesScreen.tsx` - 469 lines
  - `components/ActiveUserCard.tsx` - 141 lines
  - `components/ConversationCard.tsx` - 258 lines
- **Status:** ✅ Perfect - Route is thin, logic in features
- **Zustand:** ✅ Integrated with chatStore

#### **2. Profile Screen** ✅

- **Route:** `app/(main)/profile.tsx` - 28 lines (thin wrapper)
- **Implementation:** `src/features/profile/`
  - `screens/ProfileScreen.tsx` - 343 lines
  - `components/ProfileHeader.tsx` - 219 lines
  - `components/ProfileMenuList.tsx` - 188 lines
- **Status:** ✅ Perfect - Route is thin, logic in features
- **Zustand:** ✅ Integrated with profileStore

---

### **❌ NEEDS REFACTORING (Not Following Best Practices)**

#### **1. Discover/Home Screen** ⚠️

- **Route:** `app/(main)/index.tsx` - **Unknown size** (needs checking)
- **Implementation:** `src/features/matching/`
  - Already has proper structure (screens/, components/, hooks/)
- **Issue:** Need to verify if route file is thin wrapper
- **Priority:** HIGH
- **Action:** Check if `app/(main)/index.tsx` is a thin wrapper

#### **2. Chat Screen** ⚠️

- **Route:** `app/(main)/chat.tsx` - **Unknown size**
- **Implementation:** `src/features/messaging/screens/ChatScreen.tsx`
- **Issue:** Route file might contain logic
- **Priority:** MEDIUM
- **Action:** Verify route is thin wrapper

#### **3. Likes Screen** ⚠️

- **Route:** `app/(main)/likes.tsx` - **Unknown size**
- **Implementation:** Likely needs feature structure
- **Issue:** May not have proper feature organization
- **Priority:** MEDIUM
- **Action:** Check implementation and refactor if needed

#### **4. Video Call Screen** ⚠️

- **Route:** `app/(main)/video-call.tsx` - **Unknown size**
- **Implementation:** Unknown
- **Issue:** Unknown structure
- **Priority:** LOW (feature may not be implemented yet)

#### **5. Voice Call Screen** ⚠️

- **Route:** `app/(main)/voice-call.tsx` - **Unknown size**
- **Implementation:** Unknown
- **Issue:** Unknown structure
- **Priority:** LOW (feature may not be implemented yet)

---

### **🔍 AUTH ROUTES - Need Verification**

#### **Auth Account Setup Screens:**

- `app/(auth)/account-setup/basic-info.tsx`
- `app/(auth)/account-setup/location.tsx`
- `app/(auth)/account-setup/preferences.tsx`
- `app/(auth)/account-setup/profile-photos.tsx`
- `app/(auth)/account-setup/verification-upload.tsx`
- `app/(auth)/account-setup/welcome-complete.tsx`

**Implementation:** `src/features/account/screens/`

- ✅ AccountBasicInfoScreen.tsx
- ✅ AccountProfilePhotosScreen.tsx
- ✅ LocationScreen.tsx
- ✅ PreferencesScreen.tsx
- ✅ VerificationUploadScreen.tsx
- ✅ WelcomeCompleteScreen.tsx

**Status:** ✅ Feature structure exists, need to verify route files are thin

---

#### **Auth Screens:**

- `app/(auth)/signin.tsx`
- `app/(auth)/signup.tsx`
- `app/(auth)/forgot-password.tsx`
- `app/(auth)/verify-email.tsx`
- `app/(auth)/verify-phone.tsx`

**Implementation:** `src/features/auth/screens/`

- ✅ ForgotPasswordScreen.tsx
- ✅ SignInScreen (needs verification)
- ✅ SignUpScreen (needs verification)

**Status:** ⚠️ Partially refactored, need verification

---

### **📋 PROFILE SETTINGS ROUTES - Need Checking**

Routes in `app/(main)/profile-settings/`:

- about.tsx
- edit.tsx
- help.tsx
- notifications.tsx
- preferences.tsx
- privacy.tsx

**Status:** ⚠️ Unknown - likely need refactoring

---

## 🎯 Refactoring Priority List

### **Priority 1: CRITICAL (Check Immediately)**

1. **app/(main)/index.tsx (Discover/Home)**
   - Check file size and content
   - Verify if it's a thin wrapper
   - If not, refactor to match messages/profile pattern

2. **app/(main)/likes.tsx**
   - Check file size and content
   - Verify if it uses `src/features/matching/` properly
   - Refactor if needed

3. **app/(main)/chat.tsx**
   - Check if it's a thin wrapper
   - Should import from `src/features/messaging/screens/ChatScreen.tsx`

---

### **Priority 2: IMPORTANT (Verify & Fix)**

4. **Auth route files** (`app/(auth)/*.tsx`)
   - Verify all are thin wrappers
   - Should import from `src/features/auth/screens/`

5. **Account setup route files** (`app/(auth)/account-setup/*.tsx`)
   - Verify all are thin wrappers
   - Should import from `src/features/account/screens/`

6. **Profile settings route files** (`app/(main)/profile-settings/*.tsx`)
   - Check if these need feature structure
   - May need `src/features/profile/screens/settings/` folder

---

### **Priority 3: MAINTENANCE (Future Work)**

7. **Video/Voice call screens**
   - Low priority (likely not implemented)
   - Will need `src/features/calling/` when implemented

8. **Modal routes** (`app/(modals)/*.tsx`)
   - Check filters.tsx
   - Verify proper structure

---

## ✅ What's Working Well (Keep This)

### **1. Zustand Stores** ✅

```
src/stores/
├── authStore.ts          ✅ Complete
├── profileStore.ts       ✅ Complete
├── matchingStore.ts      ✅ Complete
└── chatStore.ts          ✅ Complete
```

**Status:** All stores properly implemented

### **2. Feature Structure** ✅

```
src/features/
├── messaging/            ✅ Well organized
├── profile/              ✅ Well organized
├── matching/             ✅ Has proper structure
├── auth/                 ✅ Has proper structure
└── account/              ✅ Has proper structure
```

### **3. Shared Resources** ✅

```
src/
├── components/           ✅ Reusable UI components
├── hooks/               ✅ Shared hooks (useAuthPersistence, etc.)
├── utils/               ✅ Security utils, validators
├── config/              ✅ Supabase, constants
└── theme/               ✅ Colors, typography
```

---

## 🚨 What Needs Immediate Attention

### **1. Verify Thin Wrappers in `app/`**

**Check these files:**

- [ ] `app/(main)/index.tsx` - Discover screen
- [ ] `app/(main)/chat.tsx` - Chat screen
- [ ] `app/(main)/likes.tsx` - Likes screen
- [ ] `app/(auth)/signin.tsx` - Sign in
- [ ] `app/(auth)/signup.tsx` - Sign up
- [ ] `app/(auth)/account-setup/*.tsx` - All account setup screens

**What to look for:**

- ❌ Files > 50 lines = NOT thin wrapper
- ❌ Business logic in route file = NEEDS REFACTORING
- ❌ State management in route = NEEDS REFACTORING
- ❌ API calls in route = NEEDS REFACTORING
- ✅ Files < 30 lines = Good thin wrapper
- ✅ Only imports and renders = Perfect

---

### **2. Missing Feature Structures**

**Profile Settings** - May need:

```
src/features/profile/screens/settings/
├── EditProfileScreen.tsx
├── PreferencesScreen.tsx
├── PrivacyScreen.tsx
├── NotificationsScreen.tsx
├── HelpScreen.tsx
└── AboutScreen.tsx
```

**Or create separate feature:**

```
src/features/settings/
├── screens/
├── components/
└── hooks/
```

---

## 📝 Recommended Next Steps

### **Step 1: Audit (15 minutes)**

Run this command to check file sizes:

```bash
wc -l app/(main)/*.tsx app/(auth)/*.tsx app/(auth)/account-setup/*.tsx
```

### **Step 2: Identify Problems (5 minutes)**

Look for:

- Files > 50 lines in `app/` folder
- Business logic in route files
- Direct Supabase calls in route files

### **Step 3: Prioritize Refactoring (10 minutes)**

Based on file sizes:

1. Largest files first
2. Most used screens second
3. Low-priority features last

### **Step 4: Refactor (Ongoing)**

Follow the pattern:

1. Create feature structure in `src/features/`
2. Move logic to screen components
3. Extract reusable UI to components
4. Update route file to thin wrapper
5. Test and verify

---

## 🎨 Ideal Final Structure

### **app/ - Routes Only (Thin Wrappers)**

```typescript
// Every file in app/ should look like this:
import { SomeScreen } from '@/src/features/some-feature/screens/SomeScreen';

export default function SomeRoute() {
  return <SomeScreen />;
}
```

### **src/ - All Logic**

```
src/
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── account/
│   ├── messaging/
│   ├── matching/
│   ├── profile/
│   └── settings/ (new?)
├── stores/
├── components/
├── hooks/
├── utils/
└── config/
```

---

## 🔍 Quick Audit Commands

### **1. Check Route File Sizes**

```bash
# Check main routes
wc -l app/(main)/*.tsx

# Check auth routes
wc -l app/(auth)/*.tsx app/(auth)/account-setup/*.tsx

# Check profile settings
wc -l app/(main)/profile-settings/*.tsx
```

### **2. Find Large Files (> 100 lines)**

```bash
find app -name "*.tsx" -exec wc -l {} \; | awk '$1 > 100' | sort -nr
```

### **3. Search for Anti-Patterns**

```bash
# Find useState in route files (should be in features)
grep -r "useState" app/

# Find useEffect in route files (should be in features)
grep -r "useEffect" app/

# Find direct supabase calls in route files
grep -r "supabase\." app/
```

---

## ✅ Success Criteria

A properly structured app should have:

1. ✅ All `app/` files < 50 lines
2. ✅ No business logic in `app/` folder
3. ✅ All features in `src/features/`
4. ✅ Zustand stores for global state
5. ✅ Reusable components in `src/components/`
6. ✅ All files < 500 lines
7. ✅ SOLID principles followed
8. ✅ TypeScript strict mode, zero errors

---

## 📊 Current Progress

### **Completed:**

- ✅ Messages screen refactored
- ✅ Profile screen refactored
- ✅ Zustand stores implemented
- ✅ Security utilities created
- ✅ Auth persistence implemented

### **Needs Work:**

- ⏳ Discover/Home screen (verify)
- ⏳ Likes screen (verify)
- ⏳ Chat screen (verify)
- ⏳ Auth routes (verify thin wrappers)
- ⏳ Account setup routes (verify thin wrappers)
- ⏳ Profile settings routes (may need refactoring)

### **Estimated Time:**

- **Quick Audit:** 15 minutes
- **Fix High Priority:** 2-3 hours
- **Complete All:** 1-2 days

---

## 🎯 Immediate Action Required

**Run this command now:**

```bash
wc -l app/(main)/index.tsx app/(main)/chat.tsx app/(main)/likes.tsx
```

This will tell us which files need immediate refactoring.

**Then report back with:**

1. File sizes
2. Which files are > 50 lines
3. We'll prioritize refactoring based on results
