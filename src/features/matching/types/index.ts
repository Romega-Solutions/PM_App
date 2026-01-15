// src/features/matching/types/index.ts
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  age: number;
  gender: "male" | "female" | "other";
  user_type: "filipina" | "foreigner";
  photos: string[];
  bio?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  height_cm?: number;
  body_type?: string;
  education?: string;
  occupation?: string;
  relationship_goal?: string;
  languages?: string[];
  interests?: string[];
  looking_for_gender: "male" | "female" | "both";
  age_preference_min: number;
  age_preference_max: number;
  distance_preference_km: number;
  is_verified: boolean;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
  last_active_at: string;
  matchScore?: number; // Smart matching score (0-100)
}

export interface Like {
  id: string;
  from_user_id: string;
  to_user_id: string;
  is_match: boolean;
  matched_at?: string;
  created_at: string;
}

export interface Pass {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  profile: Profile;
  matched_at: string;
  is_mutual: boolean;
}

export interface SwipeResult {
  success: boolean;
  isMatch?: boolean;
  matchedProfile?: Profile;
  error?: string;
}
