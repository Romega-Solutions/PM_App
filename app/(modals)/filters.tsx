// Create: app/(modals)/filters.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Filters() {
  const router = useRouter();
  
  return (
    <View className="flex-1 bg-gray-900 justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-4">Search Filters</Text>
      <Text className="text-gray-400 text-center mb-6">
        Filter functionality coming soon.
      </Text>
      <TouchableOpacity 
        onPress={() => router.back()}
        className="bg-pink-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">Close</Text>
      </TouchableOpacity>
    </View>
  );
}