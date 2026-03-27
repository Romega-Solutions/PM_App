/\*\*

- PinayMate - Dating App for Filipinas & Foreign Men
-
- BUSINESS RULES (MVP):
- - Filipinas (women) can create accounts
- - Foreign men can create accounts
- - Filipinas match with Foreign men (and vice versa)
-
- FUTURE: Can expand to include Filipino men, foreign women, etc.
  \*/

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserType = 'filipina' | 'foreigner';
export type Gender = 'female' | 'male';

export type SignUpPayload = {
email: string;
password: string;
userType: UserType;
firstName: string;
};

export type BasicInfoPayload = {
userType: UserType; // NEW: Critical for matching logic
firstName: string;
lastName: string;
age: number;
gender: Gender;
nationality?: string; // Optional: For foreigners (e.g., "American", "British")
createdAt?: string;
};

export type PreferencesPayload = {
interestedIn: Gender; // For MVP: filipinas → male, foreigners → female
ageMin: number;
ageMax: number;
maxDistanceKm: number;
relationshipGoal: 'long_term' | 'marriage' | 'casual' | 'friendship' | 'not_sure';
createdAt?: string;
};

// ============================================================================
// BUSINESS LOGIC VALIDATION
// ============================================================================

export const PINAYMATE_RULES = {
filipina: {
requiredGender: 'female' as Gender,
canMatchWith: 'foreigner' as UserType,
defaultInterestedIn: 'male' as Gender,
description: 'Filipina women seeking foreign partners'
},
foreigner: {
requiredGender: 'male' as Gender,
canMatchWith: 'filipina' as UserType,
defaultInterestedIn: 'female' as Gender,
description: 'Foreign men seeking Filipina partners'
}
} as const;

/\*\*

- Validates if user type and gender combination is allowed
  \*/
  export function validateUserTypeGender(
  userType: UserType,
  gender: Gender
  ): { valid: boolean; error?: string } {
  const rule = PINAYMATE_RULES[userType];

if (gender !== rule.requiredGender) {
return {
valid: false,
error: `${userType === 'filipina' ? 'Filipinas' : 'Foreigners'} must select ${rule.requiredGender} gender`
};
}

return { valid: true };
}

/\*\*

- Gets default preferences based on user type
  \*/
  export function getDefaultPreferences(userType: UserType): Partial<PreferencesPayload> {
  const rule = PINAYMATE_RULES[userType];

return {
interestedIn: rule.defaultInterestedIn,
ageMin: 18,
ageMax: 99,
maxDistanceKm: 100,
relationshipGoal: 'not_sure'
};
}

// ============================================================================
// SIGNUP FLOW
// ============================================================================

/\*\*

- STEP 1: User Type Selection (before signup form)
- - Simple screen with two clear options
- - Shows what each option means
    \*/
    export const userTypeOptions = [
    {
    type: 'filipina' as UserType,
    title: 'I am a Filipina',
    subtitle: 'Connect with foreign men',
    icon: '🇵🇭',
    },
    {
    type: 'foreigner' as UserType,
    title: 'I am a Foreign Man',
    subtitle: 'Meet beautiful Filipinas',
    icon: '🌍',
    }
    ];

/\*\*

- STEP 2: Email Signup
- - Email, Password, First Name
- - UserType is already selected from Step 1
    \*/

/\*\*

- STEP 3: Email Verification
- - Verify email address
    \*/

/\*\*

- STEP 4: Profile Setup Flow (after email verified)
- a) Basic Info
- b) Profile Photos (minimum 2-3)
- c) Location
- d) Preferences (auto-populated based on userType)
- e) Verification (ID check)
  \*/

// ============================================================================
// PROFILE SETUP SCREENS
// ============================================================================

/\*\*

- Screen 4a: Basic Info
- Fields shown based on userType:
  \*/
  export function getBasicInfoFields(userType: UserType) {
  const commonFields = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'age', label: 'Age', required: true, min: 18, max: 99 },
  ];

if (userType === 'filipina') {
return [
...commonFields,
{
name: 'gender',
label: 'Gender',
required: true,
fixed: 'female',
note: 'Auto-selected based on account type'
}
];
} else {
return [
...commonFields,
{
name: 'gender',
label: 'Gender',
required: true,
fixed: 'male',
note: 'Auto-selected based on account type'
},
{
name: 'nationality',
label: 'Nationality',
required: true,
placeholder: 'e.g., American, British, Australian'
}
];
}
}

