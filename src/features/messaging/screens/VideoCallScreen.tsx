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
  Dimensions,
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
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const TEXT_SECONDARY = "rgba(255,255,255,0.75)";
const DANGER_RED = "#EF4444";

const { width, height } = Dimensions.get("window");

export default function VideoCallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, userAvatar, userId } = useLocalSearchParams<{
    userName: string;
    userAvatar: string;
    userId: string;
  }>();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
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

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
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

      {/* Remote Video (Full Screen) */}
      <View style={styles.remoteVideoContainer}>
        <LinearGradient
          colors={["#1a0f2e", "#0F0814"]}
          style={StyleSheet.absoluteFillObject}
        />
        {callStatus === "connected" && isVideoOn ? (
          <View style={styles.videoPlaceholder}>
            <Image
              source={
                userAvatar
                  ? { uri: userAvatar }
                  : require("../../../../assets/girls/ai1.jpg")
              }
              style={styles.remoteAvatar}
              blurRadius={20}
            />
            <Text style={styles.videoPlaceholderText}>
              Video feed will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <Image
              source={
                userAvatar
                  ? { uri: userAvatar }
                  : require("../../../../assets/girls/ai1.jpg")
              }
              style={styles.avatar}
            />
          </View>
        )}
      </View>

      {/* Header with user info */}
      <LinearGradient
        colors={["rgba(15, 8, 20, 0.9)", "transparent"]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.userName}>{userName || "Unknown"}</Text>
        <Text style={styles.callStatus}>{getStatusText()}</Text>
      </LinearGradient>

      {/* Local Video (Picture in Picture) */}
      <View style={[styles.localVideoContainer, { top: insets.top + 80 }]}>
        <LinearGradient
          colors={[ACCENT_PURPLE, ACCENT_PINK]}
          style={styles.localVideoGradient}
        >
          <View style={styles.localVideoContent}>
            {isVideoOn ? (
              <View style={styles.localVideoPlaceholder}>
                <Text style={styles.localVideoText}>You</Text>
              </View>
            ) : (
              <View style={styles.videoOffContainer}>
                <VideoOff size={24} color={WHITE} />
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Controls */}
      <LinearGradient
        colors={["transparent", "rgba(15, 8, 20, 0.95)"]}
        style={[
          styles.controlsContainer,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.controlsRow}>
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
              <MicOff size={26} color={WHITE} />
            ) : (
              <Mic size={26} color={WHITE} />
            )}
          </TouchableOpacity>

          {/* Video Toggle Button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isVideoOn && styles.controlButtonActive,
            ]}
            onPress={toggleVideo}
            activeOpacity={0.7}
          >
            {isVideoOn ? (
              <VideoIcon size={26} color={WHITE} />
            ) : (
              <VideoOff size={26} color={WHITE} />
            )}
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
              <PhoneOff size={30} color={WHITE} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Camera Flip Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCamera}
            activeOpacity={0.7}
          >
            <Camera size={26} color={WHITE} />
          </TouchableOpacity>

          {/* Fullscreen Button */}
          <TouchableOpacity style={styles.controlButton} activeOpacity={0.7}>
            <Maximize size={26} color={WHITE} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
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
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontWeight: "500",
    backgroundColor: "rgba(15, 8, 20, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
    borderColor: SURFACE,
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
    color: WHITE,
    marginBottom: 4,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  callStatus: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  localVideoContainer: {
    position: "absolute",
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
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
    backgroundColor: BRAND_BG,
    borderRadius: 14,
    overflow: "hidden",
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(141, 105, 246, 0.2)",
  },
  localVideoText: {
    fontSize: 14,
    color: WHITE,
    fontWeight: "600",
  },
  videoOffContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 40,
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
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlButtonActive: {
    backgroundColor: DANGER_RED,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
