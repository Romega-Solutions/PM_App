/**
 * Profile Screen Route
 * 
 * Thin wrapper for the ProfileScreen feature component.
 * This file follows the app router convention while keeping
 * the actual implementation in the feature-first structure.
 * 
 * Architecture: Feature-First Design
 * - Route file: app/(main)/profile.tsx (this file)
 * - Implementation: src/features/profile/screens/ProfileScreen.tsx
 * - Components: src/features/profile/components/*
 * - Store: src/stores/profileStore.ts
 * 
 * @module app/routes
 */

import React from 'react';
import { ProfileScreen } from '@/src/features/profile/screens/ProfileScreen';

/**
 * Profile Route Component
 * 
 * Simple wrapper that imports and renders the feature component.
 * All business logic is in the feature folder.
 */
export default function Profile() {
  return <ProfileScreen />;
}
