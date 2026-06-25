import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  ShieldAlert,
  X,
  Smile,
  UploadCloud,
  Video,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  AccessibilityInfo,
  Alert,
  FlatList,
  Image,
  type ImageSourcePropType,
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
import {
  DEMO_CURRENT_USER_ID,
  getSeedConversationPhotoSource,
  isSeedConversationId,
} from "@/src/features/messaging/data/seedConversations";
import { useChatRealtime } from "@/src/features/messaging/hooks/useChatRealtime";
import { useMessages } from "@/src/features/messaging/hooks/useMessages";
import { useMessageUpload } from "@/src/features/messaging/hooks/useMessageUpload";
import type { Message as MessageType } from "@/src/features/messaging/types/messaging.types";
import { DateHeader } from "@/src/features/messaging/components/DateHeader";
import { ScrollToBottomFab } from "@/src/features/messaging/components/ScrollToBottomFab";
import { TypingIndicator } from "@/src/features/messaging/components/TypingIndicator";
import { blockUser, unmatchUser } from "@/src/features/safety/api/safetyApi";
import { MessageBubble } from "../components/MessageBubble";
import { useAppTheme, makeStyles } from "@/src/theme";
import { useMessageStore } from "@/src/stores/messageStore";

// Brand Colors

type ChatScreenParams = {
  userId: string;
  userName: string;
  userImage?: string;
  isOnline?: string;
  conversationId?: string;
  isDemo?: string;
};

function getDateKey(dateString: string): string {
  return new Date(dateString).toDateString();
}

function shouldShowDateHeader(messages: MessageType[], index: number): boolean {
  if (index === 0) return true;
  return (
    getDateKey(messages[index].created_at) !==
    getDateKey(messages[index - 1].created_at)
  );
}

function normalizeImageSource(
  source?: string | ImageSourcePropType | null,
): ImageSourcePropType | null {
  if (!source) return null;
  if (typeof source === "string") {
    const uri = source.trim();
    return uri ? { uri } : null;
  }
  return source;
}

