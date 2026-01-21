# 🔧 PINAYMATE REFACTORING PLAN

## Remove Mock Data & Enforce Best Practices

**Date:** January 20, 2026  
**Goal:** Zero mock data, 100% database-driven, <500 lines per file

---

## 📊 CURRENT STATE ANALYSIS (Updated: January 21, 2026)

### **✅ COMPLETED - 100% Database-Driven (NO MOCK DATA)**

```
✅ app/(main)/messages.tsx            - Using useConversations hook (Real DB)
✅ src/features/messaging/screens/ChatScreen.tsx - Using useMessages hook (Real DB)
✅ app/(main)/likes.tsx               - Using getMatches API (Real DB, 615 lines)
✅ app/(main)/index.tsx               - Using fetchDiscoverProfiles API (Real DB, 1836 lines)
```

### **⚠️ FILES STILL OVER 500 LINES (Need Refactoring)**

```
❌ app/(main)/index.tsx              - 1,836 lines (NEED TO SPLIT)
❌ app/(main)/profile.tsx             - 561 lines (NEED TO SPLIT)
❌ src/features/account/api/accountApi.ts - 548 lines (NEED TO SPLIT)
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

### **New Architecture (Feature-First Design)**

```
src/
├── features/                       # Feature modules (domain-driven)
│   ├── messaging/
│   │   ├── api/
│   │   │   ├── messages.api.ts         (250 lines) - Message CRUD, send, delete
│   │   │   ├── conversations.api.ts    (180 lines) - Conversation management
│   │   │   └── realtime.api.ts         (180 lines) - Realtime subscriptions
│   │   ├── hooks/
│   │   │   ├── useMessages.ts          (200 lines) - Message state management
│   │   │   ├── useConversations.ts     (150 lines) - Conversation list logic
│   │   │   ├── useChatRealtime.ts      (150 lines) - Realtime message sync
│   │   │   └── useMessageUpload.ts     (120 lines) - Image upload logic
│   │   ├── components/
│   │   │   ├── MessagesList.tsx        (200 lines) - Message list renderer
│   │   │   ├── MessageBubble.tsx       (120 lines) - Single message UI
│   │   │   ├── MessageInput.tsx        (180 lines) - Input with emoji/image
│   │   │   ├── ConversationList.tsx    (200 lines) - Conversations grid
│   │   │   ├── ConversationCard.tsx    (150 lines) - Single conversation
│   │   │   ├── ChatHeader.tsx          (120 lines) - Chat top bar
│   │   │   ├── TypingIndicator.tsx     (60 lines)  - "User is typing..."
│   │   │   └── MessageStatus.tsx       (80 lines)  - Read/sent indicators
│   │   ├── screens/
│   │   │   ├── MessagesScreen.tsx      (200 lines) - Conversation list screen
│   │   │   └── ChatScreen.tsx          (250 lines) - Active chat screen
│   │   └── types/
│   │       └── messaging.types.ts      (100 lines) - Message, Conversation types
│   │
│   ├── matching/
│   │   ├── api/
│   │   │   ├── matches.api.ts          (180 lines) - Get matches, like/unlike
│   │   │   ├── swipes.api.ts           (150 lines) - Swipe actions
│   │   │   └── preferences.api.ts      (120 lines) - Matching preferences
│   │   ├── hooks/
│   │   │   ├── useMatches.ts           (150 lines) - Matches state
│   │   │   ├── useDiscoverProfiles.ts  (200 lines) - Discovery feed logic
│   │   │   └── useSwipeActions.ts      (180 lines) - Swipe gesture handling
│   │   ├── components/
│   │   │   ├── ProfileStack.tsx        (250 lines) - Swipeable card stack
│   │   │   ├── ProfileCard.tsx         (300 lines) - Profile display card
│   │   │   ├── ProfileImage.tsx        (120 lines) - Image carousel
│   │   │   ├── ProfileInfo.tsx         (150 lines) - Profile details
│   │   │   ├── ProfileActions.tsx      (180 lines) - Like/pass buttons
│   │   │   ├── SwipeGesture.tsx        (200 lines) - Gesture handler
│   │   │   ├── MatchModal.tsx          (200 lines) - "It's a match!" popup
│   │   │   ├── MatchesGrid.tsx         (180 lines) - Grid of matches
│   │   │   └── MatchCard.tsx           (150 lines) - Single match card
│   │   ├── screens/
│   │   │   ├── DiscoverScreen.tsx      (250 lines) - Main swipe screen
│   │   │   └── MatchesScreen.tsx       (200 lines) - Matches list
│   │   ├── utils/
│   │   │   └── matchingAlgorithm.ts    (150 lines) - Score calculation
│   │   └── types/
│   │       └── matching.types.ts       (120 lines) - Match, Profile types
│   │
│   ├── profile/
│   │   ├── api/
│   │   │   ├── profiles.api.ts         (200 lines) - Profile CRUD
│   │   │   └── photos.api.ts           (150 lines) - Photo upload/delete
│   │   ├── hooks/
│   │   │   ├── useProfile.ts           (180 lines) - Profile state
│   │   │   └── usePhotoUpload.ts       (150 lines) - Photo management
│   │   ├── components/
│   │   │   ├── ProfileView.tsx         (250 lines) - Profile display
│   │   │   ├── ProfileEdit.tsx         (300 lines) - Edit profile form
│   │   │   └── PhotoGallery.tsx        (200 lines) - Photo grid
│   │   └── types/
│   │       └── profile.types.ts        (100 lines) - Profile types
│   │
│   └── auth/
│       ├── api/
│       │   └── auth.api.ts             (180 lines) - Login/signup/logout
│       ├── hooks/
│       │   ├── useAuth.ts              (150 lines) - Auth state
│       │   └── useSession.ts           (100 lines) - Session management
│       └── types/
│           └── auth.types.ts           (80 lines) - User, Session types
│
├── shared/                         # Shared across features
│   ├── components/
│   │   ├── ui/                     # Pure UI components
│   │   │   ├── Button.tsx              (100 lines)
│   │   │   ├── Input.tsx               (120 lines)
│   │   │   ├── Card.tsx                (80 lines)
│   │   │   ├── Avatar.tsx              (100 lines)
│   │   │   ├── Badge.tsx               (60 lines)
│   │   │   ├── LoadingSpinner.tsx      (80 lines)
│   │   │   ├── LoadingState.tsx        (100 lines)
│   │   │   ├── ErrorState.tsx          (120 lines)
│   │   │   ├── EmptyState.tsx          (100 lines)
│   │   │   ├── SkeletonCard.tsx        (90 lines)
│   │   │   └── Modal.tsx               (150 lines)
│   │   └── layout/
│   │       ├── SafeContainer.tsx       (80 lines)
│   │       └── ScreenWrapper.tsx       (100 lines)
│   │
│   ├── hooks/
│   │   ├── useNetworkStatus.ts         (80 lines) - Online/offline detection
│   │   ├── useDebounce.ts              (60 lines) - Debounce hook
│   │   └── useAsyncState.ts            (100 lines) - Async state helper
│   │
│   ├── utils/
│   │   ├── formatters.ts               (150 lines) - Date, text formatting
│   │   ├── validators.ts               (120 lines) - Input validation
│   │   ├── errorHandler.ts             (180 lines) - Error handling
│   │   ├── constants.ts                (100 lines) - App constants
│   │   └── storage.ts                  (120 lines) - AsyncStorage wrapper
│   │
│   └── types/
│       ├── api.types.ts                (100 lines) - API response types
│       └── common.types.ts             (80 lines) - Common types
│
├── config/
│   ├── supabase.ts                     (100 lines) - Supabase client setup
│   ├── storage.ts                      (80 lines) - Storage bucket config
│   └── constants.ts                    (120 lines) - Config constants
│
└── app/                                # Expo Router screens (thin wrappers)
    ├── (main)/
    │   ├── index.tsx                   (80 lines) - Import DiscoverScreen
    │   ├── messages.tsx                (80 lines) - Import MessagesScreen
    │   ├── likes.tsx                   (80 lines) - Import MatchesScreen
    │   ├── profile.tsx                 (100 lines) - Import ProfileScreen
    │   └── chat.tsx                    (80 lines) - Import ChatScreen
    └── (auth)/
        ├── signin.tsx                  (100 lines) - Import SignInScreen
        └── signup.tsx                  (100 lines) - Import SignUpScreen
