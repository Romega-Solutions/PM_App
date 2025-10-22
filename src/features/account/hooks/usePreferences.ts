import { useCallback, useEffect, useState } from "react";
import { accountApi, PreferencesPayload } from "../api/accountApi";

export type PreferencesForm = {
  interestedIn: string;
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  relationshipGoal: string;
};

export const usePreferences = () => {
  const [form, setForm] = useState<PreferencesForm>({
    interestedIn: "",
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

  const isValid = () => {
    return form.interestedIn !== "" && form.relationshipGoal !== "";
  };

  const savePreferences = useCallback(async () => {
    setLoading(true);
    try {
      const payload: PreferencesPayload = {
        interestedIn: form.interestedIn.toLowerCase(),
        ageMin: form.ageMin,
        ageMax: form.ageMax,
        maxDistanceKm: form.maxDistanceKm,
        relationshipGoal: form.relationshipGoal
          .toLowerCase()
          .replace(/\s+/g, "_"),
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
          interestedIn: existing.interestedIn ?? "",
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
    isValid: isValid(),
    loading,
    loadingInitial,
    savePreferences,
  } as const;
};
