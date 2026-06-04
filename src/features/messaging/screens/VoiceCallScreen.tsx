import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, withAlpha } from "@/src/theme";

export default function VoiceCallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { userName, userAvatar } = useLocalSearchParams<{
    userName: string;
    userAvatar: string;
  }>();

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<
    "connecting" | "ringing" | "connected"
  >("connecting");

  // Timer for call duration
  useEffect(() => {
    if (callStatus === "connected") {
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callStatus]);

  // Simulate call connection (for demo purposes)
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus("ringing");
    }, 1000);

    const answerTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 3000);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(answerTimer);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Simulated connecting...";
      case "ringing":
        return "Simulated ringing...";
      case "connected":
        return `Simulated call ${formatDuration(callDuration)}`;
      default:
        return "";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.brandBackground }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandBackground} />
      <LinearGradient
        colors={[
          colors.brandBackground,
          withAlpha(colors.secondary, 0.18),
          colors.brandBackground,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                userAvatar
                  ? { uri: userAvatar }
                  : require("../../../../assets/girls/ai1.jpg")
              }
              style={[styles.avatar, { borderColor: colors.brandSurfaceElevated }]}
              accessibilityLabel={`${userName || "Unknown"} avatar`}
              accessibilityIgnoresInvertColors
            />
            <View style={styles.pulseRing}>
              <LinearGradient
                colors={[withAlpha(colors.secondary, 0.3), withAlpha(colors.primary, 0.3)]}
                style={styles.pulseGradient}
              />
            </View>
          </View>

          <Text style={[styles.userName, { color: colors.onPrimary }]}>{userName || "Unknown"}</Text>
          <Text
            style={[styles.callStatus, { color: withAlpha(colors.onPrimary, 0.72) }]}
            accessibilityLiveRegion="polite"
          >
            {getStatusText()}
          </Text>
          <Text style={[styles.simulatedNotice, { color: withAlpha(colors.onPrimary, 0.62) }]}>
            Demo call screen. Real voice signaling is not connected yet.
          </Text>
        </View>

        {/* Call Controls */}
        <View
          style={[
            styles.controlsContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          {/* Mute Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isMuted
                  ? colors.secondary
                  : colors.brandSurfaceElevated,
                borderColor: colors.brandBorder,
              },
            ]}
            onPress={toggleMute}
            activeOpacity={0.7}
            accessibilityRole="switch"
            accessibilityLabel="Mute microphone"
            accessibilityState={{ checked: isMuted }}
          >
            {isMuted ? (
              <MicOff size={28} color={colors.onSecondary} />
            ) : (
              <Mic size={28} color={colors.onPrimary} />
            )}
            <Text style={[styles.controlLabel, { color: withAlpha(colors.onPrimary, 0.72) }]}>
              {isMuted ? "Unmute" : "Mute"}
            </Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={[styles.endCallButton, { shadowColor: colors.danger }]}
            onPress={handleEndCall}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="End simulated voice call"
          >
            <LinearGradient
              colors={[colors.danger, colors.dangerInk]}
              style={styles.endCallGradient}
            >
              <PhoneOff size={32} color={colors.onStatus} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isSpeaker
                  ? colors.secondary
                  : colors.brandSurfaceElevated,
                borderColor: colors.brandBorder,
              },
            ]}
            onPress={toggleSpeaker}
            activeOpacity={0.7}
            accessibilityRole="switch"
            accessibilityLabel="Speaker mode"
            accessibilityState={{ checked: isSpeaker }}
          >
            {isSpeaker ? (
              <Volume2 size={28} color={colors.onSecondary} />
            ) : (
              <VolumeX size={28} color={colors.onPrimary} />
            )}
            <Text style={[styles.controlLabel, { color: withAlpha(colors.onPrimary, 0.72) }]}>
              {isSpeaker ? "Speaker" : "Earpiece"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  userInfoContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 32,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
  },
  pulseRing: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 90,
    opacity: 0.5,
  },
  pulseGradient: {
    flex: 1,
    borderRadius: 90,
  },
  userName: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  callStatus: {
    fontSize: 18,
    fontWeight: "500",
  },
  simulatedNotice: {
    marginTop: 12,
    paddingHorizontal: 32,
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
  },
  controlLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
  endCallGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
