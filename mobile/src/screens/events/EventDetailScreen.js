import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import client from '../../api/client';
import colors from '../../theme/colors';
import { Calendar, MonitorPlay, ShieldAlert, Heart, ChevronLeft, Star } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';

const { height } = Dimensions.get('window');

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [tickets, setTickets] = useState('1');
  const [activeTab, setActiveTab] = useState('Date and Time');

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header Image Area */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: event.imageUrl || 'https://via.placeholder.com/500x300' }} 
            style={styles.heroImage} 
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.circularButton} onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circularButton}>
              <Heart size={20} color={colors.primary} fill={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceCurrent}>${event.ticketPrice.toFixed(0)}</Text>
              <Text style={styles.priceOld}>${(event.ticketPrice * 1.25).toFixed(0)}</Text>
            </View>
          </View>
          
          <View style={styles.ratingRow}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text style={styles.ratingText}>4.8 <Text style={styles.ratingSubtext}>(194 reading)</Text></Text>
          </View>

          {/* Feature Tabs Row */}
          <View style={styles.featuresRow}>
            <TouchableOpacity style={styles.featureItem} onPress={() => setActiveTab('Online event')}>
              <MonitorPlay size={24} color={activeTab === 'Online event' ? colors.primary : colors.secondary} />
              <Text style={[styles.featureText, activeTab === 'Online event' && styles.featureTextActive]}>Online event</Text>
              {activeTab === 'Online event' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => setActiveTab('Refund policy')}>
              <ShieldAlert size={24} color={activeTab === 'Refund policy' ? colors.primary : colors.secondary} />
              <Text style={[styles.featureText, activeTab === 'Refund policy' && styles.featureTextActive]}>Refund policy</Text>
              {activeTab === 'Refund policy' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => setActiveTab('Date and Time')}>
              <Calendar size={24} color={activeTab === 'Date and Time' ? colors.primary : colors.secondary} />
              <Text style={[styles.featureText, activeTab === 'Date and Time' && styles.featureTextActive]}>Date and Time</Text>
              {activeTab === 'Date and Time' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Tab Content Placeholder */}
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
            <Text style={styles.descriptionText}>Venue: {event.venue}</Text>
            <Text style={styles.descriptionText}>Date: {new Date(event.date).toLocaleDateString()}</Text>
            
            <View style={styles.inputContainer}>
               <Text style={styles.inputLabel}>Number of Tickets:</Text>
               <CustomInput 
                  value={tickets}
                  onChangeText={setTickets}
                  keyboardType="number-pad"
                  placeholder="1"
               />
               <Text style={styles.seatsLeft}>{event.availableSeats} seats remaining</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.bookButton, event.availableSeats === 0 && styles.bookButtonDisabled]} 
          onPress={handleBook}
          disabled={event.availableSeats === 0 || bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.bookButtonText}>Get tickets</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingBottom: 100,
  },
  heroContainer: {
    height: height * 0.4,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginRight: 16,
    lineHeight: 32,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceCurrent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  priceOld: {
    fontSize: 12,
    color: colors.secondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  ratingSubtext: {
    color: colors.secondary,
    fontWeight: '500',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
  },
  featureTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 6,
  },
  tabContent: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textLight,
    marginBottom: 12,
  },
  inputContainer: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  seatsLeft: {
    fontSize: 12,
    color: colors.primary,
    marginTop: -8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: colors.secondary,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  }
});

export default EventDetailScreen;
