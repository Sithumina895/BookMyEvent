import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import colors from '../theme/colors';

// Palette of vibrant, tasteful avatar background gradients/colors
const AVATAR_PALETTE = [
  { bg: '#E04D38', text: '#FFFFFF' }, // Primary Coral
  { bg: '#2EC4B6', text: '#FFFFFF' }, // Teal
  { bg: '#6366F1', text: '#FFFFFF' }, // Indigo
  { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink
  { bg: '#F59E0B', text: '#FFFFFF' }, // Amber
  { bg: '#0EA5E9', text: '#FFFFFF' }, // Sky
  { bg: '#10B981', text: '#FFFFFF' }, // Emerald
];

const getAvatarTheme = (name) => {
  if (!name || typeof name !== 'string') return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const SIZES = {
  sm: { size: 36, fontSize: 13, dot: 8 },
  md: { size: 46, fontSize: 16, dot: 10 },
  lg: { size: 64, fontSize: 24, dot: 14 },
  xl: { size: 90, fontSize: 32, dot: 18 },
};

const UserAvatar = ({ name = 'User', imageUri, size = 'md', showOnline = false, style }) => {
  const config = SIZES[size] || SIZES.md;
  const theme = getAvatarTheme(name);
  const initials = getInitials(name);

  return (
    <View style={[styles.wrapper, { width: config.size, height: config.size }, style]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { width: config.size, height: config.size, borderRadius: config.size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.avatarContainer,
            {
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
              backgroundColor: theme.bg,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: config.fontSize, color: theme.text }]}>
            {initials}
          </Text>
        </View>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: config.dot,
              height: config.dot,
              borderRadius: config.dot / 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initials: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  image: {
    resizeMode: 'cover',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.white,
  },
});

export default UserAvatar;
