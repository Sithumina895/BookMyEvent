import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user or organizer
  
  const { register, isLoading, error } = useContext(AuthContext);
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');
    if (!name || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    await register(name, email, password, role);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and discover amazing events</Text>
        </View>

        {(error || localError) ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || localError}</Text>
          </View>
        ) : null}

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

          <Text style={styles.roleLabel}>I am a:</Text>
          <View style={styles.roleContainer}>
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

          <View style={styles.buttonContainer}>
            <CustomButton 
              title="Sign Up" 
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
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
  roleLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
