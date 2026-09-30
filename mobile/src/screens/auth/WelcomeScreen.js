import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import colors from '../../theme/colors';

const BG_IMAGE = require('../../../assets/loading_background.jpg');

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to Login after 5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground source={BG_IMAGE} style={styles.background}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.logoText}>BookMyEvent</Text>
          <Text style={styles.tagline}>Discover the best events around you.</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Dark overlay for readability
    justifyContent: 'space-between',
    paddingVertical: 100,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginTop: 100,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  loader: {
    marginBottom: 50,
  }
});

export default WelcomeScreen;
