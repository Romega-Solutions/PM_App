// src/features/matching/api/matchingApi.ts
import { supabase } from "@/src/config/supabase";
import { Match, Profile, SwipeResult } from "../types";

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate match score between current user and potential match
 * Returns score from 0-100
 */
const calculateMatchScore = (currentUser: any, candidate: any): number => {
  let score = 0;

  // 1. RELATIONSHIP GOAL MATCH (25 points max)
  if (currentUser.relationship_goal && candidate.relationship_goal) {
    if (currentUser.relationship_goal === candidate.relationship_goal) {
      score += 25; // Perfect match
    } else if (
      (currentUser.relationship_goal === "long-term" &&
        candidate.relationship_goal === "marriage") ||
      (currentUser.relationship_goal === "marriage" &&
        candidate.relationship_goal === "long-term")
    ) {
      score += 20; // Compatible serious intentions
    } else if (
      currentUser.relationship_goal === "dating" ||
      candidate.relationship_goal === "dating"
    ) {
      score += 10; // Open to different levels
    }
  }

  // 2. SHARED INTERESTS (20 points max)
  if (
    currentUser.interests &&
    candidate.interests &&
    currentUser.interests.length > 0 &&
    candidate.interests.length > 0
  ) {
    const sharedInterests = currentUser.interests.filter((interest: string) =>
      candidate.interests.includes(interest)
    );
    const interestScore = Math.min(
      20,
      (sharedInterests.length / currentUser.interests.length) * 20
    );
    score += interestScore;
  }

  // 3. SHARED LANGUAGES (15 points max)
  if (
    currentUser.languages &&
    candidate.languages &&
    currentUser.languages.length > 0 &&
    candidate.languages.length > 0
  ) {
    const sharedLanguages = currentUser.languages.filter((lang: string) =>
      candidate.languages.includes(lang)
    );
    const languageScore = Math.min(
      15,
      (sharedLanguages.length /
        Math.max(currentUser.languages.length, candidate.languages.length)) *
        15
    );
    score += languageScore;
  }

  // 4. LOCATION/DISTANCE (15 points max)
  if (
    currentUser.latitude &&
    currentUser.longitude &&
    candidate.latitude &&
    candidate.longitude
  ) {
    const distance = calculateDistance(
      currentUser.latitude,
      currentUser.longitude,
      candidate.latitude,
      candidate.longitude
    );
    const maxDistance = currentUser.distance_preference_km || 100;
    if (distance <= maxDistance) {
      // Closer is better
      const distanceScore = 15 * (1 - distance / maxDistance);
      score += distanceScore;
    }
  } else if (
    currentUser.city &&
    candidate.city &&
    currentUser.city === candidate.city
  ) {
    score += 15; // Same city
  } else if (
    currentUser.country &&
    candidate.country &&
    currentUser.country === candidate.country
  ) {
    score += 8; // Same country
  }

  // 5. AGE COMPATIBILITY (10 points max)
  if (currentUser.age && candidate.age) {
    const ageDiff = Math.abs(currentUser.age - candidate.age);
    if (ageDiff <= 3) {
      score += 10; // Very close age
    } else if (ageDiff <= 5) {
      score += 8;
    } else if (ageDiff <= 10) {
      score += 5;
    } else if (ageDiff <= 15) {
      score += 2;
    }
  }

  // 6. EDUCATION LEVEL (10 points max)
  if (currentUser.education && candidate.education) {
    const educationLevels = [
      "high-school",
      "some-college",
      "bachelors",
      "masters",
      "phd",
    ];
    const userLevel = educationLevels.indexOf(
      currentUser.education.toLowerCase()
    );
    const candidateLevel = educationLevels.indexOf(
      candidate.education.toLowerCase()
    );
    if (userLevel !== -1 && candidateLevel !== -1) {
      const levelDiff = Math.abs(userLevel - candidateLevel);
      if (levelDiff === 0) {
        score += 10; // Same level
      } else if (levelDiff === 1) {
        score += 7; // Adjacent level
      } else if (levelDiff === 2) {
        score += 4;
      }
    }
  }

  // 7. ACTIVITY & VERIFICATION BONUS (5 points max)
  // Verified users get priority
  if (candidate.is_verified) {
    score += 3;
  }
  // Recently active users get priority
  if (candidate.last_active_at) {
    const hoursSinceActive =
      (Date.now() - new Date(candidate.last_active_at).getTime()) /
      (1000 * 60 * 60);
    if (hoursSinceActive < 24) {
      score += 2; // Active within 24 hours
    } else if (hoursSinceActive < 72) {
      score += 1; // Active within 3 days
    }
  }

  return Math.round(score);
};

