import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserType } from '../api/authApi';

const SIGNUP_DATA_KEY = '@pinaymate_signup_data';

export type SignupData = {
  email: string;
  firstName: string;
  userType: UserType;
  timestamp: string;
};

export const useSignupPersistence = () => {
  const saveSignupData = async (data: Omit<SignupData, 'timestamp'>) => {
    try {
      const signupData: SignupData = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(SIGNUP_DATA_KEY, JSON.stringify(signupData));
      console.log('💾 Signup data saved to storage:', signupData);
      return true;
    } catch (error) {
      console.error('❌ Error saving signup data:', error);
      return false;
    }
  };

  const getSignupData = async (): Promise<SignupData | null> => {
    try {
      const data = await AsyncStorage.getItem(SIGNUP_DATA_KEY);
      if (!data) {
        console.log('ℹ️ No signup data found in storage');
        return null;
      }
      
      const signupData: SignupData = JSON.parse(data);
      console.log('📦 Retrieved signup data from storage:', signupData);
      
      // Check if data is older than 24 hours (expired)
      const timestamp = new Date(signupData.timestamp);
      const hoursSinceSignup = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSignup > 24) {
        console.log('⏰ Signup data expired (>24h), clearing...');
        await clearSignupData();
        return null;
      }
      
      return signupData;
    } catch (error) {
      console.error('❌ Error retrieving signup data:', error);
      return null;
    }
  };

  const clearSignupData = async () => {
    try {
      await AsyncStorage.removeItem(SIGNUP_DATA_KEY);
      console.log('🗑️ Signup data cleared from storage');
      return true;
    } catch (error) {
      console.error('❌ Error clearing signup data:', error);
      return false;
    }
  };

  return {
    saveSignupData,
    getSignupData,
    clearSignupData,
  };
};