```

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
```

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

**Actions:**

```typescript
// BEFORE (2048 lines monolith)
const filipinaProfiles: Profile[] = [ /* 180 lines */ ];
const maleProfiles: Profile[] = [ /* 180 lines */ ];
// ... massive component with everything

// AFTER (300 lines, clean separation)
import { useDiscoverProfiles } from '@/src/hooks/useDiscoverProfiles';
import { ProfileStack } from '@/src/components/discover/ProfileStack';

function DiscoverScreen() {
  const { profiles, like, pass, superLike, loading, error } = useDiscoverProfiles();

  return (
    <ProfileStack
      profiles={profiles}
      onLike={like}
      onPass={pass}
      onSuperLike={superLike}
    />
  );
}
```

**Files to Create:**

1. `src/hooks/useDiscoverProfiles.ts` (200 lines)
2. `src/api/profiles.api.ts` (180 lines)
3. `src/components/discover/ProfileStack.tsx` (250 lines)
4. `src/components/discover/ProfileCard.tsx` (300 lines)
5. `src/components/discover/SwipeActions.tsx` (150 lines)
6. `src/components/discover/ProfileDetails.tsx` (250 lines)

---

### **Task 1.3: Fix Likes/Matches Screen**

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

**Current Issues:**

- ❌ Mock messages array with hardcoded data
- ❌ Simulated auto-replies using setTimeout()
- ❌ No Supabase integration (all TODO comments)
- ❌ Image upload completely commented out
- ❌ No persistent message history
- ❌ No realtime message sync

