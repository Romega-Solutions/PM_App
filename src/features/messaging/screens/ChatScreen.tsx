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
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import hooks and types
import { supabase } from "@/src/config/supabase";
import { useChatRealtime } from "@/src/features/messaging/hooks/useChatRealtime";
import { useMessages } from "@/src/features/messaging/hooks/useMessages";
import { useMessageUpload } from "@/src/features/messaging/hooks/useMessageUpload";
import type { Message as MessageType } from "@/src/features/messaging/types/messaging.types";
import { DateHeader } from "@/src/features/messaging/components/DateHeader";
import { EmptyChatState } from "@/src/features/messaging/components/EmptyChatState";
import { ScrollToBottomFab } from "@/src/features/messaging/components/ScrollToBottomFab";
import { TypingIndicator } from "@/src/features/messaging/components/TypingIndicator";

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

type ChatScreenParams = {
  userId: string;
  userName: string;
  userImage?: string;
  isOnline?: string;
  conversationId?: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ChatScreenParams>();
  const flatListRef = useRef<FlatList<MessageType>>(null);
  const inputRef = useRef<TextInput>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const userName = params.userName || "User";
  const isOnline = params.isOnline === "true";
  const recipientId = params.userId;

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  // Initialize messaging hooks
  const {
    messages: dbMessages,
    loading,
    error,
    sendText,
    sendImage: sendImageToDb,
    markAsRead,
    addMessage,
  } = useMessages({
    conversationId: params.conversationId,
    userId: currentUserId,
    recipientId: recipientId || "",
    autoLoad: true,
  });

  const { uploadImage, uploading } = useMessageUpload();

  // Setup realtime subscriptions
  const { sendTyping } = useChatRealtime({
    conversationId: params.conversationId,
    userId: currentUserId,
    recipientId: recipientId || "",
    onNewMessage: (message) => {
      addMessage(message);
      flatListRef.current?.scrollToEnd({ animated: true });
    },
    onTyping: (typing) => {
      setIsTyping(typing);
    },
  });

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!showScrollFab) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [dbMessages, showScrollFab]);

  // Send typing indicator
  useEffect(() => {
    if (inputText.length > 0) {
      sendTyping(true);
      const timer = setTimeout(() => sendTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      sendTyping(false);
    }
  }, [inputText, sendTyping]);

  // ==================== HANDLER FUNCTIONS ====================

  // Send message handler - REAL BACKEND INTEGRATION
  const handleSend = useCallback(async () => {
    if (inputText.trim().length === 0) return;

    const messageText = inputText.trim();
    setInputText("");

    try {
      await sendText(messageText);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("❌ Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
      // Restore input text on error
      setInputText(messageText);
    }
  }, [inputText, sendText]);

  // Image picker handler
  const handleImagePick = useCallback(async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to send images.",
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

        try {
          // Upload image to Supabase Storage
          const imageUrl = await uploadImage(
            imageUri,
            params.conversationId || "",
          );

          if (!imageUrl) {
            throw new Error("Failed to get image URL");
          }

          // Send image message to database
          await sendImageToDb(imageUrl);
          flatListRef.current?.scrollToEnd({ animated: true });
        } catch (uploadError) {
          console.error("❌ Error uploading image:", uploadError);
          Alert.alert(
            "Upload Failed",
            "Could not upload image. Please try again.",
          );
        }
      }
    } catch (error) {
      console.error("❌ Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, [uploadImage, sendImageToDb, params.conversationId]);

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
                    onPress: () => console.log("Clear chat - TODO: implement"),
                  },
                ],
              );
              break;
          }
        },
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
              {
                text: "Clear",
                onPress: () => console.log("Clear - TODO: implement"),
              },
            ]),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }, []);

  // Phone call handler
  const handlePhoneCall = useCallback(() => {
    router.push({
      pathname: "/voice-call",
      params: {
        userId: recipientId,
        userName: userName,
        userAvatar: params.userImage,
      },
    });
  }, [router, recipientId, userName, params.userImage]);

  // Video call handler
  const handleVideoCall = useCallback(() => {
    router.push({
      pathname: "/video-call",
      params: {
        userId: recipientId,
        userName: userName,
        userAvatar: params.userImage,
      },
    });
  }, [router, recipientId, userName, params.userImage]);

  // Emoji picker handler
  const handleEmojiPick = useCallback(() => {
    console.log("Emoji picker - TODO: implement");
    // TODO: Implement emoji picker
  }, []);

  // ==================== END HANDLER FUNCTIONS ====================

  function getDateKey(dateString: string): string {
    return new Date(dateString).toDateString();
  }

  function shouldShowDateHeader(
    messages: MessageType[],
    index: number,
  ): boolean {
    if (index === 0) return true;
    return (
      getDateKey(messages[index].created_at) !==
      getDateKey(messages[index - 1].created_at)
    );
  }

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      setShowScrollFab(distanceFromBottom > 200);
    },
    [],
  );

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderMessageStatus = (status: MessageType["status"]) => {
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

  const renderMessage = (message: MessageType, index: number) => {
    const isMyMessage = message.sender_id === currentUserId;
    const showAvatar = !isMyMessage;

    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        {showAvatar &&
          (params.userImage && params.userImage.startsWith("http") ? (
            <Image
              source={{ uri: params.userImage }}
              style={styles.messageAvatar}
            />
          ) : (
            <View style={styles.messageAvatarPlaceholder}>
              <Text style={styles.messageAvatarPlaceholderText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ))}

        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          {message.type === "image" && message.image_url ? (
            <Image
              source={{ uri: message.image_url }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.theirMessageText,
              ]}
            >
              {message.text}
            </Text>
          )}

          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {formatTime(message.created_at)}
            </Text>
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

  // Show loading state
  if (loading && dbMessages.length === 0) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator size="large" color={ACCENT_PURPLE} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load messages</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/messages")}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/messages");
              }
            }}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={WHITE} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* User Info */}
          <TouchableOpacity style={styles.headerUserInfo} activeOpacity={0.7}>
            <View style={styles.headerAvatarContainer}>
              {params.userImage && params.userImage.startsWith("http") ? (
                <Image
                  source={{ uri: params.userImage }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarPlaceholderText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
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
      <FlatList
        ref={flatListRef}
        data={dbMessages}
        keyExtractor={(item) => item.id}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
          dbMessages.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        ListEmptyComponent={<EmptyChatState userName={userName} />}
        renderItem={({ item, index }) => (
          <View>
            {shouldShowDateHeader(dbMessages, index) && (
              <DateHeader date={item.created_at} />
            )}
            {renderMessage(item, index)}
          </View>
        )}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.messageRow, styles.theirMessageRow]}>
              {params.userImage && params.userImage.startsWith("http") ? (
                <Image
                  source={{ uri: params.userImage }}
                  style={styles.messageAvatar}
                />
              ) : (
                <View style={styles.messageAvatarPlaceholder}>
                  <Text style={styles.messageAvatarPlaceholderText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[styles.messageBubble, styles.theirMessageBubble]}>
                <TypingIndicator />
              </View>
            </View>
          ) : null
        }
      />

      {/* Scroll to Bottom FAB */}
      <ScrollToBottomFab visible={showScrollFab} onPress={scrollToBottom} />

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
              style={[
                styles.mediaButton,
                uploading && styles.mediaButtonDisabled,
              ]}
              accessibilityLabel="Attach media"
              onPress={handleImagePick}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={ACCENT_PURPLE} />
              ) : (
                <ImageIcon size={22} color={ACCENT_PURPLE} strokeWidth={2} />
              )}
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
  headerAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ACCENT_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: ACCENT_PURPLE,
  },
  headerAvatarPlaceholderText: {
    fontSize: 18,
    fontFamily: "Lora-Bold",
    color: WHITE,
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
  messageAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: ACCENT_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  messageAvatarPlaceholderText: {
    fontSize: 14,
    fontFamily: "Lora-Bold",
    color: WHITE,
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
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: "DMSans-Regular",
    color: TEXT_MUTED,
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

  // Loading and Error States
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: TEXT_SECONDARY,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },
  errorText: {
    color: ACCENT_PINK,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ACCENT_PURPLE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
  mediaButtonDisabled: {
    opacity: 0.5,
  },
});
