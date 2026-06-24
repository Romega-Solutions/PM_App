jest.mock("react-native", () => ({
  ActivityIndicator: "ActivityIndicator",
  Platform: { OS: "ios" },
  ScrollView: "ScrollView",
  StatusBar: "StatusBar",
  StyleSheet: {
    absoluteFill: {},
    create: (styles: unknown) => styles,
  },
  Text: "Text",
  TouchableOpacity: "TouchableOpacity",
  View: "View",
}));

// NativeWind mock removed

jest.mock("lucide-react-native", () => ({
  Settings: "Settings",
}));

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock("@/src/features/account/api/accountApi", () => ({
  accountApi: {
    clearBasicInfo: jest.fn(),
    clearLocation: jest.fn(),
    clearPreferences: jest.fn(),
    clearVerification: jest.fn(),
  },
}));

jest.mock("@/src/stores/profileStore", () => ({
  useProfileStore: () => ({
    setProfile: jest.fn(),
    clearProfile: jest.fn(),
  }),
}));

jest.mock("@/src/features/profile/components/ProfileHeader", () => ({
  ProfileHeader: "ProfileHeader",
}));

jest.mock("@/src/features/profile/components/ProfileMenuList", () => ({
  ProfileMenuList: "ProfileMenuList",
  getDefaultMenuItems: jest.fn(() => []),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createProfileData } = require("../ProfileScreen");

describe("createProfileData", () => {
  it("does not invent profile identity, age, location, or verification state", () => {
    const profile = createProfileData({
      id: "user-123",
      first_name: null,
      last_name: "",
      age: null,
      user_type: null,
      location_name: "",
      photos: null,
      is_verified: null,
    });

    expect(profile).toEqual({
      firstName: null,
      lastName: null,
      age: null,
      userType: null,
      location: null,
      photoUri: null,
      isVerified: false,
    });
  });

  it("keeps only a real first profile photo URL", () => {
    const profile = createProfileData({
      id: "user-123",
      first_name: "Maria",
      last_name: "Santos",
      age: 28,
      user_type: "filipina",
      location_name: "Cebu, Philippines",
      photos: ["", "https://example.com/photo.jpg"],
      is_verified: true,
    });

    expect(profile.photoUri).toBe("https://example.com/photo.jpg");
  });
});
