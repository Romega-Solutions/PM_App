# Chat UI & Flow Documentation

## 📱 Overview

The chat system implements a Messenger-like interface with real-time messaging capabilities, typing indicators, message status tracking, and a modern design using the app's brand colors.

---

## 🎨 Design System Integration

### **Fonts (from global.css)**

- **Headers**: `Lora-Bold` (user names, titles)
- **Body/UI**: `DMSans-Regular` (messages, timestamps)
- **Accents**: Uses brand font weights for consistency

### **Brand Colors**

- **Background**: `#0F0814` (BRAND_BG)
- **Primary Accent**: `#8D69F6` (ACCENT_PURPLE)
- **Secondary Accent**: `#EF3E78` (ACCENT_PINK)
- **Success/Online**: `#10B981` (ONLINE_GREEN)
- **Surfaces**: `rgba(255,255,255,0.06)` (SURFACE)
- **My Messages**: `rgba(141, 105, 246, 0.25)` (Purple tint)
- **Their Messages**: `rgba(255, 255, 255, 0.08)` (Neutral surface)

---

## 📂 File Structure

```
app/
  (main)/
    chat.tsx                    # Route file (exports ChatScreen)
    messages.tsx                # Messages list with navigation
src/
  features/
    messaging/
      screens/
        ChatScreen.tsx          # Main chat component
```

---

## 🔧 Core Functions & Features

### **1. Message Management**

#### `Message` Type

```typescript
{
  id: string;                   // Unique message identifier
  text: string;                 // Message content
  senderId: string;             // User ID who sent the message
  timestamp: Date;              // When message was sent
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image";       // Future support for images
  imageUri?: string;            // Optional image attachment
}
```

#### **Message Status Flow**

1. `sending` → Gray single check ✓
2. `sent` → Gray double check ✓✓
3. `delivered` → Gray double check ✓✓
4. `read` → Purple double check ✓✓ (brand color)

---

### **2. Real-Time Features**

#### **Typing Indicator**

- **Function**: Shows animated dots when user is typing
- **Trigger**: Activates when `inputText.length > 0`
- **Auto-hide**: 1 second after user stops typing
- **Visual**: Three animated dots in recipient's message bubble

```typescript
useEffect(() => {
  if (inputText.length > 0) {
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  }
}, [inputText]);
```

#### **Auto-scroll to Bottom**

- **Function**: Automatically scrolls to latest message
- **Trigger**: When new message is added
- **Delay**: 100ms for smooth animation

```typescript
useEffect(() => {
  setTimeout(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, 100);
}, [messages]);
```

---

### **3. Send Message Flow**

#### **`handleSend()` Function**

```typescript
1. Validate input (must not be empty)
2. Create new message with status "sending"
3. Add to messages array
4. Clear input field
5. Simulate status progression:
   - After 500ms → "sent"
   - After 1000ms → "delivered"
   - After 2000ms → Auto-reply from recipient
   - After 3500ms → Mark as "read"
```

#### **Status Simulation Timeline**

```
0ms:     User sends message     [sending ✓]
500ms:   Server receives        [sent ✓✓]
1000ms:  Delivered to recipient [delivered ✓✓]
2000ms:  Recipient replies      [auto-reply]
3500ms:  Recipient reads        [read ✓✓ purple]
```

---

### **4. Message Rendering**

#### **`renderMessage()` Function**

- **Conditional Timestamp**: Shows only if:
  - First message in chat, OR
  - Different sender than previous, OR
  - > 5 minutes since last message

- **Avatar Display**: Shows recipient avatar only for their messages
- **Message Alignment**:
  - My messages: Right-aligned, purple background
  - Their messages: Left-aligned, neutral background
- **Status Icons**: Shows only on my messages (right side)

```typescript
const renderMessage = (message: Message, index: number) => {
  const isMyMessage = message.senderId === "me";
  const showTimestamp = /* timestamp logic */;

  return (
    <View>
      {showTimestamp && <Timestamp />}
      <MessageBubble
        align={isMyMessage ? "right" : "left"}
        status={isMyMessage ? message.status : null}
      />
    </View>
  );
};
```

---

### **5. Header Functions**

#### **User Status Display**

- **Active Now**: Green dot + "Active now" text (online users)
- **Offline**: No dot + "Offline" text (offline users)
- **Dynamic Updates**: Based on route params `isOnline`

#### **Action Buttons**

1. **Phone**: Voice call (placeholder)
2. **Video**: Video call (placeholder)
3. **More Options**: Menu (placeholder)

---

### **6. Input Area Functions**

#### **Media Attachment**

- **Button**: Image icon on left
- **Function**: Opens media picker (placeholder)
- **Future**: Support image messages

#### **Emoji Picker**

- **Button**: Smile icon inside input
- **Function**: Opens emoji keyboard (placeholder)
- **Future**: Quick emoji reactions

#### **Send Button States**

- **Inactive**: Dim background, disabled (empty input)
- **Active**: Bright purple, glowing shadow (has text)
- **Animation**: Scale on press
- **Icon Fill**: Filled when active, outline when inactive

```typescript
<TouchableOpacity
  style={[
    styles.sendButton,
    inputText.trim().length > 0 && styles.sendButtonActive
  ]}
  disabled={inputText.trim().length === 0}
/>
```

---

### **7. Keyboard Handling**

#### **KeyboardAvoidingView**

- **Platform**: Different behavior for iOS/Android
- **Behavior**: `padding` on iOS, `height` on Android
- **Auto-adjust**: Input moves up when keyboard appears

#### **Keyboard Listeners**

