import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import colors from '../theme/colors';
import { X, Calendar, MapPin, Ticket as TicketIcon, CheckCircle2, Share2, Download } from 'lucide-react-native';
import Svg, { Rect, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// A clean SVG QR Code generator simulation for modern aesthetics
const SimulatedQRCode = ({ size = 160 }) => (
  <View style={[styles.qrContainer, { width: size, height: size }]}>
    <Svg width={size - 20} height={size - 20} viewBox="0 0 100 100">
      {/* Outer Corners */}
      <Rect x="5" y="5" width="26" height="26" rx="4" fill={colors.text} />
      <Rect x="9" y="9" width="18" height="18" rx="2" fill={colors.white} />
      <Rect x="13" y="13" width="10" height="10" rx="1" fill={colors.text} />

      <Rect x="69" y="5" width="26" height="26" rx="4" fill={colors.text} />
      <Rect x="73" y="9" width="18" height="18" rx="2" fill={colors.white} />
      <Rect x="77" y="13" width="10" height="10" rx="1" fill={colors.text} />

      <Rect x="5" y="69" width="26" height="26" rx="4" fill={colors.text} />
      <Rect x="9" y="73" width="18" height="18" rx="2" fill={colors.white} />
      <Rect x="13" y="77" width="10" height="10" rx="1" fill={colors.text} />

      {/* Center & Random Matrix patterns */}
      <Rect x="42" y="42" width="16" height="16" rx="3" fill={colors.primary} />
      <Rect x="46" y="46" width="8" height="8" rx="1" fill={colors.white} />

      <Rect x="36" y="10" width="8" height="12" fill={colors.text} rx="1" />
      <Rect x="48" y="8" width="14" height="6" fill={colors.text} rx="1" />
      <Rect x="10" y="38" width="6" height="14" fill={colors.text} rx="1" />
      <Rect x="20" y="45" width="12" height="6" fill={colors.text} rx="1" />
      <Rect x="70" y="38" width="8" height="8" fill={colors.text} rx="1" />
      <Rect x="82" y="48" width="10" height="14" fill={colors.text} rx="1" />
      <Rect x="38" y="72" width="12" height="8" fill={colors.text} rx="1" />
      <Rect x="56" y="68" width="6" height="16" fill={colors.text} rx="1" />
      <Rect x="72" y="78" width="18" height="8" fill={colors.text} rx="1" />
    </Svg>
  </View>
);

const TicketModal = ({ visible, onClose, booking }) => {
  if (!booking) return null;

  const event = booking.event || {};
  const eventDate = event.date ? new Date(event.date) : new Date();
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const year = eventDate.getFullYear();
  const time = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const ticketCode = (booking._id || 'BME890432').slice(-8).toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Confirmation Header */}
            <View style={styles.statusBadge}>
              <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={styles.statusText}>
                {booking.status === 'CANCELLED' ? 'BOOKING CANCELLED' : 'VERIFIED PASS'}
              </Text>
            </View>

            <Text style={styles.modalTitle}>Digital Entry Ticket</Text>
            <Text style={styles.modalSubtitle}>Scan at the entrance gate for quick admission</Text>

            {/* Boarding Pass Style Card */}
            <View style={styles.ticketCard}>
              {/* Ticket Card Top */}
              <View style={styles.ticketHeader}>
                <View style={styles.ticketCategoryPill}>
                  <Text style={styles.ticketCategoryText}>{event.category || 'Event'}</Text>
                </View>
                <Text style={styles.ticketCode}>#{ticketCode}</Text>
              </View>

              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title || 'Event Title'}
              </Text>

              <View style={styles.metaRow}>
                <MapPin size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {event.venue || 'Main Venue'}
                </Text>
              </View>

              {/* Middle Perforated Divider with Notches */}
              <View style={styles.dividerContainer}>
                <View style={styles.notchLeft} />
                <View style={styles.dashedLine} />
                <View style={styles.notchRight} />
              </View>

              {/* Details Grid */}
              <View style={styles.ticketDetails}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>DATE</Text>
                  <Text style={styles.detailValue}>{`${month} ${day}, ${year}`}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>TIME</Text>
                  <Text style={styles.detailValue}>{time}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>TICKETS</Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>
                    {booking.numberOfTickets || 1} VIP
                  </Text>
                </View>
              </View>

              {/* QR Code Container */}
              <View style={styles.qrSection}>
                <SimulatedQRCode size={150} />
                <Text style={styles.scanNotice}>PASS ID: {ticketCode}</Text>
                <Text style={styles.ticketTotalText}>
                  Total Paid: ${(booking.totalPrice || event.ticketPrice || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={onClose} activeOpacity={0.8}>
                <Share2 size={16} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={styles.actionBtnTextSecondary}>Share Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => alert('Pass saved to offline tickets!')}
                activeOpacity={0.8}
              >
                <Download size={16} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.actionBtnTextPrimary}>Save to Wallet</Text>
              </TouchableOpacity>
            </View>
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
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  scroll: {
    alignItems: 'center',
    paddingTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  ticketCard: {
    width: width - 48,
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketCategoryPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  ticketCode: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    fontFamily: 'Courier',
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  dividerContainer: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    marginHorizontal: -20,
    marginBottom: 12,
  },
  notchLeft: {
    position: 'absolute',
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  notchRight: {
    position: 'absolute',
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginHorizontal: 20,
  },
  ticketDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 4,
  },
  detailCol: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  qrSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  qrContainer: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: 8,
    letterSpacing: 1.5,
  },
  ticketTotalText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    width: width - 48,
    gap: 12,
    marginTop: 20,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionBtnTextSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  actionBtnTextPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

export default TicketModal;
