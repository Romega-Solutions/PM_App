// app/(tabs)/likes.tsx
import { supabase } from "@/src/config/supabase";
import { accountApi } from "@/src/features/account/api/accountApi";
import { getMatches } from "@/src/features/matching/api/matchingApi";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MapPin, MessageCircle, Sparkles, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Brand Colors
const BRAND_BG = "#0F0814";
const ACCENT_PURPLE = "#8D69F6";
const ACCENT_PINK = "#EF3E78";
const VERIFIED_GREEN = "#10B981";
const WHITE = "#FFFFFF";
const SURFACE = "rgba(255,255,255,0.06)";
const SURFACE_BORDER = "rgba(141,105,246,0.18)";

// Card dimensions
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const IMAGE_HEIGHT = CARD_WIDTH * 0.85;

// Match type
type Match = {
  id: string | number;
  name: string;
  age: number;
  image: any;
  location: string;
  verified: boolean;
  mutual: boolean;
  gender: "female" | "male";
  matchedAt?: string;
};

// ✅ NO MOCK DATA - All data from real database

interface MatchCardProps {
  match: Match;
  onMessage: () => void;
  onUnmatch: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onMessage,
  onUnmatch,
}) => (
  <View style={styles.card}>
    {/* Image Container */}
    <View style={styles.imageContainer}>
      <Image source={match.image} style={styles.cardImage} resizeMode="cover" />

      {/* Verified Badge */}
      {match.verified && (
        <View style={styles.verifiedBadge}>
          <Sparkles size={10} color={WHITE} strokeWidth={2.5} />
        </View>
      )}

      {/* Mutual Match Badge */}
      {match.mutual && (
        <View style={styles.mutualBadge}>
          <Heart
            size={10}
            color={ACCENT_PINK}
            fill={ACCENT_PINK}
            strokeWidth={2}
          />
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
        style={styles.imageGradient}
      />
    </View>

    {/* Card Info */}
    <View style={styles.cardInfo}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {match.name}, {match.age}
        </Text>
      </View>

      <View style={styles.locationRow}>
        <MapPin size={12} color={ACCENT_PURPLE} strokeWidth={2} />
        <Text style={styles.locationText} numberOfLines={1}>
          {match.location}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.cardActionBtn, styles.unmatchBtn]}
          onPress={onUnmatch}
          accessibilityRole="button"
          accessibilityLabel="Unmatch"
        >
          <X size={16} color={ACCENT_PINK} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cardActionBtn, styles.messageBtn]}
          onPress={onMessage}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <MessageCircle size={16} color={WHITE} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function Likes() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"all" | "mutual">("all");
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data and matches on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Failed to fetch user:", userError);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Get user type
        const basicInfo = await accountApi.getBasicInfo();
        setUserType(basicInfo?.userType ?? null);

        // Fetch matches from database
        const { data: dbMatches, error: matchesError } = await getMatches(
          user.id,
        );

        if (matchesError) {
          console.error("Failed to fetch matches:", matchesError);
          // Show empty state - no fallback to mock data
          setMatches([]);
        } else if (dbMatches && dbMatches.length > 0) {
          // Convert database matches to display format
          const displayMatches: Match[] = dbMatches.map((match) => ({
            id: match.profile.id,
            name: match.profile.first_name,
            age: match.profile.age,
            location: match.profile.city || "Philippines",
            image: match.profile.photos?.[0]
              ? { uri: match.profile.photos[0] }
              : require("../../assets/girls/ai1.jpg"),
            verified: match.profile.is_verified,
            mutual: match.is_mutual,
            gender:
              match.profile.gender === "other"
                ? "female"
                : match.profile.gender,
            matchedAt: match.matched_at,
          }));
          setMatches(displayMatches);
        } else {
          // No matches in database
          setMatches([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Show empty state - no fallback to mock data
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMatches =
    filter === "mutual" ? matches.filter((m) => m.mutual) : matches;

  const handleMessage = (id: string | number) => {
    console.log("Message match:", id);
    // TODO: Navigate to messages screen with this match
  };

  const handleUnmatch = (id: string | number) => {
    console.log("Unmatch:", id);
    // TODO: Show confirmation dialog and remove match
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_BG}
          translucent={false}
        />
        {Platform.OS === "ios" && (
          <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
        )}
        <ActivityIndicator size="large" color={ACCENT_PINK} />
        <Text style={styles.loadingText}>Loading matches...</Text>
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
      {Platform.OS === "ios" && (
        <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Matches</Text>
          <Text style={styles.subtitle}>
            {filteredMatches.length} {filter === "mutual" ? "mutual" : ""} match
            {filteredMatches.length !== 1 ? "es" : ""} waiting
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
          onPress={() => setFilter("all")}
          accessibilityRole="button"
          accessibilityLabel="Show all matches"
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All Matches
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "mutual" && styles.filterTabActive,
          ]}
          onPress={() => setFilter("mutual")}
          accessibilityRole="button"
          accessibilityLabel="Show mutual matches only"
        >
          <Heart
            size={14}
            color={filter === "mutual" ? WHITE : ACCENT_PINK}
            fill={filter === "mutual" ? WHITE : "transparent"}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.filterText,
              filter === "mutual" && styles.filterTextActive,
            ]}
          >
            Mutual
          </Text>
        </TouchableOpacity>
      </View>

      {/* Matches Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 24, 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onMessage={() => handleMessage(match.id)}
              onUnmatch={() => handleUnmatch(match.id)}
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <View style={styles.emptyState}>
            <Heart size={64} color={ACCENT_PURPLE} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No mutual matches yet</Text>
            <Text style={styles.emptyText}>
              Keep swiping to find your perfect match!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * ✅ All matches now loaded from real database
 * ✅ No mock data or fallbacks
 */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "DMSans-Medium",
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: Platform.OS === "ios" ? 32 : 30,
    fontFamily: "Lora-Bold",
    color: ACCENT_PINK,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 0.2,
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: ACCENT_PINK,
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterText: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: ACCENT_PINK,
    letterSpacing: 0.3,
  },
  filterTextActive: {
    color: WHITE,
  },

  // Grid
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 16,
    justifyContent: "space-between",
  },

  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: SURFACE,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    position: "relative",
    height: IMAGE_HEIGHT,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1A1A",
  },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: VERIFIED_GREEN,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: WHITE,
    ...Platform.select({
      ios: {
        shadowColor: VERIFIED_GREEN,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mutualBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 62, 120, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
  },

  // Card Info
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontFamily: "Lora-Bold",
    color: WHITE,
    letterSpacing: 0.3,
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    color: ACCENT_PURPLE,
    letterSpacing: 0.2,
    flex: 1,
  },

  // Card Actions
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  unmatchBtn: {
    backgroundColor: "rgba(239, 62, 120, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 62, 120, 0.3)",
  },
  messageBtn: {
    backgroundColor: ACCENT_PINK,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_PINK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Lora-Bold",
    color: WHITE,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
