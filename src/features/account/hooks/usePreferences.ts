import { useCallback, useEffect, useState } from "react";
import { accountApi } from "../api/accountApi";

export type PreferencesForm = {
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  relationshipGoal: string;
};

export const usePreferences = () => {
  const [form, setForm] = useState<PreferencesForm>({
    ageMin: 22,
    ageMax: 35,
    maxDistanceKm: 50,
    relationshipGoal: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const setField = useCallback(
    <K extends keyof PreferencesForm>(key: K, value: PreferencesForm[K]) => {
      setForm((s) => ({ ...s, [key]: value }));
    },
    []
  );

  // Return as a computed value, not a function
  const isValid = form.relationshipGoal !== "";

  const savePreferences = useCallback(async () => {
    setLoading(true);
    try {
      // Get userType from basicInfo
      const basicInfo = await accountApi.getBasicInfo();
      if (!basicInfo?.userType) {
        throw new Error(
          "User type not found. Please complete basic info first."
        );
      }

      const payload = {
        ageMin: form.ageMin,
        ageMax: form.ageMax,
        maxDistanceKm: form.maxDistanceKm,
        relationshipGoal: form.relationshipGoal
          .toLowerCase()
          .replace(/\s+/g, "_"),
        userType: basicInfo.userType,
      };

      const res = await accountApi.savePreferences(payload);
      return res;
    } finally {
      setLoading(false);
    }
  }, [form]);

  const load = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const existing = await accountApi.getPreferences();
      if (existing) {
        setForm({
          ageMin: existing.ageMin ?? 22,
          ageMax: existing.ageMax ?? 35,
          maxDistanceKm: existing.maxDistanceKm ?? 50,
          relationshipGoal: existing.relationshipGoal ?? "",
        });
      }
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    form,
    setField,
    isValid, // This is now a boolean, not a function
    loading,
    loadingInitial,
    savePreferences,
  } as const;
};
