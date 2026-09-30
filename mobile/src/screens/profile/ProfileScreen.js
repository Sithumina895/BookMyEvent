import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import colors from '../../theme/colors';
import { User as UserIcon, Mail, Shield } from 'lucide-react-native';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        
        <View style={styles.infoRow}>
          <UserIcon size={20} color={colors.secondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Mail size={20} color={colors.secondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Shield size={20} color={colors.secondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoValue}>{user.role === 'organizer' ? 'Event Organizer' : 'Attendee'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionSection}>
        <CustomButton title="Log Out" onPress={logout} variant="danger" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(26, 26, 36, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1,
  },
  section: {
    marginTop: 24,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoContent: {
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  actionSection: {
    padding: 24,
    marginTop: 20,
  }
});

export default ProfileScreen;
