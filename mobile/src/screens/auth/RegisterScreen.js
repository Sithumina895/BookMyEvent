import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user or organizer
  
  const { register, isLoading } = useContext(AuthContext);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password must be at least 6 characters long',
      });
      return;
    }

    const result = await register(name, email, password, role);
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Welcome to BookMyEvent!',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: result.message || 'Could not complete registration. Please try again.',
      });
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Background Shapes */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      <View style={styles.shape3} />

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and discover amazing events</Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
            <CustomInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <CustomInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <View style={styles.roleToggle}>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
                  onPress={() => setRole('user')}
                >
                  <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Attendee</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'organizer' && styles.roleButtonActive]}
                  onPress={() => setRole('organizer')}
                >
                  <Text style={[styles.roleText, role === 'organizer' && styles.roleTextActive]}>Organizer</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton 
                title="Create Account" 
                onPress={handleRegister} 
                loading={isLoading} 
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
              Sign In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  shape1: {
    position: 'absolute',
    top: -80,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(204, 75, 55, 0.07)', 
  },
  shape2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(204, 75, 55, 0.05)',
  },
  shape3: {
    position: 'absolute',
    top: 300,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(42, 157, 143, 0.05)', 
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    backgroundColor: '#FCE8E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  roleToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: colors.white,
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleText: {
    fontWeight: '600',
    color: colors.textLight,
  },
  roleTextActive: {
    color: colors.white,
  },
  buttonContainer: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 15,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default RegisterScreen;
