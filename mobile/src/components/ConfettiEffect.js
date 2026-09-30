import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#FBBF24', // Warm Gold
];

const NUM_PIECES = 65;

const ConfettiPiece = ({ index }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  // Randomized static properties per piece
  const startX = useRef(Math.random() * SCREEN_WIDTH).current;
  const driftX = useRef((Math.random() - 0.5) * 160).current;
  const sizeWidth = useRef(Math.random() * 8 + 6).current;
  const sizeHeight = useRef(Math.random() * 12 + 6).current;
  const isCircle = useRef(Math.random() > 0.6).current;
  const color = useRef(CONFETTI_COLORS[index % CONFETTI_COLORS.length]).current;
  const delay = useRef(Math.random() * 400).current;
  const duration = useRef(2400 + Math.random() * 1200).current;
  const rotationTarget = useRef((Math.random() > 0.5 ? 1 : -1) * (720 + Math.random() * 720)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [animValue, delay, duration]);

  const translateY = animValue.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [-30, SCREEN_HEIGHT * 0.1, SCREEN_HEIGHT + 40],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, startX + driftX * 0.5, startX + driftX],
  });

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${rotationTarget}deg`],
  });

  const rotateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.5, 1, 0.8],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.piece,
        {
          width: sizeWidth,
          height: sizeHeight,
          borderRadius: isCircle ? sizeWidth / 2 : 2,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate },
            { rotateX },
            { scale },
          ],
        },
      ]}
    />
  );
};

const ConfettiEffect = ({ active = true, onComplete }) => {
  useEffect(() => {
    if (active && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: NUM_PIECES }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default ConfettiEffect;
