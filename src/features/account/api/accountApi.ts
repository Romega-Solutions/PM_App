/**
 * Account API - Main Entry Point
 *
 * Re-exports all account-related API functions from modular files.
 * This maintains backward compatibility while keeping code organized.
 *
 * Architecture:
 * - Each API category in separate file (<200 lines each)
 * - Single Responsibility Principle applied
 * - Easy to test and maintain
 */

// Re-export all types and functions from modular API files
export * from "./basicInfoApi";
export * from "./locationApi";
export * from "./photosApi";
export * from "./preferencesApi";
export * from "./verificationApi";

import * as basicInfo from "./basicInfoApi";
import * as location from "./locationApi";
import * as photos from "./photosApi";
import * as preferences from "./preferencesApi";
import * as verification from "./verificationApi";

// Unified API object for backward compatibility
export const accountApi = {
  // Basic Info
  saveBasicInfo: basicInfo.saveBasicInfo,
  getBasicInfo: basicInfo.getBasicInfo,
  clearBasicInfo: basicInfo.clearBasicInfo,

  // Photos
  saveProfilePhoto: photos.saveProfilePhoto,
  getProfilePhotos: photos.getProfilePhotos,
  removeProfilePhoto: photos.removeProfilePhoto,

  // Location
  saveLocation: location.saveLocation,
  getLocation: location.getLocation,
  clearLocation: location.clearLocation,

  // Verification
  saveVerification: verification.saveVerification,
  getVerification: verification.getVerification,
  clearVerification: verification.clearVerification,
  compareVerificationData: verification.compareVerificationData,

  // Preferences
  savePreferences: preferences.savePreferences,
  getPreferences: preferences.getPreferences,
  clearPreferences: preferences.clearPreferences,
};

export default accountApi;
