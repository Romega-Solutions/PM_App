import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Flag,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  UserRound,
  Volume,
  VolumeX,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles, useAppTheme } from "@/src/theme";

const DEMO_CONNECT_DELAY_MS = 1400;
const DEMO_TICK_MS = 1000;

function formatCallDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function VoiceCallScreen() {
  const theme = useAppTheme();
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, userAvatar, userId, isDemo, conversationId, isOnline } =
    useLocalSearchParams<{
    userName: string;
    userAvatar: string;
    userId: string;
    isDemo?: string;
    conversationId?: string;
    isOnline?: string;
  }>();

  const displayName = userName || "this match";
  const canOpenSafetyReport = Boolean(userId);
  const isDemoCall = isDemo === "true";
  const [isConnected, setIsConnected] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    if (!isDemoCall) return;

    let durationTimer: ReturnType<typeof setInterval> | undefined;

    setIsConnected(false);
    setElapsedSeconds(0);

    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setElapsedSeconds(1);
      durationTimer = setInterval(() => {
        setElapsedSeconds((current) => current + 1);
      }, DEMO_TICK_MS);
    }, DEMO_CONNECT_DELAY_MS);

    return () => {
      clearTimeout(connectTimer);
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [isDemoCall]);

  const callStatusText = isDemoCall
    ? isConnected
      ? "Connected"
      : "Ringing"
    : "Safety first";
  const callTimeText = isDemoCall
    ? isConnected
      ? formatCallDuration(elapsedSeconds)
      : "Connecting..."
    : "No call started";

  const handleClose = () => {
    if (isDemoCall && userId) {
      router.replace({
        pathname: "/chat",
        params: {
          userId,
          userName: displayName,
          userImage: userAvatar,
          isOnline: isOnline ?? "true",
          ...(conversationId ? { conversationId } : {}),
          isDemo: "true",
        },
      });
      return;
    }

    router.back();
  };

  const handleReport = () => {
    if (!userId) return;

    router.push({
      pathname: "/(modals)/report-user",
      params: {
        userId,
        userName: displayName,
        source: "chat",
        ...(isDemo === "true" ? { isDemo: "true" } : {}),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.colors.dalisay[900], theme.semanticColors.background, theme.colors.dalisay[900]]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            {isDemoCall ? "Demo voice preview" : "Voice call"}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close voice call screen"
          accessibilityHint="Returns to the chat"
          hitSlop={8}
        >
          <X size={24} color={theme.colors.neutral.white} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 96, paddingBottom: insets.bottom + 32 },
        ]}
        bounces={false}
      >
        <View style={styles.avatarShell}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <UserRound size={56} color="rgba(255,255,255,0.78)" strokeWidth={1.8} />
              <Text style={styles.avatarFallbackText}>No photo</Text>
            </View>
          )}
          <View style={styles.unavailableBadge}>
            {isDemoCall && !isMuted ? (
              <Mic size={26} color={theme.colors.neutral.white} />
            ) : (
              <MicOff size={26} color={theme.colors.neutral.white} />
            )}
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusPill}>
            <ShieldCheck size={16} color={theme.colors.neutral.white} />
            <Text style={styles.statusPillText}>
              {callStatusText} - {callTimeText}
            </Text>
          </View>

          <Text style={styles.title}>
            {isDemoCall ? "Voice preview" : "Keep this chat in messages"}
          </Text>
          <Text style={styles.description}>
            {isDemoCall
              ? `Local voice preview with ${displayName}.`
              : "This screen does not start voice calls. No call was started and no microphone permission was requested."}
          </Text>

          {isDemoCall ? (
            <View style={styles.controlRow}>
              <Pressable
                onPress={() => setIsMuted((current) => !current)}
                style={({ pressed }) => [
                  styles.controlButton,
                  isMuted && styles.controlButtonActive,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={isMuted ? "Unmute demo call" : "Mute demo call"}
                accessibilityState={{ checked: isMuted }}
              >
                {isMuted ? (
                  <MicOff size={20} color={theme.colors.neutral.white} />
                ) : (
                  <Mic size={20} color={theme.colors.neutral.white} />
                )}
                <Text style={styles.controlButtonText}>
                  {isMuted ? "Muted" : "Mic on"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsSpeakerOn((current) => !current)}
                style={({ pressed }) => [
                  styles.controlButton,
                  isSpeakerOn && styles.controlButtonActive,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  isSpeakerOn ? "Turn speaker off" : "Turn speaker on"
                }
                accessibilityState={{ checked: isSpeakerOn }}
              >
                {isSpeakerOn ? (
                  <Volume size={20} color={theme.colors.neutral.white} />
                ) : (
                  <VolumeX size={20} color={theme.colors.neutral.white} />
                )}
                <Text style={styles.controlButtonText}>
                  {isSpeakerOn ? "Speaker" : "Earpiece"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.noteRow}>
            <MicOff size={20} color="rgba(255,255,255,0.78)" />
            <Text style={styles.noteText}>
              {isDemoCall
                ? `You can preview the call entry point for ${displayName}. Ending returns to the seeded chat, and report or block remains demo-safe.`
                : `You are still in chat with ${displayName}. Keep the conversation in messages, and use report, block, or unmatch if anything feels unsafe.`}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleReport}
          disabled={!canOpenSafetyReport}
          style={({ pressed }) => [
            styles.safetyButton,
            !canOpenSafetyReport && styles.safetyButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            canOpenSafetyReport
              ? `Report or block ${displayName}`
              : "Report and block needs a member profile"
          }
          accessibilityHint={
            canOpenSafetyReport
              ? "Opens the private safety report form for this member"
              : "Return to chat and open safety options once this member is identified"
          }
          accessibilityState={{ disabled: !canOpenSafetyReport }}
        >
          <Flag size={20} color="#FFB4B4" strokeWidth={2.4} />
          <Text style={styles.safetyButtonText}>
            {canOpenSafetyReport
              ? "Report or block"
              : "Return to chat for safety options"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back to chat"
          accessibilityHint="Closes this voice call screen"
        >
          <LinearGradient
            colors={[theme.semanticColors.primary, theme.semanticColors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          >
            <PhoneOff size={22} color={theme.colors.neutral.white} />
            <Text style={styles.primaryButtonText}>Back to chat</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.semanticColors.background,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  headerTitle: {
    color: theme.colors.neutral.white,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  buttonPressed: {
    opacity: 0.72,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  avatarShell: {
    alignSelf: "center",
    width: 176,
    height: 176,
    borderRadius: 88,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginBottom: 28,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 84,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 84,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarFallbackText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  unavailableBadge: {
    position: "absolute",
    right: 4,
    bottom: 8,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 62, 120, 0.94)",
    borderWidth: 3,
    borderColor: theme.semanticColors.background,
  },
  statusCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  statusPill: {
    alignSelf: "flex-start",
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(141, 105, 246, 0.22)",
    marginBottom: 18,
  },
  statusPillText: {
    color: theme.colors.neutral.white,
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    color: theme.colors.neutral.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    marginBottom: 12,
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 16,
    lineHeight: 24,
  },
  controlRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  controlButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  controlButtonActive: {
    backgroundColor: "rgba(141, 105, 246, 0.24)",
    borderColor: "rgba(141, 105, 246, 0.44)",
  },
  controlButtonText: {
    color: theme.colors.neutral.white,
    fontSize: 14,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 20,
  },
  noteRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  noteText: {
    flex: 1,
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 21,
  },
  safetyButton: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255, 180, 180, 0.32)",
    backgroundColor: "rgba(255, 180, 180, 0.12)",
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  safetyButtonDisabled: {
    opacity: 0.58,
  },
  safetyButtonText: {
    color: theme.colors.neutral.white,
    fontSize: 16,
    fontWeight: "800",
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 24,
  },
  primaryButtonPressed: {
    opacity: 0.82,
  },
  primaryButtonGradient: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: theme.colors.neutral.white,
    fontSize: 17,
    fontWeight: "800",
  },
}));
