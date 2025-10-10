import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AccountSetupLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent going back during setup
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen
          name="basic-info"
          options={{
            title: "Basic Information",
          }}
        />
        <Stack.Screen
          name="profile-photos"
          options={{
            title: "Profile Photos",
          }}
        />
        <Stack.Screen
          name="location"
          options={{
            title: "Location",
          }}
        />
        <Stack.Screen
          name="preferences"
          options={{
            title: "Preferences",
          }}
        />
        <Stack.Screen
          name="verification-upload"
          options={{
            title: "Verification",
          }}
        />
        <Stack.Screen
          name="welcome-complete"
          options={{
            title: "Welcome",
          }}
        />
      </Stack>
    </>
  );
}
