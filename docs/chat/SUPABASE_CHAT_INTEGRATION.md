# Chat Screen - Supabase Integration Guide

## 📋 Overview

The ChatScreen is now fully prepared for Supabase backend integration with all UI functions working and clear TODO markers for database integration.

---

## ✅ Completed Features

### **1. All Button Functions Working**

- ✅ **Phone Call Button** - Shows confirmation dialog
- ✅ **Video Call Button** - Shows confirmation dialog
- ✅ **More Options Button** - Action sheet with 6 options
- ✅ **Image Upload Button** - Opens image picker
- ✅ **Emoji Button** - Quick emoji selector
- ✅ **Send Button** - Sends text messages

### **2. Tab Bar Removed**

- ✅ Chat screen shows **full screen** (no bottom tabs)
- ✅ Configured in `app/(main)/_layout.tsx` with `href: null`
- ✅ Only accessible via navigation from Messages screen

---

## 🗄️ Supabase Database Schema

### **Table: `messages`**

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT DEFAULT 'text', -- 'text' or 'image'
  image_url TEXT,
  status TEXT DEFAULT 'sent', -- 'sending', 'sent', 'delivered', 'read'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);
```

### **Table: `conversations`** (Optional - for optimization)

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id),
  user2_id UUID NOT NULL REFERENCES profiles(id),
  last_message_id UUID REFERENCES messages(id),
  last_message_at TIMESTAMP WITH TIME ZONE,
  user1_unread_count INTEGER DEFAULT 0,
  user2_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
```

---

## 🔧 Integration Steps

### **Step 1: Install Supabase Client**

```bash
npm install @supabase/supabase-js
```

### **Step 2: Update Supabase Config**

File: `src/config/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### **Step 3: Create Message Service**

File: `src/services/messageService.ts`

```typescript
import { supabase } from "@/src/config/supabase";

export type Message = {
  id: string;
  text: string;
  sender_id: string;
  recipient_id: string;
  type: "text" | "image";
  image_url?: string;
  status: "sending" | "sent" | "delivered" | "read";
  created_at: string;
};

