import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import AnimatedPressable from './AnimatedPressable';
import AnimatedMount from './AnimatedMount';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  style 
}) {
  return (
    <AnimatedMount slide style={[styles.container, style]}>
      {Icon && (
        <View style={styles.iconContainer}>
          <Icon size={32} color={theme.colors.primary} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionLabel && onAction && (
        <AnimatedPressable style={styles.cta} onPress={onAction}>
          <Text style={styles.ctaText}>{actionLabel}</Text>
        </AnimatedPressable>
      )}
    </AnimatedMount>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
  },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily,
  },
});
