import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { theme } from '../constants/theme';

export default function SkeletonLoader({ variant = 'card', style }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.35, { duration: 800 })
      ),
      -1, // infinite
      true // reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const renderContent = () => {
    switch (variant) {
      case 'circle':
        return <View style={styles.circle} />;
      case 'square':
        return <View style={styles.square} />;
      case 'list':
        return (
          <View style={styles.listContainer}>
            <View style={styles.lineLong} />
            <View style={styles.lineMedium} />
            <View style={styles.lineShort} />
          </View>
        );
      case 'card':
      default:
        return (
          <View style={styles.cardContainer}>
            <View style={styles.row}>
              <View style={styles.avatarPlaceholder} />
              <View style={styles.cardHeader}>
                <View style={styles.lineMedium} />
                <View style={[styles.lineShort, { marginTop: 8 }]} />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.grid}>
              <View style={styles.gridItem} />
              <View style={styles.gridItem} />
              <View style={styles.gridItem} />
            </View>
          </View>
        );
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {renderContent()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  square: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  listContainer: {
    paddingVertical: 12,
  },
  lineLong: {
    height: 16,
    width: '90%',
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
    marginBottom: 10,
  },
  lineMedium: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
    marginBottom: 10,
  },
  lineShort: {
    height: 12,
    width: '40%',
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
  },
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9ECEF',
  },
  cardHeader: {
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 14,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    height: 16,
    width: '28%',
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
  },
});
