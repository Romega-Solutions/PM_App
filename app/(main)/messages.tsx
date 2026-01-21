/**
 * Messages Screen Route
 *
 * Thin wrapper for the MessagesScreen feature component.
 * This file follows the app router convention while keeping
 * the actual implementation in the feature-first structure.
 *
 * Architecture: Feature-First Design
 * - Route file: app/(main)/messages.tsx (this file)
 * - Implementation: src/features/messaging/screens/MessagesScreen.tsx
 * - Components: src/features/messaging/components/*
 * - Hooks: src/features/messaging/hooks/*
 *
 * @module app/routes
 */

import { MessagesScreen } from "@/src/features/messaging/screens/MessagesScreen";
import React from "react";

/**
 * Messages Route Component
 *
 * Simple wrapper that imports and renders the feature component.
 * All business logic is in the feature folder.
 */
export default function Messages() {
  return <MessagesScreen />;
}
