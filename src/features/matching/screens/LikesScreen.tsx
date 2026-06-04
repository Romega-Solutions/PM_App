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
 * - Fetches data via useCurrentUser + useMatches hooks (no direct supabase import)
 * - No mock data - 100% database-driven
 */

import { accountApi } from "@/src/features/account/api/accountApi";
import { useTheme, withAlpha } from "@/src/theme";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyMatchesState } from "../components/EmptyMatchesState";
import { LikesFilter } from "../components/LikesFilter";
import { LikesHeader } from "../components/LikesHeader";
import { Match, MatchCard } from "../components/MatchCard";
import { useCurrentUser, useMatches } from "../hooks/useMatchingQueries";

export default function LikesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<"all" | "mutual">("all");
  const [, setUserType] = useState<string | null>(null);

  // ── Auth & data via hooks (no direct supabase import) ──────────────────────
  const {
    data: currentUser,
    isLoading: userLoading,
  } = useCurrentUser();

  const userId = currentUser?.id ?? null;

  const {
    data: dbMatches,
    isLoading: matchesLoading,
  } = useMatches(userId);

  const loading = userLoading || matchesLoading;

  // Hydrate user type when auth resolves (preserves original behaviour)
  useEffect(() => {
    if (!currentUser) return;
    accountApi.getBasicInfo().then((info) => {
      setUserType(info?.userType ?? null);
    });
  }, [currentUser]);

  // Convert database matches to display format
  const matches: Match[] = (dbMatches ?? []).map((match) => ({
    id: match.profile.id,
    name: match.profile.first_name,
    age: match.profile.age,
    location: match.profile.city || "Philippines",
    image: match.profile.photos?.[0]
      ? { uri: match.profile.photos[0] }
      : require("../../../../assets/girls/ai1.jpg"),
    verified: match.profile.is_verified,
    mutual: match.is_mutual,
    gender:
      match.profile.gender === "other" ? "female" : match.profile.gender,
    matchedAt: match.matched_at,
  }));

  const filteredMatches =
    filter === "mutual" ? matches.filter((m) => m.mutual) : matches;

  const handleMessage = (id: string | number) => {
    Alert.alert("Messaging unavailable", "Match messaging is not wired yet.");
  };

  const handleUnmatch = (id: string | number) => {
    Alert.alert(
      "Unmatch unavailable",
      "Removing a match is not wired yet.",
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.brandBackground}
          translucent={false}
        />
        {insets.top > 0 && (
          <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
        )}
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.brandBackground}
        translucent={false}
      />
      {insets.top > 0 && (
        <View style={{ height: insets.top, backgroundColor: colors.brandBackground }} />
      )}

      <LikesHeader matchCount={filteredMatches.length} filter={filter} />
      <LikesFilter filter={filter} onFilterChange={setFilter} />

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
        {filteredMatches.length === 0 && <EmptyMatchesState />}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brandBackground,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: withAlpha(colors.onPrimary, 0.85),
    fontFamily: "DMSans-Medium",
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
});
