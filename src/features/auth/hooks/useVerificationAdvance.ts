import { supabase } from "@/src/config/supabase";
import { useCallback, useRef, useState } from "react";

export const useVerificationAdvance = () => {
  const [isChecking, setIsChecking] = useState(false);
  const didAdvance = useRef(false);

  const checkAuthentication = useCallback(async () => {
    try {
      console.log('🔍 Checking authentication status...');
      
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Error checking session:", error);
        return false;
      }

      if (session?.user) {
        const isVerified = !!session.user.email_confirmed_at;
        console.log(`${isVerified ? '✅' : '⏳'} User auth status:`, {
          userId: session.user.id,
          email: session.user.email,
          verified: isVerified,
        });
        return isVerified;
      }

      console.log("⏳ No active session found");
      return false;
    } catch (error) {
      console.error("❌ Exception checking auth:", error);
      return false;
    }
  }, []);

  const manualCheck = useCallback(
    async (onAdvance: () => void) => {
      if (didAdvance.current) {
        console.log('⚠️ Already advanced, skipping check');
        return false;
      }

      setIsChecking(true);
      console.log("🔍 Manual verification check...");

      try {
        const isAuthenticated = await checkAuthentication();

        if (isAuthenticated) {
          console.log('✅ User verified!');
          didAdvance.current = true;
          setIsChecking(false);
          onAdvance();
          return true;
        }

        console.log('⏳ User not verified yet');
        setIsChecking(false);
        return false;
      } catch (error) {
        console.error('❌ Error during manual check:', error);
        setIsChecking(false);
        return false;
      }
    },
    [checkAuthentication]
  );

  return {
    isChecking,
    manualCheck,
  };
};