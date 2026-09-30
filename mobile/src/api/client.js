import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to access localhost, and localhost for iOS simulator
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
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

// Response interceptor to handle global errors (like 401 Unauthorized)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors globally if needed (e.g., clear token and logout)
      // For now, we'll just let the components handle the error or AuthContext
    }
    return Promise.reject(error);
  }
);

export default client;
