import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';

const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon: IconComponent,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'danger':
        return colors.danger;
      case 'secondary':
        return colors.dark;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textLight;
    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text;
      default:
        return colors.white;
    }
  };

  const isOutline = variant === 'outline';
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`size_${size}`],
        { backgroundColor: getBackgroundColor() },
        isOutline && styles.outline,
        variant === 'primary' && !disabled && styles.primaryShadow,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {IconComponent && iconPosition === 'left' && (
            <View style={styles.iconLeft}>
              <IconComponent size={size === 'sm' ? 16 : 18} color={textColor} />
            </View>
          )}
          <Text style={[styles.text, styles[`textSize_${size}`], { color: textColor }, textStyle]}>
            {title}
          </Text>
          {IconComponent && iconPosition === 'right' && (
            <View style={styles.iconRight}>
              <IconComponent size={size === 'sm' ? 16 : 18} color={textColor} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  size_sm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  size_md: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  size_lg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 18,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  primaryShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 17,
  },
});

export default CustomButton;
