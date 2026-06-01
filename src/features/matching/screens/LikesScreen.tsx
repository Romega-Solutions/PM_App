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
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
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

const BRAND_BG = "#0F0814";
const ACCENT_PINK = "#EF3E78";

export default function LikesScreen() {
  const insets = useSafeAreaInsets();
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
    if (__DEV__) {
      console.log("Message match:", id);
    }
    // TODO: Navigate to messages screen with this match
  };

  const handleUnmatch = (id: string | number) => {
    if (__DEV__) {
      console.log("Unmatch:", id);
    }
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
