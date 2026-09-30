import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import client from '../../api/client';
import colors from '../../theme/colors';
import EventCard from '../../components/EventCard';
import { Ticket, XCircle } from 'lucide-react-native';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBookings = useCallback(async () => {
    try {
      const response = await client.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await client.patch(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
              fetchBookings(); // refresh list
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Could not cancel booking');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Bookings</Text>
      
      <View style={styles.tabSwitchContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'All' && styles.tabButtonActive]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Past' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Past')}
        >
          <Text style={[styles.tabText, activeTab === 'Past' && styles.tabTextActive]}>Past</Text>
        </TouchableOpacity>
      </View>
      
      {bookings.length > 0 && (
         <View style={styles.featuredContainer}>
           <Text style={styles.sectionHeading}>Upcoming</Text>
           {/* Using the EventCard for the featured booking UI */}
           <View style={{ position: 'relative' }}>
             <EventCard 
                event={bookings[0].event} 
                variant="featured"
                onPress={() => navigation.navigate('EventDetail', { eventId: bookings[0].event._id })}
             />
             {!bookings[0].status.includes('CANCELLED') && (
                <TouchableOpacity 
                   style={styles.cancelOverlayBtn}
                   onPress={() => handleCancelBooking(bookings[0]._id)}
                >
                   <XCircle size={16} color={colors.white} />
                   <Text style={styles.cancelOverlayText}>Cancel</Text>
                </TouchableOpacity>
             )}
           </View>
           <Text style={styles.sectionHeading}>More Bookings</Text>
         </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ticket size={48} color={colors.border} />
      <Text style={styles.emptyText}>No bookings yet</Text>
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
          data={bookings}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => {
            if (index === 0) return null; // Skip first item (featured)
            return (
              <View style={styles.gridItemWrapper}>
                 <EventCard 
                   event={item.event} 
                   variant="grid"
                   onPress={() => navigation.navigate('EventDetail', { eventId: item.event._id })} 
                 />
                 {item.status === 'CANCELLED' && (
                    <Text style={styles.cancelledText}>CANCELLED</Text>
                 )}
              </View>
            );
          }}
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 4,
    width: 200,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 26,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  featuredContainer: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  cancelOverlayBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cancelOverlayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  gridItemWrapper: {
     position: 'relative'
  },
  cancelledText: {
     position: 'absolute',
     top: 16,
     right: 16,
     fontSize: 10,
     fontWeight: '800',
     color: colors.danger,
     backgroundColor: 'rgba(255,255,255,0.9)',
     paddingHorizontal: 6,
     paddingVertical: 2,
     borderRadius: 4,
     overflow: 'hidden'
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
  }
});

export default MyBookingsScreen;
