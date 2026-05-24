import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

/**
 * ClinicalCanvas
 * A high-performance wrapper component that dynamically adjusts its padding
 * to avoid hardware notches and status bars across all mobile devices.
 */
const ClinicalCanvas = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  // On Web, the notch is typically not an issue, but we still apply 
  // standard padding for consistency. On Native, we use the device-specific insets.
  const dynamicStyle = {
    paddingTop: Platform.OS === 'web' ? theme.spacing.lg : Math.max(insets.top, theme.spacing.md),
    paddingBottom: Platform.OS === 'web' ? theme.spacing.md : Math.max(insets.bottom, theme.spacing.md),
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  return (
    <View style={[styles.canvas, dynamicStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default ClinicalCanvas;
