import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import UserAvatar from '../../components/UserAvatar';
import colors from '../../theme/colors';
import client from '../../api/client';
import {
  User as UserIcon,
  Mail,
  Shield,
  Ticket,
  Heart,
  PlusCircle,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [bookingCount, setBookingCount] = useState(0);
  const [hostedCount, setHostedCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const isOrganizer = user?.role === 'organizer';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isOrganizer && user?._id) {
          const res = await client.get(`/events?organizer=${user._id}`);
          const myEvents = (res.data || []).filter(
            (e) => (e.organizer?._id || e.organizer) === user._id
          );
          setHostedCount(myEvents.length);
        } else {
          const res = await client.get('/bookings');
          setBookingCount(res.data?.length || 0);
        }
      } catch (e) {
        // quiet error
      }
    };
    fetchStats();
  }, [isOrganizer, user?._id]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of BookMyEvent?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Guest Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.guestAvatar}>
              <UserIcon size={38} color={colors.primary} />
            </View>
            <Text style={styles.userName}>Guest Explorer</Text>
            <Text style={styles.userEmail}>Sign in to save events and book tickets</Text>

            <View style={styles.guestAuthRow}>
              <TouchableOpacity
                style={styles.guestSignInBtn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.88}
              >
                <Text style={styles.guestSignInBtnText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestSignUpBtn}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.88}
              >
                <Text style={styles.guestSignUpBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>APP PREFERENCES</Text>
            <View style={styles.menuCard}>
              <View style={styles.menuItem}>
                <View style={[styles.menuIconWrap, { backgroundColor: colors.accentLight }]}>
                  <Bell size={18} color={colors.accent} />
                </View>
                <Text style={[styles.menuItemText, { flex: 1 }]}>Push Notifications</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  Alert.alert(
                    'Help & Support',
                    'Contact our 24/7 support team at support@bookmyevent.com'
                  )
                }
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.infoLight }]}>
                  <HelpCircle size={18} color={colors.info} />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
                <ChevronRight size={16} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.versionText}>BookMyEvent App v2.4.0 • Build 2026</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.headerCard}>
          <UserAvatar name={user.name} size="xl" showOnline={true} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View
            style={[
              styles.roleBadge,
              isOrganizer ? styles.roleBadgeOrganizer : styles.roleBadgeAttendee,
            ]}
          >
            <Shield size={12} color={isOrganizer ? '#D97706' : colors.primary} style={{ marginRight: 5 }} />
            <Text
              style={[
                styles.roleBadgeText,
                isOrganizer ? styles.roleBadgeTextOrganizer : styles.roleBadgeTextAttendee,
              ]}
            >
              {isOrganizer ? 'EVENT ORGANIZER' : 'VERIFIED ATTENDEE'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {isOrganizer ? (
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.8}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{hostedCount}</Text>
              <Text style={styles.statLabel}>Hosted</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => navigation.navigate('Bookings')}
              activeOpacity={0.8}
            >
              <Text style={styles.statNumber}>{bookingCount}</Text>
              <Text style={styles.statLabel}>Tickets</Text>
            </TouchableOpacity>
          )}

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {isOrganizer ? 'Active' : 'Gold'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>
              {isOrganizer ? '100%' : '5'}
            </Text>
            <Text style={styles.statLabel}>{isOrganizer ? 'Verified' : 'Saved'}</Text>
          </View>
        </View>

        {/* Organizer Host Event Action Banner */}
        {isOrganizer && (
          <TouchableOpacity
            style={styles.organizerCta}
            onPress={() => navigation.navigate('CreateEvent')}
            activeOpacity={0.88}
          >
            <View style={styles.organizerCtaLeft}>
              <View style={styles.organizerIconWrap}>
                <PlusCircle size={22} color={colors.white} />
              </View>
              <View>
                <Text style={styles.organizerCtaTitle}>Host a New Event</Text>
                <Text style={styles.organizerCtaSub}>Publish tickets and manage attendees</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* Navigation Actions Group 1 */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>
            {isOrganizer ? 'ORGANIZER MANAGEMENT' : 'ACTIVITY & TICKETS'}
          </Text>

          <View style={styles.menuCard}>
            {isOrganizer ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('Dashboard')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: colors.primaryLight }]}>
                    <Shield size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.menuItemText}>Organizer Dashboard & Analytics</Text>
                  <ChevronRight size={16} color={colors.textLight} />
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('CreateEvent')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
                    <PlusCircle size={18} color={colors.success} />
                  </View>
                  <Text style={styles.menuItemText}>Create New Event</Text>
                  <ChevronRight size={16} color={colors.textLight} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('Bookings')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: colors.primaryLight }]}>
                    <Ticket size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.menuItemText}>My Bookings & Passes</Text>
                  <ChevronRight size={16} color={colors.textLight} />
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('Home')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: '#FDF2F8' }]}>
                    <Heart size={18} color="#DB2777" />
                  </View>
                  <Text style={styles.menuItemText}>Saved Events & Wishlist</Text>
                  <ChevronRight size={16} color={colors.textLight} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Navigation Actions Group 2: Preferences */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>PREFERENCES & SETTINGS</Text>

          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={[styles.menuIconWrap, { backgroundColor: colors.accentLight }]}>
                <Bell size={18} color={colors.accent} />
              </View>
              <Text style={[styles.menuItemText, { flex: 1 }]}>Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Lock size={18} color="#16A34A" />
              </View>
              <Text style={styles.menuItemText}>Account Security & Privacy</Text>
              <ChevronRight size={16} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <HelpCircle size={18} color="#2563EB" />
              </View>
              <Text style={styles.menuItemText}>Help Center & Support</Text>
              <ChevronRight size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={18} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>BookMyEvent v2.4.0 • Modern Edition</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120, // Tab bar clearance
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeOrganizer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  roleBadgeAttendee: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  roleBadgeTextOrganizer: {
    color: '#D97706',
  },
  roleBadgeTextAttendee: {
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
  },
  organizerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 20,
    marginBottom: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  organizerCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  organizerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  organizerCtaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  organizerCtaSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 66,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingVertical: 15,
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.danger,
  },
  versionText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(224, 77, 56, 0.2)',
  },
  guestAuthRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
    width: '100%',
    paddingHorizontal: 8,
  },
  guestSignInBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  guestSignInBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  guestSignUpBtn: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  guestSignUpBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
});

export default ProfileScreen;
