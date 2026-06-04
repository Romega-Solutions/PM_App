import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  Maximize,
  Mic,
  MicOff,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, withAlpha } from "@/src/theme";

export default function VideoCallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { userName, userAvatar } = useLocalSearchParams<{
    userName: string;
    userAvatar: string;
  }>();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<
    "connecting" | "ringing" | "connected"
  >("connecting");

  useEffect(() => {
    if (callStatus !== "connected") return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  useEffect(() => {
    const ringTimer = setTimeout(() => setCallStatus("ringing"), 1000);
    const connectTimer = setTimeout(() => setCallStatus("connected"), 3000);
    return () => {
      clearTimeout(ringTimer);
      clearTimeout(connectTimer);
    };
  }, []);

  const statusText = getStatusText(callStatus, callDuration);
  const avatarSource = userAvatar
    ? { uri: userAvatar }
    : require("../../../../assets/girls/ai1.jpg");

  return (
    <View style={[styles.container, { backgroundColor: colors.brandBackground }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandBackground} />

      <View style={styles.remoteVideoContainer}>
        <LinearGradient
          colors={[withAlpha(colors.secondary, 0.18), colors.brandBackground]}
          style={StyleSheet.absoluteFillObject}
        />
        {callStatus === "connected" && isVideoOn ? (
          <View style={styles.videoPlaceholder}>
            <Image
              source={avatarSource}
              style={styles.remoteAvatar}
              blurRadius={20}
              accessibilityIgnoresInvertColors
            />
            <Text
              style={[
                styles.videoPlaceholderText,
                {
                  color: withAlpha(colors.onPrimary, 0.78),
                  backgroundColor: colors.brandOverlay,
                },
              ]}
            >
              Demo video surface. Real video signaling is not connected yet.
            </Text>
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <Image
              source={avatarSource}
              style={[styles.avatar, { borderColor: colors.brandSurfaceElevated }]}
              accessibilityLabel={`${userName || "Unknown"} avatar`}
              accessibilityIgnoresInvertColors
            />
          </View>
        )}
      </View>

      <LinearGradient
        colors={[colors.brandOverlay, "transparent"]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={[styles.userName, { color: colors.onPrimary }]}>
          {userName || "Unknown"}
        </Text>
        <Text
          style={[styles.callStatus, { color: withAlpha(colors.onPrimary, 0.72) }]}
          accessibilityLiveRegion="polite"
        >
          {statusText}
        </Text>
      </LinearGradient>

      <View style={[styles.localVideoContainer, { top: insets.top + 80 }]}>
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={styles.localVideoGradient}
        >
          <View style={[styles.localVideoContent, { backgroundColor: colors.brandBackground }]}>
            {isVideoOn ? (
              <View
                style={[
                  styles.localVideoPlaceholder,
                  { backgroundColor: withAlpha(colors.secondary, 0.2) },
                ]}
              >
                <Text style={[styles.localVideoText, { color: colors.onPrimary }]}>You</Text>
              </View>
            ) : (
              <View style={[styles.videoOffContainer, { backgroundColor: colors.brandOverlay }]}>
                <VideoOff size={24} color={colors.onPrimary} />
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      <LinearGradient
        colors={["transparent", colors.brandScrim]}
        style={[styles.controlsContainer, { paddingBottom: insets.bottom + 32 }]}
      >
        <Text style={[styles.simulatedNotice, { color: withAlpha(colors.onPrimary, 0.62) }]}>
          Demo call controls only. Audio/video devices are not connected.
        </Text>
        <View style={styles.controlsRow}>
          <ControlButton
            label="Mute microphone"
            checked={isMuted}
            activeColor={colors.danger}
            onPress={() => setIsMuted((value) => !value)}
          >
            {isMuted ? (
              <MicOff size={26} color={colors.onStatus} />
            ) : (
              <Mic size={26} color={colors.onPrimary} />
            )}
          </ControlButton>

          <ControlButton
            label="Camera"
            checked={isVideoOn}
            activeWhenFalse
            activeColor={colors.danger}
            onPress={() => setIsVideoOn((value) => !value)}
          >
            {isVideoOn ? (
              <VideoIcon size={26} color={colors.onPrimary} />
            ) : (
              <VideoOff size={26} color={colors.onStatus} />
            )}
          </ControlButton>

          <TouchableOpacity
            style={[styles.endCallButton, { shadowColor: colors.danger }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="End simulated video call"
          >
            <LinearGradient
              colors={[colors.danger, colors.dangerInk]}
              style={styles.endCallGradient}
            >
              <PhoneOff size={30} color={colors.onStatus} />
            </LinearGradient>
          </TouchableOpacity>

          <ControlButton
            label={`Switch to ${isFrontCamera ? "rear" : "front"} camera in demo state`}
            onPress={() => setIsFrontCamera((value) => !value)}
          >
            <Camera size={26} color={colors.onPrimary} />
          </ControlButton>

          <ControlButton
            label="Fullscreen unavailable in demo state"
            onPress={() =>
              Alert.alert(
                "Fullscreen unavailable",
                "Fullscreen video is not connected until real video signaling exists.",
              )
            }
          >
            <Maximize size={26} color={colors.onPrimary} />
          </ControlButton>
        </View>
      </LinearGradient>
    </View>
  );
}

function ControlButton({
  label,
  checked,
  activeWhenFalse = false,
  activeColor,
  onPress,
  children,
}: {
  label: string;
  checked?: boolean;
  activeWhenFalse?: boolean;
  activeColor?: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const isActive =
    checked === undefined ? false : activeWhenFalse ? !checked : checked;

  return (
    <TouchableOpacity
      style={[
        styles.controlButton,
        {
          backgroundColor: isActive
            ? activeColor || colors.secondary
            : colors.brandSurfaceElevated,
          shadowColor: colors.brandScrim,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole={checked === undefined ? "button" : "switch"}
      accessibilityLabel={label}
      accessibilityState={
        checked === undefined ? undefined : { checked }
      }
    >
      {children}
    </TouchableOpacity>
  );
}

function getStatusText(
  status: "connecting" | "ringing" | "connected",
  duration: number,
) {
  switch (status) {
    case "connecting":
      return "Simulated connecting...";
    case "ringing":
      return "Simulated ringing...";
    case "connected":
      return `Simulated call ${formatDuration(duration)}`;
    default:
      return "";
  }
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  remoteAvatar: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  videoPlaceholderText: {
    marginHorizontal: 24,
    fontSize: 15,
    fontWeight: "500",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    textAlign: "center",
    overflow: "hidden",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  callStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  localVideoContainer: {
    position: "absolute",
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  localVideoGradient: {
    flex: 1,
    padding: 2,
  },
  localVideoContent: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  localVideoText: {
    fontSize: 14,
    fontWeight: "600",
  },
  videoOffContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  simulatedNotice: {
    marginBottom: 16,
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  endCallGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
