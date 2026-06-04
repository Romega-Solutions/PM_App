import {
  SettingsNote,
  SettingsScreenScaffold,
  SettingsSectionTitle,
} from "@/src/components/settings/SettingsScreenScaffold";
import { SettingsRow } from "@/src/components/settings/SettingsRow";
import { Bell, Heart, Mail, MessageCircle, Users } from "lucide-react-native";
import React, { useState } from "react";

export function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [newMatches, setNewMatches] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [newLikes, setNewLikes] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <SettingsScreenScaffold title="Notifications">
      <SettingsSectionTitle>Push Notifications</SettingsSectionTitle>
      <SettingsNote>
        Notification settings are local to this screen until notification
        preferences are connected to account storage.
      </SettingsNote>

      <SettingsRow
        icon={Bell}
        title="Enable Push Notifications"
        description="Receive notifications on your device"
        value={pushEnabled}
        onValueChange={setPushEnabled}
        badge="Local"
      />

      <SettingsSectionTitle>Notification Types</SettingsSectionTitle>
      <SettingsRow
        icon={Users}
        title="New Matches"
        description="When you get a new match"
        value={newMatches}
        onValueChange={setNewMatches}
        disabled={!pushEnabled}
        badge="Local"
      />
      <SettingsRow
        icon={MessageCircle}
        title="New Messages"
        description="When someone sends you a message"
        value={newMessages}
        onValueChange={setNewMessages}
        disabled={!pushEnabled}
        badge="Local"
      />
      <SettingsRow
        icon={Heart}
        title="New Likes"
        description="When someone likes your profile"
        value={newLikes}
        onValueChange={setNewLikes}
        disabled={!pushEnabled}
        badge="Local"
      />

      <SettingsSectionTitle>Email Notifications</SettingsSectionTitle>
      <SettingsRow
        icon={Mail}
        title="Email Updates"
        description="Receive updates via email"
        value={emailNotifications}
        onValueChange={setEmailNotifications}
        badge="Local"
      />
    </SettingsScreenScaffold>
  );
}
