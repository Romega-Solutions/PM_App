/**
 * Security Utilities - Input Validation & Sanitization
 *
 * PURPOSE: Provide security helpers for data validation and sanitization
 *
 * SECURITY PRACTICES:
 * - Validate all user inputs with Zod schemas
 * - Sanitize strings to prevent XSS
 * - Validate file uploads (size, type)
 * - Rate limiting helpers
 *
 * SOLID PRINCIPLES:
 * - Single Responsibility: Only handles security concerns
 * - Open/Closed: Easy to add new validation schemas
 *
 * @filesize ~200 lines (under 250 limit for utilities)
 */

import { z } from "zod";

// ===== VALIDATION SCHEMAS =====

/**
 * User profile validation schema
 */
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s-]+$/, "Only letters, spaces, and hyphens allowed"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s-]+$/, "Only letters, spaces, and hyphens allowed"),

  age: z
    .number()
    .int()
    .min(18, "Must be at least 18 years old")
    .max(100, "Invalid age"),

  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio too long"),

  location: z
    .string()
    .min(2, "Location required")
    .max(100, "Location too long"),

  interests: z
    .array(z.string())
    .min(1, "Select at least one interest")
    .max(10, "Maximum 10 interests"),
});

/**
 * Message validation schema
 */
export const messageSchema = z.object({
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),

  conversationId: z.string().uuid("Invalid conversation ID"),

  recipientId: z.string().uuid("Invalid recipient ID"),
});

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password too long")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[0-9]/, "Password must contain number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain special character");

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

/**
 * Image upload validation schema
 */
export const imageUploadSchema = z.object({
  uri: z.string().url("Invalid image URI"),
  type: z
    .enum(["image/jpeg", "image/png", "image/jpg"])
    .refine((val) => ["image/jpeg", "image/png", "image/jpg"].includes(val), {
      message: "Only JPEG and PNG images allowed",
    }),
  size: z.number().max(10 * 1024 * 1024, "Image size must be less than 10MB"),
});

// ===== SANITIZATION FUNCTIONS =====

/**
 * Sanitize text input (remove HTML, trim whitespace)
 */
export const sanitizeText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
};

/**
 * Sanitize message text
 */
export const sanitizeMessage = (text: string): string => {
  return sanitizeText(text).substring(0, 1000); // Limit length
};

/**
 * Sanitize name (letters, spaces, hyphens only)
 */
export const sanitizeName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z\s-]/g, "")
    .trim()
    .substring(0, 50);
};

/**
 * Sanitize bio (remove scripts, limit length)
 */
export const sanitizeBio = (bio: string): string => {
  return sanitizeText(bio).substring(0, 500);
};

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate profile data
 * @throws ZodError if validation fails
 */
export const validateProfile = (data: unknown) => {
  return profileSchema.parse(data);
};

/**
 * Validate message data
 * @throws ZodError if validation fails
 */
export const validateMessage = (data: unknown) => {
  return messageSchema.parse(data);
};

/**
 * Validate email
 * @throws ZodError if validation fails
 */
export const validateEmail = (email: string) => {
  return emailSchema.parse(email);
};

/**
 * Validate password
 * @throws ZodError if validation fails
 */
export const validatePassword = (password: string) => {
  return passwordSchema.parse(password);
};

/**
 * Safe validation (returns result object instead of throwing)
 */
export const safeValidateProfile = (data: unknown) => {
  return profileSchema.safeParse(data);
};

export const safeValidateMessage = (data: unknown) => {
  return messageSchema.safeParse(data);
};

export const safeValidateEmail = (email: string) => {
  return emailSchema.safeParse(email);
};

// ===== FILE VALIDATION =====

/**
 * Validate image file for upload
 */
export const validateImage = (file: {
  uri: string;
  type: string;
  size: number;
}) => {
  return imageUploadSchema.parse(file);
};

/**
 * Check if file is a valid image
 */
export const isValidImage = (mimeType: string): boolean => {
  return ["image/jpeg", "image/jpg", "image/png"].includes(mimeType);
};

/**
 * Check if file size is within limit
 */
export const isValidFileSize = (
  sizeInBytes: number,
  maxMB: number = 10,
): boolean => {
  return sizeInBytes <= maxMB * 1024 * 1024;
};

// ===== RATE LIMITING =====

const rateLimitMap = new Map<string, number[]>();

/**
 * Check if action is rate limited
 * @param key - Unique key for the action (e.g., "send-message-userId")
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 */
export const isRateLimited = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000,
): boolean => {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];

  // Remove old timestamps outside the window
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= maxAttempts) {
    return true;
  }

  // Add current timestamp
  recentTimestamps.push(now);
  rateLimitMap.set(key, recentTimestamps);

  return false;
};

/**
 * Clear rate limit for a key
 */
export const clearRateLimit = (key: string): void => {
  rateLimitMap.delete(key);
};

// ===== TOKEN VALIDATION =====

/**
 * Validate JWT token format (basic check)
 */
export const isValidJWTFormat = (token: string): boolean => {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token);
};

/**
 * Check if token is expired (requires decoded JWT)
 */
export const isTokenExpired = (exp: number): boolean => {
  return Date.now() >= exp * 1000;
};
