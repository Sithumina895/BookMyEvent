import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, ArrowUpRight, Calendar } from 'lucide-react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 60) / 2; // 2 columns with padding

const EventCard = ({ event, onPress, variant = 'grid' }) => {
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const year = eventDate.getFullYear();
  const time = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.featuredTopHalf}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>{day}</Text>
            <Text style={styles.dateBadgeMonth}>{month}</Text>
            <Text style={styles.dateBadgeYear}>{year}</Text>
          </View>
          
          <View style={styles.featuredContent}>
            <View style={styles.featuredCategoryRow}>
              <Text style={styles.featuredCategoryText}>{event.category}</Text>
              <View style={styles.onlineTag}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>{event.title}</Text>
            <Text style={styles.featuredTime}>{time} GMT</Text>
          </View>
        </View>
        
        <View style={styles.featuredImageContainer}>
          <Image 
            source={{ uri: event.imageUrl || 'https://via.placeholder.com/500x300' }} 
            style={styles.featuredImage} 
          />
          <View style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Event</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid Variant
  const fullDate = `${eventDate.toLocaleDateString('en-US', { weekday: 'short' })}, ${day} ${month} ${year}`;
  
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.gridHeader}>
        <Text style={styles.gridCategory} numberOfLines={1}>{event.category}</Text>
        <ArrowUpRight size={16} color={colors.textLight} />
      </View>
      <Text style={styles.gridTitle} numberOfLines={2}>{event.title}</Text>
      
      <View style={styles.onlineTagGrid}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineTextGrid}>Online</Text>
      </View>
      
      <View style={styles.gridFooter}>
        <View style={styles.gridDateRow}>
          <Calendar size={12} color={colors.textLight} style={{ marginRight: 6 }} />
          <Text style={styles.gridDateText}>{fullDate}</Text>
        </View>
        <Text style={styles.gridTimeText}>{time} GMT</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // FEATURED STYLES (Orange Card)
  featuredCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    marginBottom: 24,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  featuredTopHalf: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 20,
  },
  dateBadge: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    height: 80,
    width: 65,
  },
  dateBadgeDay: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  dateBadgeMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  dateBadgeYear: {
    fontSize: 10,
    color: colors.textLight,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featuredCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredCategoryText: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.9,
  },
  onlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 4,
  },
  onlineText: {
    color: colors.white,
    fontSize: 12,
  },
  featuredTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredTime: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.8,
  },
  featuredImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  joinButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },

  // GRID STYLES (White Cards)
  gridCard: {
    backgroundColor: colors.white,
    width: GRID_ITEM_WIDTH,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    flex: 1,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
    minHeight: 40,
  },
  onlineTagGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  onlineTextGrid: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  gridFooter: {
    marginTop: 'auto',
  },
  gridDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridDateText: {
    fontSize: 11,
    color: colors.textLight,
  },
  gridTimeText: {
    fontSize: 11,
    color: colors.textLight,
    marginLeft: 18,
  },
});

export default EventCard;
