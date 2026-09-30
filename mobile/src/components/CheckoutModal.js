import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Ticket,
  Lock,
  ArrowRight,
  CircleDollarSign,
  Smartphone,
  Building,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, subtitle: 'Instant confirmation' },
  { id: 'applepay', name: 'Digital Wallet', icon: Smartphone, subtitle: 'Apple Pay / Google Pay' },
  { id: 'cash', name: 'Pay at Entrance', icon: CircleDollarSign, subtitle: 'Reserve & pay on-site' },
];

const CheckoutModal = ({
  visible,
  onClose,
  event,
  ticketCount,
  onConfirmBooking,
  loading = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('884');
  const [cardHolder, setCardHolder] = useState('John Doe');

  if (!event) return null;

  const unitPrice = Number(event.ticketPrice) || 0;
  const subtotal = unitPrice * ticketCount;
  const serviceFee = unitPrice > 0 ? 2.5 : 0;
  const total = (subtotal + serviceFee).toFixed(2);

  const eventDate = event.date ? new Date(event.date) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.securityBadge}>
                <Lock size={12} color={colors.success} style={{ marginRight: 4 }} />
                <Text style={styles.securityText}>256-BIT ENCRYPTED CHECKOUT</Text>
              </View>
              <Text style={styles.sheetTitle}>Checkout & Payment</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Order Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionHeader}>Order Summary</Text>

              <View style={styles.eventRow}>
                <View style={styles.ticketIconWrap}>
                  <Ticket size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View style={styles.eventMetaRow}>
                    <Calendar size={12} color={colors.textLight} style={{ marginRight: 4 }} />
                    <Text style={styles.eventMetaText}>{formattedDate}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  {ticketCount}x Standard Ticket ({unitPrice === 0 ? 'Free' : `$${unitPrice.toFixed(2)}`})
                </Text>
                <Text style={styles.breakdownValue}>
                  {unitPrice === 0 ? 'Free' : `$${subtotal.toFixed(2)}`}
                </Text>
              </View>

              {unitPrice > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Processing & Platform Fee</Text>
                  <Text style={styles.breakdownValue}>${serviceFee.toFixed(2)}</Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Due</Text>
                <Text style={styles.totalValue}>{unitPrice === 0 ? 'Free' : `$${total}`}</Text>
              </View>
            </View>

            {/* Payment Method Selector */}
            <Text style={styles.sectionHeader}>Select Payment Method</Text>
            <View style={styles.methodsList}>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                    onPress={() => setSelectedMethod(method.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.methodIconWrap,
                        isSelected && { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Icon size={20} color={isSelected ? colors.primary : colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.methodTitle,
                          isSelected && { color: colors.text, fontWeight: '800' },
                        ]}
                      >
                        {method.name}
                      </Text>
                      <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                    </View>
                    <View
                      style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Credit Card Input Form (Shown when card is selected) */}
            {selectedMethod === 'card' && (
              <View style={styles.cardForm}>
                <Text style={styles.formGroupTitle}>Card Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={cardHolder}
                    onChangeText={setCardHolder}
                    placeholder="Full name as shown on card"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <View style={styles.cardInputRow}>
                    <CreditCard size={18} color={colors.primary} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.textInput, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      placeholder="1234 5678 9012 3456"
                      keyboardType="numeric"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                </View>

                <View style={styles.twoColRow}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.inputLabel}>Expires (MM/YY)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={expiry}
                      onChangeText={setExpiry}
                      placeholder="MM/YY"
                      keyboardType="numeric"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Security Code (CVV)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      keyboardType="numeric"
                      secureTextEntry
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Guarantee Notice */}
            <View style={styles.guaranteeRow}>
              <ShieldCheck size={16} color={colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.guaranteeText}>
                Guaranteed verified tickets with instant QR entry pass.
              </Text>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={onConfirmBooking}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <View style={styles.payButtonContent}>
                  <Text style={styles.payButtonText}>
                    Confirm & Pay {unitPrice === 0 ? 'Free' : `$${total}`}
                  </Text>
                  <ArrowRight size={18} color={colors.white} style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 20, 26, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: {
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  eventMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  methodsList: {
    gap: 10,
    marginBottom: 18,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  methodIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  methodSubtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  cardForm: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  formGroupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  cardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  twoColRow: {
    flexDirection: 'row',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  guaranteeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
  },
});

export default CheckoutModal;
