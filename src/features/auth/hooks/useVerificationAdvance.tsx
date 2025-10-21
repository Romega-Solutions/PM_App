import { useCallback, useEffect, useRef, useState } from "react";

export const useVerificationAdvance = (delay = 3000) => {
  const [countdown, setCountdown] = useState(Math.ceil(delay / 1000));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAdvance = useRef(false);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((onAdvance: () => void) => {
    clearTimers();
    setCountdown(Math.ceil(delay / 1000));
    intervalRef.current = setInterval(() => {
      setCountdown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    timerRef.current = setTimeout(() => {
      if (didAdvance.current) return;
      didAdvance.current = true;
      clearTimers();
      onAdvance();
    }, delay);
  }, [clearTimers, delay]);

  const stop = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const immediateAdvance = useCallback((onAdvance: () => void) => {
    if (didAdvance.current) return;
    didAdvance.current = true;
    clearTimers();
    onAdvance();
  }, [clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { countdown, start, stop, immediateAdvance };
};