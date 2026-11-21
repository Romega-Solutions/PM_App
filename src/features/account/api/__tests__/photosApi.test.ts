import { supabase } from "@/src/config/supabase";
import { deleteProfilePhoto, uploadProfilePhoto } from "@/src/features/profile/api/profileApi";
import { clearProfilePhotoUrlCache } from "@/src/features/profile/api/profilePhotoUrls";
import { getProfilePhotos, removeProfilePhoto, saveProfilePhoto } from "../photosApi";

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

jest.mock("@/src/features/profile/api/profileApi", () => ({
  deleteProfilePhoto: jest.fn(),
  uploadProfilePhoto: jest.fn(),
}));

const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "33333333-3333-4333-8333-333333333333";
const path = (owner: string, name: string) =>
  `${owner}/1781049600000-${name}-2222-4222-8222-222222222222.jpg`;
const publicUrl = (p: string) =>
  `https://project.supabase.co/storage/v1/object/public/profile-photos/${p}`;
const signedUrl = (p: string) =>
  `https://project.supabase.co/storage/v1/object/sign/profile-photos/${p}?token=t-${p.length}`;

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

function mockSigning() {
  const createSignedUrls = jest.fn(async (paths: string[]) => ({
    data: paths.map((p) => ({ path: p, signedUrl: signedUrl(p), error: null })),
    error: null,
  }));
  (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrls });
  return createSignedUrls;
}

describe("photosApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearProfilePhotoUrlCache();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    });
  });

  it("stores the uploaded path first, keeps own photos deduped to six, and returns signed links", async () => {
    const createSignedUrls = mockSigning();
    const newPath = path(USER_ID, "aaaaaaaa");
    const oldPath = path(USER_ID, "bbbbbbbb");
    const { update, updateEq } = mockProfilesTable([
      newPath,
      publicUrl(oldPath), // legacy public URL is still read (dual-read)
      " ",
      path(USER_ID, "cccccccc"),
      publicUrl(path(OTHER_ID, "dddddddd")),
      path(USER_ID, "eeeeeeee"),
      path(USER_ID, "ffffffff"),
      path(USER_ID, "99999999"),
    ]);
    (uploadProfilePhoto as jest.Mock).mockResolvedValue({
      success: true,
      path: newPath,
      url: signedUrl(newPath),
    });

    const result = await saveProfilePhoto(" file:///tmp/new.jpg ");

    expect(uploadProfilePhoto).toHaveBeenCalledWith("file:///tmp/new.jpg", USER_ID);
    const stored = (update.mock.calls[0] as unknown as [{ photos: string[] }])[0].photos;
    expect(stored).toHaveLength(6);
    expect(stored[0]).toBe(newPath);
    expect(stored[1]).toBe(oldPath);
    expect(stored.every((p: string) => p.startsWith(`${USER_ID}/`))).toBe(true);
    expect(update).toHaveBeenCalledWith({ photos: stored, photos_completed: true });
    expect(updateEq).toHaveBeenCalledWith("id", USER_ID);
    expect(result.data.photos).toEqual(stored.map(signedUrl));
    expect(createSignedUrls).toHaveBeenCalledWith(stored, 3600);
  });

  it("passes a rejected-photo message from the server through", async () => {
    mockProfilesTable([]);
    (uploadProfilePhoto as jest.Mock).mockResolvedValue({
      success: false,
      error: "Photo was not accepted. Use a JPEG, PNG, WebP or HEIC photo under 10 MB.",
    });

    await expect(saveProfilePhoto("file:///tmp/big.jpg")).rejects.toThrow(
      "Photo was not accepted. Use a JPEG, PNG, WebP or HEIC photo under 10 MB.",
    );
  });

  it("rejects blank upload URIs before upload or profile update", async () => {
    await expect(saveProfilePhoto("   ")).rejects.toThrow(
      "Choose a profile photo and try again.",
    );

    expect(uploadProfilePhoto).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns signed links for stored paths and old public URLs", async () => {
    mockSigning();
    const a = path(USER_ID, "aaaaaaaa");
    const b = path(USER_ID, "bbbbbbbb");
    mockProfilesTable([a, publicUrl(b)]);

    await expect(getProfilePhotos()).resolves.toEqual([signedUrl(a), signedUrl(b)]);
  });

  it("does not delete storage when the requested photo is not on the signed-in profile", async () => {
    mockSigning();
    const owned = path(USER_ID, "aaaaaaaa");
    mockProfilesTable([owned]);

    const result = await removeProfilePhoto(signedUrl(path(OTHER_ID, "bbbbbbbb")));

    expect(result).toEqual({ ok: true, data: [signedUrl(owned)] });
    expect(deleteProfilePhoto).not.toHaveBeenCalled();
  });

  it("matches a signed display URL to the stored path, deletes it, and stores the rest as paths", async () => {
    mockSigning();
    const owned = path(USER_ID, "aaaaaaaa");
    const remaining = path(USER_ID, "bbbbbbbb");
    const { update, updateEq } = mockProfilesTable([
      publicUrl(owned),
      publicUrl(path(OTHER_ID, "cccccccc")),
      remaining,
    ]);
    (deleteProfilePhoto as jest.Mock).mockResolvedValue({ success: true });

    const result = await removeProfilePhoto(` ${signedUrl(owned)} `);

    expect(deleteProfilePhoto).toHaveBeenCalledWith(owned);
    expect(result).toEqual({ ok: true, data: [signedUrl(remaining)] });
    expect(update).toHaveBeenCalledWith({
      photos: [remaining],
      photos_completed: true,
    });
    expect(updateEq).toHaveBeenCalledWith("id", USER_ID);
  });
});
