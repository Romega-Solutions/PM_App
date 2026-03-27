/**
 * Home Screen (Discover/Swipe)
 *
 * REFACTORED: Previously 1,836 lines
 * NOW: Thin wrapper (~30 lines) importing DiscoverScreen
 *
 * SOLID Principles Applied:
 * - Single Responsibility: This file only handles Expo Router routing
 * - All business logic moved to DiscoverScreen component
 *
 * Components Created:
 * - DiscoverScreen.tsx (~420 lines) - Main orchestrator
 * - ProfileCard.tsx (~290 lines) - Swipeable profile card
 * - ActionButtons.tsx (~120 lines) - Like/Pass/SuperLike buttons
 * - ProfileDetailsModal.tsx (~350 lines) - Full profile details
 * - MatchModal.tsx (~180 lines) - Match celebration
 * - useSwipeGesture.ts (~140 lines) - Gesture hook
 *
 * Total: 1,836 lines → 7 files (avg ~240 lines/file)
 * All files under 500 line limit ✅
 */

import { DiscoverScreen } from "@/src/features/matching/screens/DiscoverScreen";
import React from "react";

export default function Home() {
  return <DiscoverScreen />;
}
