import { getSeedProfilesInOrder } from "@/src/features/matching/data/seedProfiles";
import type { ConversationWithUser, Message } from "../types/messaging.types";

export const DEMO_CURRENT_USER_ID = "00000000-0000-4000-8000-000000000001";

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

function getSeedConversationIndex(id: string): number | null {
  if (!isSeedConversationId(id)) return null;

  const index = Number.parseInt(id.replace("seed-conv-", ""), 10) - 1;
  return Number.isInteger(index) &&
    index >= 0 &&
    index < SEED_MESSAGE_FIXTURES.length
    ? index
    : null;
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

export function getSeedMessages(
  conversationId: string,
  currentUserId = DEMO_CURRENT_USER_ID,
  recipientId?: string,
): Message[] {
  const index = getSeedConversationIndex(conversationId);

  if (index === null) {
    return [];
  }

  const fixture = SEED_MESSAGE_FIXTURES[index];
  const otherUserId = recipientId || DEMO_USER_IDS[index];
  const senderId = currentUserId || DEMO_CURRENT_USER_ID;
  const messageTimes = [
    minutesAgoIso(fixture.minutesAgo + 42),
    minutesAgoIso(fixture.minutesAgo + 26),
    minutesAgoIso(fixture.minutesAgo + 12),
    minutesAgoIso(fixture.minutesAgo),
  ];
  const seedReplies = [
    "Hi, thanks for matching with me. Your profile caught my attention.",
    "That is kind of you to say. I like conversations that feel easy and thoughtful.",
    "Same here. I am curious what a relaxed weekend looks like for you.",
  ];

  return [
    {
      id: `${conversationId}-message-01`,
      conversation_id: conversationId,
      sender_id: otherUserId,
      recipient_id: senderId,
      text: seedReplies[0],
      type: "text",
      status: "delivered",
      is_deleted: false,
      created_at: messageTimes[0],
      updated_at: messageTimes[0],
    },
    {
      id: `${conversationId}-message-02`,
      conversation_id: conversationId,
      sender_id: senderId,
      recipient_id: otherUserId,
      text: seedReplies[1],
      type: "text",
      status: "read",
      is_deleted: false,
      read_at: messageTimes[2],
      created_at: messageTimes[1],
      updated_at: messageTimes[1],
    },
    {
      id: `${conversationId}-message-03`,
      conversation_id: conversationId,
      sender_id: senderId,
      recipient_id: otherUserId,
      text: seedReplies[2],
      type: "text",
      status: "read",
      is_deleted: false,
      read_at: messageTimes[3],
      created_at: messageTimes[2],
      updated_at: messageTimes[2],
    },
    {
      id: `${conversationId}-message-04`,
      conversation_id: conversationId,
      sender_id: otherUserId,
      recipient_id: senderId,
      text: fixture.text,
      type: "text",
      status: fixture.unread > 0 ? "delivered" : "read",
      is_deleted: false,
      read_at: fixture.unread > 0 ? undefined : messageTimes[3],
      created_at: messageTimes[3],
      updated_at: messageTimes[3],
    },
  ];
}

export function createSeedOutgoingMessage({
  conversationId,
  currentUserId = DEMO_CURRENT_USER_ID,
  recipientId,
  text,
}: {
  conversationId: string;
  currentUserId?: string;
  recipientId: string;
  text: string;
}): Message {
  const timestamp = new Date().toISOString();

  return {
    id: `${conversationId}-local-${Date.now()}`,
    conversation_id: conversationId,
    sender_id: currentUserId || DEMO_CURRENT_USER_ID,
    recipient_id: recipientId,
    text,
    type: "text",
    status: "sent",
    is_deleted: false,
    delivery_method: "demo-local",
    created_at: timestamp,
    updated_at: timestamp,
  };
}
