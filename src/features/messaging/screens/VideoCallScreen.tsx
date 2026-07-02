import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  CameraOff,
  Flag,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  UserRound,
  Video,
  VideoOff,
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

const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.08)";
const SURFACE_STRONG = "rgba(255,255,255,0.14)";
const TEXT_SECONDARY = "rgba(255,255,255,0.78)";
const TEXT_MUTED = "rgba(255,255,255,0.62)";
const DEMO_CONNECT_DELAY_MS = 1400;
const DEMO_TICK_MS = 1000;

function formatCallDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function VideoCallScreen() {
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
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

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
        ...(conversationId ? { conversationId } : {}),
        source: "chat",
        ...(isDemo === "true" ? { isDemo: "true" } : {}),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#24103A", BRAND_BG, "#130916"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            {isDemoCall ? "Demo video preview" : "Video call"}
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
          accessibilityLabel="Close video call screen"
          accessibilityHint="Returns to the chat"
          hitSlop={8}
        >
          <X size={24} color={WHITE} />
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
              <UserRound size={56} color={TEXT_SECONDARY} strokeWidth={1.8} />
              <Text style={styles.avatarFallbackText}>No photo</Text>
            </View>
          )}
          <View style={styles.unavailableBadge}>
            {isDemoCall && isCameraOn ? (
              <Video size={26} color={WHITE} />
            ) : (
              <VideoOff size={26} color={WHITE} />
            )}
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusPill}>
            <ShieldCheck size={16} color={WHITE} />
            <Text style={styles.statusPillText}>
              {callStatusText} - {callTimeText}
            </Text>
          </View>

          <Text style={styles.title}>
            {isDemoCall ? "Video preview" : "Keep this chat in messages"}
          </Text>
          <Text style={styles.description}>
            {isDemoCall
              ? `Local video preview with ${displayName}.`
              : "This screen does not start video calls. No call was started and no camera or microphone permission was requested."}
          </Text>

          {isDemoCall ? (
            <View style={styles.controlRow}>
              <Pressable
                onPress={() => setIsCameraOn((current) => !current)}
                style={({ pressed }) => [
                  styles.controlButton,
                  isCameraOn && styles.controlButtonActive,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  isCameraOn ? "Turn demo camera off" : "Turn demo camera on"
                }
                accessibilityState={{ checked: isCameraOn }}
              >
                {isCameraOn ? (
                  <Camera size={20} color={WHITE} />
                ) : (
                  <CameraOff size={20} color={WHITE} />
                )}
                <Text style={styles.controlButtonText}>
                  {isCameraOn ? "Camera" : "Camera off"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsMicOn((current) => !current)}
                style={({ pressed }) => [
                  styles.controlButton,
                  isMicOn && styles.controlButtonActive,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={isMicOn ? "Mute demo call" : "Unmute demo call"}
                accessibilityState={{ checked: isMicOn }}
              >
                {isMicOn ? (
                  <Mic size={20} color={WHITE} />
                ) : (
                  <MicOff size={20} color={WHITE} />
                )}
                <Text style={styles.controlButtonText}>
                  {isMicOn ? "Mic on" : "Muted"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.noteRow}>
            <VideoOff size={20} color={TEXT_SECONDARY} />
            <Text style={styles.noteText}>
              {isDemoCall
                ? `You can preview the video entry point for ${displayName}. Ending returns to the seeded chat, and report or block remains demo-safe.`
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
          accessibilityHint="Closes this video call screen"
        >
          <LinearGradient
            colors={[ACCENT_PINK, ACCENT_PURPLE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          >
            <PhoneOff size={22} color={WHITE} />
            <Text style={styles.primaryButtonText}>Back to chat</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
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
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  headerTitle: {
    color: WHITE,
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
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_STRONG,
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
    backgroundColor: SURFACE_STRONG,
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
    color: TEXT_MUTED,
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
    borderColor: BRAND_BG,
  },
  statusCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_STRONG,
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
    color: WHITE,
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    color: WHITE,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    marginBottom: 12,
  },
  description: {
    color: TEXT_SECONDARY,
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
    borderColor: SURFACE_STRONG,
    backgroundColor: SURFACE,
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
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: SURFACE_STRONG,
    marginVertical: 20,
  },
  noteRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  noteText: {
    flex: 1,
    color: TEXT_MUTED,
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
    color: WHITE,
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
    color: WHITE,
    fontSize: 17,
    fontWeight: "800",
  },
});
