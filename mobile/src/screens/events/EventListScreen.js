import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import EventCard from '../../components/EventCard';
import OrganizerEventCard from '../../components/OrganizerEventCard';
import UserAvatar from '../../components/UserAvatar';
import colors from '../../theme/colors';
import {
  Search,
  Bell,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  Flame,
  PlusCircle,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  CalendarX,
  ChevronDown,
  Music,
  Laptop,
  Utensils,
  Briefcase,
  Palette,
  TrendingUp,
  BarChart3,
  CircleDollarSign,
  Ticket,
  Users,
  Shield,
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

const CATEGORIES = [
  { name: 'All', icon: Sparkles },
  { name: 'Music', icon: Music },
  { name: 'Tech', icon: Laptop },
  { name: 'Food', icon: Utensils },
  { name: 'Business', icon: Briefcase },
  { name: 'Art', icon: Palette },
];

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Ticket Confirmed!',
    description: 'Your booking for Global Tech Summit 2026 is confirmed.',
    time: '10m ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Early Bird Ending Soon',
    description: 'Neon Nights Music Festival tickets are selling out fast.',
    time: '2h ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Welcome to BookMyEvent',
    description: 'Explore live concerts, tech meetups, and art workshops near you.',
    time: '1d ago',
    unread: false,
  },
];

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const EventListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const isOrganizer = user?.role === 'organizer';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const fetchEvents = useCallback(async () => {
    try {
      let url = '/events';
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (isOrganizer && user?._id) {
        params.organizer = user._id;
      }

      const response = await client.get(url, { params });
      let data = response.data || [];

      if (isOrganizer) {
        // Enforce organizer isolation: he ONLY sees events he created!
        data = data.filter(
          (e) => (e.organizer?._id || e.organizer) === user?._id
        );
      } else if (activeCategory !== 'All') {
        data = data.filter((e) => e.category === activeCategory);
      }

      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, activeCategory, isOrganizer, user?._id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEditEvent = (eventItem) => {
    navigation.navigate('CreateEvent', { eventToEdit: eventItem });
  };

  const handleDeleteEvent = (eventItem) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to permanently delete "${eventItem.title}"? This will cancel all active tickets and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.delete(`/events/${eventItem._id}`);
              setEvents((prev) => prev.filter((e) => e._id !== eventItem._id));
              Toast.show({
                type: 'success',
                text1: 'Event Deleted',
                text2: 'The event has been successfully removed.',
              });
            } catch (err) {
              Alert.alert('Delete Failed', err.response?.data?.message || 'Could not delete event');
            }
          },
        },
      ]
    );
  };

  const toggleBookmark = (eventId) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        Toast.show({ type: 'info', text1: 'Removed from Saved' });
      } else {
        next.add(eventId);
        Toast.show({ type: 'success', text1: 'Saved to Favorites' });
      }
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const renderOrganizerHeader = () => {
    const totalEventsCount = events.length;
    const totalCapacitySum = events.reduce(
      (sum, e) => sum + (Number(e.totalCapacity) || 0),
      0
    );
    const totalAvailableSum = events.reduce(
      (sum, e) => sum + (Number(e.availableSeats) || 0),
      0
    );
    const totalTicketsSold = Math.max(0, totalCapacitySum - totalAvailableSum);
    const totalRevenue = events.reduce((sum, e) => {
      const sold = Math.max(
        0,
        (Number(e.totalCapacity) || 0) - (Number(e.availableSeats) || 0)
      );
      return sum + sold * (Number(e.ticketPrice) || 0);
    }, 0);
    const soldRatioPercent =
      totalCapacitySum > 0
        ? Math.round((totalTicketsSold / totalCapacitySum) * 100)
        : 0;

    return (
      <View style={styles.headerContainer}>
        {/* Top Profile & Actions Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <UserAvatar name={user?.name || 'Organizer'} size="md" showOnline={true} />
            <View style={styles.userTextContainer}>
              <View style={styles.organizerRoleBadge}>
                <Shield size={10} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.organizerRoleBadgeText}>ORGANIZER PORTAL</Text>
              </View>
              <Text style={styles.userName}>{user?.name || 'Organizer'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createEventHeaderBtn}
            onPress={() => navigation.navigate('CreateEvent')}
            activeOpacity={0.85}
          >
            <Plus size={16} color={colors.white} style={{ marginRight: 4 }} />
            <Text style={styles.createEventHeaderBtnText}>New Event</Text>
          </TouchableOpacity>
        </View>

        {/* Live Analytics Dashboard Card */}
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.analyticsCardTitle}>Live Sales & Performance</Text>
            </View>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>LIVE</Text>
            </View>
          </View>

          {/* 4 Analytics Metrics */}
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsBox}>
              <View style={styles.analyticsBoxHeader}>
                <CircleDollarSign size={15} color={colors.success} />
                <Text style={styles.analyticsBoxLabel}>Revenue</Text>
              </View>
              <Text style={[styles.analyticsBoxValue, { color: colors.success }]}>
                ${totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.analyticsBoxSub}>From ticket sales</Text>
            </View>

            <View style={styles.analyticsBox}>
              <View style={styles.analyticsBoxHeader}>
                <Ticket size={15} color={colors.primary} />
                <Text style={styles.analyticsBoxLabel}>Tickets Sold</Text>
              </View>
              <Text style={styles.analyticsBoxValue}>
                {totalTicketsSold}{' '}
                <Text style={styles.analyticsBoxSubInline}>/ {totalCapacitySum}</Text>
              </Text>
              <Text style={styles.analyticsBoxSub}>{soldRatioPercent}% capacity sold</Text>
            </View>
          </View>

          <View style={[styles.analyticsGrid, { marginTop: 10 }]}>
            <View style={styles.analyticsBox}>
              <View style={styles.analyticsBoxHeader}>
                <Users size={15} color={colors.warning} />
                <Text style={styles.analyticsBoxLabel}>Tickets Left</Text>
              </View>
              <Text style={styles.analyticsBoxValue}>{totalAvailableSum}</Text>
              <Text style={styles.analyticsBoxSub}>Available inventory</Text>
            </View>

            <View style={styles.analyticsBox}>
              <View style={styles.analyticsBoxHeader}>
                <BarChart3 size={15} color={colors.text} />
                <Text style={styles.analyticsBoxLabel}>Hosted Events</Text>
              </View>
              <Text style={styles.analyticsBoxValue}>{totalEventsCount}</Text>
              <Text style={styles.analyticsBoxSub}>Live on platform</Text>
            </View>
          </View>
        </View>

        {/* Search Bar for Organizer's events */}
        <View style={[styles.searchContainer, { marginTop: 16 }]}>
          <Search size={18} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your hosted events..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <X size={16} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderGrid}>
          <Text style={styles.sectionTitle}>Your Published Events</Text>
          <Text style={styles.gridCountText}>{events.length} listed</Text>
        </View>
      </View>
    );
  };

  const renderOrganizerEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <CalendarX size={38} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Events Published Yet</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No events matching "${searchQuery}".`
          : 'You haven’t published any events yet. Tap below to create your first event and start tracking live ticket sales and revenue!'}
      </Text>
      <TouchableOpacity
        style={styles.organizerCreateEmptyBtn}
        onPress={() => navigation.navigate('CreateEvent')}
        activeOpacity={0.85}
      >
        <Plus size={18} color={colors.white} style={{ marginRight: 6 }} />
        <Text style={styles.organizerCreateEmptyBtnText}>Create Your First Event</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    const featuredEvent = events.length > 0 ? events[0] : null;
    const trendingEvents = events.slice(1, 4);

    return (
      <View style={styles.headerContainer}>
        {/* Top Profile & Notification Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate(user ? 'Profile' : 'Login')}
            activeOpacity={0.8}
          >
            <UserAvatar name={user?.name || 'Guest'} size="md" showOnline={Boolean(user)} />
            <View style={styles.userTextContainer}>
              <Text style={styles.greeting}>{getTimeGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'Guest Explorer'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.topBarRight}>
            {!user && (
              <TouchableOpacity
                style={styles.headerSignInBtn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.headerSignInBtnText}>Sign In</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => setIsNotificationModalOpen(true)}
              activeOpacity={0.8}
            >
              <Bell size={20} color={colors.text} />
              {unreadCount > 0 && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Location & Quick Status Bar */}
        <View style={styles.locationBar}>
          <View style={styles.locationLeft}>
            <MapPin size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.locationText}>New York, USA</Text>
            <ChevronDown size={14} color={colors.textLight} style={{ marginLeft: 2 }} />
          </View>
          <View style={styles.eventsBadge}>
            <Sparkles size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.eventsBadgeText}>{events.length} Live Events</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search concerts, conferences, food..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <X size={16} color={colors.textLight} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.8}
          >
            <SlidersHorizontal size={17} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.name}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryListContent}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.name;
            const IconComp = item.icon;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveCategory(item.name)}
                activeOpacity={0.8}
              >
                <IconComp
                  size={14}
                  color={isActive ? colors.white : colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Featured Spotlight Section */}
        {featuredEvent && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Flame size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Featured Spotlight</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <EventCard
              event={featuredEvent}
              variant="featured"
              isBookmarked={bookmarkedIds.has(featuredEvent._id)}
              onBookmark={() => toggleBookmark(featuredEvent._id)}
              onPress={() => navigation.navigate('EventDetail', { eventId: featuredEvent._id })}
            />
          </View>
        )}

        {/* Trending This Week Horizontal Carousel */}
        {trendingEvents.length > 0 && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={18} color={colors.gold} style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Trending This Week</Text>
              </View>
              <Text style={styles.trendingCountText}>{trendingEvents.length} popular</Text>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingEvents}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingRight: 10, paddingBottom: 8 }}
              renderItem={({ item }) => (
                <EventCard
                  event={item}
                  variant="trending"
                  onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
                />
              )}
            />
          </View>
        )}

        {/* Host an Event CTA Banner (Organizers Only) */}
        {user?.role === 'organizer' && (
          <View style={styles.hostBanner}>
            <View style={styles.hostBannerContent}>
              <Text style={styles.hostBannerSub}>Planning an event?</Text>
              <Text style={styles.hostBannerTitle}>Host on BookMyEvent</Text>
              <Text style={styles.hostBannerDesc}>
                Publish tickets, manage attendees & grow your audience effortlessly.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.hostBannerBtn}
              onPress={() => navigation.navigate('CreateEvent')}
              activeOpacity={0.85}
            >
              <PlusCircle size={16} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.hostBannerBtnText}>Create</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* All Events Header */}
        <View style={styles.sectionHeaderGrid}>
          <Text style={styles.sectionTitle}>All Upcoming Events</Text>
          <Text style={styles.gridCountText}>{events.length} available</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <CalendarX size={38} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Events Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No events matching "${searchQuery}". Try different keywords.`
          : 'Check back later for newly announced events in this category.'}
      </Text>
      {(searchQuery.length > 0 || activeCategory !== 'All') && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => {
            setSearchQuery('');
            setActiveCategory('All');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Curating events for you...</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={isOrganizer ? renderOrganizerHeader : renderHeader}
            ListEmptyComponent={isOrganizer ? renderOrganizerEmptyState : renderEmptyState}
            renderItem={({ item, index }) => {
              if (isOrganizer) {
                return (
                  <OrganizerEventCard
                    event={item}
                    onEdit={() => handleEditEvent(item)}
                    onDelete={() => handleDeleteEvent(item)}
                    onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
                  />
                );
              }

              if (index === 0 && events.length > 1) return null; // Featured card is in header
              return (
                <View style={styles.rowItemWrapper}>
                  <EventCard
                    event={item}
                    variant="row"
                    isBookmarked={bookmarkedIds.has(item._id)}
                    onBookmark={() => toggleBookmark(item._id)}
                    onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
                  />
                </View>
              );
            }}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}

        {/* Filter Modal */}
        <Modal
          visible={isFilterModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFilterModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.filterModalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeading}>Filter Events</Text>
                <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.filterGroupLabel}>Categories</Text>
              <View style={styles.filterPillsGroup}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.filterChip,
                      activeCategory === cat.name && styles.filterChipActive,
                    ]}
                    onPress={() => setActiveCategory(cat.name)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        activeCategory === cat.name && styles.filterChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.applyFilterBtn}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={styles.applyFilterBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Notifications Modal */}
        <Modal
          visible={isNotificationModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsNotificationModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.notificationModalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Bell size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.modalHeading}>Notifications</Text>
                </View>
                <TouchableOpacity onPress={() => setIsNotificationModalOpen(false)}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 360 }}>
                {notifications.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.notificationItem, item.unread && styles.notificationItemUnread]}
                  >
                    <View style={styles.notificationIconWrap}>
                      <Calendar size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.notificationTitleRow}>
                        <Text style={styles.notificationTitle}>{item.title}</Text>
                        <Text style={styles.notificationTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.notificationDesc}>{item.description}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.markReadBtn}
                onPress={() => {
                  setNotifications(notifications.map((n) => ({ ...n, unread: false })));
                  setIsNotificationModalOpen(false);
                }}
              >
                <CheckCircle2 size={16} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.markReadBtnText}>Mark All as Read</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingBottom: 110, // Floating tab bar clearance
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSignInBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(224, 77, 56, 0.25)',
  },
  headerSignInBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  locationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  eventsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 6,
    height: 54,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  clearSearchBtn: {
    padding: 8,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryList: {
    marginBottom: 22,
  },
  categoryListContent: {
    paddingRight: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  sectionWrapper: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  trendingCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  hostBanner: {
    backgroundColor: colors.dark,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  hostBannerContent: {
    flex: 1,
    marginRight: 12,
  },
  hostBannerSub: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hostBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    marginTop: 2,
    marginBottom: 4,
  },
  hostBannerDesc: {
    fontSize: 11,
    color: '#98A2B3',
    lineHeight: 16,
  },
  hostBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  hostBannerBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  gridCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  rowItemWrapper: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  resetBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 20, 26, 0.65)',
    justifyContent: 'flex-end',
  },
  filterModalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  notificationModalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  filterGroupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  filterPillsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  applyFilterBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyFilterBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.light,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  notificationItemUnread: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryMuted,
  },
  notificationIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  notificationTime: {
    fontSize: 10,
    color: colors.textLight,
  },
  notificationDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  markReadBtn: {
    flexDirection: 'row',
    backgroundColor: colors.dark,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  markReadBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  organizerRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  organizerRoleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  createEventHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  createEventHeaderBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  analyticsCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  analyticsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  analyticsCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 5,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.5,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  analyticsBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analyticsBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  analyticsBoxLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  analyticsBoxValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  analyticsBoxSub: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  analyticsBoxSubInline: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  organizerCreateEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  organizerCreateEmptyBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EventListScreen;
