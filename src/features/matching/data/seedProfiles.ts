/**
 * Seed Profiles — AI Model Demo Data
 *
 * Provides 20 demo Pinay profiles using the AI-generated model images
 * in assets/images/ai-models/. These are shown in the discovery feed
 * when no real database profiles are available, giving new users an
 * immediate premium feel.
 *
 * All seed profiles are clearly marked with isSeedProfile: true and
 * display a "Demo" badge. Swipe actions on seed profiles do NOT call
 * the backend.
 */

import { ProfileCardData } from "../components/ProfileCard";

/**
 * Shuffle an array using Fisher-Yates algorithm
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
  {
    id: "seed-01",
    name: "Maria",
    age: 25,
    location: "Makati, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-01-corporate/pose-01-office-window.webp"),
    verified: false,
    interests: ["Travel", "Cooking", "Photography"],
    bio: "Love exploring new places and trying local cuisines 🌏",
    occupation: "Marketing Manager",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-02",
    name: "Angela",
    age: 23,
    location: "Cebu City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-01-corporate/pose-02-skyline-blazer.webp"),
    verified: false,
    interests: ["Music", "Beach", "Yoga"],
    bio: "Island girl at heart 🏝️ Love sunsets and good conversation",
    occupation: "Graphic Designer",
    relationshipGoal: "dating",
    isSeedProfile: true,
  },
  {
    id: "seed-03",
    name: "Jasmine",
    age: 27,
    location: "Davao City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-01-corporate/pose-03-pastel-suit.webp"),
    verified: false,
    interests: ["Reading", "Coffee", "Art"],
    bio: "Coffee lover and bookworm ☕📚 Looking for deep connections",
    occupation: "Software Engineer",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-04",
    name: "Patricia",
    age: 24,
    location: "Quezon City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-01-corporate/pose-04-white-suit.webp"),
    verified: false,
    interests: ["Fitness", "Dancing", "Movies"],
    bio: "Dance like nobody's watching 💃 Gym in the morning, salsa at night",
    occupation: "Physical Therapist",
    relationshipGoal: "dating",
    isSeedProfile: true,
  },
  {
    id: "seed-05",
    name: "Isabelle",
    age: 26,
    location: "Taguig, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-01-corporate/pose-05-cafe-white-blouse.webp"),
    verified: false,
    interests: ["Fashion", "Travel", "Food"],
    bio: "Fashion enthusiast with wanderlust ✈️ Let's explore together",
    occupation: "Fashion Buyer",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-06",
    name: "Camille",
    age: 28,
    location: "Pasig, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-02-beach/pose-01-sunlit-shore.webp"),
    verified: false,
    interests: ["Hiking", "Photography", "Cooking"],
    bio: "Weekend adventurer 🏔️ Love capturing moments and making memories",
    occupation: "Architect",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-07",
    name: "Denise",
    age: 22,
    location: "Manila, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-02-beach/pose-02-beach-recline.webp"),
    verified: false,
    interests: ["K-pop", "Gaming", "Anime"],
    bio: "Proud nerd 🎮 Love K-dramas and late-night gaming sessions",
    occupation: "Content Creator",
    relationshipGoal: "dating",
    isSeedProfile: true,
  },
  {
    id: "seed-08",
    name: "Grace",
    age: 29,
    location: "Iloilo City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-03-evening/pose-01-gray-gown.webp"),
    verified: false,
    interests: ["Volunteering", "Teaching", "Music"],
    bio: "Passionate about education and making a difference 🌟",
    occupation: "University Lecturer",
    relationshipGoal: "marriage",
    isSeedProfile: true,
  },
  {
    id: "seed-09",
    name: "Bianca",
    age: 25,
    location: "Baguio, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-03-evening/pose-02-portrait-black-dress.webp"),
    verified: false,
    interests: ["Art", "Coffee", "Nature"],
    bio: "Mountain girl living in the City of Pines 🌲☕",
    occupation: "Fine Arts Teacher",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-10",
    name: "Althea",
    age: 26,
    location: "Makati, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-03-evening/pose-03-black-gown.webp"),
    verified: false,
    interests: ["Fitness", "Wellness", "Travel"],
    bio: "Wellness advocate and gym regular 💪 Seeking a healthy lifestyle partner",
    occupation: "Nutritionist",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-11",
    name: "Nicole",
    age: 24,
    location: "Cebu City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-03-evening/pose-04-lounge-dress.webp"),
    verified: false,
    interests: ["Diving", "Beach", "Photography"],
    bio: "Free diver and ocean lover 🌊 Happiest underwater",
    occupation: "Marine Biologist",
    relationshipGoal: "dating",
    isSeedProfile: true,
  },
  {
    id: "seed-12",
    name: "Samantha",
    age: 30,
    location: "Bonifacio Global City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-04-business/pose-01-blue-suit-interior.webp"),
    verified: false,
    interests: ["Business", "Wine", "Travel"],
    bio: "Entrepreneur by day, foodie by night 🍷 Love meaningful conversations",
    occupation: "Business Owner",
    relationshipGoal: "marriage",
    isSeedProfile: true,
  },
  {
    id: "seed-13",
    name: "Kyla",
    age: 23,
    location: "Mandaluyong, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-05-creative/pose-01-office-tablet.webp"),
    verified: false,
    interests: ["Singing", "Piano", "Movies"],
    bio: "Music is my love language 🎵 Always humming a tune",
    occupation: "Voice Teacher",
    relationshipGoal: "dating",
    isSeedProfile: true,
  },
  {
    id: "seed-14",
    name: "Francesca",
    age: 27,
    location: "Pasay, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-06-garden/pose-01-garden-dress.webp"),
    verified: false,
    interests: ["Aviation", "Travel", "Languages"],
    bio: "Flight attendant exploring the world one city at a time ✈️",
    occupation: "Flight Attendant",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-15",
    name: "Leah",
    age: 31,
    location: "Davao City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-07-urban/pose-01-street-casual.webp"),
    verified: false,
    interests: ["Gardening", "Cooking", "Family"],
    bio: "Simple living, high thinking 🌻 Family-oriented and proud of it",
    occupation: "Registered Nurse",
    relationshipGoal: "marriage",
    isSeedProfile: true,
  },
  {
    id: "seed-16",
    name: "Rica",
    age: 24,
    location: "Makati, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-08-red-hair/pose-01-closeup-wink.webp"),
    verified: false,
    interests: ["Fashion", "Dancing", "Socializing"],
    bio: "Life is too short for boring outfits 👗 Let's make memories!",
    occupation: "Events Coordinator",
    relationshipGoal: "dating",
    isSeedProfile: true,
  },
  {
    id: "seed-17",
    name: "Chesca",
    age: 26,
    location: "Quezon City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-08-red-hair/pose-02-arcade-jersey.webp"),
    verified: false,
    interests: ["Film", "Writing", "Coffee"],
    bio: "Aspiring filmmaker and storyteller 🎬 Every person has a story",
    occupation: "Film Producer",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-18",
    name: "Ella",
    age: 25,
    location: "San Juan, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-08-red-hair/pose-03-celebration-outfit.webp"),
    verified: false,
    interests: ["Baking", "Dogs", "Running"],
    bio: "Dog mom and pastry baker 🐕🧁 Mornings start with a run and end with cake",
    occupation: "Pastry Chef",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-19",
    name: "Trisha",
    age: 28,
    location: "Cebu City, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-08-red-hair/pose-04-pink-studio.webp"),
    verified: false,
    interests: ["Tech", "Gaming", "Cats"],
    bio: "Cat lady and code wizard 🐱💻 Building apps by day, gaming by night",
    occupation: "Full-Stack Developer",
    relationshipGoal: "long-term",
    isSeedProfile: true,
  },
  {
    id: "seed-20",
    name: "Ava",
    age: 23,
    location: "Taguig, Philippines",
    distance: "Demo profile",
    image: require("@/assets/images/ai-models/model-08-red-hair/pose-05-red-outfit.webp"),
    verified: false,
    interests: ["Modeling", "Skincare", "Yoga"],
    bio: "Aspiring model with a skincare obsession ✨ Inner and outer glow",
    occupation: "Brand Ambassador",
    relationshipGoal: "dating",
    isSeedProfile: true,
  },
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
