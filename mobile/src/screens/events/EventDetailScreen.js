import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import client from '../../api/client';
import colors from '../../theme/colors';
import { Calendar, MapPin, Users, Info, Ticket } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [tickets, setTickets] = useState('1');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
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
  };

  const handleBook = async () => {
    const numTickets = parseInt(tickets, 10);
    if (isNaN(numTickets) || numTickets < 1) {
      Alert.alert('Invalid', 'Please enter a valid number of tickets');
      return;
    }

    setBookingLoading(true);
    try {
      await client.post('/bookings', {
        eventId: event._id,
        numberOfTickets: numTickets
      });
      Alert.alert('Success!', 'Your tickets have been booked.');
      navigation.navigate('Bookings');
    } catch (error) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setBookingLoading(false);
    }
  };

  const isOrganizer = user?._id === event?.organizer?._id;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) return null;

  const date = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image 
          source={{ uri: event.imageUrl || 'https://via.placeholder.com/500x300' }} 
          style={styles.image} 
        />
        
        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Date</Text>
                <Text style={styles.infoValue}>{date}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MapPin size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Venue</Text>
                <Text style={styles.infoValue}>{event.venue}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Users size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Organizer</Text>
                <Text style={styles.infoValue}>{event.organizer?.name || 'Event Organizer'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {!isOrganizer ? (
          <>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>${event.ticketPrice.toFixed(2)}</Text>
              <Text style={styles.seatsLeft}>{event.availableSeats} seats left</Text>
            </View>
            
            <View style={styles.bookingControls}>
              <View style={styles.ticketInputContainer}>
                <CustomInput 
                  value={tickets}
                  onChangeText={setTickets}
                  keyboardType="number-pad"
                  placeholder="Qty"
                />
              </View>
              <View style={styles.bookButtonWrapper}>
                <CustomButton 
                  title="Book Now" 
                  onPress={handleBook}
                  loading={bookingLoading}
                  disabled={event.availableSeats === 0}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.organizerActions}>
            <Text style={styles.organizerText}>You are organizing this event</Text>
            <View style={styles.bookButtonWrapper}>
               <CustomButton title="Edit Event" variant="outline" onPress={() => {}} />
            </View>
          </View>
        )}
      </View>
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
  scroll: {
    paddingBottom: 120,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 24,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(26, 26, 36, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 24,
    lineHeight: 34,
  },
  infoSection: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.textLight,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.secondary,
  },
  priceValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  seatsLeft: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  bookingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
  },
  ticketInputContainer: {
    width: 60,
    marginRight: 12,
  },
  bookButtonWrapper: {
    flex: 1,
  },
  organizerActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  organizerText: {
    fontSize: 14,
    color: colors.secondary,
    flex: 1,
  }
});

export default EventDetailScreen;
