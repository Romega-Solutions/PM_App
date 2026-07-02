import type { ImageSourcePropType } from "react-native";

export type SeedAiModelId =
  | "model-01-corporate"
  | "model-02-beach"
  | "model-03-evening"
  | "model-04-business"
  | "model-05-creative"
  | "model-06-garden"
  | "model-07-urban"
  | "model-08-red-hair";

export type SeedAiModelPose = {
  id: string;
  label: string;
  filename: string;
  image: ImageSourcePropType;
};

export type SeedAiModelCatalogEntry = {
  id: SeedAiModelId;
  folder: string;
  label: string;
  biography: string;
  personality: string;
  conversationStyle: string;
  poses: SeedAiModelPose[];
};

export const SEED_AI_MODELS: Record<SeedAiModelId, SeedAiModelCatalogEntry> = {
  "model-01-corporate": {
    id: "model-01-corporate",
    folder: "assets/images/ai-models/model-01-corporate",
    label: "Corporate professional",
    biography:
      "A polished city professional visual set for a career-focused demo profile with office, skyline, and cafe poses.",
    personality:
      "Composed, warm, ambitious, and thoughtful. Best for grounded long-term conversations about work, travel, food, and values.",
    conversationStyle:
      "Practical, curious, and direct without rushing intimacy.",
    poses: [
      {
        id: "pose-01-office-window",
        label: "Office window portrait",
        filename: "pose-01-office-window.webp",
        image: require("@/assets/images/ai-models/model-01-corporate/pose-01-office-window.webp"),
      },
      {
        id: "pose-02-skyline-blazer",
        label: "Skyline blazer portrait",
        filename: "pose-02-skyline-blazer.webp",
        image: require("@/assets/images/ai-models/model-01-corporate/pose-02-skyline-blazer.webp"),
      },
      {
        id: "pose-03-pastel-suit",
        label: "Pastel suit portrait",
        filename: "pose-03-pastel-suit.webp",
        image: require("@/assets/images/ai-models/model-01-corporate/pose-03-pastel-suit.webp"),
      },
      {
        id: "pose-04-white-suit",
        label: "White suit portrait",
        filename: "pose-04-white-suit.webp",
        image: require("@/assets/images/ai-models/model-01-corporate/pose-04-white-suit.webp"),
      },
      {
        id: "pose-05-cafe-white-blouse",
        label: "Cafe white blouse portrait",
        filename: "pose-05-cafe-white-blouse.webp",
        image: require("@/assets/images/ai-models/model-01-corporate/pose-05-cafe-white-blouse.webp"),
      },
    ],
  },
  "model-02-beach": {
    id: "model-02-beach",
    folder: "assets/images/ai-models/model-02-beach",
    label: "Beach lifestyle",
    biography:
      "A relaxed beach and island lifestyle visual set for outdoor, travel, and coastal demo profile scenes.",
    personality:
      "Relaxed, sunny, curious, and playful. Best for light but respectful conversations about travel, weekends, and local food.",
    conversationStyle:
      "Warm, casual, and easygoing while keeping boundaries clear.",
    poses: [
      {
        id: "pose-01-sunlit-shore",
        label: "Sunlit shore pose",
        filename: "pose-01-sunlit-shore.webp",
        image: require("@/assets/images/ai-models/model-02-beach/pose-01-sunlit-shore.webp"),
      },
      {
        id: "pose-02-beach-recline",
        label: "Beach recline pose",
        filename: "pose-02-beach-recline.webp",
        image: require("@/assets/images/ai-models/model-02-beach/pose-02-beach-recline.webp"),
      },
    ],
  },
  "model-03-evening": {
    id: "model-03-evening",
    folder: "assets/images/ai-models/model-03-evening",
    label: "Evening formal",
    biography:
      "A refined formal and eveningwear visual set for a calm, mature, and premium demo profile presence.",
    personality:
      "Elegant, steady, sincere, and observant. Best for careful long-term conversations about values and shared plans.",
    conversationStyle:
      "Confident, thoughtful, and measured.",
    poses: [
      {
        id: "pose-01-gray-gown",
        label: "Gray gown portrait",
        filename: "pose-01-gray-gown.webp",
        image: require("@/assets/images/ai-models/model-03-evening/pose-01-gray-gown.webp"),
      },
      {
        id: "pose-02-portrait-black-dress",
        label: "Black dress portrait",
        filename: "pose-02-portrait-black-dress.webp",
        image: require("@/assets/images/ai-models/model-03-evening/pose-02-portrait-black-dress.webp"),
      },
      {
        id: "pose-03-black-gown",
        label: "Black gown pose",
        filename: "pose-03-black-gown.webp",
        image: require("@/assets/images/ai-models/model-03-evening/pose-03-black-gown.webp"),
      },
      {
        id: "pose-04-lounge-dress",
        label: "Lounge dress pose",
        filename: "pose-04-lounge-dress.webp",
        image: require("@/assets/images/ai-models/model-03-evening/pose-04-lounge-dress.webp"),
      },
    ],
  },
  "model-04-business": {
    id: "model-04-business",
    folder: "assets/images/ai-models/model-04-business",
    label: "Business interior",
    biography:
      "A single business interior portrait for an entrepreneur or owner demo profile.",
    personality:
      "Driven, direct, polished, and intentional. Best for conversations about goals, routines, and serious plans.",
    conversationStyle:
      "Clear, practical, and respectful.",
    poses: [
      {
        id: "pose-01-blue-suit-interior",
        label: "Blue suit interior portrait",
        filename: "pose-01-blue-suit-interior.webp",
        image: require("@/assets/images/ai-models/model-04-business/pose-01-blue-suit-interior.webp"),
      },
    ],
  },
  "model-05-creative": {
    id: "model-05-creative",
    folder: "assets/images/ai-models/model-05-creative",
    label: "Creative professional",
    biography:
      "A warm creative-professional portrait for music, teaching, or arts-oriented demo profiles.",
    personality:
      "Expressive, kind, artistic, and reflective. Best for thoughtful conversations about music, books, and weekend plans.",
    conversationStyle:
      "Curious, gentle, and expressive.",
    poses: [
      {
        id: "pose-01-office-tablet",
        label: "Office tablet portrait",
        filename: "pose-01-office-tablet.webp",
        image: require("@/assets/images/ai-models/model-05-creative/pose-01-office-tablet.webp"),
      },
    ],
  },
  "model-06-garden": {
    id: "model-06-garden",
    folder: "assets/images/ai-models/model-06-garden",
    label: "Garden lifestyle",
    biography:
      "A soft garden portrait for travel, wellness, and calm outdoor demo profile themes.",
    personality:
      "Gentle, gracious, open-minded, and warm. Best for conversations about travel, food, family, and culture.",
    conversationStyle:
      "Warm, steady, and open.",
    poses: [
      {
        id: "pose-01-garden-dress",
        label: "Garden dress portrait",
        filename: "pose-01-garden-dress.webp",
        image: require("@/assets/images/ai-models/model-06-garden/pose-01-garden-dress.webp"),
      },
    ],
  },
  "model-07-urban": {
    id: "model-07-urban",
    folder: "assets/images/ai-models/model-07-urban",
    label: "Urban casual",
    biography:
      "A casual city portrait for grounded everyday-life demo profile concepts.",
    personality:
      "Practical, friendly, grounded, and sincere. Best for simple conversations about routines, food, and family.",
    conversationStyle:
      "Approachable, sincere, and unforced.",
    poses: [
      {
        id: "pose-01-street-casual",
        label: "Street casual portrait",
        filename: "pose-01-street-casual.webp",
        image: require("@/assets/images/ai-models/model-07-urban/pose-01-street-casual.webp"),
      },
    ],
  },
  "model-08-red-hair": {
    id: "model-08-red-hair",
    folder: "assets/images/ai-models/model-08-red-hair",
    label: "Red-haired social",
    biography:
      "A bold red-haired social and event visual set for expressive creative, tech, gaming, and modeling demo profiles.",
    personality:
      "Expressive, witty, energetic, and creative. Best for playful but respectful conversations about events, games, pets, and projects.",
    conversationStyle:
      "Energetic, witty, and lightly playful.",
    poses: [
      {
        id: "pose-01-closeup-wink",
        label: "Closeup wink portrait",
        filename: "pose-01-closeup-wink.webp",
        image: require("@/assets/images/ai-models/model-08-red-hair/pose-01-closeup-wink.webp"),
      },
      {
        id: "pose-02-arcade-jersey",
        label: "Arcade jersey pose",
        filename: "pose-02-arcade-jersey.webp",
        image: require("@/assets/images/ai-models/model-08-red-hair/pose-02-arcade-jersey.webp"),
      },
      {
        id: "pose-03-celebration-outfit",
        label: "Celebration outfit pose",
        filename: "pose-03-celebration-outfit.webp",
        image: require("@/assets/images/ai-models/model-08-red-hair/pose-03-celebration-outfit.webp"),
      },
      {
        id: "pose-04-pink-studio",
        label: "Pink studio pose",
        filename: "pose-04-pink-studio.webp",
        image: require("@/assets/images/ai-models/model-08-red-hair/pose-04-pink-studio.webp"),
      },
      {
        id: "pose-05-red-outfit",
        label: "Red outfit pose",
        filename: "pose-05-red-outfit.webp",
        image: require("@/assets/images/ai-models/model-08-red-hair/pose-05-red-outfit.webp"),
      },
    ],
  },
};

export function getSeedAiModel(id: SeedAiModelId): SeedAiModelCatalogEntry {
  return SEED_AI_MODELS[id];
}

export function getSeedAiModelPose(
  modelId: SeedAiModelId,
  poseId: string,
): SeedAiModelPose {
  const model = getSeedAiModel(modelId);
  return model.poses.find((pose) => pose.id === poseId) ?? model.poses[0];
}

export function getSeedAiModelGallery(
  modelId: SeedAiModelId,
): ImageSourcePropType[] {
  return getSeedAiModel(modelId).poses.map((pose) => pose.image);
}