export default function ChatScreen() {
  const theme = useAppTheme();
  const styles = useStyles();
  const BRAND_BG = theme.colors.dalisay[950];
  const ACCENT_PURPLE = theme.colors.dalisay[500];
  const DANGER_RED = theme.colors.amihan[500];
  const WHITE = "#FFFFFF";
  const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
  const TEXT_MUTED = "rgba(255,255,255,0.5)";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ChatScreenParams>();
  const inputRef = useRef<TextInput>(null);

  const handleSwipeToReply = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList<MessageType>>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [createdConversationId, setCreatedConversationId] = useState<
    string | undefined
  >(params.conversationId);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [safetyAction, setSafetyAction] = useState<
    "blocking" | "unmatching" | null
  >(null);
  const [safetyFeedback, setSafetyFeedback] = useState<{
    title: string;
    message: string;
    action?: "block" | "unmatch";
  } | null>(null);
  const [safetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const [isDemoConversationClosed, setIsDemoConversationClosed] =
    useState(false);
  const hideDemoConversation = useMessageStore(
    (state) => state.hideDemoConversation,
  );

  const userName = params.userName || "User";
  const isOnline = params.isOnline === "true";
  const recipientId = params.userId;
  const isSafetyActionPending = safetyAction !== null;
  const hasDraftMessage = inputText.trim().length > 0;
  const activeConversationId = params.conversationId ?? createdConversationId;
  const isDemoChat =
    params.isDemo === "true" ||
    Boolean(activeConversationId && isSeedConversationId(activeConversationId));
  const demoUserImage = activeConversationId
    ? getSeedConversationPhotoSource(activeConversationId)
    : null;
  const chatUserImage = normalizeImageSource(
    isDemoChat ? demoUserImage ?? params.userImage : params.userImage,
  );
  const defaultEmoji = String.fromCodePoint(0x1f60a);
  const messagingUserId = isDemoChat
    ? currentUserId || DEMO_CURRENT_USER_ID
    : currentUserId;

  // Get current user ID
  useEffect(() => {
    if (isDemoChat) {
      setCurrentUserId(DEMO_CURRENT_USER_ID);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, [isDemoChat]);

  useEffect(() => {
    if (params.conversationId) {
      setCreatedConversationId(params.conversationId);
      setIsDemoConversationClosed(false);
    }
  }, [params.conversationId]);

  // Initialize messaging hooks
  const {
    messages: dbMessages,
    loading,
    error,
    sendText,
    sendImage: sendImageToDb,
    markAsRead,
    refresh,
    addMessage,
  } = useMessages({
    conversationId: activeConversationId,
    userId: messagingUserId,
    recipientId: recipientId || "",
    autoLoad: true,
  });
  const isFirstMessageSetup = !activeConversationId && dbMessages.length === 0;
  const messageInputPlaceholder = isSafetyActionPending
    ? "Messaging paused while this finishes..."
    : isDemoChat
      ? "Reply in demo chat..."
      : isFirstMessageSetup
      ? "Write the first message..."
      : "Type a respectful message...";

  useEffect(() => {
    if (activeConversationId) return;

    const messageConversationId = dbMessages.find(
      (message) => message.conversation_id,
    )?.conversation_id;

    if (messageConversationId) {
      setCreatedConversationId(messageConversationId);
    }
  }, [activeConversationId, dbMessages]);

  useEffect(() => {
    if (!activeConversationId || !messagingUserId || dbMessages.length === 0) {
      return;
    }

    void markAsRead();
  }, [activeConversationId, messagingUserId, dbMessages.length, markAsRead]);

  const {
    uploadImage,
    uploading,
    progress: uploadProgress,
    error: uploadError,
    reset: resetUpload,
  } = useMessageUpload();
  const uploadProgressValue = Math.max(uploadProgress, uploading ? 5 : 0);

  // Setup realtime subscriptions
  const { sendTyping } = useChatRealtime({
    conversationId: isDemoChat ? undefined : activeConversationId,
    userId: messagingUserId,
    recipientId: recipientId || "",
    onNewMessage: (message) => {
      addMessage(message);
      flatListRef.current?.scrollToEnd({ animated: true });
    },
    onTyping: (typing) => {
      setIsTyping(typing);
    },
  });

  useEffect(() => {
    if (!uploadError) return;

    setMediaError(uploadError.message || "Photo upload failed. Try again.");
  }, [uploadError]);

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
    setSendError(null);
    setInputText("");

    try {
      const sentMessage = await sendText(messageText);

      if (sentMessage?.conversation_id) {
        setCreatedConversationId(sentMessage.conversation_id);
      }

      flatListRef.current?.scrollToEnd({ animated: true });
    } catch {
      console.error("Error sending message.");
      const recoveryMessage =
        "Message was not sent. Check your connection, review the text, and try again.";
      setSendError(recoveryMessage);
      AccessibilityInfo.announceForAccessibility(recoveryMessage);
      Alert.alert("Message not sent", recoveryMessage);
      // Restore input text on error
      setInputText(messageText);
    }
  }, [inputText, sendText]);

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      if (sendError) {
        setSendError(null);
      }
    },
    [sendError],
  );

  // Image picker handler
  const handleImagePick = useCallback(async () => {
    try {
      resetUpload();
      setMediaError(null);

      if (uploading || isSafetyActionPending) {
        return;
      }

      if (!activeConversationId) {
        const message =
          "Photo sharing unlocks after your first text starts this matched conversation. Send a short message first, then attach a photo.";
        setMediaError(message);
        AccessibilityInfo.announceForAccessibility(message);
        Alert.alert("Could not send photo", message);
        return;
      }

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
          if (isDemoChat) {
            await sendImageToDb(imageUri);
            AccessibilityInfo.announceForAccessibility(
              "Demo photo message added.",
            );
            flatListRef.current?.scrollToEnd({ animated: true });
            return;
          }

          // Upload image to Supabase Storage
          const imageUrl = await uploadImage(
            imageUri,
            activeConversationId,
          );

          if (!imageUrl) {
            throw new Error("Failed to get image URL");
          }

          // Send image message to database
          await sendImageToDb(imageUrl);
          AccessibilityInfo.announceForAccessibility("Photo sent.");
          flatListRef.current?.scrollToEnd({ animated: true });
        } catch (uploadError) {
          console.error("Error uploading image.");
          setMediaError(
            uploadError instanceof Error
              ? uploadError.message
              : "Could not upload image. Please try again.",
          );
          Alert.alert(
            "Upload Failed",
            "Could not upload image. Please try again.",
          );
        }
      }
    } catch {
      console.error("Error picking image.");
      setMediaError("Could not open your photo library. Please try again.");
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, [
    isSafetyActionPending,
    isDemoChat,
    activeConversationId,
    resetUpload,
    sendImageToDb,
    uploadImage,
    uploading,
  ]);

  const handleBlockUser = useCallback(() => {
    setSafetyMenuOpen(false);

    if (isDemoChat) {
      const message = `${userName} would be blocked in a live conversation. No backend safety action was sent for this seeded chat.`;
      if (activeConversationId) {
        hideDemoConversation(activeConversationId);
      }
      setIsDemoConversationClosed(true);
      setSafetyFeedback({
        title: "Demo block recorded",
        message,
      });
      AccessibilityInfo.announceForAccessibility(message);
      setTimeout(() => router.replace("/messages"), 650);
      return;
    }

    if (!recipientId) {
      Alert.alert(
        "Could not block member",
        "This member could not be identified. Go back and try again.",
      );
      return;
    }

    Alert.alert(
      `Block ${userName}?`,
      "Use Block when you want contact to stop. This removes the match, closes the chat for you, and prevents this member from messaging you again. If something unsafe happened, report first so support can review it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block member",
          style: "destructive",
          onPress: async () => {
            setSafetyFeedback(null);
            setSafetyAction("blocking");
            const result = await blockUser(recipientId);
            setSafetyAction(null);

            if (!result.success) {
              const message =
                result.error ||
                "Block did not finish. Check your connection and try again.";
              setSafetyFeedback({
                title: "Block did not finish",
                message,
                action: "block",
              });
              AccessibilityInfo.announceForAccessibility(message);
              Alert.alert("Block failed", message);
              return;
            }

            AccessibilityInfo.announceForAccessibility(
              `${userName} has been blocked.`,
            );
            Alert.alert(
              "Member blocked",
              `${userName} can no longer message you. You can report this member from their profile if support should review what happened.`,
              [
                {
                  text: "Back to messages",
                  onPress: () => router.replace("/messages"),
                },
              ],
            );
          },
        },
      ],
    );
  }, [
    activeConversationId,
    hideDemoConversation,
    isDemoChat,
    recipientId,
    router,
    userName,
  ]);

  const handleUnmatchUser = useCallback(() => {
    setSafetyMenuOpen(false);

    if (isDemoChat) {
      const message = `${userName} would be removed from your matches in a live conversation. No backend safety action was sent for this seeded chat.`;
      if (activeConversationId) {
        hideDemoConversation(activeConversationId);
      }
      setIsDemoConversationClosed(true);
      setSafetyFeedback({
        title: "Demo unmatch recorded",
        message,
      });
      AccessibilityInfo.announceForAccessibility(message);
      setTimeout(() => router.replace("/messages"), 650);
      return;
    }

    if (!recipientId) {
      Alert.alert(
        "Could not unmatch",
        "This member could not be identified. Go back and try again.",
      );
      return;
    }

    Alert.alert(
      `Unmatch ${userName}?`,
      "Use Unmatch when you simply want to leave the connection. This removes the match and closes this conversation for you. If there was harassment, threats, fraud, or pressure, report instead so support can review it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: async () => {
            setSafetyFeedback(null);
            setSafetyAction("unmatching");
            const result = await unmatchUser(recipientId);
            setSafetyAction(null);

            if (!result.success) {
              const message =
                result.error ||
                "Unmatch did not finish. Check your connection and try again.";
              setSafetyFeedback({
                title: "Unmatch did not finish",
                message,
                action: "unmatch",
              });
              AccessibilityInfo.announceForAccessibility(message);
              Alert.alert("Unmatch failed", message);
              return;
            }

            AccessibilityInfo.announceForAccessibility(
              `${userName} has been unmatched.`,
            );
            Alert.alert(
              "Match removed",
              `${userName} has been removed from your matches. Use Report next time if the conversation needs support review.`,
              [
                {
                  text: "Back to messages",
                  onPress: () => router.replace("/messages"),
                },
              ],
            );
          },
        },
      ],
    );
  }, [
    activeConversationId,
    hideDemoConversation,
    isDemoChat,
    recipientId,
    router,
    userName,
  ]);

  const handleReportUser = useCallback(() => {
    setSafetyMenuOpen(false);

    if (!recipientId) {
      Alert.alert(
        "Could not open report form",
        "This member could not be identified. Go back and try again.",
      );
      return;
    }

    router.push({
      pathname: "/(modals)/report-user",
      params: {
        userId: recipientId,
        userName,
        conversationId: activeConversationId,
        source: "chat",
        ...(isDemoChat ? { isDemo: "true" } : {}),
      },
    });
  }, [activeConversationId, isDemoChat, recipientId, router, userName]);

  const handleRetrySafetyAction = useCallback(() => {
    if (!safetyFeedback?.action) return;

    if (safetyFeedback.action === "block") {
      handleBlockUser();
      return;
    }

    handleUnmatchUser();
  }, [handleBlockUser, handleUnmatchUser, safetyFeedback?.action]);

  // More options handler
  const handleMoreOptions = useCallback(() => {
    if (isSafetyActionPending) return;

    if (Platform.OS === "web" || isDemoChat) {
      setSafetyMenuOpen((current) => !current);
      return;
    }

    const options = [
      "Report safety concern",
      "Block member",
      "Unmatch only",
      "Cancel",
    ];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Safety options",
          message:
            "Report sends this chat for support review. Block stops future contact. Unmatch only removes the connection.",
          options,
          destructiveButtonIndex: [1, 2],
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              handleReportUser();
              break;
            case 1:
              handleBlockUser();
              break;
            case 2:
              handleUnmatchUser();
              break;
          }
        },
      );
    } else {
      Alert.alert(
        "Safety options",
        "Report sends this chat for support review. Block stops future contact. Unmatch only removes the connection.",
        [
          { text: "Report safety concern", onPress: handleReportUser },
          {
            text: "Block member",
            style: "destructive",
            onPress: handleBlockUser,
          },
          {
            text: "Unmatch only",
            style: "destructive",
            onPress: handleUnmatchUser,
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    }
  }, [
    handleBlockUser,
    handleReportUser,
    handleUnmatchUser,
    isDemoChat,
    isSafetyActionPending,
  ]);

  // Phone call handler
  const handlePhoneCall = useCallback(() => {
    router.push({
      pathname: "/voice-call",
      params: {
        userId: recipientId,
        userName: userName,
        userAvatar: params.userImage,
        conversationId: activeConversationId,
        isOnline: params.isOnline,
        ...(isDemoChat ? { isDemo: "true" } : {}),
      },
    });
  }, [
    activeConversationId,
    isDemoChat,
    params.isOnline,
    params.userImage,
    recipientId,
    router,
    userName,
  ]);

  // Video call handler
  const handleVideoCall = useCallback(() => {
    router.push({
      pathname: "/video-call",
      params: {
        userId: recipientId,
        userName: userName,
        userAvatar: params.userImage,
        conversationId: activeConversationId,
        isOnline: params.isOnline,
        ...(isDemoChat ? { isDemo: "true" } : {}),
      },
    });
  }, [
    activeConversationId,
    isDemoChat,
    params.isOnline,
    params.userImage,
    recipientId,
    router,
    userName,
  ]);

  const handleEmojiPick = useCallback(() => {
    setInputText((current) => {
      const prefix = current.trim().length > 0 ? `${current} ` : "";
      return `${prefix}${defaultEmoji}`;
    });
    inputRef.current?.focus();
  }, [defaultEmoji]);

  // ==================== END HANDLER FUNCTIONS ====================

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      setShowScrollFab(distanceFromBottom > 200);
    },
    [],
  );

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const keyExtractor = useCallback((item: MessageType) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: MessageType; index: number }) => (
      <View>
        {shouldShowDateHeader(dbMessages, index) && (
          <DateHeader date={item.created_at} />
        )}
        <MessageBubble
          message={item}
          currentUserId={messagingUserId}
          userName={userName}
          onSwipeToReply={handleSwipeToReply}
          userImage={chatUserImage}
        />
      </View>
    ),
    [
      chatUserImage,
      dbMessages,
      handleSwipeToReply,
      messagingUserId,
      userName,
    ],
  );

  // Show loading state
  if (loading && dbMessages.length === 0) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator
          size="large"
          color={ACCENT_PURPLE}
          accessibilityRole="progressbar"
          accessibilityLabel={`Loading messages with ${userName}`}
        />
        <Text style={styles.loadingText}>Loading messages...</Text>
        <Text style={styles.loadingSubtext}>
          Opening your matched chat with {userName}. If this is your first
          message, the conversation is created only after you send it.
        </Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View
        style={[styles.root, styles.centerContent]}
        accessibilityRole="alert"
      >
        <View style={styles.errorIconWrap}>
          <RefreshCw size={30} color={ACCENT_PURPLE} strokeWidth={1.8} />
        </View>
        <Text style={styles.errorText}>Messages did not load</Text>
        <Text style={styles.errorSubtext}>
          Check your connection and try again. If this is a new chat, send the
          first text only after the screen loads cleanly.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={refresh}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Retry loading messages"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isDemoChat && isDemoConversationClosed) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <View style={styles.errorIconWrap}>
          <ShieldAlert size={30} color={ACCENT_PURPLE} strokeWidth={1.8} />
        </View>
        <Text style={styles.errorText}>Demo conversation removed</Text>
        <Text style={styles.errorSubtext}>
          This seeded chat is hidden from the inbox on this device. Live
          conversations keep the backend block, unmatch, and report flows ready.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/messages")}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Return to messages"
        >
          <Text style={styles.retryButtonText}>Back to messages</Text>
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
      {Platform.OS !== "web" && (
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
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <ArrowLeft size={24} color={WHITE} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* User Info */}
          <View
            style={styles.headerUserInfo}
            accessible
            accessibilityLabel={`${userName}, ${isDemoChat ? "demo chat" : isOnline ? "active now" : "offline"}`}
          >
            <View style={styles.headerAvatarContainer}>
              {chatUserImage ? (
                <Image
                  source={chatUserImage}
                  style={styles.headerAvatar}
                  accessibilityLabel={`${userName} profile photo`}
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
                {isDemoChat
                  ? `Demo chat${isOnline ? " - Active now" : ""}`
                  : isOnline
                    ? "Active now"
                    : "Offline"}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handlePhoneCall}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={`Keep voice with ${userName} in messages`}
              accessibilityHint="Opens a safe explanation. No microphone permission will be requested."
            >
              <Phone size={20} color={ACCENT_PURPLE} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleVideoCall}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={`Keep video with ${userName} in messages`}
              accessibilityHint="Opens a safe explanation. No camera or microphone permission will be requested."
            >
              <Video size={20} color={ACCENT_PURPLE} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                styles.headerSafetyBtn,
                isSafetyActionPending && styles.headerActionBtnDisabled,
              ]}
              onPress={handleMoreOptions}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={`Open safety options for ${userName}`}
              accessibilityHint="Lets you report, block, or unmatch this member"
              accessibilityState={{ disabled: isSafetyActionPending }}
              disabled={isSafetyActionPending}
            >
              <ShieldAlert size={20} color={DANGER_RED} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isSafetyActionPending && (
        <View
          style={styles.safetyBusyBanner}
          accessibilityRole="progressbar"
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            safetyAction === "blocking"
              ? `Blocking ${userName}`
              : `Unmatching ${userName}`
          }
        >
          <ActivityIndicator size="small" color={WHITE} />
          <Text style={styles.safetyBusyText}>
            {safetyAction === "blocking"
              ? "Blocking member..."
              : "Removing match..."}
          </Text>
        </View>
      )}

      <View style={styles.safetyReminder}>
        {isDemoChat ? (
          <MessageCircle size={17} color={ACCENT_PURPLE} strokeWidth={2.2} />
        ) : (
          <ShieldAlert size={17} color={DANGER_RED} strokeWidth={2.2} />
        )}
        <Text style={styles.safetyReminderText}>
          {isDemoChat
            ? "Demo chat: replies, photos, and safety actions run locally for this beta conversation. Live delivery and moderation stay ready for real conversations."
            : "Report first if support should review this chat. Block stops contact. Unmatch only leaves the connection."}
        </Text>
        <TouchableOpacity
          style={[
            styles.safetyReminderButton,
            isSafetyActionPending && styles.headerActionBtnDisabled,
          ]}
          onPress={handleMoreOptions}
          disabled={isSafetyActionPending}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel={`Open safety options for ${userName}`}
          accessibilityHint="Report for support review, block to stop contact, or unmatch to leave the connection"
          accessibilityState={{ disabled: isSafetyActionPending }}
        >
          <Text style={styles.safetyReminderButtonText}>
            {isDemoChat ? "Demo" : "Options"}
          </Text>
        </TouchableOpacity>
      </View>

      {safetyMenuOpen && (
        <View
          style={styles.safetyOptionsPanel}
          accessibilityRole="menu"
          accessibilityLabel={`Safety options for ${userName}`}
        >
          <TouchableOpacity
            style={styles.safetyOptionButton}
            onPress={handleReportUser}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel={`Report safety concern about ${userName}`}
            accessibilityHint="Opens the private safety report form"
          >
            <ShieldAlert size={18} color={WHITE} strokeWidth={2.4} />
            <View style={styles.safetyOptionContent}>
              <Text style={styles.safetyOptionTitle}>Report safety concern</Text>
              <Text style={styles.safetyOptionText}>
                Opens a private report for support review.
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.safetyOptionGrid}>
            <TouchableOpacity
              style={[styles.safetyOptionButton, styles.safetyOptionDanger]}
              onPress={handleBlockUser}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={
                isDemoChat ? `Record demo block for ${userName}` : `Block ${userName}`
              }
            >
              <ShieldAlert size={17} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.safetyOptionTitle}>
                {isDemoChat ? "Demo block" : "Block member"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.safetyOptionButton, styles.safetyOptionSecondary]}
              onPress={handleUnmatchUser}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={
                isDemoChat
                  ? `Record demo unmatch with ${userName}`
                  : `Unmatch with ${userName}`
              }
            >
              <X size={17} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.safetyOptionTitle}>Unmatch only</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.safetyOptionClose}
            onPress={() => setSafetyMenuOpen(false)}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="Close safety options"
          >
            <Text style={styles.safetyOptionCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={dbMessages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
          dbMessages.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        ListEmptyComponent={
          <View style={styles.emptyChatState}>
            <View style={styles.emptyChatIconWrap}>
              <MessageCircle
                size={36}
                color={ACCENT_PURPLE}
                strokeWidth={1.8}
              />
            </View>
            <Text style={styles.emptyChatTitle}>Send the first message</Text>
            <Text style={styles.emptyChatText}>
              Your first text creates the matched conversation after access
              checks pass. Keep it specific, kind, and easy to reply to.
            </Text>
            <View style={styles.emptyChatSafetyRow}>
              <ShieldAlert size={14} color={TEXT_SECONDARY} strokeWidth={2} />
              <Text style={styles.emptyChatSafetyText}>
                Photos unlock after the first text. Never share passwords,
                codes, IDs, or payment details in chat.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.emptyChatSafetyButton,
                isSafetyActionPending && styles.headerActionBtnDisabled,
              ]}
              onPress={handleMoreOptions}
              disabled={isSafetyActionPending}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={`Open safety options for ${userName}`}
              accessibilityHint="Report this chat, block future contact, or unmatch only"
              accessibilityState={{ disabled: isSafetyActionPending }}
            >
              <ShieldAlert size={16} color={WHITE} strokeWidth={2.4} />
              <Text style={styles.emptyChatSafetyButtonText}>
                Report or leave chat
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.messageRow, styles.theirMessageRow]}>
              {chatUserImage ? (
                <Image
                  source={chatUserImage}
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

      <ScrollToBottomFab visible={showScrollFab} onPress={scrollToBottom} />

      {(uploading || mediaError) && (
        <View
          style={[
            styles.mediaStatusBanner,
            mediaError && styles.mediaStatusBannerError,
          ]}
          accessibilityRole={uploading ? "progressbar" : "alert"}
          accessibilityLabel={
            uploading
              ? `Uploading photo, ${uploadProgressValue} percent complete`
              : mediaError || "Photo upload failed"
          }
        >
          <View style={styles.mediaStatusIconWrap}>
            {uploading ? (
              <UploadCloud size={18} color={WHITE} strokeWidth={2.3} />
            ) : (
              <AlertCircle size={18} color={WHITE} strokeWidth={2.3} />
            )}
          </View>
          <View style={styles.mediaStatusContent}>
            <Text style={styles.mediaStatusTitle}>
              {uploading ? "Uploading photo" : "Photo was not sent"}
            </Text>
            <Text style={styles.mediaStatusText}>
              {uploading
                ? `${uploadProgressValue}% complete. Keep this screen open until the upload finishes. This photo stays in the matched chat path.`
                : mediaError || "Check your connection and try again."}
            </Text>
            {uploading && (
              <View style={styles.mediaProgressTrack}>
                <View
                  style={[
                    styles.mediaProgressFill,
                    { width: `${uploadProgressValue}%` },
                  ]}
                />
              </View>
            )}
          </View>
          {mediaError && (
            <TouchableOpacity
              style={styles.mediaRetryButton}
              onPress={handleImagePick}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="Try sending a photo again"
              accessibilityHint="Reopens your photo library so you can choose the photo again"
            >
              <RefreshCw size={18} color={WHITE} strokeWidth={2.3} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {sendError && (
        <View
          style={styles.sendErrorBanner}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={sendError}
        >
          <AlertCircle size={18} color={WHITE} strokeWidth={2.3} />
          <Text style={styles.sendErrorText}>{sendError}</Text>
        </View>
      )}

      {safetyFeedback && (
        <View
          style={styles.safetyFeedbackBanner}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${safetyFeedback.title}. ${safetyFeedback.message}`}
        >
          <AlertCircle size={18} color={WHITE} strokeWidth={2.3} />
          <View style={styles.safetyFeedbackContent}>
            <Text style={styles.safetyFeedbackTitle}>
              {safetyFeedback.title}
            </Text>
            <Text style={styles.safetyFeedbackText}>
              {safetyFeedback.message}
            </Text>
          </View>
          {safetyFeedback.action && (
            <TouchableOpacity
              style={styles.safetyFeedbackRetry}
              onPress={handleRetrySafetyAction}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={`Retry ${safetyFeedback.action}`}
              accessibilityHint="Opens the confirmation before trying this safety action again"
            >
              <RefreshCw size={17} color={WHITE} strokeWidth={2.3} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.safetyFeedbackDismiss}
            onPress={() => setSafetyFeedback(null)}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="Dismiss safety message"
          >
            <X size={18} color={WHITE} strokeWidth={2.3} />
          </TouchableOpacity>
        </View>
      )}

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
                (uploading || isSafetyActionPending) && styles.mediaButtonDisabled,
              ]}
              accessibilityLabel={
                uploading
                  ? "Uploading photo"
                  : isDemoChat
                    ? "Attach demo photo"
                    : isSafetyActionPending
                    ? "Photo sharing paused"
                    : isFirstMessageSetup
                      ? "Photo sharing available after first message"
                      : "Attach photo"
              }
              accessibilityRole="button"
              accessibilityHint={
                isDemoChat
                  ? "Opens your photo library and adds the image locally without uploading"
                  : isSafetyActionPending
                  ? "Photo sharing is paused while the safety action finishes"
                  : isFirstMessageSetup
                    ? "Send a text first to start this matched conversation, then attach a photo"
                    : "Opens your photo library to send an image"
              }
              accessibilityState={{
                disabled: uploading || isSafetyActionPending,
                busy: uploading,
              }}
              activeOpacity={0.84}
              onPress={handleImagePick}
              disabled={uploading || isSafetyActionPending}
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
                onChangeText={handleInputChange}
                placeholder={messageInputPlaceholder}
                placeholderTextColor={TEXT_MUTED}
                style={styles.textInput}
                multiline
                maxLength={1000}
                accessibilityLabel="Message input"
                accessibilityHint={
                  isDemoChat
                    ? "Adds this reply only to the local demo conversation"
                    : isFirstMessageSetup
                    ? "Your first text starts this matched conversation after access checks pass"
                    : "Type your message before sending"
                }
                editable={!isSafetyActionPending}
              />

              {/* Emoji Button */}
              <TouchableOpacity
                style={[
                  styles.emojiButton,
                  isSafetyActionPending && styles.iconButtonDisabled,
                ]}
                accessibilityLabel="Add emoji"
                accessibilityRole="button"
                accessibilityHint="Opens a note about using your keyboard for emoji"
                accessibilityState={{ disabled: isSafetyActionPending }}
                disabled={isSafetyActionPending}
                onPress={handleEmojiPick}
              >
                <Smile size={20} color={TEXT_MUTED} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                hasDraftMessage &&
                  !isSafetyActionPending &&
                  styles.sendButtonActive,
                (!hasDraftMessage || isSafetyActionPending) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!hasDraftMessage || isSafetyActionPending}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel={
                hasDraftMessage
                  ? isDemoChat
                    ? "Send demo reply"
                    : isFirstMessageSetup
                    ? "Send first message"
                    : "Send message"
                  : "Type a message before sending"
              }
              accessibilityHint={
                isSafetyActionPending
                  ? "Messaging is paused while the safety action finishes"
                  : isDemoChat
                    ? "Adds this message locally without contacting live chat services"
                  : isFirstMessageSetup
                    ? "Creates the matched conversation after access checks pass"
                  : "Sends this message to the current conversation"
              }
              accessibilityState={{
                disabled: !hasDraftMessage || isSafetyActionPending,
              }}
            >
              <Send
                size={20}
                color={WHITE}
                strokeWidth={2.5}
                fill={hasDraftMessage ? WHITE : "transparent"}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={styles.chatMediaSafetyHint}
            accessibilityRole="text"
          >
            {isFirstMessageSetup
              ? "Send a text first to start this matched conversation. Photo sharing stays locked until the chat exists."
              : isDemoChat
                ? "Demo chat replies and photos stay local on this device. Live conversations keep storage uploads, reports, and backend delivery."
              : "Only send photos you are comfortable sharing in this chat. Never send passwords, codes, ID documents, or payment details. Report pressure or threats from Safety options."}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((theme) => {
  const BRAND_BG = theme.colors.dalisay[950];
  const ACCENT_PURPLE = theme.colors.dalisay[500];
  const DANGER_RED = theme.colors.amihan[500];
  const ONLINE_GREEN = "#10B981";
  const WHITE = "#FFFFFF";
  const SURFACE = "rgba(255,255,255,0.06)";
  const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
  const TEXT_MUTED = "rgba(255,255,255,0.5)";
  return {
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(141, 105, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.25)",
  },
  headerSafetyBtn: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderColor: "rgba(255, 107, 107, 0.28)",
  },
  headerActionBtnDisabled: {
    opacity: 0.5,
  },
  safetyBusyBanner: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(239, 62, 120, 0.18)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(239, 62, 120, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  safetyBusyText: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
  },
  safetyReminder: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 107, 107, 0.09)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 107, 107, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  safetyReminderText: {
    flex: 1,
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    lineHeight: 18,
  },
  safetyReminderButton: {
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.38)",
    backgroundColor: "rgba(255, 107, 107, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  safetyReminderButtonText: {
    color: WHITE,
    fontSize: 13,
    fontFamily: "DMSans-Bold",
  },
  safetyOptionsPanel: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(18, 10, 38, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    gap: 10,
  },
  safetyOptionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  safetyOptionButton: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(141, 105, 246, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  safetyOptionDanger: {
    backgroundColor: "rgba(255, 107, 107, 0.18)",
    borderColor: "rgba(255, 107, 107, 0.38)",
  },
  safetyOptionSecondary: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.16)",
  },
  safetyOptionContent: {
    flex: 1,
  },
  safetyOptionTitle: {
    color: WHITE,
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    lineHeight: 18,
  },
  safetyOptionText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    lineHeight: 17,
    marginTop: 2,
  },
  safetyOptionClose: {
    minHeight: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  safetyOptionCloseText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontFamily: "DMSans-Bold",
  },
  mediaStatusBanner: {
    minHeight: 72,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(141, 105, 246, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.38)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mediaStatusBannerError: {
    backgroundColor: "rgba(255, 107, 107, 0.16)",
    borderColor: "rgba(255, 107, 107, 0.42)",
  },
  mediaStatusIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaStatusContent: {
    flex: 1,
  },
  mediaStatusTitle: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
  },
  mediaStatusText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
    marginTop: 2,
  },
  mediaProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
    marginTop: 8,
  },
  mediaProgressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: WHITE,
  },
  mediaRetryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  sendErrorBanner: {
    minHeight: 56,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 107, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.42)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sendErrorText: {
    flex: 1,
    color: WHITE,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    lineHeight: 18,
  },
  safetyFeedbackBanner: {
    minHeight: 72,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 107, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.42)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  safetyFeedbackContent: {
    flex: 1,
  },
  safetyFeedbackTitle: {
    color: WHITE,
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    lineHeight: 18,
  },
  safetyFeedbackText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
    marginTop: 2,
  },
  safetyFeedbackRetry: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  safetyFeedbackDismiss: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  emptyChatState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emptyChatIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.24)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyChatTitle: {
    fontSize: 20,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyChatText: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  emptyChatSafetyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    maxWidth: 300,
  },
  emptyChatSafetyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    color: "rgba(255,255,255,0.62)",
    lineHeight: 20,
  },
  emptyChatSafetyButton: {
    minHeight: 46,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 107, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.38)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyChatSafetyButtonText: {
    color: WHITE,
    fontSize: 14,
    fontFamily: "DMSans-Bold",
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
    backgroundColor: "rgba(141, 105, 246, 0.25)",
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.3)",
  },
  theirMessageBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
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
  messageFailedText: {
    color: DANGER_RED,
    fontSize: 11,
    fontFamily: "DMSans-Bold",
    marginTop: 4,
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
  imageSafetyStrip: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(15, 8, 20, 0.72)",
  },
  imageSafetyText: {
    color: WHITE,
    fontSize: 11,
    fontFamily: "DMSans-Bold",
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    minHeight: 48,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    letterSpacing: 0,
    maxHeight: 80,
    paddingTop: Platform.OS === "ios" ? 2 : 0,
  },
  emojiButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonDisabled: {
    opacity: 0.45,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  sendButtonDisabled: {
    opacity: 0.62,
  },
  chatMediaSafetyHint: {
    marginTop: 8,
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    lineHeight: 17,
    textAlign: "center",
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
  loadingSubtext: {
    marginTop: 8,
    color: TEXT_MUTED,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    textAlign: "center",
  },
  errorText: {
    color: WHITE,
    fontSize: 20,
    fontFamily: "DMSans-Bold",
    marginTop: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    lineHeight: 22,
    marginBottom: 18,
    textAlign: "center",
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(141, 105, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.24)",
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: ACCENT_PURPLE,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
  mediaButtonDisabled: {
    opacity: 0.5,
  },
  };
});