/\*\*

- Screen 4d: Preferences
- Auto-populated intelligently:
  \*/
  export function getPreferencesDefaults(userType: UserType): PreferencesPayload {
  const rule = PINAYMATE_RULES[userType];

return {
interestedIn: rule.defaultInterestedIn, // Fixed, not editable in MVP
ageMin: 18,
ageMax: userType === 'filipina' ? 65 : 45, // Smart defaults
maxDistanceKm: 100,
relationshipGoal: 'not_sure'
};
}

// ============================================================================
// MATCHING LOGIC
// ============================================================================

/\*\*

- Determines if two users can match
  \*/
  export function canUsersMatch(
  user1: Pick<BasicInfoPayload, 'userType' | 'gender'>,
  user2: Pick<BasicInfoPayload, 'userType' | 'gender'>
  ): boolean {
  // Filipina (female) ↔ Foreigner (male)
  const isValidPair =
  (user1.userType === 'filipina' && user2.userType === 'foreigner') ||
  (user1.userType === 'foreigner' && user2.userType === 'filipina');

const hasCorrectGenders =
(user1.gender === 'female' && user2.gender === 'male') ||
(user1.gender === 'male' && user2.gender === 'female');

return isValidPair && hasCorrectGenders;
}

// ============================================================================
// UPDATED AUTH API
// ============================================================================

export const authApi = {
signUp: async (
email: string,
password: string,
metadata: { firstName: string; userType: UserType }
) => {
console.log("Sign up:", { email, userType: metadata.userType });

    // Validate required fields
    if (!metadata.userType || !['filipina', 'foreigner'].includes(metadata.userType)) {
      throw new Error('Invalid user type');
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
      user: { email, metadata },
      needsVerification: true,
      message: "Verification email sent",
    };

},

signIn: async (email: string, password: string) => {
console.log("Sign in:", email);
await new Promise((resolve) => setTimeout(resolve, 1000));
return { user: { email }, session: { access_token: "mock-token" } };
},

signOut: async () => {
throw new Error("Sign out not implemented yet");
},
};

// ============================================================================
// UPDATED ACCOUNT API
// ============================================================================

let basicInfoStore: BasicInfoPayload | null = null;
let preferencesStore: PreferencesPayload | null = null;

export const accountApi = {
// Save basic info with validation
saveBasicInfo: async (
payload: BasicInfoPayload
): Promise<{ ok: true; data: BasicInfoPayload }> => {
// Validate userType + gender combination
const validation = validateUserTypeGender(payload.userType, payload.gender);
if (!validation.valid) {
throw new Error(validation.error);
}

    await new Promise((r) => setTimeout(r, 700));
    const record = { ...payload, createdAt: new Date().toISOString() };
    basicInfoStore = record;
    return { ok: true, data: record };

},

getBasicInfo: async (): Promise<BasicInfoPayload | null> => {
await new Promise((r) => setTimeout(r, 250));
return basicInfoStore;
},

// Save preferences with smart defaults
savePreferences: async (
payload: PreferencesPayload,
userType: UserType
): Promise<{ ok: true; data: PreferencesPayload }> => {
// Ensure interestedIn matches user type rules
const rule = PINAYMATE_RULES[userType];
const validatedPayload = {
...payload,
interestedIn: rule.defaultInterestedIn, // Force correct gender
};

    await new Promise((r) => setTimeout(r, 500));
    const record = { ...validatedPayload, createdAt: new Date().toISOString() };
    preferencesStore = record;
    return { ok: true, data: record };

},

getPreferences: async (): Promise<PreferencesPayload | null> => {
await new Promise((r) => setTimeout(r, 200));
return preferencesStore;
},
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/\*
// SIGNUP FLOW:

1. User selects "I am a Filipina" or "I am a Foreign Man"
   → userType is set

2. User fills signup form
   → email, password, firstName

3. Email verification
   → Navigate to /(auth)/verify-email

4. After verification, navigate to profile setup:
   → /(setup)/basic-info
   → /(setup)/photos
   → /(setup)/location
   → /(setup)/preferences (auto-filled based on userType)
   → /(setup)/verification

5. Profile complete → Navigate to /(main)

// MATCHING LOGIC:

- Filipinas see ONLY foreign men in their feed
- Foreign men see ONLY Filipinas in their feed
- Age, distance, and relationship goal preferences filter further

\*/
