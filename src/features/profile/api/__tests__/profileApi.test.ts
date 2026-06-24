import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { supabase } from "@/src/config/supabase";
import {
  deleteProfilePhoto,
  updateProfilePhotos,
  updateUserProfile,
  uploadProfilePhoto,
} from "../profileApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
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

    beforeEach(() => {
      (Platform as { OS: string }).OS = "ios";
      jest.spyOn(crypto, "randomUUID").mockReturnValue(
        "22222222-2222-4222-8222-222222222222",
      );
    });

    it("uploads profile photos to a user-scoped path with validated type and size", async () => {
      const upload = jest.fn().mockResolvedValue({ error: null });
      const getPublicUrl = jest.fn(() => ({
        data: {
          publicUrl:
            "https://project.supabase.co/storage/v1/object/public/profile-photos/11111111-1111-4111-8111-111111111111/1781049600000-22222222-2222-4222-8222-222222222222.jpg",
        },
      }));
      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload,
        getPublicUrl,
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 1024,
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue("base64-image");
      (decode as jest.Mock).mockReturnValue("decoded-image");

      const result = await uploadProfilePhoto(" file:///photo.jpeg ", userId);

      expect(result.success).toBe(true);
      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith("file:///photo.jpeg");
      expect(upload).toHaveBeenCalledWith(
        "11111111-1111-4111-8111-111111111111/1781049600000-22222222-2222-4222-8222-222222222222.jpg",
        "decoded-image",
        {
          contentType: "image/jpeg",
          upsert: true,
        },
      );
    });

    it("uploads web blob profile photos using blob MIME type when the URI has no extension", async () => {
      (Platform as { OS: string }).OS = "web";
      const blob = new Blob(["image"], { type: "image/png" });
      const upload = jest.fn().mockResolvedValue({ error: null });
      const getPublicUrl = jest.fn(() => ({
        data: {
          publicUrl:
            "https://project.supabase.co/storage/v1/object/public/profile-photos/11111111-1111-4111-8111-111111111111/1781049600000-22222222-2222-4222-8222-222222222222.png",
        },
      }));
      (global as typeof globalThis & { fetch: jest.Mock }).fetch = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          blob: jest.fn().mockResolvedValue(blob),
        });
      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload,
        getPublicUrl,
      });

      const result = await uploadProfilePhoto(
        "blob:https://app.pinaymate.com/photo",
        userId,
      );

      expect(result.success).toBe(true);
      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
      expect(upload).toHaveBeenCalledWith(
        "11111111-1111-4111-8111-111111111111/1781049600000-22222222-2222-4222-8222-222222222222.png",
        blob,
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    });

    it("rejects profile photo upload before storage when user ID is not scoped", async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 1024,
      });

      const result = await uploadProfilePhoto("file:///photo.jpg", "not-a-user-id");

      expect(result).toEqual({
        success: false,
        error: "Photo upload failed. Check your connection and try again.",
      });
      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it("updates only current-user profile photo URLs", async () => {
      const eq = jest.fn().mockResolvedValue({ error: null });
      const update = jest.fn().mockReturnValue({ eq });
      const photoUrl =
        "https://project.supabase.co/storage/v1/object/public/profile-photos/11111111-1111-4111-8111-111111111111/1717977600000-22222222-2222-4222-8222-222222222222.jpg";

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue({ update });

      const result = await updateProfilePhotos([` ${photoUrl} `, photoUrl]);

      expect(result).toEqual({ success: true });
      expect(update).toHaveBeenCalledWith({
        photos: [photoUrl],
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

    it("deletes only normalized profile-photo storage paths", async () => {
      const remove = jest.fn().mockResolvedValue({ error: null });
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      (supabase.storage.from as jest.Mock).mockReturnValue({ remove });

      const result = await deleteProfilePhoto(
        "https://project.supabase.co/storage/v1/object/public/profile-photos/11111111-1111-4111-8111-111111111111/1717977600000-22222222-2222-4222-8222-222222222222.jpg?download=1",
      );

      expect(result).toEqual({ success: true });
      expect(remove).toHaveBeenCalledWith([
        "11111111-1111-4111-8111-111111111111/1717977600000-22222222-2222-4222-8222-222222222222.jpg",
      ]);
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
