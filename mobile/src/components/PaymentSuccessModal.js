import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';
import { CheckCircle2, Ticket, Calendar, MapPin, ArrowRight } from 'lucide-react-native';
import ConfettiEffect from './ConfettiEffect';
import { playPaymentSuccessSound } from '../utils/soundEffects';

const { width } = Dimensions.get('window');

const PaymentSuccessModal = ({
  visible,
  onClose,
  bookingDetails,
  onViewTicket,
  onGoToBookings,
}) => {
  useEffect(() => {
    if (visible) {
      playPaymentSuccessSound();
    }
  }, [visible]);

  if (!bookingDetails) return null;

  const { event, ticketCount, totalPaid } = bookingDetails;
  const eventDate = event?.date ? new Date(event.date) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti Explosion Layer */}
        <ConfettiEffect active={visible} />

        <View style={styles.card}>
          {/* Animated Success Badge */}
          <View style={styles.iconCircle}>
            <CheckCircle2 size={42} color={colors.white} strokeWidth={2.5} />
          </View>

          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Your reservation is confirmed. Your digital entry pass is ready.
          </Text>

          {/* Receipt / Event Summary */}
          <View style={styles.receiptBox}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {event?.title || 'Event'}
            </Text>

            <View style={styles.metaRow}>
              <Calendar size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>

            <View style={styles.metaRow}>
              <MapPin size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.metaText} numberOfLines={1}>
                {event?.venue || 'Location'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <View>
                <Text style={styles.statLabel}>Tickets</Text>
                <Text style={styles.statValue}>{ticketCount}x Standard</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.statLabel}>Total Paid</Text>
                <Text style={styles.statValue}>
                  {Number(totalPaid) === 0 ? 'Free' : `$${Number(totalPaid).toFixed(2)}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onViewTicket}
            activeOpacity={0.88}
          >
            <Ticket size={18} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>View Digital Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onGoToBookings}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Go to My Bookings</Text>
            <ArrowRight size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 17, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: Math.min(width - 40, 380),
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default PaymentSuccessModal;
