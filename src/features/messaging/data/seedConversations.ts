import { getSeedProfilesInOrder } from "@/src/features/matching/data/seedProfiles";
import type { ConversationWithUser } from "../types/messaging.types";

const DEMO_CURRENT_USER_ID = "00000000-0000-4000-8000-000000000001";

const DEMO_USER_IDS = [
  "00000000-0000-4000-8000-000000000101",
  "00000000-0000-4000-8000-000000000102",
  "00000000-0000-4000-8000-000000000103",
  "00000000-0000-4000-8000-000000000104",
  "00000000-0000-4000-8000-000000000105",
  "00000000-0000-4000-8000-000000000106",
  "00000000-0000-4000-8000-000000000107",
  "00000000-0000-4000-8000-000000000108",
];

const SEED_MESSAGE_FIXTURES = [
  {
    profileIndex: 0,
    text: "Hi, I saw that you like travel too. Cebu sunsets are my favorite.",
    unread: 3,
    minutesAgo: 4,
    active: true,
  },
  {
    profileIndex: 2,
    text: "Coffee and books is a strong combo. What are you reading lately?",
    unread: 2,
    minutesAgo: 12,
    active: true,
  },
  {
    profileIndex: 4,
    text: "Your profile made me smile. Hope your week is going well.",
    unread: 1,
    minutesAgo: 28,
    active: true,
  },
  {
    profileIndex: 7,
    text: "I volunteer on weekends too. That caught my attention.",
    unread: 0,
    minutesAgo: 64,
    active: true,
  },
  {
    profileIndex: 10,
    text: "The beach is always a good plan. Do you prefer sunrise or sunset?",
    unread: 5,
    minutesAgo: 96,
    active: false,
  },
  {
    profileIndex: 11,
    text: "Meaningful conversations over dinner sounds perfect.",
    unread: 0,
    minutesAgo: 180,
    active: false,
  },
  {
    profileIndex: 13,
    text: "I just landed from a trip and wanted to reply before I rest.",
    unread: 1,
    minutesAgo: 240,
    active: true,
  },
  {
    profileIndex: 17,
    text: "Running then pastries is balance, right?",
    unread: 0,
    minutesAgo: 360,
    active: false,
  },
] as const;

function minutesAgoIso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

export function isSeedConversationId(id: string): boolean {
  return id.startsWith("seed-conv-");
}

export function getSeedConversations(
  currentUserId = DEMO_CURRENT_USER_ID,
): ConversationWithUser[] {
  const profiles = getSeedProfilesInOrder();

  return SEED_MESSAGE_FIXTURES.map((fixture, index) => {
    const profile = profiles[fixture.profileIndex];
    const otherUserId = DEMO_USER_IDS[index];
    const timestamp = minutesAgoIso(fixture.minutesAgo);

    return {
      id: `seed-conv-${String(index + 1).padStart(2, "0")}`,
      participant_1_id: currentUserId || DEMO_CURRENT_USER_ID,
      participant_2_id: otherUserId,
      last_message_id: `seed-message-${String(index + 1).padStart(2, "0")}`,
      last_message_text: fixture.text,
      last_message_sender_id: otherUserId,
      last_message_at: timestamp,
      participant_1_unread_count: fixture.unread,
      participant_2_unread_count: 0,
      created_at: timestamp,
      updated_at: timestamp,
      other_user: {
        id: otherUserId,
        first_name: profile.name,
        photos: [],
        is_active: fixture.active,
        last_active_at: timestamp,
      },
      unread_count: fixture.unread,
    };
  });
}
