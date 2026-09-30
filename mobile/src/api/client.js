import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  // 1. Web browser
  if (Platform.OS === 'web') {
    const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
    return `http://${host}:5000/api`;
  }

  // 2. Expo hostUri (automatically detects your computer's IP when using Expo Go or dev client)
  const hostUri = Constants.expoConfig?.hostUri ||
                  Constants.manifest2?.extra?.expoClient?.hostUri ||
                  Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:5000/api`;
    }
  }

  // 3. React Native bundle scriptURL
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:5000/api`;
    }
  }

  // 4. Fallback for physical devices / emulators
  // 10.87.240.173 is the host LAN IP which works for both physical devices and emulators
  return Platform.OS === 'android' ? 'http://10.87.240.173:5000/api' : 'http://localhost:5000/api';
};

const API_URL = getBaseUrl();
console.log('[API Client] Base URL configured as:', API_URL);

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout so requests never hang for minutes
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
      error.customMessage = 'Connection timed out. Please check if the backend server is running.';
    } else if (error.message === 'Network Error' || !error.response) {
      error.customMessage = 'Cannot connect to server. Ensure your phone and server are on the same Wi-Fi network.';
    }
    return Promise.reject(error);
  }
);

export default client;
