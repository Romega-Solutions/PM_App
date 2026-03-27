# 🚀 Copy-Paste Guide for AI: Simplified MVP Architecture

## 📋 Give This to Your AI Every Time

````
You are helping me build a React Native Expo dating app using a SIMPLIFIED Clean Architecture for MVP.

CRITICAL RULES:
1. app/ folder MUST stay at root (Expo Router requirement)
2. All business logic goes in src/
3. Keep it simple - no over-engineering
4. Follow the structure below EXACTLY

---

FOLDER STRUCTURE:

Pinaymate/
├── app/                              # Routes ONLY (Expo Router)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   │   └── verify.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx                # Home/Matching
│       ├── matches.tsx
│       ├── messages.tsx
│       └── profile.tsx
│
└── src/
    ├── config/
    │   ├── supabase.ts              # Supabase client
    │   └── constants.ts             # App constants
    │
    ├── features/
    │   ├── auth/
    │   │   ├── api/
    │   │   │   └── authApi.ts       # Supabase auth calls
    │   │   ├── hooks/
    │   │   │   ├── useSignIn.ts
    │   │   │   ├── useSignUp.ts
    │   │   │   └── useAuth.ts       # Global auth state
    │   │   ├── screens/
    │   │   │   ├── SignInScreen.tsx
    │   │   │   └── SignUpScreen.tsx
    │   │   └── types/
    │   │       └── index.ts
    │   │
    │   ├── profile/
    │   │   ├── api/
    │   │   │   └── profileApi.ts
    │   │   ├── hooks/
    │   │   │   ├── useProfile.ts
    │   │   │   └── useUpdateProfile.ts
    │   │   ├── screens/
    │   │   │   ├── ProfileScreen.tsx
    │   │   │   └── EditProfileScreen.tsx
    │   │   └── types/
    │   │
    │   ├── matching/
    │   │   ├── api/
    │   │   │   └── matchingApi.ts
    │   │   ├── hooks/
    │   │   │   ├── useMatches.ts
    │   │   │   └── useSwipe.ts
    │   │   ├── screens/
    │   │   │   └── SwipeScreen.tsx
    │   │   ├── services/            # Complex logic only
    │   │   │   └── matchingAlgorithm.ts
    │   │   └── types/
    │   │
    │   └── messaging/
    │       ├── api/
    │       ├── hooks/
    │       ├── screens/
    │       └── types/
    │
    ├── shared/
    │   ├── components/
    │   │   └── ui/
    │   │       ├── Button.tsx
    │   │       ├── Input.tsx
    │   │       ├── Card.tsx
    │   │       └── Avatar.tsx
    │   ├── hooks/
    │   │   ├── useAsync.ts
    │   │   └── useDebounce.ts
    │   ├── utils/
    │   │   ├── validators.ts
    │   │   └── formatters.ts
    │   └── types/
    │       └── common.ts
    │
    └── theme/
        ├── colors.ts
        └── spacing.ts

---

FILE PATTERNS TO FOLLOW:

1. API LAYER (Supabase calls):
```typescript
// src/features/auth/api/authApi.ts
import { supabase } from '@/src/config/supabase';

export const authApi = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
````

2. HOOK LAYER (Logic + State):

```typescript
// src/features/auth/hooks/useSignIn.ts
import { useState } from "react";
import { authApi } from "../api/authApi";

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.signIn(email, password);
      // Success handled by global auth state
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
};
```

3. SCREEN LAYER (UI Component):

```typescript
// src/features/auth/screens/SignInScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useSignIn } from '../hooks/useSignIn';
import { Button } from '@/src/shared/components/ui/Button';

interface SignInScreenProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSuccess,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useSignIn();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      onSuccess();
    } catch {
      // Error already handled in hook
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title="Sign In"
        onPress={handleSignIn}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  error: { color: 'red', marginBottom: 10 },
});
```

4. ROUTE LAYER (Expo Router):

```typescript
// app/(auth)/signin.tsx
import React from 'react';
import { useRouter } from 'expo-router';
import { SignInScreen } from '@/src/features/auth/screens/SignInScreen';

