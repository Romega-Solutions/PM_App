import { useCallback, useMemo, useState } from "react";

/**
 * Simple hook returning sample locations and filtered results.
 * Replace sampleLocations with API/geocoding when ready.
 */
export const useLocationSearch = () => {
  const [query, setQuery] = useState("");

  const sampleLocations = useMemo(
    () => [
      "Manila, Philippines",
      "Cebu City, Philippines",
      "Davao City, Philippines",
      "Quezon City, Philippines",
      "Makati, Philippines",
      "Taguig, Philippines",
      "Pasig, Philippines",
      "Caloocan, Philippines",
      "Los Angeles, CA, USA",
      "New York, NY, USA",
      "Toronto, ON, Canada",
      "London, UK",
      "Sydney, Australia",
      "Tokyo, Japan",
      "Singapore",
      "Hong Kong",
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return sampleLocations
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, sampleLocations]);

  const hasQuery = query.trim().length > 0;

  const clear = useCallback(() => setQuery(""), []);

  return {
    query,
    setQuery,
    clear,
    filtered,
    hasQuery,
    sampleLocations,
  } as const;
};
