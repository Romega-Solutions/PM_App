/**
 * Tests for security utilities (validation, sanitization, rate limiting).
 * Pure functions — no mocking required.
 */
import {
  clearRateLimit,
  isRateLimited,
  isTokenExpired,
  isValidFileSize,
  isValidImage,
  isValidJWTFormat,
  safeValidateEmail,
  safeValidateProfile,
  sanitizeBio,
  sanitizeMessage,
  sanitizeName,
  sanitizeText,
  validateEmail,
  validateImage,
  validateMessage,
  validatePassword,
  validateProfile,
} from "../security";

describe("sanitization", () => {
  it("strips HTML tags and angle brackets", () => {
    expect(sanitizeText("<b>hi</b>")).toBe("hi");
    expect(sanitizeText("<script>alert(1)</script>")).toBe("alert(1)");
    expect(sanitizeText("a > b < c")).toBe("a  b  c");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeText("   hello   ")).toBe("hello");
  });

  it("sanitizeName keeps only letters, spaces and hyphens", () => {
    expect(sanitizeName("John123 Doe!")).toBe("John Doe");
    expect(sanitizeName("Mary-Jane")).toBe("Mary-Jane");
  });

  it("sanitizeMessage caps length at 1000 chars", () => {
    expect(sanitizeMessage("x".repeat(2000)).length).toBe(1000);
  });

  it("sanitizeBio caps length at 500 chars", () => {
    expect(sanitizeBio("y".repeat(800)).length).toBe(500);
  });
});

describe("email validation", () => {
  it("lowercases a valid email", () => {
    expect(validateEmail("TEST@EXAMPLE.COM")).toBe("test@example.com");
  });

  it("rejects an invalid email via safeParse", () => {
    expect(safeValidateEmail("not-an-email").success).toBe(false);
    expect(safeValidateEmail("a@b.co").success).toBe(true);
  });
});

describe("password validation", () => {
  it("accepts a strong password", () => {
    expect(() => validatePassword("Passw0rd!")).not.toThrow();
  });

  it("rejects passwords missing complexity requirements", () => {
    expect(() => validatePassword("password")).toThrow(); // no upper/number/special
    expect(() => validatePassword("Short1!")).toThrow(); // < 8 chars
  });
});

describe("profile validation", () => {
  const validProfile = {
    firstName: "Maria",
    lastName: "Santos",
    age: 24,
    bio: "Loves hiking and coffee.",
    location: "Manila",
    interests: ["travel"],
  };

  it("accepts a valid profile", () => {
    expect(() => validateProfile(validProfile)).not.toThrow();
  });

  it("rejects under-18 ages", () => {
    const result = safeValidateProfile({ ...validProfile, age: 16 });
    expect(result.success).toBe(false);
  });

  it("rejects names with digits", () => {
    const result = safeValidateProfile({ ...validProfile, firstName: "M4ria" });
    expect(result.success).toBe(false);
  });
});

describe("message validation", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts a well-formed message", () => {
    expect(() =>
      validateMessage({ text: "hi", conversationId: uuid, recipientId: uuid })
    ).not.toThrow();
  });

  it("rejects a non-uuid conversation id", () => {
    expect(() =>
      validateMessage({ text: "hi", conversationId: "nope", recipientId: uuid })
    ).toThrow();
  });
});

describe("file validation", () => {
  it("isValidImage allows jpeg/png only", () => {
    expect(isValidImage("image/jpeg")).toBe(true);
    expect(isValidImage("image/png")).toBe(true);
    expect(isValidImage("image/gif")).toBe(false);
  });

  it("isValidFileSize enforces the MB limit", () => {
    expect(isValidFileSize(5 * 1024 * 1024, 10)).toBe(true);
    expect(isValidFileSize(11 * 1024 * 1024, 10)).toBe(false);
  });

  it("validateImage throws on oversized files", () => {
    expect(() =>
      validateImage({
        uri: "https://example.com/a.jpg",
        type: "image/jpeg",
        size: 50 * 1024 * 1024,
      })
    ).toThrow();
  });
});

describe("rate limiting", () => {
  it("blocks after the allowed number of attempts", () => {
    const key = `test-${Math.random()}`;
    expect(isRateLimited(key, 2, 60000)).toBe(false);
    expect(isRateLimited(key, 2, 60000)).toBe(false);
    expect(isRateLimited(key, 2, 60000)).toBe(true);
  });

  it("clearRateLimit resets the counter", () => {
    const key = `reset-${Math.random()}`;
    isRateLimited(key, 1, 60000);
    expect(isRateLimited(key, 1, 60000)).toBe(true);
    clearRateLimit(key);
    expect(isRateLimited(key, 1, 60000)).toBe(false);
  });
});

describe("token helpers", () => {
  it("validates JWT shape", () => {
    expect(isValidJWTFormat("aaa.bbb.ccc")).toBe(true);
    expect(isValidJWTFormat("not-a-jwt")).toBe(false);
  });

  it("detects expiry from an exp claim (seconds)", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    expect(isTokenExpired(nowSec - 3600)).toBe(true);
    expect(isTokenExpired(nowSec + 3600)).toBe(false);
  });
});