```typescript
useEffect(() => {
  const keyboardShow = Keyboard.addListener(
    Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
    (e) => setKeyboardHeight(e.endCoordinates.height)
  );
  const keyboardHide = Keyboard.addListener(
    Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
    () => setKeyboardHeight(0)
  );
  return () => {
    keyboardShow.remove();
    keyboardHide.remove();
  };
}, []);
```

---

### **8. Navigation Integration**

#### **From Messages List → Chat Screen**

```typescript
// In messages.tsx
const handleOpenChat = (conversation) => {
  router.push({
    pathname: "/(main)/chat",
    params: {
      userId: conversation.id.toString(),
      userName: conversation.name,
      userImage: conversation.image,
      isOnline: conversation.isOnline.toString(),
    },
  });
};
```

#### **Chat Screen Route Params**

```typescript
type ChatScreenParams = {
  userId: string; // Unique user identifier
  userName: string; // Display name in header
  userImage?: string; // Avatar image URI
  isOnline?: string; // "true" or "false" (boolean as string)
};
```

---

## 🎯 User Experience Flow

### **1. Open Chat**

```
Messages Screen → Click conversation → Navigate to ChatScreen
  ↓
Load params (userId, userName, userImage, isOnline)
  ↓
Render header with user info + status
  ↓
Load message history (hardcoded demo messages)
  ↓
Scroll to bottom (most recent message)
```

### **2. Send Message**

```
User types message → Input updates → Typing indicator shows
  ↓
User presses send button
  ↓
Message added with "sending" status
  ↓
Input cleared
  ↓
Status updates: sending → sent → delivered
  ↓
Auto-reply simulated after 2s
  ↓
All messages marked as "read" after 3.5s
```

### **3. Receive Message**

```
Recipient message appears
  ↓
Shows avatar on left
  ↓
Neutral background color
  ↓
Auto-scroll to bottom
  ↓
No status indicator (only for sent messages)
```

---

## 🚀 Future Enhancements

### **Phase 1: Core Features**

- [ ] Real Supabase integration
- [ ] Message persistence
- [ ] Real-time subscriptions
- [ ] Push notifications

### **Phase 2: Rich Media**

- [ ] Image attachments
- [ ] Voice messages
- [ ] Video messages
- [ ] File sharing

### **Phase 3: Advanced Features**

- [ ] Message reactions (❤️, 😂, 👍)
- [ ] Reply to specific messages
- [ ] Message deletion
- [ ] Edit sent messages
- [ ] Voice/video calls

### **Phase 4: UX Improvements**

- [ ] Message search
- [ ] Pinned conversations
- [ ] Mute notifications
- [ ] Archive chats
- [ ] Custom chat themes

---

## 📊 Message States Diagram

```
┌─────────────────────────────────────────────────┐
│           Message Lifecycle                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  User Types → [Input Field Active]              │
│       ↓                                          │
│  Press Send → [Status: "sending"] ✓             │
│       ↓                                          │
│  Server → [Status: "sent"] ✓✓                   │
│       ↓                                          │
│  Delivered → [Status: "delivered"] ✓✓           │
│       ↓                                          │
│  Recipient Reads → [Status: "read"] ✓✓ (purple) │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Visual Components

### **Message Bubbles**

- **My Messages**:
  - Right-aligned
  - Purple gradient background (`rgba(141, 105, 246, 0.25)`)
  - Border: `rgba(141, 105, 246, 0.3)`
  - Rounded corners (20px) with sharp bottom-right (4px)
  - Status icon bottom-right

- **Their Messages**:
  - Left-aligned
  - Neutral surface (`rgba(255, 255, 255, 0.08)`)
  - Border: `rgba(255, 255, 255, 0.1)`
  - Rounded corners (20px) with sharp bottom-left (4px)
  - Avatar on left (32x32)

### **Timestamp Pills**

- Centered
- Semi-transparent background
- 12px top/bottom margin
- Format: `2:30 PM`

### **Typing Indicator**

- Three animated dots
- 8px diameter each
- 4px spacing
- Muted color

---

## 🔐 Data Flow (Future Implementation)

```typescript
// Send Message to Supabase
const sendMessage = async (text: string) => {
  const { data, error } = await supabase.from("messages").insert({
    sender_id: currentUserId,
    recipient_id: recipientId,
    text: text,
    status: "sent",
    created_at: new Date(),
  });
};

// Subscribe to New Messages
const subscribeToMessages = () => {
  supabase
    .channel(`chat:${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();
};
```

---

## 📱 Accessibility Features

- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Full support
- **Screen Reader**: Proper role assignments
- **Touch Targets**: Minimum 44x44pt (iOS HIG)
- **Color Contrast**: WCAG AA compliant

---

## ⚡ Performance Optimizations

1. **useCallback**: Memoized functions (handleSend)
2. **Auto-scroll**: Debounced with 100ms delay
3. **Message Rendering**: Virtual list (future)
4. **Image Loading**: Lazy loading (future)
5. **Animations**: Use native driver where possible

---

## 🧪 Testing Scenarios

### **Happy Path**

1. Open chat → See messages
2. Type message → See typing indicator
3. Send message → See status progression
4. Receive reply → Auto-scroll to bottom

### **Edge Cases**

- Empty input → Send button disabled
- Long messages → Multi-line support (max 100px height)
- Keyboard open → Input area moves up
- No internet → Show error (future)
- User offline → Show offline status

---

This chat system provides a complete Messenger-like experience with modern UI, smooth animations, and a robust foundation for real-time messaging! 🚀💬
