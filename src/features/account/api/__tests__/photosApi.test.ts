import { supabase } from "@/src/config/supabase";
import { deleteProfilePhoto, uploadProfilePhoto } from "@/src/features/profile/api/profileApi";
import { removeProfilePhoto, saveProfilePhoto } from "../photosApi";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock("@/src/features/profile/api/profileApi", () => ({
  deleteProfilePhoto: jest.fn(),
  uploadProfilePhoto: jest.fn(),
}));

function mockProfilesTable(existingPhotos: unknown, updateError: unknown = null) {
  const single = jest.fn().mockResolvedValue({
    data: { photos: existingPhotos },
    error: null,
  });
  const selectEq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq: selectEq }));
  const updateEq = jest.fn().mockResolvedValue({ error: updateError });
  const update = jest.fn(() => ({ eq: updateEq }));

  (supabase.from as jest.Mock).mockReturnValue({ select, update });

  return { select, selectEq, single, update, updateEq };
}

describe("photosApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
  });

  it("uploads a trimmed photo URI and keeps a deduped six-photo profile list", async () => {
    const uploadedUrl = "https://cdn.example/profile-photos/user-123/new.jpg";
    const oldPhoto = "https://cdn.example/profile-photos/user-123/old.jpg";
    const { update, updateEq } = mockProfilesTable([
      uploadedUrl,
      oldPhoto,
      " ",
      "https://cdn.example/profile-photos/user-123/third.jpg",
      "https://cdn.example/profile-photos/other-user/leaked.jpg",
      "https://cdn.example/profile-photos/user-123/fourth.jpg",
      "https://cdn.example/profile-photos/user-123/fifth.jpg",
      "https://cdn.example/profile-photos/user-123/sixth.jpg",
    ]);
    (uploadProfilePhoto as jest.Mock).mockResolvedValue({
      success: true,
      url: uploadedUrl,
    });

    const result = await saveProfilePhoto(" file:///tmp/new.jpg ");

    expect(uploadProfilePhoto).toHaveBeenCalledWith("file:///tmp/new.jpg", "user-123");
    expect(result.data.photos).toHaveLength(6);
    expect(result.data.photos[0]).toBe(uploadedUrl);
    expect(result.data.photos[1]).toBe(oldPhoto);
    expect(result.data.photos).not.toContain(
      "https://cdn.example/profile-photos/other-user/leaked.jpg",
    );
    expect(update).toHaveBeenCalledWith({
      photos: result.data.photos,
      photos_completed: true,
    });
    expect(updateEq).toHaveBeenCalledWith("id", "user-123");
  });

  it("rejects blank upload URIs before upload or profile update", async () => {
    await expect(saveProfilePhoto("   ")).rejects.toThrow(
      "Choose a profile photo and try again.",
    );

    expect(uploadProfilePhoto).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("does not delete storage when the requested photo is not on the signed-in profile", async () => {
    const ownedPhoto = "https://cdn.example/profile-photos/user-123/owned.jpg";
    const unownedPhoto = "https://cdn.example/profile-photos/other-user/photo.jpg";
    mockProfilesTable([ownedPhoto]);

    const result = await removeProfilePhoto(unownedPhoto);

    expect(result).toEqual({ ok: true, data: [ownedPhoto] });
    expect(deleteProfilePhoto).not.toHaveBeenCalled();
  });

  it("deletes an owned profile-photo object before removing it from the profile list", async () => {
    const ownedPhoto = "https://cdn.example/profile-photos/user-123/owned.jpg";
    const remainingPhoto = "https://cdn.example/profile-photos/user-123/remaining.jpg";
    const leakedPhoto = "https://cdn.example/profile-photos/other-user/leaked.jpg";
    const { update, updateEq } = mockProfilesTable([
      ownedPhoto,
      leakedPhoto,
      remainingPhoto,
    ]);
    (deleteProfilePhoto as jest.Mock).mockResolvedValue({ success: true });

    const result = await removeProfilePhoto(` ${ownedPhoto} `);

    expect(deleteProfilePhoto).toHaveBeenCalledWith(ownedPhoto);
    expect(result).toEqual({ ok: true, data: [remainingPhoto] });
    expect(update).toHaveBeenCalledWith({
      photos: [remainingPhoto],
      photos_completed: true,
    });
    expect(updateEq).toHaveBeenCalledWith("id", "user-123");
  });
});
