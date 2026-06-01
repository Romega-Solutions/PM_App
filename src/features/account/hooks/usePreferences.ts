import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { accountApi } from "../api/accountApi";

export type PreferencesForm = {
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  relationshipGoal: string;
};

export const preferencesKeys = {
  all: ["account", "preferences"] as const,
} as const;

const DEFAULT_FORM: PreferencesForm = {
  ageMin: 22,
  ageMax: 35,
  maxDistanceKm: 50,
  relationshipGoal: "",
};

export const usePreferences = () => {
  // Local form state — this is client-side ephemeral state, not server state.
  // The query seeds the initial values once on mount; after that the user
  // edits locally until they hit "Save".
  const [form, setForm] = useState<PreferencesForm>(DEFAULT_FORM);
  const seeded = useRef(false);

  const qc = useQueryClient();

  // ----- READ: server state → useQuery -----
  const query = useQuery({
    queryKey: preferencesKeys.all,
    queryFn: async () => {
      const existing = await accountApi.getPreferences();
      return existing ?? null;
    },
  });

  // Seed the local form once when server data first arrives.
  // useEffect is the correct place for this — not render-time side effects.
  useEffect(() => {
    if (query.data && !seeded.current) {
      seeded.current = true;
      setForm({
        ageMin: query.data.ageMin ?? DEFAULT_FORM.ageMin,
        ageMax: query.data.ageMax ?? DEFAULT_FORM.ageMax,
        maxDistanceKm: query.data.maxDistanceKm ?? DEFAULT_FORM.maxDistanceKm,
        relationshipGoal:
          query.data.relationshipGoal ?? DEFAULT_FORM.relationshipGoal,
      });
    }
  }, [query.data]);

  const setField = useCallback(
    <K extends keyof PreferencesForm>(key: K, value: PreferencesForm[K]) => {
      setForm((s) => ({ ...s, [key]: value }));
    },
    []
  );

  // Return as a computed value, not a function
  const isValid = form.relationshipGoal !== "";

  // ----- WRITE: useMutation -----
  // form is captured via a ref so mutationFn always sees the latest values
  // without needing to be recreated on every form change.
  const formRef = useRef(form);
  formRef.current = form;

  const mutation = useMutation({
    mutationFn: async () => {
      // Get userType from basicInfo (unchanged — read inside mutation is fine
      // because this is not a cacheable read, it's a dependency lookup before
      // the write).
      const basicInfo = await accountApi.getBasicInfo();
      if (!basicInfo?.userType) {
        throw new Error(
          "User type not found. Please complete basic info first."
        );
      }

      const currentForm = formRef.current;
      const payload = {
        ageMin: currentForm.ageMin,
        ageMax: currentForm.ageMax,
        maxDistanceKm: currentForm.maxDistanceKm,
        relationshipGoal: currentForm.relationshipGoal
          .toLowerCase()
          .replace(/\s+/g, "_"),
        userType: basicInfo.userType,
      };

      return accountApi.savePreferences(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: preferencesKeys.all });
    },
  });

  const savePreferences = useCallback(
    () => mutation.mutateAsync(),
    [mutation]
  );

  return {
    form,
    setField,
    isValid, // This is now a boolean, not a function
    loading: mutation.isPending,
    loadingInitial: query.isLoading,
    savePreferences,
  } as const;
};
