import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import client from '../../api/client';
import colors from '../../theme/colors';
import TicketModal from '../../components/TicketModal';
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Compass,
  ArrowRight,
} from 'lucide-react-native';

const STATUS_CONFIG = {
  CONFIRMED: {
    bg: colors.successLight,
    text: colors.success,
    label: 'CONFIRMED',
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: colors.dangerLight,
    text: colors.danger,
    label: 'CANCELLED',
    icon: XCircle,
  },
  ATTENDED: {
    bg: '#F3F4F6',
    text: colors.textSecondary,
    label: 'ATTENDED',
    icon: CheckCircle2,
  },
};

const MyBookingsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Upcoming' | 'Past' | 'Cancelled'
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const response = await client.get('/bookings');
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This will release your seats.',
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.patch(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
              fetchBookings();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Could not cancel booking');
            }
          },
        },
      ]
    );
  };

  // Filter bookings based on active tab
  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    if (!b.event) return false;
    const eventDate = new Date(b.event.date);

    if (activeTab === 'Upcoming') {
      return b.status !== 'CANCELLED' && eventDate >= now;
    }
    if (activeTab === 'Past') {
      return eventDate < now && b.status !== 'CANCELLED';
    }
    if (activeTab === 'Cancelled') {
      return b.status === 'CANCELLED';
    }
    return true; // 'All'
  });

  const renderBookingItem = ({ item }) => {
    const event = item.event;
    if (!event) return null;

    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
    const year = eventDate.getFullYear();
    const time = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.CONFIRMED;
    const StatusIcon = statusCfg.icon;
    const isCancelled = item.status === 'CANCELLED';

    return (
      <View style={styles.bookingCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateBlockMonth}>{month.toUpperCase()}</Text>
            <Text style={styles.dateBlockDay}>{day}</Text>
          </View>

          <View style={styles.cardHeaderInfo}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <StatusIcon size={12} color={statusCfg.text} style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
              </View>
              <Text style={styles.ticketCountText}>
                {item.numberOfTickets} Ticket{item.numberOfTickets > 1 ? 's' : ''}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('EventDetail', { eventId: event._id })}
            >
              <Text style={styles.bookingEventTitle} numberOfLines={2}>
                {event.title}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Meta Row */}
        <View style={styles.cardMetaRow}>
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.textLight} style={{ marginRight: 5 }} />
            <Text style={styles.metaItemText}>{time}</Text>
          </View>
          <View style={[styles.metaItem, { flex: 1, marginLeft: 12 }]}>
            <MapPin size={13} color={colors.textLight} style={{ marginRight: 5 }} />
            <Text style={styles.metaItemText} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
        </View>

        {/* Card Actions Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalPriceLabel}>Total Paid</Text>
            <Text style={styles.totalPriceValue}>
              ${(item.totalPrice || event.ticketPrice * item.numberOfTickets || 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.cardActionButtons}>
            {!isCancelled ? (
              <>
                <TouchableOpacity
                  style={styles.cancelLinkBtn}
                  onPress={() => handleCancelBooking(item._id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelLinkText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewPassBtn}
                  onPress={() => setSelectedBookingForPass(item)}
                  activeOpacity={0.85}
                >
                  <QrCode size={15} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.viewPassBtnText}>View Pass</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.cancelledBadgePill}>
                <Text style={styles.cancelledBadgeText}>Booking Cancelled</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.subTitleBadge}>MY WALLET</Text>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <View style={styles.ticketCountBadge}>
          <Ticket size={14} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.ticketCountBadgeText}>{bookings.length} Booked</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabSwitchContainer}>
        {['All', 'Upcoming', 'Past', 'Cancelled'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ticket size={40} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'All' ? 'No tickets yet' : `No ${activeTab.toLowerCase()} bookings`}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'All'
          ? 'Browse trending concerts, conferences, and festivals and secure your spot today!'
          : `You don't have any ${activeTab.toLowerCase()} event tickets at this moment.`}
      </Text>
      <TouchableOpacity
        style={styles.exploreCtaBtn}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}
      >
        <Compass size={16} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.exploreCtaText}>Explore Events</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.subTitleBadge}>MY WALLET</Text>
              <Text style={styles.headerTitle}>My Bookings</Text>
            </View>
          </View>
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <Ticket size={40} color={colors.primary} />
          </View>
          <Text style={styles.guestTitle}>Sign In to Access Your Wallet</Text>
          <Text style={styles.guestSubtitle}>
            Log in or create an account to view your confirmed tickets, digital QR passes, and booking history.
          </Text>
          <TouchableOpacity
            style={styles.guestSignInBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.88}
          >
            <Text style={styles.guestSignInBtnText}>Sign In / Register</Text>
            <ArrowRight size={16} color={colors.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching your passes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderHeader}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}

        {/* Digital QR Ticket Pass Modal */}
        <TicketModal
          visible={Boolean(selectedBookingForPass)}
          booking={selectedBookingForPass}
          onClose={() => setSelectedBookingForPass(null)}
        />
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 110,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingTop: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  subTitleBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  ticketCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ticketCountBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  dateBlock: {
    width: 54,
    height: 60,
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  dateBlockMonth: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  dateBlockDay: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ticketCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  bookingEventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 22,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItemText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalPriceValue: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
  },
  cardActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelLinkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.dangerLight,
  },
  cancelLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  viewPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewPassBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  cancelledBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelledBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  guestIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(224, 77, 56, 0.2)',
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  guestSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  guestSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  guestSignInBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
  },
});

export default MyBookingsScreen;
