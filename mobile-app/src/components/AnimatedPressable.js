import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { getSpringConfig } from '../constants/theme';

const AnimatedPress = Animated.createAnimatedComponent(Pressable);

export default function AnimatedPressable({ children, onPress, style, disabled, hapticType = 'medium', ...props }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.97, getSpringConfig({ damping: 22, stiffness: 280 }));
    
    // Trigger haptics safely (wrap in try/catch in case haptics are not supported on the target device platform)
    try {
      if (hapticType === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (hapticType === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (hapticType === 'heavy') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      console.log('Haptics error:', error);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, getSpringConfig({ damping: 22, stiffness: 280 }));
  };

  return (
    <AnimatedPress
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPress>
  );
}