**Actions:**

```typescript
// BEFORE (mock data + fake simulation)
const [messages, setMessages] = useState<Message[]>([
  { id: "1", text: "Hi! How are you?", senderId: "other", ... },
  { id: "2", text: "Great! How about you?", senderId: "me", ... },
  // ... 5+ hardcoded messages
]);

const handleSend = useCallback(() => {
  // Just adds to local state - NOTHING SAVED!
  setMessages([...messages, newMessage]);

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
```

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
```

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

**Solution:**

```typescript
// GOOD: Centralized API
// api/profiles.api.ts
export const profilesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true);

    if (error) throw new Error(error.message);
    return data;
  },

  getById: async (id: string) => {},
  create: async (profile: ProfileInput) => {},
  update: async (id: string, updates: Partial<Profile>) => {},
  delete: async (id: string) => {},
};
```

**API Modules to Create:**

- `api/profiles.api.ts` - Profile CRUD
- `api/messages.api.ts` - Message operations
- `api/matches.api.ts` - Match/like operations
- `api/conversations.api.ts` - Conversation management
- `api/realtime.api.ts` - Supabase realtime setup
- `api/storage.api.ts` - File uploads (High Priority)\*\*

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
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(
    conversationId: string,
    userId: string,
    recipientId: string,
    callback: MessageCallback
  ): () => void {
    const channelName = `conversation:${conversationId}`;

    // Remove existing channel if any
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${recipientId},recipient_id=eq.${userId}),and(sender_id=eq.${userId},recipient_id=eq.${recipientId}))`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new);
          callback(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for ${channelName}:`, status);
      });

    this.channels.set(channelName, channel);

    // Return cleanup function
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to typing indicators
   */
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

  /**
   * Broadcast typing status
   */
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

  /**
   * Subscribe to read receipts
   */
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

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`🔌 Unsubscribed from ${name}`);
    });
    this.channels.clear();
  }
}

export const realtimeApi = new RealtimeAPI();
```

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

```

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
  },

  subscribeToMatches: (userId: string, callback: Function) => {
    return supabase
      .channel(`matches:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "likes",
          filter: `to_user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe();
  },

  unsubscribe: (channel) => {
    channel.unsubscribe();
  },
};
````

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
