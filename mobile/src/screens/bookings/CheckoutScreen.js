import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { ChevronLeft, CreditCard, ShieldCheck } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';
import client from '../../api/client';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

const CheckoutScreen = ({ route, navigation }) => {
  const { event, tickets } = route.params;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Hardcoded UI for credit card (No actual input needed, just UI)
  const subtotal = event.ticketPrice * parseInt(tickets);
  const fee = subtotal * 0.05; // 5% platform fee
  const total = subtotal + fee;

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulate payment gateway delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call API to create booking
      await client.post('/bookings', {
        eventId: event._id,
        numberOfTickets: parseInt(tickets)
      });
      
      setLoading(false);
      setSuccess(true);
      
      // Play Success Sound
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://actions.google.com/sounds/v1/ui/coins.ogg' },
          { shouldPlay: true }
        );
        // We do not wait for it to finish, it plays in the background
      } catch (e) {
        console.log("Could not play sound", e);
      }
      
      // Navigate to bookings after showing confetti for 3 seconds
      setTimeout(() => {
        navigation.navigate('Bookings');
      }, 3000);

    } catch (error) {
      setLoading(false);
      Alert.alert('Payment Failed', error.response?.data?.message || 'Something went wrong processing your payment.');
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <ConfettiCannon 
          count={200} 
          origin={{ x: width / 2, y: -20 }}
          colors={[colors.primary, colors.accent, colors.warning, '#E63946']}
          fadeOut={true}
        />
        <View style={styles.successCard}>
          <View style={styles.successIconWrapper}>
            <ShieldCheck size={48} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>Your booking is confirmed.</Text>
          <Text style={styles.successRedirect}>Redirecting to your tickets...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.eventName}>{event.title}</Text>
            <Text style={styles.eventDetail}>{new Date(event.date).toLocaleDateString()} at {event.venue}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{tickets}x Ticket{tickets > 1 ? 's' : ''}</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes & Fees</Text>
              <Text style={styles.summaryValue}>${fee.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.divider, { borderStyle: 'dashed' }]} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method (Mock UI) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <CreditCard size={24} color={colors.primary} />
              <Text style={styles.paymentCardText}>Credit or Debit Card</Text>
            </View>
            
            <View style={styles.mockInput}>
              <Text style={styles.mockInputText}>•••• •••• •••• 4242</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[styles.mockInput, { flex: 0.48 }]}>
                <Text style={styles.mockInputText}>MM/YY</Text>
              </View>
              <View style={[styles.mockInput, { flex: 0.48 }]}>
                <Text style={styles.mockInputText}>CVC</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay ${total.toFixed(2)}</Text>
              <ShieldCheck size={18} color={colors.white} style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>Payments are secure and encrypted</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 14,
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  mockInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  mockInputText: {
    color: colors.secondary,
    fontSize: 15,
    letterSpacing: 2,
  },
  footer: {
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
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
  },
  payButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secureText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.secondary,
    marginTop: 12,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  successRedirect: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  }
});

export default CheckoutScreen;
