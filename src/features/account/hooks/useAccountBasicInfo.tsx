import { useCallback, useEffect, useMemo, useState } from "react";
import { accountApi, BasicInfoPayload } from "../api/accountApi";

export type BasicInfoForm = {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
};

export const useAccountBasicInfo = (initial?: Partial<BasicInfoForm>) => {
  const [form, setForm] = useState<BasicInfoForm>({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    age: initial?.age ?? "",
    gender: initial?.gender ?? "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const minAge = 18;
  const maxAge = 70;

  const setField = useCallback((key: keyof BasicInfoForm, value: string) => {
    setForm((s) => ({ ...s, [key]: value }));
  }, []);

  const errors = useMemo(() => {
    return {
      firstName:
        touched.firstName && form.firstName.trim().length < 2
          ? "Enter your first name (min 2 chars)"
          : "",
      lastName:
        touched.lastName && form.lastName.trim().length < 2
          ? "Enter your last name (min 2 chars)"
          : "",
      age:
        touched.age &&
        (form.age === "" ||
          isNaN(Number(form.age)) ||
          Number(form.age) < minAge ||
          Number(form.age) > maxAge)
          ? `Enter a valid age (${minAge}-${maxAge})`
          : "",
      gender: touched.gender && !form.gender ? "Select your gender" : "",
    };
  }, [form, touched]);

  const isValid = useMemo(() => {
    const ageNum = parseInt(form.age || "", 10);
    return (
      form.firstName.trim().length >= 2 &&
      form.lastName.trim().length >= 2 &&
      !Number.isNaN(ageNum) &&
      ageNum >= minAge &&
      ageNum <= maxAge &&
      form.gender !== ""
    );
  }, [form]);

  const saveBasicInfo = useCallback(async () => {
    setLoading(true);
    try {
      const payload: BasicInfoPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: Number(form.age),
        gender: form.gender,
      };

      const res = await accountApi.saveBasicInfo(payload);
      return res; // { ok: true, data }
    } catch (err) {
      // bubble up error for UI to handle
      throw err;
    } finally {
      setLoading(false);
    }
  }, [form]);

  const loadExisting = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const existing = await accountApi.getBasicInfo();
      if (existing) {
        setForm({
          firstName: existing.firstName ?? "",
          lastName: existing.lastName ?? "",
          age: String(existing.age ?? ""),
          gender: existing.gender ?? "",
        });
      }
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    // load saved basic info when hook mounts (non-blocking)
    loadExisting();
  }, [loadExisting]);

  return {
    form,
    setField,
    touched,
    setTouched,
    errors,
    isValid,
    loading,
    loadingInitial,
    saveBasicInfo,
  } as const;
};
