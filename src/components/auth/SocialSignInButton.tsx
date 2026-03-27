import SecondaryButton from "@/src/components/ui/SecondaryButton";
import React from "react";

interface SocialSignInButtonProps {
  provider: "google" | "apple";
  onPress: () => void;
  loading?: boolean;
}

export default function SocialSignInButton({
  provider,
  onPress,
  loading = false,
}: SocialSignInButtonProps) {
  const config = {
    google: {
      title: "🌐 Continue with Google",
      variant: "purple" as const,
      accessibilityLabel: "Sign in with Google",
    },
    apple: {
      title: " Continue with Apple",
      variant: "white" as const,
      accessibilityLabel: "Sign in with Apple",
    },
  };

  const { title, variant, accessibilityLabel } = config[provider];

  return (
    <SecondaryButton
      title={title}
      variant={variant}
      onPress={onPress}
      loading={loading}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