/**
 * Fetch profiles for discovery based on user preferences
 * - Filters by opposite user_type (filipinas see foreigners, foreigners see filipinas)
 * - Filters by gender preference
 * - Filters by age preference
 * - Excludes already liked/passed profiles
 * - Only shows active profiles
 * - SMART MATCHING: Scores and ranks profiles by compatibility
 */
export const fetchDiscoverProfiles = async (
  userId: string,
  limit: number = 20
): Promise<{ data: Profile[] | null; error: any }> => {
  try {
    // Get current user's profile to determine preferences
    const { data: currentUser, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !currentUser) {
      return { data: null, error: userError || "User not found" };
    }

    // Determine which user_type to show
    const targetUserType =
      currentUser.user_type === "filipina" ? "foreigner" : "filipina";

    // Get IDs of users already liked or passed
    const [{ data: likedUsers }, { data: passedUsers }] = await Promise.all([
      supabase.from("likes").select("to_user_id").eq("from_user_id", userId),
      supabase.from("passes").select("to_user_id").eq("from_user_id", userId),
    ]);

    const excludedIds = [
      ...(likedUsers?.map((l) => l.to_user_id) || []),
      ...(passedUsers?.map((p) => p.to_user_id) || []),
      userId, // Exclude self
    ];

    // Build query - fetch MORE profiles for better scoring
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("user_type", targetUserType)
      .eq("is_active", true)
      .not("id", "in", `(${excludedIds.join(",")})`)
      .limit(limit * 3); // Fetch 3x to allow for better scoring

    // Filter by gender preference
    if (
      currentUser.looking_for_gender &&
      currentUser.looking_for_gender !== "both"
    ) {
      query = query.eq("gender", currentUser.looking_for_gender);
    }

    // Filter by age preference (hard filter)
    if (currentUser.age_preference_min) {
      query = query.gte("age", currentUser.age_preference_min);
    }
    if (currentUser.age_preference_max) {
      query = query.lte("age", currentUser.age_preference_max);
    }

    const { data: profiles, error } = await query;

    if (error) {
      return { data: null, error };
    }

    if (!profiles || profiles.length === 0) {
      return { data: [], error: null };
    }

    // Calculate match scores for each profile
    const scoredProfiles = profiles.map((profile) => ({
      ...profile,
      matchScore: calculateMatchScore(currentUser, profile),
    }));

    // Sort by match score (highest first)
    scoredProfiles.sort((a, b) => b.matchScore - a.matchScore);

    // Take top matches up to limit
    const topMatches = scoredProfiles.slice(0, limit);

    console.log(
      `🎯 Smart Matching: Found ${topMatches.length} profiles with scores:`,
      topMatches.map((p) => ({ name: p.first_name, score: p.matchScore }))
    );

    return { data: topMatches, error: null };
  } catch (error) {
    console.error("Error fetching discover profiles:", error);
    return { data: null, error };
  }
};

/**
 * Like a profile
 * - Saves the like to database
 * - Checks if it's a mutual like (match)
 * - Updates is_match field if mutual
 */
