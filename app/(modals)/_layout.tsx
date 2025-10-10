// Create: app/(modals)/_layout.tsx
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ 
      presentation: 'modal',
      headerShown: false 
    }}>
      <Stack.Screen name="filters" />
      <Stack.Screen name="report-user" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}