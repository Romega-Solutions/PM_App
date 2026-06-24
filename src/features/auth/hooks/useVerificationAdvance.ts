import { supabase } from "@/src/config/supabase";
import { useCallback, useRef, useState } from "react";

export const useVerificationAdvance = () => {
  const [isChecking, setIsChecking] = useState(false);
  const didAdvance = useRef(false);

  const checkAuthentication = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Unable to check verification session.");
        return false;
      }

      if (session?.user) {
        const isVerified = !!session.user.email_confirmed_at;
        return isVerified;
      }

      return false;
    } catch {
      console.error("Unable to check verification session.");
      return false;
    }
  }, []);

  const manualCheck = useCallback(
    async (onAdvance: () => void) => {
      if (didAdvance.current) {
        return false;
      }

      setIsChecking(true);

      try {
        const isAuthenticated = await checkAuthentication();

        if (isAuthenticated) {
          didAdvance.current = true;
          setIsChecking(false);
          onAdvance();
          return true;
        }

        setIsChecking(false);
        return false;
      } catch {
        console.error("Manual verification check failed.");
        setIsChecking(false);
        return false;
      }
    },
    [checkAuthentication],
  );

  return {
    isChecking,
    manualCheck,
  };
};
