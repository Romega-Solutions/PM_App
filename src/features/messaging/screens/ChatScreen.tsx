import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const ONLINE_GREEN = "#10B981";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const MY_MESSAGE_BG = "rgba(141, 105, 246, 0.25)";
const THEIR_MESSAGE_BG = "rgba(255, 255, 255, 0.08)";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

export type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image";
  imageUri?: string;
};

type ChatScreenParams = {
  userId: string;
  userName: string;
  userImage?: string;
  isOnline?: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ChatScreenParams>();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! How are you doing?",
      senderId: params.userId || "other",
      timestamp: new Date(Date.now() - 3600000),
      status: "read",
      type: "text",
    },
    {
      id: "2",
      text: "I'm doing great! Just got back from a coffee shop in Makati. How about you?",
      senderId: "me",
      timestamp: new Date(Date.now() - 3500000),
      status: "read",
      type: "text",
    },
    {
      id: "3",
      text: "That sounds nice! I've been wanting to explore more cafes there.",
      senderId: params.userId || "other",
      timestamp: new Date(Date.now() - 3400000),
      status: "read",
      type: "text",
    },
    {
      id: "4",
      text: "We should definitely go together sometime! I know a few great spots 😊",
      senderId: "me",
      timestamp: new Date(Date.now() - 3300000),
      status: "delivered",
      type: "text",
    },
    {
      id: "5",
      text: "That would be amazing! When are you free?",
      senderId: params.userId || "other",
      timestamp: new Date(Date.now() - 120000),
      status: "read",
      type: "text",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const userName = params.userName || "User";
  const isOnline = params.isOnline === "true";

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (inputText.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [inputText]);

  // ==================== HANDLER FUNCTIONS ====================

  // Send message handler (Ready for Supabase integration)
  const handleSend = useCallback(() => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: "me",
      timestamp: new Date(),
      status: "sending",
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // TODO: Replace with Supabase integration
    // await supabase.from('messages').insert({
    //   text: newMessage.text,
    //   sender_id: currentUserId,
    //   recipient_id: params.userId,
    //   type: 'text',
    //   created_at: new Date(),
    // });

    // Simulate message sent (Remove when using real backend)
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);

    // Simulate message delivered (Remove when using real backend)
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);

    // Simulate auto-reply from other user (Remove when using real backend)
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "That sounds perfect! Looking forward to it 💕",
        senderId: params.userId || "other",
        timestamp: new Date(),
        status: "read",
        type: "text",
      };
      setMessages((prev) => [...prev, replyMessage]);

      // Mark as read
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === "me" ? { ...msg, status: "read" } : msg
          )
        );
      }, 1500);
    }, 2000);
  }, [inputText, params.userId]);

  // Image picker handler
  const handleImagePick = useCallback(async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to send images."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const fileName = result.assets[0].fileName || `image_${Date.now()}.jpg`;
        const fileType = result.assets[0].type || "image";

        // Create optimistic image message
        const imageMessage: Message = {
          id: `temp_${Date.now()}`,
          text: "",
          senderId: "me",
          timestamp: new Date(),
          status: "sending",
          type: "image",
          imageUri,
        };

        setMessages((prev) => [...prev, imageMessage]);

        // TODO: Upload to Supabase Storage
        try {
          // Step 1: Convert image to blob for upload
          // const response = await fetch(imageUri);
          // const blob = await response.blob();

          // Step 2: Generate unique file path
          // const chatId = `${params.userId}_me`;
          // const filePath = `${chatId}/${Date.now()}_${fileName}`;

          // Step 3: Upload to Supabase Storage
          // const { data: uploadData, error: uploadError } = await supabase.storage
          //   .from('chat-images')
          //   .upload(filePath, blob, {
          //     contentType: 'image/jpeg',
          //     cacheControl: '3600',
          //     upsert: false
          //   });

          // if (uploadError) throw uploadError;

          // Step 4: Get public URL
          // const { data: { publicUrl } } = supabase.storage
          //   .from('chat-images')
          //   .getPublicUrl(filePath);

          // Step 5: Save message to database
          // const { data: messageData, error: messageError } = await supabase
          //   .from('messages')
          //   .insert({
          //     sender_id: 'me',
          //     receiver_id: params.userId,
          //     content: '',
          //     message_type: 'image',
          //     image_url: publicUrl,
          //     created_at: new Date().toISOString(),
          //   })
          //   .select()
          //   .single();

          // if (messageError) throw messageError;

          // Step 6: Update message with server ID and mark as sent
          // setMessages((prev) =>
          //   prev.map((msg) =>
          //     msg.id === imageMessage.id
          //       ? { ...msg, id: messageData.id, status: "sent", imageUri: publicUrl }
          //       : msg
          //   )
          // );

          // Simulate upload complete (remove this when Supabase is connected)
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === imageMessage.id ? { ...msg, status: "sent" } : msg
              )
            );
          }, 1500);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Mark message as failed
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === imageMessage.id
                ? { ...msg, status: "sent", text: "❌ Upload failed" }
                : msg
            )
          );
          Alert.alert(
            "Upload Failed",
            "Could not upload image. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, []);

  // Emoji picker handler
  const handleEmojiPick = useCallback(() => {
    // TODO: Implement emoji picker
    // For now, add common emojis to input
    const commonEmojis = ["❤️", "😊", "😂", "🥰", "👍", "🙏", "💕", "✨"];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...commonEmojis, "Cancel"],
          cancelButtonIndex: commonEmojis.length,
        },
        (buttonIndex) => {
          if (buttonIndex < commonEmojis.length) {
            setInputText((prev) => prev + commonEmojis[buttonIndex]);
          }
        }
      );
    } else {
      // On Android, just add a heart emoji for now
      setInputText((prev) => prev + "❤️");
    }
  }, []);

  // Phone call handler
  const handlePhoneCall = useCallback(() => {
    router.push({
      pathname: "/(main)/voice-call" as any,
      params: {
        userId: params.userId || "unknown",
        userName: userName,
        userAvatar: params.userImage || "",
      },
    });
  }, [userName, params.userId, params.userImage, router]);

  // Video call handler
  const handleVideoCall = useCallback(() => {
    router.push({
      pathname: "/(main)/video-call" as any,
      params: {
        userId: params.userId || "unknown",
        userName: userName,
        userAvatar: params.userImage || "",
      },
    });
  }, [userName, params.userId, params.userImage, router]);

  // More options handler
  const handleMoreOptions = useCallback(() => {
    const options = [
      "View Profile",
      "Mute Notifications",
      "Block User",
      "Report User",
      "Clear Chat History",
      "Cancel",
    ];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: [2, 3, 4],
          cancelButtonIndex: 5,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              console.log("View Profile");
              // TODO: Navigate to user profile
              break;
            case 1:
              console.log("Mute Notifications");
              // TODO: Mute chat notifications
              break;
            case 2:
              console.log("Block User");
              // TODO: Block user functionality
              break;
            case 3:
              console.log("Report User");
              // TODO: Report user functionality
              break;
            case 4:
              Alert.alert(
                "Clear Chat",
                "Are you sure you want to clear all messages?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => setMessages([]),
                  },
                ]
              );
              break;
          }
        }
      );
    } else {
      // Android - show simple alert for now
      Alert.alert("More Options", "Choose an action:", [
        { text: "View Profile", onPress: () => console.log("View Profile") },
        { text: "Mute Notifications", onPress: () => console.log("Mute") },
        { text: "Block User", onPress: () => console.log("Block") },
        { text: "Report User", onPress: () => console.log("Report") },
        {
          text: "Clear Chat",
          onPress: () =>
            Alert.alert("Clear Chat", "Are you sure?", [
              { text: "Cancel" },
              { text: "Clear", onPress: () => setMessages([]) },
            ]),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }, []);

  // ==================== END HANDLER FUNCTIONS ====================

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderMessageStatus = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Check size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "sent":
        return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "delivered":
        return <CheckCheck size={14} color={TEXT_MUTED} strokeWidth={2.5} />;
      case "read":
        return <CheckCheck size={14} color={ACCENT_PURPLE} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isMyMessage = message.senderId === "me";
    const showTimestamp =
      index === 0 ||
      messages[index - 1].senderId !== message.senderId ||
      message.timestamp.getTime() - messages[index - 1].timestamp.getTime() >
        300000; // 5 minutes

    return (
      <View key={message.id}>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
          ]}
        >
          {!isMyMessage && (
            <Image
              source={
                params.userImage
                  ? { uri: params.userImage }
                  : require("@/assets/girls/ai1.jpg")
              }
              style={styles.messageAvatar}
            />
          )}

          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
              message.type === "image" && styles.imageBubble,
            ]}
          >
            {/* Image Message */}
            {message.type === "image" && message.imageUri && (
              <View style={styles.imageMessageContainer}>
                <Image
                  source={{ uri: message.imageUri }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
                {message.status === "sending" && (
                  <View style={styles.imageUploadingOverlay}>
                    <Text style={styles.imageUploadingText}>Uploading...</Text>
                  </View>
                )}
              </View>
            )}

            {/* Text Message */}
            {message.type === "text" && (
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.theirMessageText,
                ]}
              >
                {message.text}
              </Text>
            )}

            {isMyMessage && (
              <View style={styles.messageStatusContainer}>
                {renderMessageStatus(message.status)}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_BG}
        translucent={false}
      />

      {/* iOS Safe Area Top */}
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={["rgba(141, 105, 246, 0.1)", "rgba(239, 62, 120, 0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerContent}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={WHITE} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* User Info */}
          <TouchableOpacity style={styles.headerUserInfo} activeOpacity={0.7}>
            <View style={styles.headerAvatarContainer}>
              <Image
                source={
                  params.userImage
                    ? { uri: params.userImage }
                    : require("@/assets/girls/ai1.jpg")
                }
                style={styles.headerAvatar}
              />
              {isOnline && <View style={styles.headerOnlineDot} />}
            </View>

            <View style={styles.headerUserText}>
              <Text style={styles.headerUserName}>{userName}</Text>
              <Text style={styles.headerUserStatus}>
                {isOnline ? "Active now" : "Offline"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handlePhoneCall}
              accessibilityLabel="Voice call"
            >
              <Phone size={20} color={ACCENT_PURPLE} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleVideoCall}
              accessibilityLabel="Video call"
            >
              <Video size={20} color={ACCENT_PURPLE} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleMoreOptions}
              accessibilityLabel="More options"
            >
              <MoreVertical size={20} color={ACCENT_PURPLE} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => renderMessage(message, index))}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageRow, styles.theirMessageRow]}>
            <Image
              source={
                params.userImage
                  ? { uri: params.userImage }
                  : require("@/assets/girls/ai1.jpg")
              }
              style={styles.messageAvatar}
            />
            <View style={[styles.messageBubble, styles.theirMessageBubble]}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <LinearGradient
            colors={["rgba(141, 105, 246, 0.05)", "rgba(239, 62, 120, 0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.inputRow}>
            {/* Media Button */}
            <TouchableOpacity
              style={styles.mediaButton}
              accessibilityLabel="Attach media"
              onPress={handleImagePick}
            >
              <ImageIcon size={22} color={ACCENT_PURPLE} strokeWidth={2} />
            </TouchableOpacity>

            {/* Text Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor={TEXT_MUTED}
                style={styles.textInput}
                multiline
                maxLength={1000}
                accessibilityLabel="Message input"
              />

              {/* Emoji Button */}
              <TouchableOpacity
                style={styles.emojiButton}
                accessibilityLabel="Add emoji"
                onPress={handleEmojiPick}
              >
                <Smile size={20} color={TEXT_MUTED} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim().length > 0 && styles.sendButtonActive,
              ]}
              onPress={handleSend}
              disabled={inputText.trim().length === 0}
              accessibilityLabel="Send message"
            >
              <Send
                size={20}
                color={WHITE}
                strokeWidth={2.5}
                fill={inputText.trim().length > 0 ? WHITE : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },

  // Header
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(141, 105, 246, 0.15)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: ACCENT_PURPLE,
  },
  headerOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ONLINE_GREEN,
    borderWidth: 2,
    borderColor: BRAND_BG,
  },
  headerUserText: {
    flex: 1,
  },
  headerUserName: {
    fontSize: 16,
    fontFamily: "Lora-Bold",
    color: WHITE,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  headerUserStatus: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: TEXT_SECONDARY,
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  timestampContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  timestampText: {
    fontSize: 11,
    fontFamily: "DMSans-Medium",
    color: TEXT_MUTED,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  theirMessageRow: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: MY_MESSAGE_BG,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  theirMessageBubble: {
    backgroundColor: THEIR_MESSAGE_BG,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  myMessageText: {
    color: WHITE,
    fontFamily: "DMSans-Regular",
  },
  theirMessageText: {
    color: TEXT_SECONDARY,
    fontFamily: "DMSans-Regular",
  },
  messageStatusContainer: {
    marginTop: 4,
    alignSelf: "flex-end",
  },

  // Image Messages
  imageBubble: {
    padding: 4,
    maxWidth: "80%",
  },
  imageMessageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  messageImage: {
    width: 240,
    height: 240,
    borderRadius: 12,
  },
  imageUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  imageUploadingText: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    letterSpacing: 0.2,
  },

  // Typing Indicator
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEXT_MUTED,
  },

  // Input
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(141, 105, 246, 0.15)",
    paddingHorizontal: 16,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  mediaButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 42,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    letterSpacing: 0.2,
    maxHeight: 80,
    paddingTop: Platform.OS === "ios" ? 2 : 0,
  },
  emojiButton: {
    marginLeft: 8,
    padding: 4,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(141, 105, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.4)",
  },
  sendButtonActive: {
    backgroundColor: ACCENT_PURPLE,
    borderColor: ACCENT_PURPLE,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
