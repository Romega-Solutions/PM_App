// src/features/matching/api/matchingApi.ts
import { supabase } from "@/src/config/supabase";
import { Match, Profile, SwipeResult } from "../types";

const MATCHING_PROFILE_SELECT = `
  id,
  first_name,
  age,
  gender,
  user_type,
  photos,
  bio,
  country,
  city,
  height_cm,
  body_type,
  education,
  occupation,
  relationship_goal,
  languages,
  interests,
  looking_for_gender,
  age_preference_min,
  age_preference_max,
  distance_preference_km,
  is_verified,
  is_active,
  is_premium,
  created_at,
  last_active_at
`;

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
      candidate.interests.includes(interest),
    );
    const interestScore = Math.min(
      20,
      (sharedInterests.length / currentUser.interests.length) * 20,
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
      candidate.languages.includes(lang),
    );
    const languageScore = Math.min(
      15,
      (sharedLanguages.length /
        Math.max(currentUser.languages.length, candidate.languages.length)) *
        15,
    );
    score += languageScore;
  }

  // 4. LOCATION (15 points max)
  if (
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
      currentUser.education.toLowerCase(),
    );
    const candidateLevel = educationLevels.indexOf(
      candidate.education.toLowerCase(),
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

  // 7. ACTIVITY SIGNAL (2 points max)
  // Verification is shown as a trust signal, not an automatic ranking boost.
  // Recently active users get priority.
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

const validateSwipeIds = (
  fromUserId: string,
  toUserId: string,
  action: "like" | "pass",
): string | null => {
  if (!fromUserId || !toUserId) {
    return `Choose a member to ${action}.`;
  }

  if (fromUserId === toUserId) {
    return `You cannot ${action} yourself.`;
  }

  return null;
};

type LikeProfileRpcResult = {
  success?: boolean;
  is_match?: boolean;
  matched_profile?: Profile | null;
  error?: string | null;
};

type MatchingAction = "like" | "pass" | "undo";

const getSafeMatchingActionError = (action: MatchingAction): string => {
  if (action === "pass") {
    return "Pass did not save. Check your connection and try again.";
  }

  if (action === "undo") {
    return "Undo did not complete. Check your connection and try again.";
  }

  return "Like did not send. Check your connection and try again.";
};

const isReviewedLaunchDiscoveryProfile = (profile: {
  is_verified?: boolean | null;
  is_active?: boolean | null;
}) => profile.is_verified === true && profile.is_active === true;

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
  limit: number = 20,
): Promise<{ data: Profile[] | null; error: any }> => {
  try {
    // Get current user's profile to determine preferences
    const { data: currentUser, error: userError } = await supabase
      .from("profiles")
      .select(MATCHING_PROFILE_SELECT)
      .eq("id", userId)
      .single();

    if (userError || !currentUser) {
      return { data: null, error: userError || "User not found" };
    }

    if (!isReviewedLaunchDiscoveryProfile(currentUser)) {
      return { data: [], error: null };
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
      .from("discoverable_profiles")
      .select(MATCHING_PROFILE_SELECT)
      .eq("user_type", targetUserType)
      .eq("is_verified", true)
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

    return { data: topMatches, error: null };
  } catch (error) {
    console.error("Error fetching discover profiles.");
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
  toUserId: string,
): Promise<SwipeResult> => {
  const validationError = validateSwipeIds(fromUserId, toUserId, "like");
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const { data, error } = await supabase.rpc("like_profile", {
      p_to_user_id: toUserId,
    });

    if (error) {
      return { success: false, error: getSafeMatchingActionError("like") };
    }

    const result = (
      Array.isArray(data) ? data[0] : data
    ) as LikeProfileRpcResult | null;

    if (!result?.success) {
      return {
        success: false,
        error: getSafeMatchingActionError("like"),
      };
    }

    return {
      success: true,
      isMatch: Boolean(result.is_match),
      matchedProfile: result.matched_profile || undefined,
    };
  } catch (error: any) {
    console.error("Error liking profile.");
    return { success: false, error: getSafeMatchingActionError("like") };
  }
};

/**
 * Pass on a profile
 * - Saves the pass to database
 * - User won't see this profile again
 */
export const passProfile = async (
  fromUserId: string,
  toUserId: string,
): Promise<{ success: boolean; error?: string }> => {
  const validationError = validateSwipeIds(fromUserId, toUserId, "pass");
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    void fromUserId;

    const { error } = await supabase.rpc("pass_profile", {
      p_to_user_id: toUserId,
    });

    if (error) {
      return { success: false, error: getSafeMatchingActionError("pass") };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error passing profile.");
    return { success: false, error: getSafeMatchingActionError("pass") };
  }
};

/**
 * Get all matches for a user
 * - Returns profiles where is_match = true
 * - Includes profile details
 */
export const getMatches = async (
  userId: string,
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
      like.from_user_id === userId ? like.to_user_id : like.from_user_id,
    );

    // Fetch profiles for all matched users
    const { data: profiles, error: profilesError } = await supabase
      .from("discoverable_profiles")
      .select(MATCHING_PROFILE_SELECT)
      .in("id", matchedUserIds);

    if (profilesError) {
      return { data: null, error: profilesError };
    }

    // Combine likes with profiles. If the profile is no longer discoverable
    // because of privacy/blocking/moderation state, omit it instead of
    // returning a broken or misleading match card.
    const matches: Match[] = likes.flatMap((like) => {
      const matchedUserId =
        like.from_user_id === userId ? like.to_user_id : like.from_user_id;
      const profile = profiles?.find((p) => p.id === matchedUserId);

      if (!profile) {
        return [];
      }

      return [
        {
          id: like.id,
          profile,
          matched_at: like.matched_at || like.created_at,
          is_mutual: true,
        },
      ];
    });

    return { data: matches, error: null };
  } catch (error) {
    console.error("Error fetching matches.");
    return { data: null, error };
  }
};

/**
 * Get users who liked the current user (but not matched yet)
 * - Returns profiles of users who liked you
 * - Doesn't include mutual matches (those are in getMatches)
 */
export const getLikesReceived = async (
  userId: string,
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
      .from("discoverable_profiles")
      .select(MATCHING_PROFILE_SELECT)
      .in("id", userIds);

    return { data: profiles, error: profilesError };
  } catch (error) {
    console.error("Error fetching received likes.");
    return { data: null, error };
  }
};

/**
 * Super like a profile.
 * Currently uses the same hardened server-side match flow as a regular like.
 */
export const superLikeProfile = async (
  fromUserId: string,
  toUserId: string,
): Promise<SwipeResult> => {
  return await likeProfile(fromUserId, toUserId);
};

/**
 * Undo last swipe.
 */
export const undoLastSwipe = async (
  userId: string,
): Promise<{ success: boolean; error?: string }> => {
  if (!userId) {
    return { success: false, error: "Sign in before undoing a swipe." };
  }

  try {
    void userId;

    const { error } = await supabase.rpc("undo_last_swipe");

    if (error) {
      return { success: false, error: getSafeMatchingActionError("undo") };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error undoing swipe.");
    return { success: false, error: getSafeMatchingActionError("undo") };
  }
};
