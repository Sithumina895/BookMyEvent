import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../theme/colors';
import { User, Mail, Lock, Shield, Sparkles, Ticket, ArrowLeft } from 'lucide-react-native';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'organizer'

  const { register, isLoading } = useContext(AuthContext);

  const validateEmail = (val) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(val);
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please complete all fields to create your account.',
      });
      return;
    }

    if (!validateEmail(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please provide a valid email address.',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Password Too Short',
        text2: 'Password must be at least 6 characters.',
      });
      return;
    }

    const result = await register(name.trim(), email.trim(), password, role);
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Account Created Successfully',
        text2: 'Welcome to BookMyEvent.',
      });

      const isOrganizer = result.user?.role === 'organizer' || role === 'organizer';
      const homeTabName = isOrganizer ? 'Dashboard' : 'Home';

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              params: {
                screen: homeTabName,
                params: {
                  screen: 'EventList',
                },
              },
            },
          ],
        })
      );
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: result.message || 'Could not complete registration. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.mainContainer}>
        <View style={styles.ambientGlow} />

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Back/Dismiss Button */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate('Main');
                  }
                }}
                activeOpacity={0.7}
              >
                <ArrowLeft size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.badgeRow}>
                <Sparkles size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.badgeText}>GET STARTED</Text>
              </View>

              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Unlock VIP tickets, personalized event recommendations, and exclusive passes.
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <CustomInput
                label="Full Name"
                placeholder="e.g. Sithumina Devshan"
                value={name}
                onChangeText={setName}
                icon={User}
              />

              <CustomInput
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon={Mail}
              />

              <CustomInput
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={Lock}
              />

              {/* Role Selection Tabs */}
              <View style={styles.roleGroup}>
                <Text style={styles.roleLabel}>I want to join as:</Text>
                <View style={styles.roleToggleRow}>
                  <TouchableOpacity
                    style={[styles.roleCard, role === 'user' && styles.roleCardActive]}
                    onPress={() => setRole('user')}
                    activeOpacity={0.8}
                  >
                    <Ticket
                      size={20}
                      color={role === 'user' ? colors.primary : colors.textLight}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.roleCardTitle, role === 'user' && styles.roleCardTitleActive]}>
                      Attendee
                    </Text>
                    <Text style={styles.roleCardSubtitle}>Discover & book tickets</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleCard, role === 'organizer' && styles.roleCardActive]}
                    onPress={() => setRole('organizer')}
                    activeOpacity={0.8}
                  >
                    <Shield
                      size={20}
                      color={role === 'organizer' ? colors.primary : colors.textLight}
                      style={{ marginBottom: 4 }}
                    />
                    <Text
                      style={[
                        styles.roleCardTitle,
                        role === 'organizer' && styles.roleCardTitleActive,
                      ]}
                    >
                      Organizer
                    </Text>
                    <Text style={styles.roleCardSubtitle}>Host & sell events</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Create Account"
                  onPress={handleRegister}
                  loading={isLoading}
                  size="lg"
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(224, 77, 56, 0.07)',
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.white,
    padding: 22,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 20,
  },
  roleGroup: {
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.light,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  roleCardActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roleCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  roleCardTitleActive: {
    color: colors.primary,
  },
  roleCardSubtitle: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  topBar: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default RegisterScreen;
