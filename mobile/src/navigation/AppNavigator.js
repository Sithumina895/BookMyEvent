import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, ImageBackground, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import colors from '../theme/colors';

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
      {user ? <MainNavigator /> : <AuthNavigator />}
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
  }
});

export default AppNavigator;
