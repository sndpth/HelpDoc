import { Platform } from 'react-native';

// Global animation profile controller
// Modes: 'disabled' (no animation) | 'subtle' (critically damped, clean) | 'standard' (balanced) | 'expressive' (springy)
export const ANIMATION_LEVEL = 'subtle';

export const getSpringConfig = (custom = {}) => {
  const defaults = { damping: 15, stiffness: 120, mass: 1 };
  const base = { ...defaults, ...custom };
  
  if (ANIMATION_LEVEL === 'disabled') {
    return { damping: 100, stiffness: 1000, mass: 0.1 }; // instant
  }
  if (ANIMATION_LEVEL === 'subtle') {
    return {
      damping: Math.max(base.damping * 1.6, 24),
      stiffness: base.stiffness * 1.25,
      mass: base.mass * 0.9,
    };
  }
  if (ANIMATION_LEVEL === 'expressive') {
    return {
      damping: Math.max(base.damping * 0.8, 10),
      stiffness: base.stiffness * 1.1,
      mass: base.mass,
    };
  }
  // 'standard' or default
  return base;
};

export const getTimingConfig = (duration, custom = {}) => {
  if (ANIMATION_LEVEL === 'disabled') {
    return { duration: 0, ...custom };
  }
  if (ANIMATION_LEVEL === 'subtle') {
    return { duration: Math.round(duration * 0.85), ...custom };
  }
  // 'standard' or 'expressive'
  return { duration, ...custom };
};

export const theme = {
  colors: {
    primary: '#004080', // Clinical Blue
    secondary: '#4895ef',
    background: '#F4F7FA',
    surface: '#FFFFFF',
    surfaceDim: '#F1F5F9',
    textPrimary: '#2B2D42',
    textSecondary: '#8D99AE',
    border: '#E9ECEF',
    borderLight: '#F0F4F8',
    success: '#4ade80',
    primaryLight: '#E6F0FA',
    surfaceSecondary: '#F8FAFC',
    danger: '#ef476f',
    error: '#ef476f',
    warning: '#F59E0B',
    info: '#06B6D4',
    accent: '#8B5CF6',
    overlay: 'rgba(15, 23, 42, 0.60)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    h1: { fontSize: 24, fontWeight: '800', color: '#004080', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
    h2: { fontSize: 18, fontWeight: '700', color: '#004080', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
    h3: { fontSize: 16, fontWeight: '700', color: '#2B2D42', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
    body: { fontSize: 14, color: '#2B2D42', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
    bodySmall: { fontSize: 12, color: '#8D99AE', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
    label: { fontSize: 11, fontWeight: '600', color: '#8D99AE', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  },
  shadows: {
    card: {
      shadowColor: '#004080',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  animation: {
    get fast() {
      return getTimingConfig(200).duration;
    },
    get normal() {
      return getTimingConfig(300).duration;
    },
    get slow() {
      return getTimingConfig(500).duration;
    },
    get spring() {
      return getSpringConfig();
    },
  },
};

