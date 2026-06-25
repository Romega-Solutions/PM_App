import { getSeedProfilesInOrder } from "@/src/features/matching/data/seedProfiles";
import type { ImageSourcePropType } from "react-native";
import type { ConversationWithUser, Message } from "../types/messaging.types";

export const DEMO_CURRENT_USER_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_CLOCK_START_MS = Math.floor(Date.now() / 60000) * 60000;

const DEMO_USER_IDS = [
  "00000000-0000-4000-8000-000000000101",
  "00000000-0000-4000-8000-000000000102",
  "00000000-0000-4000-8000-000000000103",
  "00000000-0000-4000-8000-000000000104",
  "00000000-0000-4000-8000-000000000105",
  "00000000-0000-4000-8000-000000000106",
  "00000000-0000-4000-8000-000000000107",
  "00000000-0000-4000-8000-000000000108",
  "00000000-0000-4000-8000-000000000109",
  "00000000-0000-4000-8000-000000000110",
  "00000000-0000-4000-8000-000000000111",
  "00000000-0000-4000-8000-000000000112",
  "00000000-0000-4000-8000-000000000113",
  "00000000-0000-4000-8000-000000000114",
  "00000000-0000-4000-8000-000000000115",
  "00000000-0000-4000-8000-000000000116",
  "00000000-0000-4000-8000-000000000117",
  "00000000-0000-4000-8000-000000000118",
  "00000000-0000-4000-8000-000000000119",
  "00000000-0000-4000-8000-000000000120",
];

const SEED_MESSAGE_FIXTURES = [
  {
    profileIndex: 0,
    text: "Your note about honest plans stood out. What kind of weekend feels balanced to you?",
    unread: 3,
    minutesAgo: 4,
    active: true,
    replies: [
      "Hi, thanks for matching with me. Your profile felt calm and intentional.",
      "I appreciate that. I like conversations that feel clear without being rushed.",
      "Same here. I usually start with coffee, a real question, and no pressure.",
    ],
  },
  {
    profileIndex: 1,
    text: "Cebu sunsets are still my favorite. Are you more of a sunrise or sunset person?",
    unread: 2,
    minutesAgo: 12,
    active: true,
    replies: [
      "Hi, your beach photos made the whole profile feel relaxed.",
      "Thank you. I like easy conversations, especially when people are respectful.",
      "That sounds like my pace too. A slow weekend by the water is hard to beat.",
    ],
  },
  {
    profileIndex: 2,
    text: "A calm dinner and good conversation sounds perfect. What question do you always ask first?",
    unread: 1,
    minutesAgo: 28,
    active: true,
    replies: [
      "Hi Grace, your profile feels very thoughtful.",
      "That is kind of you. I prefer sincerity over big promises.",
      "Same. I think consistency says more than a perfect opening line.",
    ],
  },
  {
    profileIndex: 3,
    text: "I liked your point about ambition and emotional maturity. Both matter.",
    unread: 0,
    minutesAgo: 64,
    active: true,
    replies: [
      "Hi Samantha, your profile made business life sound grounded, not busy for show.",
      "I like that you noticed. I value people who know what they want.",
      "Me too. Clear plans and kindness make a strong combination.",
    ],
  },
  {
    profileIndex: 4,
    text: "Music and books is a strong combo. What song has been on repeat lately?",
    unread: 5,
    minutesAgo: 96,
    active: true,
    replies: [
      "Hi Kyla, your music note caught my attention.",
      "That makes me happy. I think playlists say a lot about someone.",
      "Then I should probably choose carefully before sharing mine.",
    ],
  },
  {
    profileIndex: 5,
    text: "I just landed from a trip and wanted to reply before I rest.",
    unread: 1,
    minutesAgo: 240,
    active: false,
    replies: [
      "Hi Francesca, your travel stories sound interesting.",
      "Travel is exciting, but I still like peaceful routines at home.",
      "That balance sounds healthy. I like people who know when to slow down.",
    ],
  },
  {
    profileIndex: 6,
    text: "Cooking for people you love is underrated. What dish are you proudest of?",
    unread: 0,
    minutesAgo: 420,
    active: false,
    replies: [
      "Hi Leah, your profile feels warm and steady.",
      "Thank you. I like simple things when they are done with care.",
      "That is a good way to put it. Simple does not have to mean boring.",
    ],
  },
  {
    profileIndex: 7,
    text: "Your cat-and-code combo made me laugh. What are you building lately?",
    unread: 2,
    minutesAgo: 620,
    active: true,
    replies: [
      "Hi Trisha, your profile has good energy.",
      "Thanks. I like people who can be playful and direct.",
      "That is a useful combination. I can do honest and a little nerdy.",
    ],
  },
] as const;

function minutesAgoIso(minutesAgo: number): string {
  return new Date(DEMO_CLOCK_START_MS - minutesAgo * 60 * 1000).toISOString();
}

function demoSequenceIso(sequence: number): string {
  return new Date(DEMO_CLOCK_START_MS + sequence * 1000).toISOString();
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
        demoPhotoSource: profile.image ?? undefined,
        is_active: fixture.active,
        last_active_at: timestamp,
      },
      unread_count: fixture.unread,
    };
  });
}

export function getSeedConversationForProfileId(
  profileId: string,
  currentUserId = DEMO_CURRENT_USER_ID,
): ConversationWithUser | null {
  const profileIndex = getSeedProfilesInOrder().findIndex(
    (profile) => profile.id === profileId,
  );

  if (profileIndex < 0) {
    return null;
  }

  const fixtureIndex = SEED_MESSAGE_FIXTURES.findIndex(
    (fixture) => fixture.profileIndex === profileIndex,
  );

  if (fixtureIndex < 0) {
    return null;
  }

  return getSeedConversations(currentUserId)[fixtureIndex] ?? null;
}

export function getSeedConversationPhotoSource(
  conversationId: string,
): ImageSourcePropType | null {
  const fixtureIndex = getSeedConversationIndex(conversationId);

  if (fixtureIndex === null) {
    return null;
  }

  const fixture = SEED_MESSAGE_FIXTURES[fixtureIndex];
  const profile = getSeedProfilesInOrder()[fixture.profileIndex];

  return profile?.image ?? null;
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
  const seedReplies = fixture.replies || [
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
  sequence = 1,
}: {
  conversationId: string;
  currentUserId?: string;
  recipientId: string;
  text: string;
  sequence?: number;
}): Message {
  const timestamp = demoSequenceIso(sequence);
  const sequenceId = String(sequence).padStart(2, "0");

  return {
    id: `${conversationId}-local-${sequenceId}`,
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

export function createSeedOutgoingImageMessage({
  conversationId,
  currentUserId = DEMO_CURRENT_USER_ID,
  recipientId,
  imageUrl,
  sequence = 1,
}: {
  conversationId: string;
  currentUserId?: string;
  recipientId: string;
  imageUrl: string;
  sequence?: number;
}): Message {
  const timestamp = demoSequenceIso(sequence);
  const sequenceId = String(sequence).padStart(2, "0");

  return {
    id: `${conversationId}-local-image-${sequenceId}`,
    conversation_id: conversationId,
    sender_id: currentUserId || DEMO_CURRENT_USER_ID,
    recipient_id: recipientId,
    text: "Photo",
    type: "image",
    image_url: imageUrl,
    status: "sent",
    is_deleted: false,
    delivery_method: "demo-local",
    created_at: timestamp,
    updated_at: timestamp,
  };
}
