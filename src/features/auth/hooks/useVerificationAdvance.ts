import { supabase } from "@/src/config/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

export const useVerificationAdvance = () => {
  const [countdown, setCountdown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAdvance = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  const checkAuthentication = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Error checking session:", error);
        return false;
      }

      if (session?.user) {
        console.log("✅ User is authenticated:", session.user.id);
        return true;
      }

      console.log("⏳ User not authenticated yet, checking again...");
      return false;
    } catch (error) {
      console.error("❌ Exception checking auth:", error);
      return false;
    }
  }, []);

  const startChecking = useCallback(
    (onAdvance: () => void) => {
      if (didAdvance.current) return;

      clearTimers();
      setIsChecking(true);

      console.log("🔍 Starting authentication check...");

      // Check immediately first
      checkAuthentication().then((isAuthenticated) => {
        if (isAuthenticated && !didAdvance.current) {
          didAdvance.current = true;
          clearTimers();
          setIsChecking(false);
          onAdvance();
          return;
        }

        // Start periodic checking every 2 seconds
        checkIntervalRef.current = setInterval(async () => {
          const isAuthenticated = await checkAuthentication();

          if (isAuthenticated && !didAdvance.current) {
            didAdvance.current = true;
            clearTimers();
            setIsChecking(false);
            onAdvance();
          }
        }, 2000); // Check every 2 seconds
      });
    },
    [clearTimers, checkAuthentication]
  );

  const stop = useCallback(() => {
    clearTimers();
    setIsChecking(false);
  }, [clearTimers]);

  const immediateAdvance = useCallback(
    (onAdvance: () => void) => {
      if (didAdvance.current) return;
      didAdvance.current = true;
      clearTimers();
      setIsChecking(false);
      onAdvance();
    },
    [clearTimers]
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    countdown,
    isChecking,
    startChecking,
    stop,
    immediateAdvance,
  };
};
