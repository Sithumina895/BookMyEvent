import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import client from '../../api/client';
import colors from '../../theme/colors';
import { Ticket, Calendar, XCircle, MapPin } from 'lucide-react-native';

const BookingCard = ({ booking, onCancel }) => {
  const event = booking.event;
  const isCancelled = booking.status === 'CANCELLED';

  const date = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          <View style={[styles.statusBadge, isCancelled && styles.statusCancelled]}>
            <Text style={[styles.statusText, isCancelled && styles.statusTextCancelled]}>
              {booking.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{date}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.secondary} />
          <Text style={styles.detailText} numberOfLines={1}>{event.venue}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ticket size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{booking.numberOfTickets} Ticket(s)</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.totalPrice}>Total: ${booking.totalPrice.toFixed(2)}</Text>
        {!isCancelled && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => onCancel(booking._id)}
          >
            <XCircle size={16} color={colors.danger} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ticket size={48} color={colors.border} />
      <Text style={styles.emptyText}>No bookings yet</Text>
      <Text style={styles.emptySubtext}>Your upcoming events will appear here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onCancel={handleCancelBooking} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    paddingBottom: 16,
  },
  eventInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusCancelled: {
    backgroundColor: 'rgba(231, 111, 81, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  statusTextCancelled: {
    color: colors.danger,
  },
  cardBody: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(231, 111, 81, 0.05)',
  },
  cancelText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
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

export default MyBookingsScreen;
