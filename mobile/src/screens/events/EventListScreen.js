import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import client from '../../api/client';
import EventCard from '../../components/EventCard';
import colors from '../../theme/colors';
import { Search } from 'lucide-react-native';
import CustomInput from '../../components/CustomInput';

const EventListScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      const response = await client.get(`/events${searchQuery ? `?search=${searchQuery}` : ''}`);
      setEvents(response.data);
    } catch (error) {
      console.error(error);
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Search size={48} color={colors.border} />
      <Text style={styles.emptyText}>No events found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your search</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomInput
          placeholder="Search for events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => navigation.navigate('EventDetail', { eventId: item._id })} 
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 15,
    color: colors.secondary,
  }
});

export default EventListScreen;
