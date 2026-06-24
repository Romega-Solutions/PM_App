import { accountApi } from "@/src/features/account/api/accountApi";
import { isBetaDemoModeEnabled } from "@/src/features/auth/demoMode";
import type { UserType } from "@/src/features/auth/api/authApi";
import { useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  age: string;
  userType: UserType;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  age?: string;
};

type TouchedFields = {
  firstName: boolean;
  lastName: boolean;
  age: boolean;
};

/**
 * Hook for managing basic info form state and validation
 * Gender is no longer part of the form - it's auto-assigned based on userType
 */
export function useAccountBasicInfo(initialUserType: UserType) {
  const isDemoMode = isBetaDemoModeEnabled();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    age: "",
    userType: initialUserType,
  });

  const [touched, setTouched] = useState<TouchedFields>({
    firstName: false,
    lastName: false,
    age: false,
  });

  const [loading, setLoading] = useState(false);

  // Validation
  const validateField = (
    field: keyof Omit<FormState, "userType">,
    value: string
  ): string | undefined => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        return undefined;

      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        return undefined;

      case "age":
        if (!value.trim()) return "Age is required";
        const ageNum = parseInt(value, 10);
        if (isNaN(ageNum)) return "Please enter a valid age";
        if (ageNum < 18) return "You must be at least 18 years old";
        if (ageNum > 70) return "Age must be 70 or younger";
        return undefined;

      default:
        return undefined;
    }
  };

  const errors: FormErrors = {
    firstName: touched.firstName
      ? validateField("firstName", form.firstName)
      : undefined,
    lastName: touched.lastName
      ? validateField("lastName", form.lastName)
      : undefined,
    age: touched.age ? validateField("age", form.age) : undefined,
  };

  const isValid =
    !errors.firstName &&
    !errors.lastName &&
    !errors.age &&
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.age.trim() !== "";

  const setField = (
    field: keyof Omit<FormState, "userType">,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveBasicInfo = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        const age = parseInt(form.age, 10);

        return {
          ok: true,
          data: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            age,
            gender: form.userType === "filipina" ? "female" : "male",
            userType: form.userType,
            createdAt: new Date().toISOString(),
          },
        } as const;
      }

      const result = await accountApi.saveBasicInfo({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: parseInt(form.age, 10),
        userType: form.userType, // Gender auto-assigned in API
      });

      return result;
    } catch (error) {
      console.error("Failed to save basic info.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setField,
    touched,
    setTouched,
    errors,
    isValid,
    loading,
    saveBasicInfo,
  };
}