export default function SignInRoute() {
  const router = useRouter();

  return (
    <SignInScreen
      onSuccess={() => router.replace('/(tabs)')}
      onForgotPassword={() => router.push('/(auth)/forgot-password')}
    />
  );
}
```

---

TYPESCRIPT CONFIG (tsconfig.json):

Add these path aliases:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"],
      "@/src/*": ["./src/*"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

---

WHEN I ASK YOU TO CREATE A FEATURE:

Step 1: Show me the folder structure
Step 2: Create api/ file (Supabase calls)
Step 3: Create hooks/ files (one hook per action)
Step 4: Create screens/ file (UI component)
Step 5: Create route file in app/ (navigation wrapper)
Step 6: Create types/ if needed (3+ types)

RULES:
✅ DO:

- Handle loading and error states
- Add TypeScript types
- Keep screens under 200 lines
- Use descriptive variable names
- Add TODO comments for setup needed

❌ DON'T:

- Create ViewModels, UseCases, Repositories (unless I ask)
- Create Mappers or DTOs
- Put API calls in screens
- Use 'any' type
- Create files that are used only once

---

ERROR HANDLING PATTERN:

Always use try-catch:

```typescript
const handleAction = async () => {
  try {
    setLoading(true);
    setError(null);
    await someApi.call();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

---

BEFORE YOU WRITE CODE, ASK ME:

1. Should this data be real-time or fetched once?
2. Do you want offline support?
3. Should this have optimistic updates?
4. Any specific validation rules?

---

REMIND ME IF I'M DOING WRONG:

- Putting business logic in app/ routes
- Creating unnecessary abstractions
- Forgetting error handling
- Not handling loading states
- Over-engineering simple features

---

START EVERY RESPONSE WITH:
"I'll create [feature] following the simplified MVP structure."

Then show:

1. Folder structure that will be created
2. Files with full code
3. What I need to configure (env vars, Supabase tables, etc.)
4. How to test it

Ready to help! What feature should we build first?

```

---

## 🎯 How to Use This Guide

### Step 1: Copy the entire block above

### Step 2: Start a new chat with your AI and paste it

### Step 3: Then ask your AI something like:

```

I need to build the sign-in feature for my dating app.

Requirements:

- Email and password sign-in
- Show loading spinner while signing in
- Display error messages
- Navigate to home screen on success
- Add a "Forgot Password?" link

Please follow the guide and show me:

1. Folder structure
2. All code files
3. What Supabase configuration I need

```

### Step 4: For Every New Feature

Just say:
```

I need to build [feature name] with [requirements].
Follow the simplified MVP structure guide.

```

---

## 📝 Quick Reference Commands

### Create New Feature
```

Create a [feature name] feature with:

- [List requirements]
- Follow MVP structure
- Keep it simple

```

### Fix Existing Code
```

This code is too complex, simplify it following MVP structure:
[paste your code]

```

### Review Architecture
```

Review my current structure and tell me:

1. What's good
2. What's over-engineered
3. What's missing
4. Quick wins to improve

```

---

## 🚨 Red Flags to Watch For

If your AI creates any of these, stop and ask for simplification:

- ❌ `domain/entities/`
- ❌ `domain/repositories/` (interfaces)
- ❌ `data/repositories/` (implementations)
- ❌ `data/mappers/`
- ❌ `data/models/`
- ❌ `presentation/viewmodels/`
- ❌ `useCases/`

Instead, you should see:
- ✅ `api/` (Supabase calls)
- ✅ `hooks/` (logic + state)
- ✅ `screens/` (UI components)
- ✅ `types/` (when needed)
- ✅ `services/` (only for complex algorithms)

---

## 💡 Example Conversation Flow

**You:** "Create user profile feature"

**AI:** "I'll create profile feature following the simplified MVP structure.

**Folder structure:**
```

src/features/profile/
├── api/profileApi.ts
├── hooks/
│ ├── useProfile.ts
│ └── useUpdateProfile.ts
├── screens/ProfileScreen.tsx
└── types/index.ts

```

**Then creates all files...**

---

Save this guide and share it with your AI at the start of every coding session! 🎉
```
