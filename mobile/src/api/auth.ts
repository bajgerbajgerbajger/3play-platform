import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

type ErrorWithResponse = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await client.post('/auth/mobile/login', { email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: unknown) {
      const e = error as ErrorWithResponse;
      throw e.response?.data?.error || 'Přihlášení se nezdařilo';
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? (JSON.parse(userStr) as User) : null;
  }
};
