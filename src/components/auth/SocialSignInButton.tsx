import SecondaryButton from "@/src/components/ui/SecondaryButton";
import React from "react";

interface SocialSignInButtonProps {
  provider: "google" | "apple";
  onPress: () => void;
  loading?: boolean;
  unavailable?: boolean;
}

export default function SocialSignInButton({
  provider,
  onPress,
  loading = false,
  unavailable = false,
}: SocialSignInButtonProps) {
  const config = {
    google: {
      title: "Continue with Google",
      unavailableTitle: "Google sign-in unavailable",
      variant: "purple" as const,
      accessibilityLabel: "Sign in with Google",
      unavailableAccessibilityLabel: "Sign in with Google is unavailable",
    },
    apple: {
      title: "Continue with Apple",
      unavailableTitle: "Apple sign-in unavailable",
      variant: "white" as const,
      accessibilityLabel: "Sign in with Apple",
      unavailableAccessibilityLabel: "Sign in with Apple is unavailable",
    },
  };

  const {
    title,
    unavailableTitle,
    variant,
    accessibilityLabel,
    unavailableAccessibilityLabel,
  } = config[provider];
  const isDisabled = loading || unavailable;

  return (
    <SecondaryButton
      title={unavailable ? unavailableTitle : title}
      variant={variant}
      onPress={onPress}
      loading={loading}
      disabled={isDisabled}
      accessibilityLabel={
        unavailable ? unavailableAccessibilityLabel : accessibilityLabel
      }
    />
  );
}
