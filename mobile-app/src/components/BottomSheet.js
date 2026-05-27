import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, Platform, Dimensions, Keyboard } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { theme, getSpringConfig, getTimingConfig } from '../constants/theme';
import AnimatedPressable from './AnimatedPressable';

export default function BottomSheet({ 
  visible, 
  onClose, 
  title, 
  children, 
  height = '80%'
}) {
  const { height: screenHeight } = Dimensions.get('window');
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      opacity.value = withTiming(1, getTimingConfig(300));
      translateY.value = withSpring(0, getSpringConfig({ damping: 25, stiffness: 150 }));
    } else {
      opacity.value = withTiming(0, getTimingConfig(250));
      translateY.value = withTiming(screenHeight, getTimingConfig(250), (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [visible, screenHeight]);

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!shouldRender) return null;

  return (
    <Modal
      transparent
      visible={shouldRender}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.avoidingView}
      >
        <Animated.View style={[styles.contentContainer, { height }, animatedContentStyle]}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <AnimatedPressable 
              onPress={onClose} 
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close sheet"
              accessibilityRole="button"
            >
              <X size={18} color={theme.colors.textSecondary} />
            </AnimatedPressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  avoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay || 'rgba(15, 23, 42, 0.6)',
  },
  contentContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl || 24,
    borderTopRightRadius: theme.borderRadius.xxl || 24,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.borderLight,
  },
  content: {
    flex: 1,
  },
});
