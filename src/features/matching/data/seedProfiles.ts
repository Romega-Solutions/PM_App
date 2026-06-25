/**
 * Seed Profiles - AI Model Demo Data
 *
 * Provides coherent demo profiles using the organized AI model catalog.
 * Each visual model folder maps to one seeded person with multiple poses,
 * instead of presenting repeated generated faces as unrelated people.
 *
 * All seed profiles are clearly marked with isSeedProfile: true and display
 * a demo badge. Swipe actions on seed profiles do not call the backend.
 */

import { ProfileCardData } from "../components/ProfileCard";
import {
  getSeedAiModel,
  getSeedAiModelGallery,
  getSeedAiModelPose,
  type SeedAiModelId,
} from "./aiModelCatalog";

type SeedProfileInput = Omit<
  ProfileCardData,
  | "image"
  | "galleryImages"
  | "modelFolder"
  | "modelBiography"
  | "modelPersonality"
  | "isSeedProfile"
> & {
  modelId: SeedAiModelId;
  primaryPoseId: string;
};

function buildSeedProfile(input: SeedProfileInput): ProfileCardData {
  const model = getSeedAiModel(input.modelId);
  const primaryPose = getSeedAiModelPose(input.modelId, input.primaryPoseId);

  return {
    ...input,
    image: primaryPose.image,
    galleryImages: getSeedAiModelGallery(input.modelId),
    modelFolder: model.folder,
    modelBiography: model.biography,
    modelPersonality: model.personality,
    isSeedProfile: true,
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const SEED_PROFILES: ProfileCardData[] = [
  buildSeedProfile({
    id: "seed-01",
    modelId: "model-01-corporate",
    primaryPoseId: "pose-01-office-window",
    name: "Maria",
    age: 28,
    location: "Makati, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Travel", "Coffee", "Design"],
    bio: "Product strategist who likes slow coffee, honest plans, and weekend food trips. I am looking for something steady, respectful, and real.",
    occupation: "Product Strategist",
    relationshipGoal: "long-term",
    languages: ["English", "Tagalog"],
    education: "Business Management",
    heightCm: 164,
    bodyType: "Average",
  }),
  buildSeedProfile({
    id: "seed-02",
    modelId: "model-02-beach",
    primaryPoseId: "pose-01-sunlit-shore",
    name: "Angela",
    age: 25,
    location: "Cebu City, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Beach", "Diving", "Photography"],
    bio: "Coastal weekends keep me balanced. I like clear intentions, kind humor, and someone who can enjoy quiet sunsets without rushing.",
    occupation: "Marine Tour Coordinator",
    relationshipGoal: "dating",
    languages: ["English", "Cebuano", "Tagalog"],
    education: "Tourism Management",
    heightCm: 160,
    bodyType: "Athletic",
  }),
  buildSeedProfile({
    id: "seed-03",
    modelId: "model-03-evening",
    primaryPoseId: "pose-01-gray-gown",
    name: "Grace",
    age: 30,
    location: "Iloilo City, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Volunteering", "Music", "Dinner"],
    bio: "I care about thoughtful conversations and people who follow through. A calm dinner and sincere questions mean more than grand gestures.",
    occupation: "Community Program Lead",
    relationshipGoal: "long-term",
    languages: ["English", "Tagalog", "Hiligaynon"],
    education: "Public Administration",
    heightCm: 166,
    bodyType: "Curvy",
  }),
  buildSeedProfile({
    id: "seed-04",
    modelId: "model-04-business",
    primaryPoseId: "pose-01-blue-suit-interior",
    name: "Samantha",
    age: 31,
    location: "Bonifacio Global City, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Business", "Food", "Travel"],
    bio: "Entrepreneur by day and home-cook by night. I respect ambition, but I value emotional maturity and consistency even more.",
    occupation: "Business Owner",
    relationshipGoal: "marriage",
    languages: ["English", "Tagalog"],
    education: "Entrepreneurship",
    heightCm: 165,
    bodyType: "Average",
  }),
  buildSeedProfile({
    id: "seed-05",
    modelId: "model-05-creative",
    primaryPoseId: "pose-01-office-tablet",
    name: "Kyla",
    age: 24,
    location: "Mandaluyong, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Music", "Books", "Art"],
    bio: "Voice teacher, playlist maker, and weekend reader. I like conversations that start light and slowly become meaningful.",
    occupation: "Voice Teacher",
    relationshipGoal: "dating",
    languages: ["English", "Tagalog"],
    education: "Music Education",
    heightCm: 158,
    bodyType: "Petite",
  }),
  buildSeedProfile({
    id: "seed-06",
    modelId: "model-06-garden",
    primaryPoseId: "pose-01-garden-dress",
    name: "Francesca",
    age: 27,
    location: "Pasay, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Travel", "Languages", "Wellness"],
    bio: "Flight attendant who still loves slow mornings at home. I appreciate patience, curiosity, and someone who respects boundaries.",
    occupation: "Flight Attendant",
    relationshipGoal: "long-term",
    languages: ["English", "Tagalog", "Spanish"],
    education: "Hospitality Management",
    heightCm: 167,
    bodyType: "Slim",
  }),
  buildSeedProfile({
    id: "seed-07",
    modelId: "model-07-urban",
    primaryPoseId: "pose-01-street-casual",
    name: "Leah",
    age: 32,
    location: "Davao City, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Family", "Cooking", "Gardening"],
    bio: "Simple routines make me happiest: cooking for people I love, caring for plants, and making space for honest connection.",
    occupation: "Registered Nurse",
    relationshipGoal: "marriage",
    languages: ["English", "Tagalog", "Bisaya"],
    education: "Nursing",
    heightCm: 162,
    bodyType: "Average",
  }),
  buildSeedProfile({
    id: "seed-08",
    modelId: "model-08-red-hair",
    primaryPoseId: "pose-04-pink-studio",
    name: "Trisha",
    age: 28,
    location: "Cebu City, Philippines",
    distance: "Demo profile",
    verified: false,
    interests: ["Tech", "Gaming", "Cats"],
    bio: "Full-stack developer, cat person, and late-night co-op teammate. I like playful banter, direct communication, and steady effort.",
    occupation: "Full-Stack Developer",
    relationshipGoal: "long-term",
    languages: ["English", "Cebuano", "Tagalog"],
    education: "Computer Science",
    heightCm: 163,
    bodyType: "Average",
  }),
];

/**
 * Returns a shuffled copy of the seed profiles for variety on each load.
 */
export function getSeedProfiles(): ProfileCardData[] {
  return shuffleArray(SEED_PROFILES);
}

/**
 * Returns the seed profiles in a stable order for beta scaffold surfaces
 * that need consistent matches, mutuals, and messages.
 */
export function getSeedProfilesInOrder(): ProfileCardData[] {
  return [...SEED_PROFILES];
}

/**
 * Check if a profile ID belongs to a seed/demo profile.
 */
export function isSeedProfileId(id: string): boolean {
  return id.startsWith("seed-");
}