export const messageService = {
  // Send a text message
  async sendMessage(recipientId: string, text: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        text,
        type: "text",
        status: "sent",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload image to storage
  async uploadImage(uri: string, chatId: string) {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${chatId}/${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from("chat-images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-images").getPublicUrl(fileName);

    return publicUrl;
  },

  // Send image message
  async sendImageMessage(
    recipientId: string,
    imageUri: string,
    chatId: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Upload image first
    const imageUrl = await this.uploadImage(imageUri, chatId);

    // Create message
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        type: "image",
        image_url: imageUrl,
        status: "sent",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get messages for a conversation
  async getMessages(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Subscribe to new messages
  subscribeToMessages(
    userId: string,
    otherUserId: string,
    onNewMessage: (message: Message) => void
  ) {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id=eq.${otherUserId},recipient_id=eq.${userId}),and(sender_id=eq.${userId},recipient_id=eq.${otherUserId}))`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Mark messages as read
  async markAsRead(messageIds: string[]) {
    const { error } = await supabase
      .from("messages")
      .update({ status: "read" })
      .in("id", messageIds);

    if (error) throw error;
  },

  // Delete message
  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from("messages")
      .update({ is_deleted: true })
      .eq("id", messageId);

    if (error) throw error;
  },
};
```

### **Step 4: Update ChatScreen Component**

Replace the TODO comments in `ChatScreen.tsx`:

```typescript
// In handleSend function:
const handleSend = useCallback(async () => {
  if (inputText.trim().length === 0) return;

  const optimisticMessage: Message = {
    id: Date.now().toString(),
    text: inputText.trim(),
    senderId: "me",
    timestamp: new Date(),
    status: "sending",
    type: "text",
  };

  setMessages((prev) => [...prev, optimisticMessage]);
  setInputText("");

  try {
    // Send to Supabase
    const sentMessage = await messageService.sendMessage(
      params.userId,
      optimisticMessage.text
    );

    // Update with real ID
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === optimisticMessage.id
          ? { ...msg, id: sentMessage.id, status: "sent" }
          : msg
      )
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    // Mark as failed
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === optimisticMessage.id ? { ...msg, status: "failed" } : msg
      )
    );
  }
}, [inputText, params.userId]);

// In handleImagePick function:
const handleImagePick = useCallback(async () => {
  // ... existing image picker code ...

  if (!result.canceled && result.assets[0]) {
    const imageUri = result.assets[0].uri;

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      text: "",
      senderId: "me",
      timestamp: new Date(),
      status: "sending",
      type: "image",
      imageUri,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const chatId = `${params.userId}-me`;
      const sentMessage = await messageService.sendImageMessage(
        params.userId,
        imageUri,
        chatId
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? {
                ...msg,
                id: sentMessage.id,
                status: "sent",
                imageUri: sentMessage.image_url,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to send image:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  }
}, [params.userId]);

// Add in useEffect for real-time subscription:
useEffect(() => {
  const loadMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const messages = await messageService.getMessages(user.id, params.userId);
      setMessages(
        messages.map((msg) => ({
          id: msg.id,
          text: msg.text || "",
          senderId: msg.sender_id === user.id ? "me" : msg.sender_id,
          timestamp: new Date(msg.created_at),
          status: msg.status as any,
          type: msg.type as any,
          imageUri: msg.image_url,
        }))
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  loadMessages();

  // Subscribe to new messages
  const unsubscribe = messageService.subscribeToMessages(
    currentUserId,
    params.userId,
    (newMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: newMessage.id,
          text: newMessage.text || "",
          senderId:
            newMessage.sender_id === currentUserId
              ? "me"
              : newMessage.sender_id,
          timestamp: new Date(newMessage.created_at),
          status: newMessage.status as any,
          type: newMessage.type as any,
          imageUri: newMessage.image_url,
        },
      ]);
    }
  );

  return () => {
    unsubscribe();
  };
}, [params.userId]);
```

---

## 🎯 Current Button Functions

### **Header Buttons**

| Button       | Function              | Current Behavior            | Backend Integration Needed        |
| ------------ | --------------------- | --------------------------- | --------------------------------- |
| **Phone** 📞 | `handlePhoneCall()`   | Shows confirmation dialog   | WebRTC/Agora/Twilio voice call    |
| **Video** 📹 | `handleVideoCall()`   | Shows confirmation dialog   | WebRTC/Agora/Twilio video call    |
| **More** ⋮   | `handleMoreOptions()` | Action sheet with 6 options | Profile view, mute, block, report |

**More Options Menu:**

1. View Profile → Navigate to user profile
2. Mute Notifications → Update user preferences
3. Block User → Add to blocked users table
4. Report User → Create report in reports table
5. Clear Chat History → Delete messages locally
6. Cancel

### **Input Area Buttons**

| Button       | Function            | Current Behavior                        | Backend Integration Needed |
| ------------ | ------------------- | --------------------------------------- | -------------------------- |
| **Image** 🖼️ | `handleImagePick()` | Opens image picker                      | Supabase Storage upload    |
| **Emoji** 😊 | `handleEmojiPick()` | Quick emoji selector (iOS action sheet) | None (UI only)             |
| **Send** ✉️  | `handleSend()`      | Sends text message                      | Supabase messages insert   |

---

## 🔐 Security Considerations

### **1. Row Level Security (RLS)**

- ✅ Users can only read their own messages
- ✅ Users can only send messages as themselves
- ✅ Users can only update their own messages

### **2. Input Validation**

```typescript
// Add to ChatScreen
const validateMessage = (text: string) => {
  if (text.length > 1000) return false;
  if (text.trim().length === 0) return false;
  // Check for spam patterns
  return true;
};
```

### **3. Rate Limiting**

```typescript
// Implement in backend or use Supabase Edge Functions
const RATE_LIMIT = 10; // messages per minute
const MESSAGE_WINDOW = 60000; // 1 minute

let messageCount = 0;
let windowStart = Date.now();

const checkRateLimit = () => {
  const now = Date.now();
  if (now - windowStart > MESSAGE_WINDOW) {
    messageCount = 0;
    windowStart = now;
  }

  if (messageCount >= RATE_LIMIT) {
    throw new Error("Rate limit exceeded");
  }

  messageCount++;
};
```

---

## 📱 Offline Support

```typescript
// Add to ChatScreen
import NetInfo from "@react-native-community/netinfo";

const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    setIsOnline(state.isConnected ?? false);
  });

  return () => unsubscribe();
}, []);

// Queue messages when offline
const sendMessageWithRetry = async (message: Message) => {
  if (!isOnline) {
    // Store in AsyncStorage queue
    await AsyncStorage.setItem(
      `pending_message_${message.id}`,
      JSON.stringify(message)
    );
    return;
  }

  // Send normally
  await messageService.sendMessage(params.userId, message.text);
};
```

---

## ✅ Integration Checklist

- [ ] Create Supabase tables (messages, conversations)
- [ ] Set up Row Level Security policies
- [ ] Create storage bucket for chat images
- [ ] Implement messageService.ts
- [ ] Update ChatScreen with real Supabase calls
- [ ] Add real-time subscriptions
- [ ] Implement offline message queue
- [ ] Add typing indicators (real-time)
- [ ] Add read receipts tracking
- [ ] Add push notifications
- [ ] Implement voice/video calling
- [ ] Add message reactions
- [ ] Add message forwarding
- [ ] Add file attachments

---

## 🚀 Next Steps

1. **Set up Supabase Project**
   - Create new project
   - Run migration scripts
   - Configure storage buckets

2. **Install Dependencies**

   ```bash
   npm install @supabase/supabase-js
   npm install @react-native-community/netinfo
   npm install @react-native-async-storage/async-storage
   ```

3. **Environment Variables**

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Test Integration**
   - Send text messages
   - Send images
   - Real-time message sync
   - Offline queue
   - Read receipts

---

**Status**: ✅ **Ready for Supabase Integration**
**All UI Functions**: ✅ **Working**
**Tab Bar**: ✅ **Removed from Chat Screen**
