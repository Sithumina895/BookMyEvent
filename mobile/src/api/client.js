import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default Vercel production endpoint
export const DEFAULT_API_URL = 'https://book-my-event-red.vercel.app/api';

// Reads from mobile/.env (EXPO_PUBLIC_API_URL) with default fallback
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return DEFAULT_API_URL;
};

const API_URL = getBaseUrl();
console.log('[API Client] Base URL configured as:', API_URL);

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds to comfortably accommodate serverless cold starts
});

// Request interceptor to add the auth token to headers
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.customMessage = 'Connection timed out. Please check your internet connection.';
    } else if (error.message === 'Network Error' || !error.response) {
      error.customMessage = 'Cannot connect to server. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

export default client;
