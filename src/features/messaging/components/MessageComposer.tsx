import { LinearGradient } from "expo-linear-gradient";
import { Image as ImageIcon, Send, Smile, X } from "lucide-react-native";
import type { RefObject } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { theme, useTheme, withAlpha } from "@/src/theme";

interface MessageComposerProps {
  inputRef: RefObject<TextInput | null>;
  inputText: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onPickImage: () => void;
  onEmojiPress: () => void;
  selectedImageUri?: string | null;
  uploadProgress: number;
  uploading: boolean;
  bottomPadding: number;
  onClearPreview: () => void;
}

export function MessageComposer({
  inputRef,
  inputText,
  onChangeText,
  onSend,
  onPickImage,
  onEmojiPress,
  selectedImageUri,
  uploadProgress,
  uploading,
  bottomPadding,
  onClearPreview,
}: MessageComposerProps) {
  const { colors } = useTheme();
  const canSend = inputText.trim().length > 0 && !uploading;
  const progressLabel = `Uploading image, ${Math.round(uploadProgress)} percent complete`;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: bottomPadding,
            borderTopColor: withAlpha(colors.secondary, 0.18),
          },
        ]}
      >
        <LinearGradient
          colors={[withAlpha(colors.secondary, 0.05), withAlpha(colors.primary, 0.05)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        {selectedImageUri ? (
          <View
            style={[
              styles.uploadPreview,
              {
                backgroundColor: colors.brandSurface,
                borderColor: colors.brandBorder,
              },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={uploading ? progressLabel : "Selected image ready to upload"}
          >
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.previewImage}
              accessibilityLabel="Selected image preview"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.previewMeta}>
              <Text style={[styles.previewTitle, { color: colors.onPrimary }]}>
                Image attachment
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: withAlpha(colors.onPrimary, 0.14) }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(uploadProgress, uploading ? 8 : 0)}%`,
                      backgroundColor: colors.secondary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.previewStatus, { color: withAlpha(colors.onPrimary, 0.65) }]}>
                {uploading ? `${Math.round(uploadProgress)}% uploaded` : "Uploading starts after selection"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.previewClear}
              onPress={onClearPreview}
              disabled={uploading}
              accessibilityRole="button"
              accessibilityLabel="Remove selected image"
              accessibilityState={{ disabled: uploading }}
              hitSlop={theme.hitSlop.sm}
            >
              <X
                size={theme.iconSizes.inline}
                color={withAlpha(colors.onPrimary, uploading ? 0.35 : 0.72)}
                strokeWidth={theme.strokeWidths.emphasis}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[
              styles.roundButton,
              {
                backgroundColor: withAlpha(colors.secondary, uploading ? 0.08 : 0.14),
                borderColor: withAlpha(colors.secondary, 0.25),
              },
            ]}
            accessibilityLabel={uploading ? progressLabel : "Attach image"}
            accessibilityRole="button"
            accessibilityState={{ disabled: uploading, busy: uploading }}
            onPress={onPickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <ImageIcon
                size={theme.iconSizes.inline}
                color={colors.secondary}
                strokeWidth={theme.strokeWidths.default}
              />
            )}
          </TouchableOpacity>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.brandSurface,
                borderColor: withAlpha(colors.secondary, 0.2),
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={onChangeText}
              placeholder="Type a message..."
              placeholderTextColor={withAlpha(colors.onPrimary, 0.5)}
              style={[styles.textInput, { color: colors.onPrimary }]}
              multiline
              maxLength={1000}
              accessibilityLabel="Message input"
              returnKeyType="send"
            />

            <TouchableOpacity
              style={styles.emojiButton}
              accessibilityLabel="Emoji picker unavailable"
              accessibilityRole="button"
              onPress={onEmojiPress}
              hitSlop={theme.hitSlop.sm}
            >
              <Smile
                size={theme.iconSizes.inline}
                color={withAlpha(colors.onPrimary, 0.55)}
                strokeWidth={theme.strokeWidths.default}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend
                  ? colors.secondary
                  : withAlpha(colors.secondary, 0.3),
                borderColor: canSend
                  ? colors.secondary
                  : withAlpha(colors.secondary, 0.4),
              },
            ]}
            onPress={onSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
          >
            <Send
              size={theme.iconSizes.inline}
              color={colors.onSecondary}
              strokeWidth={theme.strokeWidths.emphasis}
              fill={canSend ? colors.onSecondary : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: theme.spacing.field,
    paddingTop: theme.spacing.related,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  uploadPreview: {
    minHeight: 82,
    marginBottom: theme.spacing.related,
    borderWidth: 1,
    borderRadius: 14,
    padding: theme.spacing.touchGap,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.touchGap,
  },
  previewImage: {
    width: 58,
    height: 58,
    borderRadius: 10,
  },
  previewMeta: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  previewStatus: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },
  previewClear: {
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.touchGap,
  },
  roundButton: {
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: theme.componentSizes.input,
    maxHeight: 108,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    maxHeight: 84,
    paddingTop: Platform.OS === "ios" ? 2 : 0,
  },
  emojiButton: {
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    marginLeft: theme.spacing.touchGap,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});
