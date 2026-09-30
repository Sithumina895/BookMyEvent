import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Users } from 'lucide-react-native';
import colors from '../theme/colors';

const EventCard = ({ event, onPress }) => {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image 
        source={{ uri: event.imageUrl || 'https://via.placeholder.com/500x300' }} 
        style={styles.image} 
      />
      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        
        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.textLight} style={styles.icon} />
          <Text style={styles.infoText}>{date}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.textLight} style={styles.icon} />
          <Text style={styles.infoText} numberOfLines={1}>{event.venue}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${event.ticketPrice.toFixed(2)}</Text>
          <View style={styles.capacityContainer}>
            <Users size={14} color={colors.primary} style={styles.icon} />
            <Text style={styles.capacityText}>
              {event.availableSeats} / {event.totalCapacity}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    position: 'absolute',
    top: -24,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  capacityText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default EventCard;
