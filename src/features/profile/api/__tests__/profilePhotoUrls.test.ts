import { supabase } from "@/src/config/supabase";
import {
  clearProfilePhotoUrlCache,
  resolveProfilePhotoUrls,
  toProfilePhotoStoragePath,
  withSignedProfilePhotosList,
} from "../profilePhotoUrls";

jest.mock("@/src/config/supabase", () => ({
  supabase: {
    storage: {
      from: jest.fn(),
    },
  },
}));

const PATH =
  "11111111-1111-4111-8111-111111111111/1781049600000-22222222-2222-4222-8222-222222222222.heic";
const PUBLIC_URL = `https://prx.supabase.co/storage/v1/object/public/profile-photos/${PATH}`;
const SIGNED_URL = `https://prx.supabase.co/storage/v1/object/sign/profile-photos/${PATH}?token=old`;

function mockSigning(result: "ok" | "error" = "ok") {
  const createSignedUrls = jest.fn(async (paths: string[]) =>
    result === "ok"
      ? {
          data: paths.map((path) => ({ path, signedUrl: `signed:${path}`, error: null })),
          error: null,
        }
      : { data: null, error: { message: "Object not found" } },
  );
  (supabase.storage.from as jest.Mock).mockReturnValue({ createSignedUrls });
  return createSignedUrls;
}

describe("profilePhotoUrls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearProfilePhotoUrlCache();
  });

  it("normalises paths, public URLs and signed URLs to the same storage path", () => {
    expect(toProfilePhotoStoragePath(PATH)).toBe(PATH);
    expect(toProfilePhotoStoragePath(` ${PUBLIC_URL} `)).toBe(PATH);
    expect(toProfilePhotoStoragePath(SIGNED_URL)).toBe(PATH);
    expect(toProfilePhotoStoragePath("https://evil.example/profile-photos/x.jpg")).toBeNull();
    expect(toProfilePhotoStoragePath(`${PATH.split("/")[0]}/../other.jpg`)).toBeNull();
    expect(toProfilePhotoStoragePath("file:///local/photo.jpg")).toBeNull();
  });

  it("signs once per path for one hour and reuses the cached link", async () => {
    const createSignedUrls = mockSigning();

    const first = await resolveProfilePhotoUrls([PATH, PUBLIC_URL, "file:///local.jpg"]);
    const second = await resolveProfilePhotoUrls([SIGNED_URL]);

    expect(first).toEqual([`signed:${PATH}`, `signed:${PATH}`, "file:///local.jpg"]);
    expect(second).toEqual([`signed:${PATH}`]);
    expect(createSignedUrls).toHaveBeenCalledTimes(1);
    expect(createSignedUrls).toHaveBeenCalledWith([PATH], 3600);
  });

  it("dual-read: keeps an old public URL when signing fails but drops an unsignable path", async () => {
    mockSigning("error");

    await expect(resolveProfilePhotoUrls([PUBLIC_URL, PATH])).resolves.toEqual([PUBLIC_URL]);
  });

  it("signs many profiles with one storage call", async () => {
    const createSignedUrls = mockSigning();
    const other = PATH.replace("22222222-2222", "33333333-2222");

    const result = await withSignedProfilePhotosList([
      { id: "a", photos: [PATH] },
      { id: "b", photos: [other, "https://images.example/demo.jpg"] },
      { id: "c", photos: null },
    ]);

    expect(createSignedUrls).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { id: "a", photos: [`signed:${PATH}`] },
      { id: "b", photos: [`signed:${other}`, "https://images.example/demo.jpg"] },
      { id: "c", photos: null },
    ]);
  });
});
