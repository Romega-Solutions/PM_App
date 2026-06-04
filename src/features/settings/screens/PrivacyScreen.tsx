import {
  SettingsNote,
  SettingsScreenScaffold,
  SettingsSectionTitle,
} from "@/src/components/settings/SettingsScreenScaffold";
import { SettingsRow } from "@/src/components/settings/SettingsRow";
import { Alert } from "react-native";
import { Eye, EyeOff, Lock, Shield, UserX } from "lucide-react-native";
import React, { useState } from "react";

export function PrivacyScreen() {
  const [showOnline, setShowOnline] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "Account deletion is not connected yet. No account data will be removed from this screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "I understand",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Unavailable",
              "Delete account support is pending backend wiring.",
            ),
        },
      ],
    );
  };

  return (
    <SettingsScreenScaffold title="Privacy">
      <SettingsSectionTitle>Privacy Settings</SettingsSectionTitle>
      <SettingsNote>
        These switches are local to this screen until privacy preferences are
        connected to account storage.
      </SettingsNote>

      <SettingsRow
        icon={Eye}
        title="Show Online Status"
        description="Let others see when you're online"
        value={showOnline}
        onValueChange={setShowOnline}
        badge="Local"
      />
      <SettingsRow
        icon={Shield}
        title="Show Distance"
        description="Display your distance to matches"
        value={showDistance}
        onValueChange={setShowDistance}
        badge="Local"
      />
      <SettingsRow
        icon={EyeOff}
        title="Read Receipts"
        description="Let others know when you read their messages"
        value={readReceipts}
        onValueChange={setReadReceipts}
        badge="Local"
      />
      <SettingsRow
        icon={Lock}
        title="Profile Visible"
        description="Make your profile discoverable"
        value={profileVisible}
        onValueChange={setProfileVisible}
        badge="Local"
      />

      <SettingsSectionTitle>Data & Account</SettingsSectionTitle>
      <SettingsRow
        icon={UserX}
        title="Delete Account"
        description="Requires confirmation. Backend deletion is not available yet."
        onPress={confirmDeleteAccount}
        destructive
        trailing={null}
      />
    </SettingsScreenScaffold>
  );
}
