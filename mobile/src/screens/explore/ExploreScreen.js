import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import colors from '../../theme/colors';
import EventCard from '../../components/EventCard';
import { Search, X, SlidersHorizontal, ArrowUpDown, Compass, Sparkles } from 'lucide-react-native';

const CATEGORIES = ['All', 'Music', 'Tech', 'Food', 'Business', 'Art'];
const PRICE_FILTERS = [
  { label: 'All Prices', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Under $100', value: 'under100' },
  { label: '$100+', value: 'over100' },
];

const ExploreScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'priceAsc' | 'priceDesc'

  const fetchEvents = useCallback(async () => {
    try {
      let url = '/events';
      if (searchQuery.trim()) {
        url += `?search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await client.get(url);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching explore events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Filter & Sort Logic
  const filteredEvents = events
    .filter((event) => {
      // Category filter
      if (selectedCategory !== 'All' && event.category !== selectedCategory) {
        return false;
      }
      // Price filter
      const price = Number(event.ticketPrice) || 0;
      if (selectedPrice === 'free' && price > 0) return false;
      if (selectedPrice === 'under100' && price >= 100) return false;
      if (selectedPrice === 'over100' && price < 100) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return (a.ticketPrice || 0) - (b.ticketPrice || 0);
      if (sortBy === 'priceDesc') return (b.ticketPrice || 0) - (a.ticketPrice || 0);
      return new Date(a.date) - new Date(b.date);
    });

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title Bar */}
      <View style={styles.titleRow}>
        <View>
          <View style={styles.badgeRow}>
            <Compass size={14} color={colors.primary} style={{ marginRight: 5 }} />
            <Text style={styles.badgeText}>DISCOVER EVENTS</Text>
          </View>
          <Text style={styles.screenTitle}>Explore</Text>
        </View>
        <TouchableOpacity
          style={styles.sortToggleBtn}
          onPress={() => {
            const nextSort =
              sortBy === 'date' ? 'priceAsc' : sortBy === 'priceAsc' ? 'priceDesc' : 'date';
            setSortBy(nextSort);
          }}
          activeOpacity={0.8}
        >
          <ArrowUpDown size={14} color={colors.text} style={{ marginRight: 6 }} />
          <Text style={styles.sortToggleText}>
            {sortBy === 'priceAsc'
              ? 'Price: Low'
              : sortBy === 'priceDesc'
              ? 'Price: High'
              : 'Soonest'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textLight} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, venue, city..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <X size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        style={styles.pillsScroll}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item;
          return (
            <TouchableOpacity
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Price Filter Chips */}
      <View style={styles.priceFilterRow}>
        {PRICE_FILTERS.map((f) => {
          const isActive = selectedPrice === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.priceChip, isActive && styles.priceChipActive]}
              onPress={() => setSelectedPrice(f.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.priceChipText, isActive && styles.priceChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Results Count Bar */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCountText}>
          Showing <Text style={{ color: colors.text, fontWeight: '800' }}>{filteredEvents.length}</Text> events
        </Text>
        {(selectedCategory !== 'All' || selectedPrice !== 'all' || searchQuery.length > 0) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory('All');
              setSelectedPrice('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetFiltersText}>Reset filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Compass size={36} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No matching events</Text>
      <Text style={styles.emptySubtitle}>
        Try changing your search terms, selecting another category, or resetting filters.
      </Text>
      <TouchableOpacity
        style={styles.resetBtn}
        onPress={() => {
          setSelectedCategory('All');
          setSelectedPrice('all');
          setSearchQuery('');
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.resetBtnText}>Clear All Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                variant="grid"
                onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}
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
  listContent: {
    paddingBottom: 110, // Floating tab bar clearance
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  sortToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sortToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 6,
  },
  pillsScroll: {
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.white,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.white,
  },
  priceFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  priceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  priceChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryMuted,
  },
  priceChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  priceChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  resultsCountText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  resetFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
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
});

export default ExploreScreen;
