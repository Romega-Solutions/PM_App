// Create: src/hooks/useAuth.ts
import { useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const signIn = async (email: string, password: string) => {
    // TODO: Implement actual auth
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
