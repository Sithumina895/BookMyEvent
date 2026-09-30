import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../theme/colors';
import {
  Calendar,
  MapPin,
  CircleDollarSign,
  Ticket,
  Users,
  Edit3,
  Trash2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';

const OrganizerEventCard = ({ event, onEdit, onDelete, onPress }) => {
  if (!event) return null;

  const totalCapacity = Number(event.totalCapacity) || 0;
  const availableSeats =
    event.availableSeats !== undefined
      ? Number(event.availableSeats)
      : totalCapacity;
  const ticketsSold = Math.max(0, totalCapacity - availableSeats);
  const ticketPrice = Number(event.ticketPrice) || 0;
  const revenue = ticketsSold * ticketPrice;
  const rawPercent = totalCapacity > 0 ? (ticketsSold / totalCapacity) * 100 : 0;
  const soldPercent =
    rawPercent > 0 && rawPercent < 1
      ? rawPercent.toFixed(1)
      : Math.round(rawPercent);

  const eventDate = event.date ? new Date(event.date) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const imageUrl =
    event.imageUrl && !event.imageUrl.includes('placeholder')
      ? event.imageUrl
      : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80';

  return (
    <View style={styles.card}>
      {/* Top Section: Image & Basic Details */}
      <TouchableOpacity
        style={styles.mainInfoRow}
        onPress={onPress}
        activeOpacity={0.88}
      >
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} />

        <View style={styles.detailsCol}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category || 'General'}</Text>
            </View>
            <Text style={styles.priceTag}>
              {ticketPrice === 0 ? 'Free' : `$${ticketPrice.toFixed(2)}`}
            </Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.metaRow}>
            <Calendar size={12} color={colors.textLight} style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>

          <View style={styles.metaRow}>
            <MapPin size={12} color={colors.textLight} style={{ marginRight: 4 }} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Analytics Dashboard Strip for this event */}
      <View style={styles.analyticsSection}>
        <View style={styles.progressHeader}>
          <View style={styles.progressHeaderLeft}>
            <TrendingUp size={13} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.progressLabel}>Sales Performance</Text>
          </View>
          <Text style={styles.progressPercent}>{soldPercent}% Sold</Text>
        </View>

        {/* Capacity Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(soldPercent, 100)}%` },
              soldPercent >= 90 && { backgroundColor: colors.warning },
              soldPercent === 100 && { backgroundColor: colors.danger },
            ]}
          />
        </View>

        {/* 3 Metric Pills */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Tickets Sold</Text>
            <View style={styles.metricValueRow}>
              <Ticket size={13} color={colors.success} style={{ marginRight: 4 }} />
              <Text style={styles.metricValue}>{ticketsSold}</Text>
            </View>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Remaining</Text>
            <View style={styles.metricValueRow}>
              <Users size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.metricValue}>{availableSeats}</Text>
            </View>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Revenue</Text>
            <View style={styles.metricValueRow}>
              <CircleDollarSign size={13} color={colors.warning} style={{ marginRight: 4 }} />
              <Text style={[styles.metricValue, { color: colors.success }]}>
                ${revenue.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons Row: Edit, Delete, View */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtnEdit}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Edit3 size={15} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnEditText}>Edit Event</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnDelete}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={15} color={colors.danger} style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnDeleteText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnDetails}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnDetailsText}>Details</Text>
          <ChevronRight size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  mainInfoRow: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 95,
    height: 95,
    borderRadius: 16,
    backgroundColor: colors.light,
  },
  detailsCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  analyticsSection: {
    marginTop: 14,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  actionBtnEdit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  actionBtnDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 12,
    backgroundColor: colors.light,
    borderRadius: 12,
  },
  actionBtnDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 2,
  },
});

export default OrganizerEventCard;
