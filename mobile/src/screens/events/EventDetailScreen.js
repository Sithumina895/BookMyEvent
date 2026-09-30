import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  Share,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import colors from '../../theme/colors';
import UserAvatar from '../../components/UserAvatar';
import CheckoutModal from '../../components/CheckoutModal';
import PaymentSuccessModal from '../../components/PaymentSuccessModal';
import TicketModal from '../../components/TicketModal';
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  ChevronLeft,
  Star,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Info,
  Users,
  Plus,
  Minus,
  Sparkles,
  Edit3,
  Trash2,
  TrendingUp,
  BarChart3,
  ShieldAlert,
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CATEGORY_FALLBACK_IMAGES = {
  Music: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
  Tech: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
  Food: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop',
  Business: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=1200&auto=format&fit=crop',
  Art: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop',
  Default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
};

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'venue' | 'policy'
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await client.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not load event details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [eventId, navigation]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [fetchEvent])
  );

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Join me at ${event.title}! Happening at ${event.venue}. Book tickets on BookMyEvent!`,
        title: event.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Toast.show({
      type: isBookmarked ? 'info' : 'success',
      text1: isBookmarked ? 'Removed from Saved' : 'Saved to Favorites',
    });
  };

  const incrementTickets = () => {
    if (event && ticketCount < (event.availableSeats || 10)) {
      setTicketCount((prev) => prev + 1);
    } else {
      Toast.show({ type: 'info', text1: 'Maximum available seats reached' });
    }
  };

  const decrementTickets = () => {
    if (ticketCount > 1) {
      setTicketCount((prev) => prev - 1);
    }
  };

  const isOrganizer =
    user?.role === 'organizer' ||
    (event?.organizer?._id || event?.organizer) === user?._id;

  const handleBook = async () => {
    if (!user) {
      setIsCheckoutOpen(false);
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to book tickets.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (ticketCount < 1) {
      Alert.alert('Invalid', 'Please select at least 1 ticket');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await client.post('/bookings', {
        eventId: event._id,
        numberOfTickets: ticketCount,
      });

      setIsCheckoutOpen(false);

      const unitPrice = Number(event.ticketPrice) || 0;
      const subtotal = unitPrice * ticketCount;
      const serviceFee = unitPrice > 0 ? 2.5 : 0;
      const totalPaid = subtotal + serviceFee;

      setBookingDetails({
        booking: response.data,
        event,
        ticketCount,
        totalPaid,
      });

      setIsSuccessModalOpen(true);
    } catch (error) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleViewTicketFromSuccess = () => {
    setIsSuccessModalOpen(false);
    setIsTicketModalOpen(true);
  };

  const handleGoToBookings = () => {
    setIsSuccessModalOpen(false);
    navigation.navigate('Bookings');
  };

  const handleEditEvent = () => {
    navigation.navigate('CreateEvent', { eventToEdit: event });
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to permanently delete this event? This action will remove all tickets and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.delete(`/events/${event._id}`);
              Toast.show({
                type: 'success',
                text1: 'Event Deleted',
                text2: 'The event has been successfully removed.',
              });
              navigation.goBack();
            } catch (err) {
              Alert.alert('Delete Failed', err.response?.data?.message || 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const imageUrl =
    event.imageUrl && !event.imageUrl.includes('placeholder')
      ? event.imageUrl
      : CATEGORY_FALLBACK_IMAGES[event.category] || CATEGORY_FALLBACK_IMAGES.Default;

  const unitPrice = Number(event.ticketPrice) || 0;
  const totalPrice = (unitPrice * ticketCount).toFixed(2);
  const organizerName = event.organizer?.name || 'Verified Event Host';

  return (
    <View style={styles.container}>
      {/* Floating Header Action Buttons with Safe Area Inset */}
      <View style={[styles.floatingHeader, { top: Math.max(insets.top + 8, 44) }]}>
        <TouchableOpacity
          style={styles.circularButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity
            style={styles.circularButton}
            onPress={toggleBookmark}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={isBookmarked ? colors.primary : colors.text}
              fill={isBookmarked ? colors.primary : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.circularButton, { marginLeft: 10 }]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 130 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchEvent}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Image Container */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          {/* Category Tag on Image */}
          <View style={styles.imageBottomInfo}>
            <View style={styles.categoryPillHero}>
              <Text style={styles.categoryPillHeroText}>{event.category}</Text>
            </View>
            <View style={styles.seatsLeftPill}>
              <Text style={styles.seatsLeftText}>
                {event.availableSeats > 0 ? `${event.availableSeats} seats left` : 'Sold Out'}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Title & Price Header */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1, marginRight: 14 }}>
              <Text style={styles.title}>{event.title}</Text>
              <View style={styles.ratingRow}>
                <Star size={15} color={colors.gold} fill={colors.gold} />
                <Text style={styles.ratingValue}>4.9</Text>
                <Text style={styles.ratingCount}> (218 reviews)</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceCurrent}>
                {unitPrice === 0 ? 'Free' : `$${unitPrice.toFixed(0)}`}
              </Text>
              {unitPrice > 0 && (
                <Text style={styles.priceOriginal}>${(unitPrice * 1.25).toFixed(0)}</Text>
              )}
              <Text style={styles.pricePerPerson}>/ ticket</Text>
            </View>
          </View>

          {/* Quick Info Grid */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.infoBox}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Calendar size={18} color={colors.primary} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {formattedDate}
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.accentLight }]}>
                <Clock size={18} color={colors.accent} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{time} GMT</Text>
              </View>
            </View>
          </View>

          {/* Location Box */}
          <View style={styles.locationBox}>
            <View style={[styles.infoIconWrap, { backgroundColor: '#F0F4FF' }]}>
              <MapPin size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Location & Venue</Text>
              <Text style={styles.infoValue}>{event.venue}</Text>
            </View>
          </View>

          {/* Host / Organizer Card */}
          <View style={styles.hostCard}>
            <UserAvatar name={organizerName} size="md" />
            <View style={styles.hostInfo}>
              <Text style={styles.hostLabel}>Organized By</Text>
              <Text style={styles.hostName}>{organizerName}</Text>
              <View style={styles.verifiedRow}>
                <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
                <Text style={styles.verifiedText}>Verified Event Creator</Text>
              </View>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'about' && styles.tabButtonActive]}
              onPress={() => setActiveTab('about')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
                About Event
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'venue' && styles.tabButtonActive]}
              onPress={() => setActiveTab('venue')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'venue' && styles.tabTextActive]}>
                Venue & Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'policy' && styles.tabButtonActive]}
              onPress={() => setActiveTab('policy')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'policy' && styles.tabTextActive]}>
                Refund Policy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Tab Content */}
          <View style={styles.tabContentArea}>
            {activeTab === 'about' && (
              <View>
                <Text style={styles.sectionHeading}>Event Description</Text>
                <Text style={styles.descriptionText}>{event.description}</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureBullet}>
                    <Sparkles size={14} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.featureBulletText}>
                      Instant digital entry pass sent to your wallet
                    </Text>
                  </View>
                  <View style={styles.featureBullet}>
                    <ShieldCheck size={14} color={colors.success} style={{ marginRight: 8 }} />
                    <Text style={styles.featureBulletText}>
                      100% Guaranteed authenticity and official venue validation
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'venue' && (
              <View>
                <Text style={styles.sectionHeading}>Venue Directions</Text>
                <Text style={styles.descriptionText}>
                  This event is taking place at {event.venue}. Doors open 45 minutes prior to start
                  time. Please arrive early for check-in and QR verification.
                </Text>
                <View style={styles.venueTipCard}>
                  <Info size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.venueTipText}>
                    Free on-site parking available for registered ticket holders.
                  </Text>
                </View>
              </View>
            )}

            {activeTab === 'policy' && (
              <View>
                <Text style={styles.sectionHeading}>Refund & Cancellation Terms</Text>
                <Text style={styles.descriptionText}>
                  Cancel anytime up to 48 hours before the event starts for a 100% full refund
                  directly credited to your original payment method.
                </Text>
                <View style={styles.guaranteeBadge}>
                  <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 8 }} />
                  <Text style={styles.guaranteeText}>BookMyEvent Buyer Protection Guarantee</Text>
                </View>
              </View>
            )}
          </View>

          {/* Ticket Selector Stepper OR Organizer Insights */}
          {isOrganizer ? (
            <View style={styles.organizerMetricsCard}>
              <View style={styles.organizerCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TrendingUp size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.organizerCardTitle}>Organizer Live Analytics</Text>
                </View>
                <View style={styles.organizerBadge}>
                  <Text style={styles.organizerBadgeText}>Hosted By You</Text>
                </View>
              </View>

              <View style={styles.organizerStatsRow}>
                <View style={styles.organizerStatCol}>
                  <Text style={styles.organizerStatNumber}>
                    {Math.max(0, (event.totalCapacity || 0) - (event.availableSeats || 0))}
                  </Text>
                  <Text style={styles.organizerStatLabel}>Tickets Sold</Text>
                </View>
                <View style={styles.organizerStatDivider} />
                <View style={styles.organizerStatCol}>
                  <Text style={styles.organizerStatNumber}>{event.availableSeats || 0}</Text>
                  <Text style={styles.organizerStatLabel}>Tickets Left</Text>
                </View>
                <View style={styles.organizerStatDivider} />
                <View style={styles.organizerStatCol}>
                  <Text style={[styles.organizerStatNumber, { color: colors.success }]}>
                    ${(
                      Math.max(0, (event.totalCapacity || 0) - (event.availableSeats || 0)) *
                      (Number(event.ticketPrice) || 0)
                    ).toFixed(0)}
                  </Text>
                  <Text style={styles.organizerStatLabel}>Revenue</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.stepperContainer}>
              <View>
                <Text style={styles.stepperTitle}>Select Tickets</Text>
                <Text style={styles.stepperSub}>
                  {unitPrice === 0 ? 'Free admission' : `$${unitPrice.toFixed(2)} per ticket`}
                </Text>
              </View>

              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={[styles.stepBtn, ticketCount <= 1 && styles.stepBtnDisabled]}
                  onPress={decrementTickets}
                  disabled={ticketCount <= 1}
                  activeOpacity={0.8}
                >
                  <Minus size={16} color={ticketCount <= 1 ? colors.textLight : colors.text} />
                </TouchableOpacity>

                <Text style={styles.stepValue}>{ticketCount}</Text>

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={incrementTickets}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom + 12, 24) },
        ]}
      >
        {isOrganizer ? (
          <View style={styles.organizerBarRow}>
            <TouchableOpacity
              style={styles.organizerEditBtn}
              onPress={handleEditEvent}
              activeOpacity={0.88}
            >
              <Edit3 size={18} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.organizerEditBtnText}>Edit Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.organizerDeleteBtn}
              onPress={handleDeleteEvent}
              activeOpacity={0.88}
            >
              <Trash2 size={18} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.organizerDeleteBtnText}>Delete Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.bottomBarLeft}>
              <Text style={styles.bottomTotalLabel}>Total Price</Text>
              <Text style={styles.bottomTotalPrice}>
                {unitPrice === 0 ? 'Free' : `$${totalPrice}`}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.bookButton,
                event.availableSeats === 0 && styles.bookButtonDisabled,
              ]}
              onPress={() => {
                if (!user) {
                  Alert.alert(
                    'Sign In Required',
                    'Please sign in or create an account to book tickets for this event.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Sign In',
                        onPress: () => navigation.navigate('Login'),
                      },
                    ]
                  );
                  return;
                }
                setIsCheckoutOpen(true);
              }}
              disabled={event.availableSeats === 0}
              activeOpacity={0.88}
            >
              <Text style={styles.bookButtonText}>
                {event.availableSeats === 0 ? 'Sold Out' : 'Proceed to Checkout'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Checkout & Payment Modal */}
      <CheckoutModal
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={event}
        ticketCount={ticketCount}
        onConfirmBooking={handleBook}
        loading={bookingLoading}
      />

      {/* Payment Success with Sound & Confetti Modal */}
      <PaymentSuccessModal
        visible={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        bookingDetails={bookingDetails}
        onViewTicket={handleViewTicketFromSuccess}
        onGoToBookings={handleGoToBookings}
      />

      {/* Digital Ticket Pass Modal */}
      <TicketModal
        visible={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={bookingDetails?.booking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  scroll: {
    paddingBottom: 120,
  },
  heroContainer: {
    height: height * 0.42,
    width: '100%',
    position: 'relative',
  },
  floatingHeader: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 20, 26, 0.3)',
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  imageBottomInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPillHero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryPillHeroText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seatsLeftPill: {
    backgroundColor: 'rgba(18, 20, 26, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seatsLeftText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  contentCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -28,
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  priceCurrent: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  priceOriginal: {
    fontSize: 12,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  pricePerPerson: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  quickInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 20,
    marginBottom: 24,
  },
  hostInfo: {
    marginLeft: 14,
    flex: 1,
  },
  hostLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  hostName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  tabContentArea: {
    minHeight: 120,
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  featuresList: {
    gap: 8,
  },
  featureBullet: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBulletText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  venueTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 14,
  },
  venueTipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  guaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 12,
    borderRadius: 14,
  },
  guaranteeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.light,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepperTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  stepperSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    paddingHorizontal: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBarLeft: {
    marginRight: 16,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bottomTotalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  bookButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  bookButtonDisabled: {
    backgroundColor: colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  organizerMetricsCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  organizerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  organizerCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  organizerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  organizerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  organizerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  organizerStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  organizerStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  organizerStatNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  organizerStatLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  organizerBarRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerEditBtn: {
    flex: 1.3,
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  organizerEditBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  organizerDeleteBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  organizerDeleteBtnText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EventDetailScreen;
