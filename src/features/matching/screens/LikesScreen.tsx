/**
 * LikesScreen
 *
 * Main screen for displaying user matches in a grid layout.
 * Integrates with Supabase to fetch real match data.
 *
 * Features:
 * - Grid layout of match cards (2 columns)
 * - Filter between all matches and mutual matches
 * - Loading state while fetching data
 * - Empty state when no matches
 * - Message and unmatch actions
 *
 * Architecture:
 * - Uses feature components for modularity
 * - Fetches data from matchingApi
 * - No mock data - 100% database-driven
 */

import { supabase } from "@/src/config/supabase";
import { getMatches } from "@/src/features/matching/api/matchingApi";
import { unmatchUser } from "@/src/features/safety/api/safetyApi";
import { useRouter } from "expo-router";
import { RefreshCw, ShieldCheck } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyMatchesState } from "../components/EmptyMatchesState";
import { LikesFilter } from "../components/LikesFilter";
import { LikesHeader } from "../components/LikesHeader";
import { Match, MatchCard } from "../components/MatchCard";

const BRAND_BG = "#0F0814";
const ACCENT_PINK = "#EF3E78";
const WHITE = "#FFFFFF";

function isMissingAuthSession(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AuthSessionMissingError"
  );
}

export default function LikesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "mutual">("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (userError && !isMissingAuthSession(userError)) {
          console.error("Failed to fetch user.");
        }
        const message = "Please sign in to view your matches.";
        setLoadError(message);
        AccessibilityInfo.announceForAccessibility(message);
        setMatches([]);
        return;
      }

      const { data: dbMatches, error: matchesError } = await getMatches(
        user.id,
      );

      if (matchesError) {
        console.error("Failed to fetch matches.");
        const message =
          "We could not refresh your matches. Check your connection and try again.";
        setLoadError(message);
        AccessibilityInfo.announceForAccessibility(message);
        setMatches([]);
      } else if (dbMatches && dbMatches.length > 0) {
        const displayMatches: Match[] = dbMatches.map((match) => ({
          id: match.profile.id,
          name: match.profile.first_name,
          age: match.profile.age,
          location: match.profile.city || "Location hidden",
          image: match.profile.photos?.[0]
            ? { uri: match.profile.photos[0] }
            : undefined,
          verified: match.profile.is_verified,
          mutual: match.is_mutual,
          gender:
            match.profile.gender === "other" ? "female" : match.profile.gender,
          matchedAt: match.matched_at,
        }));
        setMatches(displayMatches);
      } else {
        setMatches([]);
      }
    } catch {
      console.error("Failed to fetch data.");
      const message =
        "We could not refresh your matches. Check your connection and try again.";
      setLoadError(message);
      AccessibilityInfo.announceForAccessibility(message);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const filteredMatches =
    filter === "mutual" ? matches.filter((m) => m.mutual) : matches;

  const handleMessage = async (id: string | number) => {
    const match = matches.find((item) => item.id === id);

    if (!match) {
      Alert.alert("Could not open conversation", "This match could not be found.");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Sign in required", "Please sign in to message matches.");
        return;
      }

      router.push({
        pathname: "/chat",
        params: {
          userId: String(id),
          userName: match.name,
          userImage:
            typeof match.image === "object" && "uri" in match.image
              ? match.image.uri
              : undefined,
          isOnline: "false",
        },
      });
    } catch {
      Alert.alert(
        "Could not open chat",
        "We could not open this match yet. Check your connection and try again.",
      );
    }
  };

  const handleUnmatch = (id: string | number) => {
    const match = matches.find((item) => item.id === id);
    const matchName = match?.name || "this member";

    Alert.alert(
      `Unmatch ${matchName}?`,
      "This removes the match from your list and closes the chat for you. If something unsafe happened, report first so support can review it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: async () => {
            const result = await unmatchUser(String(id));

            if (!result.success) {
              Alert.alert(
                "Unmatch failed",
                result.error ||
                  "The match was not removed. Check your connection and try again.",
              );
              return;
            }

            setMatches((current) => current.filter((item) => item.id !== id));
          },
        },
      ],
    );
  };

  const handleReport = (id: string | number) => {
    const match = matches.find((item) => item.id === id);

    router.push({
      pathname: "/(modals)/report-user",
      params: {
        userId: String(id),
        userName: match?.name || "this member",
        source: "likes",
      },
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.root,
          styles.centerContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_BG}
          translucent={false}
        />
        {Platform.OS === "ios" && (
          <View style={{ height: insets.top, backgroundColor: BRAND_BG }} />
        )}
        <View style={styles.loadingPanel}>
          <ActivityIndicator
            size="large"
            color={ACCENT_PINK}
            accessibilityLabel="Loading matches"
          />
          <Text style={styles.loadingText}>Checking your matches...</Text>
          <Text style={styles.loadingSubtext}>
            We are loading confirmed matches and keeping chat access tied to
            the matched conversation flow.
          </Text>
        </View>
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

      <LikesHeader matchCount={filteredMatches.length} filter={filter} />
      <LikesFilter
        filter={filter}
        onFilterChange={setFilter}
        allCount={matches.length}
        mutualCount={matches.filter((match) => match.mutual).length}
      />

      <View
        style={styles.matchSafetyNote}
        accessible
        accessibilityLabel="Matched messaging safety note. Message opens the chat, and your first text starts the conversation after match checks pass. Keep private details private and use report or unmatch controls when needed."
      >
        <View style={styles.matchSafetyRule} />
        <View style={styles.matchSafetyBody}>
          <View style={styles.matchSafetyHeadingRow}>
            <View style={styles.matchSafetyIcon}>
              <ShieldCheck size={15} color={WHITE} strokeWidth={2.4} />
            </View>
            <Text style={styles.matchSafetyHeading}>Before you message</Text>
          </View>
          <Text style={styles.matchSafetyText}>
            Tap Message to open the chat. Your first text starts the
            conversation only after match checks pass. Keep private details
            private, and report before unmatching if support should review the
            interaction.
          </Text>
        </View>
      </View>

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
              onReport={() => handleReport(match.id)}
            />
          ))}
        </View>

        {filteredMatches.length === 0 && (
          <EmptyMatchesState
            variant={
              loadError ? "error" : filter === "mutual" ? "filtered" : "empty"
            }
            message={loadError ?? undefined}
            onAction={loadError ? fetchMatches : undefined}
          />
        )}

        {matches.length > 0 && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchMatches}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Refresh matches"
            accessibilityHint="Checks for new mutual matches"
          >
            <RefreshCw
              size={16}
              color="rgba(255,255,255,0.72)"
              strokeWidth={2.4}
            />
            <Text style={styles.refreshButtonText}>Refresh matches</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingPanel: {
    width: "100%",
    maxWidth: 318,
    paddingVertical: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "DMSans-Medium",
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    maxWidth: 286,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.58)",
    fontFamily: "DMSans-Regular",
    textAlign: "center",
  },
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
  refreshButton: {
    alignSelf: "center",
    minHeight: 44,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    color: "rgba(255,255,255,0.72)",
  },
  matchSafetyNote: {
    marginHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  matchSafetyRule: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(239, 62, 120, 0.72)",
  },
  matchSafetyBody: {
    flex: 1,
    paddingVertical: 2,
  },
  matchSafetyHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  matchSafetyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 62, 120, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  matchSafetyHeading: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: WHITE,
    letterSpacing: 0.2,
  },
  matchSafetyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.72)",
  },
});
