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

  describe("links that carry tokens instead of a PKCE code", () => {
    beforeEach(() => {
      // The old handler waited 2 seconds before acting on token links, so
      // these tests advance the clock past that to prove nothing happens later.
      jest.useFakeTimers();
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        data: { session },
        error: null,
      });
    });

    const tokenLinks = [
      [
        "hash",
        "pinaymate://verification-success#access_token=attacker-access&refresh_token=attacker-refresh&type=signup",
      ],
      [
        "query",
        "pinaymate://verification-success?access_token=attacker-access&refresh_token=attacker-refresh&type=signup",
      ],
      [
        "recovery hash",
        "pinaymate://reset-password#access_token=attacker-access&refresh_token=attacker-refresh&type=recovery",
      ],
      [
        "legacy token and type",
        "pinaymate://verification-success?token=legacy-token&type=signup",
      ],
    ] as const;

    it.each(tokenLinks)(
      "does not sign in from a %s link",
      async (_name, link) => {
        const consoleError = jest
          .spyOn(console, "error")
          .mockImplementation(() => undefined);
        (Linking.getInitialURL as jest.Mock).mockResolvedValue(link);

        setupDeepLinking();
        await flushDeepLinkWork();
        await jest.advanceTimersByTimeAsync(3000);

        expect(supabase.auth.setSession).not.toHaveBeenCalled();
        expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
        expect(ensureUserProfile).not.toHaveBeenCalled();
        expect(router.replace).not.toHaveBeenCalled();
        expect(JSON.stringify(consoleError.mock.calls)).not.toMatch(
          /attacker|legacy-token/,
        );

        consoleError.mockRestore();
      },
    );

    it("does not sign in from a link event while the app is running", async () => {
      (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);

      setupDeepLinking();
      const onUrl = (Linking.addEventListener as jest.Mock).mock.calls[0][1];
      onUrl({
        url: "pinaymate://verification-success#access_token=attacker-access&refresh_token=attacker-refresh",
      });
      await flushDeepLinkWork();
      await jest.advanceTimersByTimeAsync(3000);

      expect(supabase.auth.setSession).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });
});
