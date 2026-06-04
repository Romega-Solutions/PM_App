import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react-native";
import type { ReactNode } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { theme, useTheme, withAlpha } from "@/src/theme";

interface ChatHeaderProps {
  userName: string;
  userImage?: string;
  isOnline: boolean;
  onBack: () => void;
  onPhoneCall: () => void;
  onVideoCall: () => void;
  onMoreOptions: () => void;
}

export function ChatHeader({
  userName,
  userImage,
  isOnline,
  onBack,
  onPhoneCall,
  onVideoCall,
  onMoreOptions,
}: ChatHeaderProps) {
  const { colors } = useTheme();
  const showImage = Boolean(userImage?.startsWith("http"));
  const statusText = isOnline ? "Active now" : "Offline";

  return (
    <View style={[styles.header, { borderBottomColor: withAlpha(colors.secondary, 0.18) }]}>
      <LinearGradient
        colors={[withAlpha(colors.secondary, 0.1), withAlpha(colors.primary, 0.08)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back to messages"
          accessibilityRole="button"
          hitSlop={theme.hitSlop.sm}
        >
          <ArrowLeft
            size={theme.iconSizes.navigation}
            color={colors.onPrimary}
            strokeWidth={theme.strokeWidths.emphasis}
          />
        </TouchableOpacity>

        <View
          style={styles.headerUserInfo}
          accessibilityRole="text"
          accessibilityLabel={`${userName}, ${statusText}`}
        >
          <View style={styles.headerAvatarContainer}>
            {showImage ? (
              <Image
                source={{ uri: userImage }}
                style={[styles.headerAvatar, { borderColor: colors.secondary }]}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View
                style={[
                  styles.headerAvatarPlaceholder,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.secondary,
                  },
                ]}
              >
                <Text style={[styles.headerAvatarPlaceholderText, { color: colors.onSecondary }]}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isOnline && (
              <View
                style={[
                  styles.headerOnlineDot,
                  {
                    backgroundColor: colors.success,
                    borderColor: colors.brandBackground,
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.headerUserText}>
            <Text style={[styles.headerUserName, { color: colors.onPrimary }]} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={[styles.headerUserStatus, { color: withAlpha(colors.onPrimary, 0.72) }]}>
              {statusText}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <HeaderAction label="Start voice call" onPress={onPhoneCall}>
            <Phone
              size={theme.iconSizes.inline}
              color={colors.secondary}
              strokeWidth={theme.strokeWidths.emphasis}
            />
          </HeaderAction>
          <HeaderAction label="Start video call" onPress={onVideoCall}>
            <Video
              size={theme.iconSizes.inline}
              color={colors.secondary}
              strokeWidth={theme.strokeWidths.emphasis}
            />
          </HeaderAction>
          <HeaderAction label="More chat options" onPress={onMoreOptions}>
            <MoreVertical
              size={theme.iconSizes.inline}
              color={colors.secondary}
              strokeWidth={theme.strokeWidths.emphasis}
            />
          </HeaderAction>
        </View>
      </View>
    </View>
  );
}

function HeaderAction({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.headerActionBtn,
        {
          backgroundColor: withAlpha(colors.secondary, 0.14),
          borderColor: withAlpha(colors.secondary, 0.25),
        },
      ]}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={theme.hitSlop.sm}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
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
    paddingHorizontal: theme.spacing.field,
    paddingVertical: theme.spacing.related,
    gap: theme.spacing.related,
  },
  backButton: {
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.related,
  },
  headerAvatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
  },
  headerAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  headerAvatarPlaceholderText: {
    fontSize: 18,
    fontFamily: "Lora-Bold",
  },
  headerOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  headerUserText: {
    flex: 1,
  },
  headerUserName: {
    fontSize: 16,
    fontFamily: "Lora-Bold",
    marginBottom: 2,
  },
  headerUserStatus: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing.touchGap,
  },
  headerActionBtn: {
    width: theme.componentSizes.iconButton,
    height: theme.componentSizes.iconButton,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});
