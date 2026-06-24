/**
 * useMessageUpload Hook
 *
 * Handles image uploads for chat messages.
 * Uploads to Supabase Storage and tracks progress.
 *
 * @module features/messaging/hooks/useMessageUpload
 */

import { useCallback, useState } from "react";
import { uploadChatImage } from "../api/messages.api";

// Import supabase for auth check
import { supabase } from "@/src/config/supabase";

interface UseMessageUploadReturn {
  uploading: boolean;
  progress: number;
  error: Error | null;
  uploadImage: (uri: string, conversationId: string) => Promise<string | null>;
  reset: () => void;
}

export function useMessageUpload(): UseMessageUploadReturn {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Upload image to Supabase Storage
   */
  const uploadImage = useCallback(
    async (uri: string, conversationId: string): Promise<string | null> => {
      setUploading(true);
      setProgress(0);
      setError(null);
      let progressInterval: ReturnType<typeof setInterval> | null = null;

      try {
        if (!conversationId) {
          throw new Error(
            "Photo sharing needs an active matched conversation before upload.",
          );
        }

        // Show optimistic progress because fetch does not expose upload progress.
        progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Get current user ID from Supabase auth
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        const { path, error: uploadError } = await uploadChatImage(
          user.id,
          conversationId,
          uri,
        );

        if (uploadError) throw uploadError;

        setProgress(100);
        return path;
      } catch (err) {
        console.error("Error uploading image.");
        setError(err as Error);
        return null;
      } finally {
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        setUploading(false);
        // Reset progress after 1 second
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [],
  );

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadImage,
    reset,
  };
}