export const likeProfile = async (
  fromUserId: string,
  toUserId: string
): Promise<SwipeResult> => {
  try {
    // Insert the like
    const { data: newLike, error: likeError } = await supabase
      .from("likes")
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        is_match: false,
      })
      .select()
      .single();

    if (likeError) {
      return { success: false, error: likeError.message };
    }

    // Check if the other user already liked this user (mutual like = match)
    const { data: mutualLike, error: mutualError } = await supabase
      .from("likes")
      .select("*")
      .eq("from_user_id", toUserId)
      .eq("to_user_id", fromUserId)
      .single();

    // If mutual like exists, it's a match!
    if (mutualLike && !mutualError) {
      // Update both likes to is_match = true
      const matchedAt = new Date().toISOString();

      await Promise.all([
        supabase
          .from("likes")
          .update({ is_match: true, matched_at: matchedAt })
          .eq("id", newLike.id),
        supabase
          .from("likes")
          .update({ is_match: true, matched_at: matchedAt })
          .eq("id", mutualLike.id),
      ]);

      // Get the matched profile
      const { data: matchedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", toUserId)
        .single();

      return {
        success: true,
        isMatch: true,
        matchedProfile: matchedProfile || undefined,
      };
    }

    return { success: true, isMatch: false };
  } catch (error: any) {
    console.error("Error liking profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Pass on a profile
 * - Saves the pass to database
 * - User won't see this profile again
 */
export const passProfile = async (
  fromUserId: string,
  toUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("passes").insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error passing profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all matches for a user
 * - Returns profiles where is_match = true
 * - Includes profile details
 */
export const getMatches = async (
  userId: string
): Promise<{ data: Match[] | null; error: any }> => {
  try {
    // Get all likes where this user is involved and is_match = true
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("*")
      .eq("is_match", true)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order("matched_at", { ascending: false });

    if (likesError) {
      return { data: null, error: likesError };
    }

    if (!likes || likes.length === 0) {
      return { data: [], error: null };
    }

    // Get the matched user IDs (the other person in each match)
    const matchedUserIds = likes.map((like) =>
      like.from_user_id === userId ? like.to_user_id : like.from_user_id
    );

    // Fetch profiles for all matched users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", matchedUserIds);

    if (profilesError) {
      return { data: null, error: profilesError };
    }

    // Combine likes with profiles
    const matches: Match[] = likes.map((like) => {
      const matchedUserId =
        like.from_user_id === userId ? like.to_user_id : like.from_user_id;
      const profile = profiles?.find((p) => p.id === matchedUserId);

      return {
        id: like.id,
        profile: profile!,
        matched_at: like.matched_at || like.created_at,
        is_mutual: true,
      };
    });

    return { data: matches, error: null };
  } catch (error) {
    console.error("Error fetching matches:", error);
    return { data: null, error };
  }
};

/**
 * Get users who liked the current user (but not matched yet)
 * - Returns profiles of users who liked you
 * - Doesn't include mutual matches (those are in getMatches)
 */
export const getLikesReceived = async (
  userId: string
): Promise<{ data: Profile[] | null; error: any }> => {
  try {
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("from_user_id")
      .eq("to_user_id", userId)
      .eq("is_match", false);

    if (likesError) {
      return { data: null, error: likesError };
    }

    if (!likes || likes.length === 0) {
      return { data: [], error: null };
    }

    const userIds = likes.map((like) => like.from_user_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    return { data: profiles, error: profilesError };
  } catch (error) {
    console.error("Error fetching received likes:", error);
    return { data: null, error };
  }
};

/**
 * Super like a profile (future premium feature)
 * - Same as like but with special flag
 */
export const superLikeProfile = async (
  fromUserId: string,
  toUserId: string
): Promise<SwipeResult> => {
  // For now, just treat it as a regular like
  // In the future, add a super_like flag to the likes table
  return await likeProfile(fromUserId, toUserId);
};

/**
 * Undo last swipe (future premium feature)
 */
export const undoLastSwipe = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the most recent like or pass
    const [{ data: lastLike }, { data: lastPass }] = await Promise.all([
      supabase
        .from("likes")
        .select("*")
        .eq("from_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("passes")
        .select("*")
        .eq("from_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    // Determine which was more recent
    const lastLikeTime = lastLike?.created_at
      ? new Date(lastLike.created_at).getTime()
      : 0;
    const lastPassTime = lastPass?.created_at
      ? new Date(lastPass.created_at).getTime()
      : 0;

    if (lastLikeTime > lastPassTime && lastLike) {
      // Delete the like
      await supabase.from("likes").delete().eq("id", lastLike.id);
    } else if (lastPass) {
      // Delete the pass
      await supabase.from("passes").delete().eq("id", lastPass.id);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error undoing swipe:", error);
    return { success: false, error: error.message };
  }
};
