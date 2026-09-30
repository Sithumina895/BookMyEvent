import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MapPin, Calendar, Clock, ArrowUpRight, Sparkles, Heart } from 'lucide-react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 56) / 2; // 2 columns with 20px padding + 16px gap

// Reliable curated high quality category fallbacks
const CATEGORY_FALLBACK_IMAGES = {
  Music: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop',
  Tech: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
  Food: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
  Business: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?q=80&w=800&auto=format&fit=crop',
  Art: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
  Default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
};

const getEventImage = (event) => {
  if (event?.imageUrl && !event.imageUrl.includes('placeholder')) {
    return event.imageUrl;
  }
  return CATEGORY_FALLBACK_IMAGES[event?.category] || CATEGORY_FALLBACK_IMAGES.Default;
};

const EventCard = ({ event, onPress, onBookmark, isBookmarked = false, variant = 'grid' }) => {
  if (!event) return null;

  const eventDate = event.date ? new Date(event.date) : new Date();
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const year = eventDate.getFullYear();
  const time = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const fullDate = `${eventDate.toLocaleDateString('en-US', { weekday: 'short' })}, ${day} ${month}`;
  const imageUrl = getEventImage(event);
  const categoryTheme = colors.categories[event.category] || colors.categories.Default;

  // 1. FEATURED HERO VARIANT
  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.92}>
        <View style={styles.featuredImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.featuredImage} />
          <View style={styles.featuredImageOverlay} />

          {/* Top Badges */}
          <View style={styles.featuredTopRow}>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Live & In-Person</Text>
            </View>

            {onBookmark && (
              <TouchableOpacity
                style={styles.bookmarkBtn}
                onPress={onBookmark}
                activeOpacity={0.7}
              >
                <Heart
                  size={18}
                  color={isBookmarked ? colors.primary : colors.white}
                  fill={isBookmarked ? colors.primary : 'none'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Date Badge floating inside image */}
          <View style={styles.featuredDateBadge}>
            <Text style={styles.featuredDateMonth}>{month.toUpperCase()}</Text>
            <Text style={styles.featuredDateDay}>{day}</Text>
          </View>
        </View>

        {/* Featured Content Bottom */}
        <View style={styles.featuredContent}>
          <View style={styles.featuredCategoryRow}>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: categoryTheme.bg, borderColor: categoryTheme.border },
              ]}
            >
              <Text style={[styles.categoryTagText, { color: categoryTheme.text }]}>
                {event.category}
              </Text>
            </View>
            <View style={styles.timeTag}>
              <Clock size={12} color={colors.textLight} style={{ marginRight: 4 }} />
              <Text style={styles.timeText}>{time}</Text>
            </View>
          </View>

          <Text style={styles.featuredTitle} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.venueRow}>
            <MapPin size={13} color={colors.primary} style={{ marginRight: 5 }} />
            <Text style={styles.venueText} numberOfLines={1}>
              {event.venue || 'Main Auditorium'}
            </Text>
          </View>

          <View style={styles.featuredFooter}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.featuredPrice}>
                {event.ticketPrice === 0 ? 'Free' : `$${Number(event.ticketPrice).toFixed(2)}`}
              </Text>
            </View>

            <TouchableOpacity style={styles.bookCtaBtn} onPress={onPress} activeOpacity={0.8}>
              <Text style={styles.bookCtaText}>Get Tickets</Text>
              <ArrowUpRight size={15} color={colors.white} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // 2. TRENDING HORIZONTAL VARIANT (for carousels)
  if (variant === 'trending') {
    return (
      <TouchableOpacity style={styles.trendingCard} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.trendingImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.trendingImage} />
          <View
            style={[
              styles.trendingCategoryBadge,
              { backgroundColor: 'rgba(18, 20, 26, 0.75)' },
            ]}
          >
            <Text style={styles.trendingCategoryText}>{event.category}</Text>
          </View>
        </View>

        <View style={styles.trendingBody}>
          <Text style={styles.trendingTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.trendingDateRow}>
            <Calendar size={11} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.trendingDateText}>{fullDate}</Text>
          </View>
          <View style={styles.trendingFooter}>
            <Text style={styles.trendingPrice}>
              {event.ticketPrice === 0 ? 'Free' : `$${Number(event.ticketPrice).toFixed(0)}`}
            </Text>
            <View style={styles.trendingArrow}>
              <ArrowUpRight size={13} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // 3. ROW VARIANT (Row by Row layout)
  if (variant === 'row') {
    return (
      <TouchableOpacity style={styles.rowCard} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.rowImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.rowImage} />
          <View style={styles.rowPriceBadge}>
            <Text style={styles.rowPriceText}>
              {event.ticketPrice === 0 ? 'Free' : `$${Number(event.ticketPrice).toFixed(0)}`}
            </Text>
          </View>
        </View>

        <View style={styles.rowContent}>
          <View style={styles.rowTopHeader}>
            <View
              style={[
                styles.categoryTagSmall,
                { backgroundColor: categoryTheme.bg, borderColor: categoryTheme.border, marginBottom: 0 },
              ]}
            >
              <Text style={[styles.categoryTagSmallText, { color: categoryTheme.text }]}>
                {event.category}
              </Text>
            </View>
            <View style={styles.rowTimeWrap}>
              <Clock size={11} color={colors.textLight} style={{ marginRight: 3 }} />
              <Text style={styles.rowTimeText}>{time}</Text>
            </View>
          </View>

          <Text style={styles.rowTitle} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.rowMetaRow}>
            <Calendar size={11} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.rowDateText}>{fullDate}</Text>
          </View>

          <View style={styles.rowBottomRow}>
            <View style={styles.rowVenueWrap}>
              <MapPin size={11} color={colors.textLight} style={{ marginRight: 4 }} />
              <Text style={styles.rowVenueText} numberOfLines={1}>
                {event.venue || 'Main Auditorium'}
              </Text>
            </View>
            <View style={styles.rowArrowBtn}>
              <ArrowUpRight size={13} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // 4. GRID 2-COLUMN VARIANT (Default)
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.gridImageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.gridImage} />
        <View style={styles.gridPricePill}>
          <Text style={styles.gridPriceText}>
            {event.ticketPrice === 0 ? 'Free' : `$${Number(event.ticketPrice).toFixed(0)}`}
          </Text>
        </View>
      </View>

      <View style={styles.gridBody}>
        <View
          style={[
            styles.categoryTagSmall,
            { backgroundColor: categoryTheme.bg, borderColor: categoryTheme.border },
          ]}
        >
          <Text style={[styles.categoryTagSmallText, { color: categoryTheme.text }]}>
            {event.category}
          </Text>
        </View>

        <Text style={styles.gridTitle} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.gridDateRow}>
          <Calendar size={11} color={colors.textLight} style={{ marginRight: 4 }} />
          <Text style={styles.gridDateText}>{fullDate}</Text>
        </View>

        <View style={styles.gridVenueRow}>
          <MapPin size={11} color={colors.textLight} style={{ marginRight: 4 }} />
          <Text style={styles.gridVenueText} numberOfLines={1}>
            {event.venue || 'Online'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Featured Styles
  featuredCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  featuredImageWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 20, 26, 0.25)',
  },
  featuredTopRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backdropFilter: 'blur(8px)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  onlineText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  bookmarkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(18, 20, 26, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredDateBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredDateMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  featuredDateDay: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 20,
  },
  featuredContent: {
    padding: 18,
  },
  featuredCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  venueText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  bookCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  bookCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },

  // Trending Horizontal Styles
  trendingCard: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: 18,
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  trendingImageWrapper: {
    height: 115,
    width: '100%',
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingCategoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendingCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  trendingBody: {
    padding: 12,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  trendingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingDateText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  trendingPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },
  trendingArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grid Styles
  gridCard: {
    backgroundColor: colors.white,
    width: GRID_ITEM_WIDTH,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  gridImageWrapper: {
    height: 105,
    width: '100%',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPricePill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(18, 20, 26, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridPriceText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  gridBody: {
    padding: 12,
  },
  categoryTagSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  categoryTagSmallText: {
    fontSize: 9,
    fontWeight: '700',
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  gridDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridDateText: {
    fontSize: 10.5,
    color: colors.textLight,
    fontWeight: '500',
  },
  gridVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridVenueText: {
    fontSize: 10.5,
    color: colors.textLight,
    fontWeight: '500',
    flex: 1,
  },

  // ROW VARIANT STYLES
  rowCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    width: '100%',
  },
  rowImageWrapper: {
    width: 105,
    height: 105,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    marginRight: 14,
  },
  rowImage: {
    width: '100%',
    height: '100%',
  },
  rowPriceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(18, 20, 26, 0.82)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rowPriceText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.white,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTimeText: {
    fontSize: 10.5,
    color: colors.textLight,
    fontWeight: '500',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 19,
    marginBottom: 6,
  },
  rowMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  rowBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  rowVenueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  rowVenueText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rowArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventCard;
