import * as Linking from "expo-linking";
import { router } from "expo-router";
import { ensureUserProfile } from "@/src/features/profile/api/ensureUserProfile";
import { setupDeepLinking } from "../deepLinking";
import { supabase } from "../supabase";

jest.mock("expo-linking", () => ({
  addEventListener: jest.fn(),
  getInitialURL: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("@/src/features/profile/api/ensureUserProfile", () => ({
  ensureUserProfile: jest.fn(),
}));

jest.mock("../supabase", () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: jest.fn(),
      getSession: jest.fn(),
      setSession: jest.fn(),
    },
  },
}));

const session = {
  user: {
    id: "user-123",
    email: "maria@example.com",
    user_metadata: {
      first_name: "Maria",
      user_type: "filipina",
    },
  },
};

async function flushDeepLinkWork() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe("setupDeepLinking", () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    (Linking.addEventListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });
  });

  it("routes PKCE password recovery links to reset-password without onboarding", async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(
      "pinaymate://reset-password?code=recovery-code&type=recovery"
    );
    (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({
      data: { session },
      error: null,
    });

    setupDeepLinking();
    await flushDeepLinkWork();

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      "recovery-code"
    );
    expect(ensureUserProfile).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/(auth)/reset-password");
  });

  it("routes PKCE signup verification links through profile readiness", async () => {
    jest.useFakeTimers();
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(
      "pinaymate://verification-success?code=signup-code&type=signup"
    );
    (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({
      data: { session },
      error: null,
    });
    (ensureUserProfile as jest.Mock).mockResolvedValue(undefined);

    setupDeepLinking();
    await flushDeepLinkWork();

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      "signup-code"
    );
    expect(ensureUserProfile).toHaveBeenCalledWith({
      userId: "user-123",
      email: "maria@example.com",
      firstName: "Maria",
      userType: "filipina",
    });
    await jest.advanceTimersByTimeAsync(500);
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/(auth)/verification-success",
      params: {
        firstName: "Maria",
        userType: "filipina",
      },
    });
  });

  it("does not exchange a PKCE code again when Supabase already restored the session", async () => {
    jest.useFakeTimers();
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(
      "pinaymate://verification-success?code=already-used-code&type=signup"
    );
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session },
    });
    (ensureUserProfile as jest.Mock).mockResolvedValue(undefined);

    setupDeepLinking();
    await flushDeepLinkWork();

    expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(ensureUserProfile).toHaveBeenCalledWith({
      userId: "user-123",
      email: "maria@example.com",
      firstName: "Maria",
      userType: "filipina",
    });
    await jest.advanceTimersByTimeAsync(500);
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/(auth)/verification-success",
      params: {
        firstName: "Maria",
        userType: "filipina",
      },
    });
  });
});
