# Chat Integration Testing Guide

**Date:** January 21, 2026  
**Status:** Launch-stage source guide. Runtime proof is still required before production claims.

---

## ✅ What Was Completed

### **Database Layer**

- Conversations table created
- `conversation_id` column added to messages
- `send_message` is the client-facing message creation RPC
- `get_or_create_conversation()` is a private helper used by `send_message`, not a client API
- Auto-update trigger for last message
- RLS policies set up
- Legacy messages backfilled when migration data exists

### **API Layer**

- ✅ `messages.api.ts` - CRUD operations (sendTextMessage, sendImageMessage, getMessages, etc.)
- ✅ `realtime.api.ts` - Live subscriptions (messages, typing, read receipts, presence)

### **Business Logic (Hooks)**

- ✅ `useMessages.ts` - Message state management
- ✅ `useChatRealtime.ts` - Realtime subscriptions
- ✅ `useMessageUpload.ts` - Image upload handling

### **UI Integration**

- ✅ ChatScreen updated - ALL mock data removed
- ✅ Real-time message sending/receiving
- ✅ Image upload integration
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Loading states
- ✅ Error handling

---

## 🧪 How to Test

### **Pre-requisites**

1. ✅ Run the migration: `03_add_conversations_table.sql` in Supabase SQL Editor
2. ✅ Verify migration success:
   ```sql
   SELECT COUNT(*) FROM conversations;
   SELECT COUNT(*) FROM messages WHERE conversation_id IS NOT NULL;
   ```

### **Test 1: Send Text Message**

1. Open the app and navigate to a chat
2. Type a message and send
3. ✅ Should see message instantly in UI
4. Check Supabase dashboard: message saved in `messages` table by `send_message`
5. Check `conversations` table: a conversation exists only after a real message send and `last_message_text` updated

### **Test 2: Receive Realtime Message**

1. Open chat on Device A (User 1)
2. Open same chat on Device B (User 2)
3. Send message from Device A
4. ✅ Should appear instantly on Device B without refresh

### **Test 3: Image Upload**

1. Click image icon in chat input
2. Select image from gallery
3. ✅ Should see upload progress
4. ✅ Image appears in chat
5. ✅ Check Supabase Storage: `chat-images` bucket has file
6. ✅ Check `messages` table: `image_url` field stores the `chat-images` storage path, not a public URL

### **Test 4: Typing Indicators**

1. Open chat on Device A
2. Open same chat on Device B
3. Start typing on Device A
4. ✅ Should see "User is typing..." on Device B

### **Test 5: Read Receipts**

1. Send message from User A
2. Open chat on User B's device
3. ✅ Message status changes from "sent" → "delivered" → "read"
4. ✅ Check marks turn purple when read

### **Test 6: Conversation List** (Next Phase)

1. Navigate to messages screen
2. ✅ Should show all conversations
3. ✅ Last message preview visible
4. ✅ Unread count badge shown
5. ✅ Sorted by last message time

---

## 🔍 Debugging Tips

### **No Messages Loading?**

```typescript
// Check console for errors
// Verify user is authenticated
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Current user:", user?.id);

// Check database query
const { data, error } = await supabase
  .from("messages")
  .select("*")
  .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
  .limit(10);
console.log("Messages:", data, "Error:", error);
```

### **Messages Not Saving?**

```sql
-- Check RLS policies and RPC grants
SELECT * FROM pg_policies WHERE tablename = 'messages';
SELECT has_function_privilege('authenticated', 'public.send_message(uuid, text, text, text, uuid)', 'EXECUTE');
SELECT has_function_privilege('authenticated', 'public.get_or_create_conversation(uuid, uuid)', 'EXECUTE');
```

Expected: `send_message` is executable by authenticated users. `get_or_create_conversation` is not directly executable.

### **Realtime Not Working?**

```typescript
// Check realtime connection
const channel = supabase
  .channel("test")
  .on("broadcast", { event: "test" }, (payload) => {
    console.log("Realtime works!", payload);
  })
  .subscribe((status) => {
    console.log("Subscription status:", status);
  });
```

### **Images Not Uploading?**

```sql
-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'chat-images';

-- Check storage policies
SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## 📊 Expected Database State

### **Before Migration**

```
messages table:
- 49 messages
- conversation_id: NULL
- No conversations table

storage.buckets:
- chat-images (may exist)
```

### **After Migration**

```
conversations table:
- ~3-5 conversations (from 3 unique senders)
- All with last_message_text populated

messages table:
- 49 messages
- conversation_id: populated for all
- Linked to conversations

storage.buckets:
- chat-images (confirmed exists)
```

---

## 🐛 Common Issues

### **Issue: "auth.uid() is null"**

**Solution:** User not logged in. Check auth state:

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
if (!session) {
  router.replace("/signin");
}
```

### **Issue: "Policy violation"**

**Solution:** RLS policies too strict. Temporarily disable for testing:

```sql
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
-- Test, then re-enable:
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### **Issue: "Conversation not found"**

**Solution:** Do not call `get_or_create_conversation()` from the client. It is private. Send a text message through `send_message`; the database creates or reuses the conversation as part of that message send.

```typescript
const { data: message, error } = await supabase.rpc("send_message", {
  p_recipient_id: recipientId,
  p_content: "Hello",
  p_message_type: "text",
  p_image_url: null,
  p_conversation_id: null,
});

const conversationId = message?.conversation_id;
```

---

## ✨ Next Steps (Days 4-5)

### **Messages List Screen**

1. Create `conversations.api.ts`
2. Create `useConversations.ts` hook
3. Remove mock data from `app/(main)/messages.tsx`
4. Create ConversationList component
5. Create ConversationCard component
6. Test conversation list loads

### **Key Features to Implement**

- ✅ Load all user conversations
- ✅ Show last message preview
- ✅ Display unread count badge
- ✅ Real-time updates when new message arrives
- ✅ Sort by last message time
- ✅ Tap to open chat

---

## 🎯 Success Criteria

**Chat is working correctly if:**

- ✅ Messages send instantly
- ✅ Messages persist after app restart
- ✅ Realtime updates work (no refresh needed)
- ✅ Images upload successfully
- ✅ Typing indicators appear
- ✅ Read receipts update
- ✅ No mock data used
- ✅ All data from Supabase

**Ready for next phase if:**

- ✅ All 6 tests pass
- ✅ No console errors
- ✅ Database queries optimized
- ✅ RLS policies working

---

## 📝 Files Changed

### **Created**

- `supabase/migrations/03_add_conversations_table.sql`
- `src/features/messaging/api/messages.api.ts`
- `src/features/messaging/api/realtime.api.ts`
- `src/features/messaging/hooks/useMessages.ts`
- `src/features/messaging/hooks/useChatRealtime.ts`
- `src/features/messaging/hooks/useMessageUpload.ts`
- `src/features/messaging/types/messaging.types.ts`

### **Modified**

- `src/features/messaging/screens/ChatScreen.tsx` (1066 → ~400 lines)
  - ❌ Removed 100+ lines of mock messages
  - ❌ Removed setTimeout simulations
  - ❌ Removed fake auto-replies
  - ✅ Integrated useMessages hook
  - ✅ Integrated useChatRealtime hook
  - ✅ Integrated useMessageUpload hook
  - ✅ Added loading states
  - ✅ Added error handling

---

**Start testing now! 🚀**
