import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, Image, TextInput, TouchableOpacity } from 'react-native';
import client from '../../api/client';
import EventCard from '../../components/EventCard';
import colors from '../../theme/colors';
import { Search, Bell, SlidersHorizontal } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';

const CATEGORIES = ['All', 'Free Events', 'Family & Education', 'Music', 'Tech'];

const EventListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchEvents = useCallback(async () => {
    try {
      let url = '/events';
      if (searchQuery) url += `?search=${searchQuery}`;
      
      const response = await client.get(url);
      let data = response.data;
      if (activeCategory !== 'All') {
         data = data.filter(e => e.category === activeCategory);
      }
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Bell size={20} color={colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.secondary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search here..."
          placeholderTextColor={colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <SlidersHorizontal size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <FlatList 
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.categoryPill, activeCategory === item && styles.categoryPillActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={() => (
            <>
              {renderHeader()}
              {events.length > 0 && (
                <View style={styles.featuredContainer}>
                  <EventCard 
                    event={events[0]} 
                    variant="featured"
                    onPress={() => navigation.navigate('EventDetail', { eventId: events[0]._id })} 
                  />
                </View>
              )}
            </>
          )}
          renderItem={({ item, index }) => {
            if (index === 0) return null; // Skip first item (featured)
            return (
              <EventCard 
                event={item} 
                variant="grid"
                onPress={() => navigation.navigate('EventDetail', { eventId: item._id })} 
              />
            );
          }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 120, // Space for floating tab bar
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    backgroundColor: colors.light,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  greeting: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.text,
  },
  filterButton: {
    padding: 8,
  },
  categoryList: {
    marginBottom: 24,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    backgroundColor: colors.white,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  featuredContainer: {
    paddingHorizontal: 24,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  }
});

export default EventListScreen;
