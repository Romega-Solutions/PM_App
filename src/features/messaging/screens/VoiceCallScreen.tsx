import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
const DANGER_RED = "#EF4444";

export default function VoiceCallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        return "Connecting...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return formatDuration(callDuration);
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0814", "#1a0f2e", "#0F0814"]}
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
              style={styles.avatar}
            />
            <View style={styles.pulseRing}>
              <LinearGradient
                colors={["rgba(141, 105, 246, 0.3)", "rgba(239, 62, 120, 0.3)"]}
                style={styles.pulseGradient}
              />
            </View>
          </View>

          <Text style={styles.userName}>{userName || "Unknown"}</Text>
          <Text style={styles.callStatus}>{getStatusText()}</Text>
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
              isMuted && styles.controlButtonActive,
            ]}
            onPress={toggleMute}
            activeOpacity={0.7}
          >
            {isMuted ? (
              <MicOff size={28} color={WHITE} />
            ) : (
              <Mic size={28} color={WHITE} />
            )}
            <Text style={styles.controlLabel}>
              {isMuted ? "Unmute" : "Mute"}
            </Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[DANGER_RED, "#DC2626"]}
              style={styles.endCallGradient}
            >
              <PhoneOff size={32} color={WHITE} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeaker && styles.controlButtonActive,
            ]}
            onPress={toggleSpeaker}
            activeOpacity={0.7}
          >
            {isSpeaker ? (
              <Volume2 size={28} color={WHITE} />
            ) : (
              <VolumeX size={28} color={WHITE} />
            )}
            <Text style={styles.controlLabel}>
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
    backgroundColor: BRAND_BG,
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
    borderColor: SURFACE,
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
    color: WHITE,
    marginBottom: 8,
    textAlign: "center",
  },
  callStatus: {
    fontSize: 18,
    color: TEXT_SECONDARY,
    fontWeight: "500",
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
    backgroundColor: SURFACE,
  },
  controlButtonActive: {
    backgroundColor: ACCENT_PURPLE,
  },
  controlLabel: {
    marginTop: 8,
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 8,
    shadowColor: DANGER_RED,
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
