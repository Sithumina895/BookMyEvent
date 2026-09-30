import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, ImageBackground, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import MainNavigator from './MainNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import colors from '../theme/colors';

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isAppLoading } = useContext(AuthContext);

  if (isAppLoading) {
    return (
      <ImageBackground 
        source={require('../../assets/loading_background.jpg')} 
        style={styles.loadingBackground}
        resizeMode="cover"
      >
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </ImageBackground>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainNavigator} />
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <RootStack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 40,
  },
});

export default AppNavigator;
