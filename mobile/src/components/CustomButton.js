import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const CustomButton = ({ title, onPress, loading = false, disabled = false, variant = 'primary' }) => {
  
  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    if (variant === 'primary') return colors.primary;
    if (variant === 'danger') return colors.danger;
    if (variant === 'outline') return 'transparent';
    return colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return colors.textLight;
    if (variant === 'outline') return colors.primary;
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default CustomButton;
