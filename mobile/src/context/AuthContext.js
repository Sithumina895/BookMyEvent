import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Verify token by fetching user profile
        const response = await client.get('/auth/me');
        setUser(response.data);
      }
    } catch (e) {
      console.log('Error restoring token/user', e);
      await AsyncStorage.removeItem('userToken');
    } finally {
      setIsAppLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      await AsyncStorage.setItem('userToken', token);
      setUser(userData);
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      const validationError = e.response?.data?.errors?.[0]?.msg;
      const errorMsg = validationError || e.response?.data?.message || e.customMessage || e.message || 'Login failed';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const register = async (name, email, password, role) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.post('/auth/register', { name, email, password, role });
      const { token, ...userData } = response.data;
      await AsyncStorage.setItem('userToken', token);
      setUser(userData);
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      const validationError = e.response?.data?.errors?.[0]?.msg;
      const errorMsg = validationError || e.response?.data?.message || e.customMessage || e.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    } catch (e) {
      console.log('Error during logout', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAppLoading, isLoading, error, login, register, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
