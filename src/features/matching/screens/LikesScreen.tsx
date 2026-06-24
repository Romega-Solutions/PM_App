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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyMatchesState } from "../components/EmptyMatchesState";
import { LikesFilter } from "../components/LikesFilter";
import { LikesHeader } from "../components/LikesHeader";
import { Match, MatchCard } from "../components/MatchCard";
import {
  getSeedProfilesInOrder,
  isSeedProfileId,
} from "../data/seedProfiles";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { makeStyles } from "@/src/theme/makeStyles";

function isMissingAuthSession(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AuthSessionMissingError"
  );
}

function getSeedMatches(): Match[] {
  return getSeedProfilesInOrder().slice(0, 10).map((profile, index) => ({
    id: profile.id,
    name: profile.name,
    age: profile.age,
    location: profile.location,
    image: profile.image || undefined,
    verified: false,
    mutual: index % 3 !== 1,
    gender: "female",
    matchedAt: new Date(Date.now() - (index + 1) * 36 * 60 * 60 * 1000).toISOString(),
    demo: true,
  }));
}

export default function LikesScreen() {
  const theme = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "mutual">("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usingSeedMatches, setUsingSeedMatches] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setUsingSeedMatches(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (userError && !isMissingAuthSession(userError)) {
          console.error("Failed to fetch user.");
        }
        setMatches(getSeedMatches());
        setUsingSeedMatches(true);
        AccessibilityInfo.announceForAccessibility(
          "Showing demo matches for beta preview.",
        );
        return;
      }

      const { data: dbMatches, error: matchesError } = await getMatches(
        user.id,
      );

      if (matchesError) {
        console.error("Failed to fetch matches.");
        setMatches(getSeedMatches());
        setUsingSeedMatches(true);
        AccessibilityInfo.announceForAccessibility(
          "Showing demo matches while live matches refresh.",
        );
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
        setUsingSeedMatches(false);
      } else {
        setMatches(getSeedMatches());
        setUsingSeedMatches(true);
      }
    } catch {
      console.error("Failed to fetch data.");
      setMatches(getSeedMatches());
      setUsingSeedMatches(true);
      AccessibilityInfo.announceForAccessibility(
        "Showing demo matches while live matches refresh.",
      );
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

    if (isSeedProfileId(String(id))) {
      Alert.alert(
        "Demo conversation",
        "This beta match is sample data. Open Messages to preview seeded unread and active conversations.",
        [
          { text: "Stay here", style: "cancel" },
          {
            text: "Open Messages",
            onPress: () => router.push("/(main)/messages"),
          },
        ],
      );
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

    if (isSeedProfileId(String(id))) {
      Alert.alert(
        `Hide ${matchName}?`,
        "This only removes the demo match from your beta preview. No real member action is sent.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Hide",
            style: "destructive",
            onPress: () =>
              setMatches((current) => current.filter((item) => item.id !== id)),
          },
        ],
      );
      return;
    }

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

    if (isSeedProfileId(String(id))) {
      Alert.alert(
        "Demo match",
        "This is sample beta data, so no real report is needed.",
      );
      return;
    }

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
          backgroundColor={theme.semanticColors.background}
          translucent={false}
        />
        {Platform.OS !== "web" && (
          <View style={{ height: insets.top, backgroundColor: theme.semanticColors.background }} />
        )}
        <View style={styles.loadingPanel}>
          <ActivityIndicator
            size="large"
            color={theme.semanticColors.primary}
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
        backgroundColor={theme.semanticColors.background}
        translucent={false}
      />
      {Platform.OS !== "web" && (
        <View style={{ height: insets.top, backgroundColor: theme.semanticColors.background }} />
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
              <ShieldCheck size={15} color={theme.colors.neutral.white} strokeWidth={2.4} />
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

      {usingSeedMatches && (
        <View
          style={styles.demoNotice}
          accessible
          accessibilityLabel="Demo matches are visible for beta preview. Real mutual matches will replace them when available."
        >
          <Text style={styles.demoNoticeTitle}>Beta preview</Text>
          <Text style={styles.demoNoticeText}>
            Demo matches and mutuals are visible now. Real matches replace these
            automatically when Supabase returns live data.
          </Text>
        </View>
      )}

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
              onPress={() => handleMessage(match.id)}
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

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.semanticColors.background,
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
    color: theme.colors.neutral.white,
    letterSpacing: 0.2,
  },
  matchSafetyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.72)",
  },
  demoNotice: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(141, 105, 246, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(141, 105, 246, 0.32)",
  },
  demoNoticeTitle: {
    fontSize: 12,
    fontFamily: "DMSans-Bold",
    color: theme.colors.neutral.white,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  demoNoticeText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "DMSans-Medium",
    color: "rgba(255, 255, 255, 0.74)",
  },
}));
// touch
