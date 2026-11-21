import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { supabase } from "@/src/config/supabase";
import {
  deleteProfilePhoto,
  getCurrentUserProfile,
  updateProfilePhotos,
  updateUserProfile,
  uploadProfilePhoto,
} from "../profileApi";
import { clearProfilePhotoUrlCache } from "../profilePhotoUrls";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock("expo-file-system/legacy", () => ({
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
}));

jest.mock("base64-arraybuffer", () => ({
  decode: jest.fn(),
}));

describe("profileApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearProfilePhotoUrlCache();
    jest.useFakeTimers().setSystemTime(new Date("2026-06-10T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("updateUserProfile", () => {
    it("strips server-owned verification fields before updating profiles", async () => {
      const eq = jest.fn().mockResolvedValue({ error: null });
      const update = jest.fn().mockReturnValue({ eq });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      (supabase.from as jest.Mock).mockReturnValue({ update });

      const result = await updateUserProfile({
        first_name: "Maria",
        location_name: "Manila",
        is_verified: true,
        verification_status: "approved",
        verified_at: "2026-06-10T00:00:00.000Z",
      } as unknown as Parameters<typeof updateUserProfile>[0]);

      expect(result).toEqual({ success: true });
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(update).toHaveBeenCalledWith({
        first_name: "Maria",
        location_name: "Manila",
        updated_at: "2026-06-10T00:00:00.000Z",
      });
      expect(eq).toHaveBeenCalledWith("id", "user-123");
    });

    it("returns an auth error before updating when no user is signed in", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await updateUserProfile({ first_name: "Maria" });

      expect(result).toEqual({
        success: false,
        error: "Please sign in to update your profile.",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe("profile photo storage", () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const storedPath =
      "11111111-1111-4111-8111-111111111111/1781049600000-22222222-2222-4222-8222-222222222222.jpg";
    const signedUrl = `https://project.supabase.co/storage/v1/object/sign/profile-photos/${storedPath}?token=abc`;
    const publicUrl = `https://project.supabase.co/storage/v1/object/public/profile-photos/${storedPath}`;

    function mockSigning() {
      const createSignedUrls = jest.fn(async (paths: string[]) => ({
        data: paths.map((path) => ({
          path,
          signedUrl: `https://project.supabase.co/storage/v1/object/sign/profile-photos/${path}?token=abc`,
          error: null,
        })),
        error: null,
      }));
      (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrls });
      return createSignedUrls;
    }

    beforeEach(() => {
      (Platform as { OS: string }).OS = "ios";
    });

    it("sends native photos to the ingest function and returns the stored path plus a 1-hour signed URL", async () => {
      const createSignedUrls = mockSigning();
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { path: storedPath, contentType: "image/jpeg" },
        error: null,
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 1024,
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue("base64-image");
      (decode as jest.Mock).mockReturnValue("decoded-image");

      const result = await uploadProfilePhoto(" file:///photo.jpeg ", userId);

      expect(result).toEqual({ success: true, path: storedPath, url: signedUrl });
      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith("file:///photo.jpeg");
      expect(supabase.functions.invoke).toHaveBeenCalledWith("profile-photo-ingest", {
        body: "decoded-image",
        headers: { "Content-Type": "image/jpeg" },
      });
      expect(createSignedUrls).toHaveBeenCalledWith([storedPath], 3600);
    });

    it("sends web blobs with the blob MIME type when the URI has no extension", async () => {
      (Platform as { OS: string }).OS = "web";
      mockSigning();
      const blob = new Blob(["image"], { type: "image/png" });
      const pngPath = storedPath.replace(".jpg", ".png");
      (global as typeof globalThis & { fetch: jest.Mock }).fetch = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          blob: jest.fn().mockResolvedValue(blob),
        });
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { path: pngPath },
        error: null,
      });

      const result = await uploadProfilePhoto(
        "blob:https://app.pinaymate.com/photo",
        userId,
      );

      expect(result.success).toBe(true);
      expect(result.path).toBe(pngPath);
      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).toHaveBeenCalledWith("profile-photo-ingest", {
        body: blob,
        headers: { "Content-Type": "image/png" },
      });
    });

    it("shows the size/type message when the server rejects the photo", async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { name: "FunctionsHttpError", context: { status: 415 } },
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 1024 });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue("base64-image");

      const result = await uploadProfilePhoto("file:///photo.jpg", userId);

      expect(result).toEqual({
        success: false,
        error: "Photo was not accepted. Use a JPEG, PNG, WebP or HEIC photo under 10 MB.",
      });
    });

    it("rejects a path from the server outside the member's folder", async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { path: storedPath.replace(userId, "33333333-3333-4333-8333-333333333333") },
        error: null,
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 1024 });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue("base64-image");

      const result = await uploadProfilePhoto("file:///photo.jpg", userId);

      expect(result.success).toBe(false);
    });

    it("rejects profile photo upload before reading when user ID is not scoped", async () => {
      const result = await uploadProfilePhoto("file:///photo.jpg", "not-a-user-id");

      expect(result).toEqual({
        success: false,
        error: "Photo upload failed. Check your connection and try again.",
      });
      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it("stores storage paths for signed, public and bare photo values", async () => {
      const eq = jest.fn().mockResolvedValue({ error: null });
      const update = jest.fn().mockReturnValue({ eq });
      const second =
        "11111111-1111-4111-8111-111111111111/1781049600001-44444444-2222-4222-8222-222222222222.webp";

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue({ update });

      const result = await updateProfilePhotos([` ${signedUrl} `, publicUrl, second]);

      expect(result).toEqual({ success: true });
      expect(update).toHaveBeenCalledWith({
        photos: [storedPath, second],
        photos_completed: true,
      });
      expect(eq).toHaveBeenCalledWith("id", userId);
    });

    it("rejects cross-user profile photo arrays before profile update", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });

      const result = await updateProfilePhotos([
        "https://project.supabase.co/storage/v1/object/public/profile-photos/33333333-3333-4333-8333-333333333333/1717977600000-22222222-2222-4222-8222-222222222222.jpg",
      ]);

      expect(result).toEqual({
        success: false,
        error: "Profile photos did not save. Check your connection and try again.",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("signs stored photos when loading the current profile", async () => {
      mockSigning();
      const single = jest.fn().mockResolvedValue({
        data: { id: userId, photos: [storedPath, "https://images.example/demo.jpg"] },
        error: null,
      });
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: userId } } });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single })) })),
      });

      const profile = await getCurrentUserProfile();

      expect(profile?.photos).toEqual([signedUrl, "https://images.example/demo.jpg"]);
    });

    it("deletes only normalized profile-photo storage paths", async () => {
      const remove = jest.fn().mockResolvedValue({ error: null });
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      (supabase.storage.from as jest.Mock).mockReturnValue({ remove });

      for (const value of [`${publicUrl}?download=1`, signedUrl, storedPath]) {
        const result = await deleteProfilePhoto(value);
        expect(result).toEqual({ success: true });
      }

      expect(remove).toHaveBeenCalledTimes(3);
      expect(remove).toHaveBeenNthCalledWith(1, [storedPath]);
      expect(remove).toHaveBeenNthCalledWith(2, [storedPath]);
      expect(remove).toHaveBeenNthCalledWith(3, [storedPath]);
    });

    it("rejects profile photo delete paths outside the current user folder", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });

      const result = await deleteProfilePhoto(
        "https://project.supabase.co/storage/v1/object/public/profile-photos/33333333-3333-4333-8333-333333333333/1717977600000-22222222-2222-4222-8222-222222222222.jpg",
      );

      expect(result).toEqual({
        success: false,
        error: "Photo could not be removed. Check your connection and try again.",
      });
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it("rejects traversal-like profile photo delete paths before storage", async () => {
      const result = await deleteProfilePhoto(
        "https://project.supabase.co/storage/v1/object/public/profile-photos/11111111-1111-4111-8111-111111111111/../other.jpg",
      );

      expect(result).toEqual({
        success: false,
        error: "Photo could not be removed. Check your connection and try again.",
      });
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });
  });
});
