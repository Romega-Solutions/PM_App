import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatHeader } from "@/src/features/messaging/components/ChatHeader";
import { ChatStateView } from "@/src/features/messaging/components/ChatStateView";
import { MessageComposer } from "@/src/features/messaging/components/MessageComposer";
import { MessageList } from "@/src/features/messaging/components/MessageList";
import { useChatRealtime } from "@/src/features/messaging/hooks/useChatRealtime";
import { useCurrentUserId } from "@/src/features/messaging/hooks/useCurrentUserId";
import { useMessages } from "@/src/features/messaging/hooks/useMessages";
import { useMessageUpload } from "@/src/features/messaging/hooks/useMessageUpload";
import type { Message as MessageType } from "@/src/features/messaging/types/messaging.types";
import { useTheme } from "@/src/theme";

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
  const { colors } = useTheme();
  const params = useLocalSearchParams<ChatScreenParams>();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const userName = params.userName || "User";
  const isOnline = params.isOnline === "true";
  const recipientId = params.userId || "";

  const { currentUserId } = useCurrentUserId();

  const {
    messages,
    loading,
    error,
    sendText,
    sendImage: sendImageToDb,
    refresh,
    addMessage,
  } = useMessages({
    conversationId: params.conversationId,
    userId: currentUserId,
    recipientId,
    autoLoad: true,
  });

  const {
    uploadImage,
    uploading,
    progress: uploadProgress,
    reset: resetUpload,
  } = useMessageUpload();

  const scrollToBottom = useCallback((animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated });
  }, []);

  const { sendTyping } = useChatRealtime({
    conversationId: params.conversationId,
    userId: currentUserId,
    recipientId,
    onNewMessage: (message) => {
      addMessage(message);
      scrollToBottom();
    },
    onTyping: setIsTyping,
  });

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (inputText.length > 0) {
      sendTyping(true);
      const timer = setTimeout(() => sendTyping(false), 1000);
      return () => clearTimeout(timer);
    }
    sendTyping(false);
  }, [inputText, sendTyping]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/messages");
    }
  }, [router]);

  const handleSend = useCallback(async () => {
    const messageText = inputText.trim();
    if (!messageText || uploading) return;

    setInputText("");
    try {
      await sendText(messageText);
      scrollToBottom();
    } catch (sendError) {
      console.error("Error sending message:", sendError);
      Alert.alert("Message failed", "Could not send your message. Please try again.");
      setInputText(messageText);
    }
  }, [inputText, scrollToBottom, sendText, uploading]);

  const handleRetryMessage = useCallback(
    async (message: MessageType) => {
      if (message.type !== "text" || !message.text.trim()) return;
      try {
        await sendText(message.text);
        scrollToBottom();
      } catch (retryError) {
        console.error("Error retrying message:", retryError);
        Alert.alert("Retry failed", "Could not resend this message yet.");
      }
    },
    [scrollToBottom, sendText],
  );

  const handleImagePick = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Photo library access is required to send images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const imageUri = result.assets[0].uri;
      setSelectedImageUri(imageUri);

      try {
        const imageUrl = await uploadImage(imageUri, params.conversationId || "");
        if (!imageUrl) throw new Error("Failed to get image URL");

        await sendImageToDb(imageUrl);
        setSelectedImageUri(null);
        scrollToBottom();
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        Alert.alert("Upload failed", "Could not upload this image. Please try again.");
      }
    } catch (pickError) {
      console.error("Error picking image:", pickError);
      Alert.alert("Image unavailable", "Could not pick an image. Please try again.");
    }
  }, [params.conversationId, scrollToBottom, sendImageToDb, uploadImage]);

  const handleClearPreview = useCallback(() => {
    if (uploading) return;
    setSelectedImageUri(null);
    resetUpload();
  }, [resetUpload, uploading]);

  const handleMoreOptions = useCallback(() => {
    const unavailable = () =>
      Alert.alert(
        "Not available yet",
        "This chat option is not connected to backend support yet.",
      );

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["View Profile", "Mute Notifications", "Block User", "Report User", "Cancel"],
          destructiveButtonIndex: [2, 3],
          cancelButtonIndex: 4,
        },
        (buttonIndex) => {
          if (buttonIndex !== 4) unavailable();
        },
      );
      return;
    }

    Alert.alert("Chat options", "These actions are not connected yet.", [
      { text: "OK", style: "cancel" },
    ]);
  }, []);

  const handlePhoneCall = useCallback(() => {
    router.push({
      pathname: "/voice-call",
      params: {
        userId: recipientId,
        userName,
        userAvatar: params.userImage,
      },
    });
  }, [params.userImage, recipientId, router, userName]);

  const handleVideoCall = useCallback(() => {
    router.push({
      pathname: "/video-call",
      params: {
        userId: recipientId,
        userName,
        userAvatar: params.userImage,
      },
    });
  }, [params.userImage, recipientId, router, userName]);

  const handleEmojiPick = useCallback(() => {
    Alert.alert("Emoji picker unavailable", "Emoji picker support is not implemented yet.");
  }, []);

  if (loading && messages.length === 0) {
    return <ChatStateView title="Loading messages..." loading />;
  }

  if (error) {
    return (
      <ChatStateView
        title="Failed to load messages"
        message={error.message}
        actionLabel="Retry"
        onAction={refresh}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.brandBackground }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.brandBackground}
        translucent={false}
      />

      {insets.top > 0 && (
        <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
      )}

      <ChatHeader
        userName={userName}
        userImage={params.userImage}
        isOnline={isOnline}
        onBack={handleBack}
        onPhoneCall={handlePhoneCall}
        onVideoCall={handleVideoCall}
        onMoreOptions={handleMoreOptions}
      />

      <MessageList
        scrollViewRef={scrollViewRef}
        messages={messages}
        currentUserId={currentUserId}
        userName={userName}
        userImage={params.userImage}
        isTyping={isTyping}
        bottomPadding={Math.max(insets.bottom + 80, 100)}
        onRetryMessage={handleRetryMessage}
      />

      <MessageComposer
        inputRef={inputRef}
        inputText={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onPickImage={handleImagePick}
        onEmojiPress={handleEmojiPick}
        selectedImageUri={selectedImageUri}
        uploadProgress={uploadProgress}
        uploading={uploading}
        bottomPadding={Math.max(insets.bottom, 16)}
        onClearPreview={handleClearPreview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
