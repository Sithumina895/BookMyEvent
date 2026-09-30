import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { Sparkles, ArrowRight } from 'lucide-react-native';

const BG_IMAGE = require('../../../assets/loading_background.jpg');

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    // Graceful automatic transition if untouched
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
      <View style={styles.gradientOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Top Brand Tag */}
            <View style={styles.tagPill}>
              <Sparkles size={13} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.tagPillText}>DISCOVER • BOOK • EXPERIENCE</Text>
            </View>

            {/* Main Hero Typography */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>BookMyEvent</Text>
              <Text style={styles.tagline}>
                Unforgettable concerts, conferences, and festivals at your fingertips.
              </Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.replace('Login')}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryBtnText}>Explore Events</Text>
                <ArrowRight size={18} color={colors.white} style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => navigation.replace('Register')}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineBtnText}>Create Account</Text>
              </TouchableOpacity>

              <View style={styles.loaderRow}>
                <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.loaderText}>Loading experiences...</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
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
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 20, 26, 0.72)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 24,
  },
  tagPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagPillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: 320,
  },
  bottomSection: {
    width: '100%',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 15,
    borderRadius: 18,
    marginBottom: 20,
  },
  outlineBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
