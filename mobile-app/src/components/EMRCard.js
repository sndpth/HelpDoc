import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FolderHeart, Stethoscope } from 'lucide-react-native';
import { theme } from '../constants/theme';

const EMRCard = ({ patient, onPress, style }) => {
  if (!patient) return null;

  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      onPress={() => onPress && onPress(patient)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FolderHeart size={18} color={theme.colors.primary} />
          <Text style={styles.name}>{patient.fullName}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{patient.ipNumber}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Age/Sex: </Text>
          {patient.age} / {patient.gender.charAt(0)}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Stethoscope size={14} color={theme.colors.secondary} style={{ marginRight: theme.spacing.xs }} />
        <Text style={styles.diagnosis} numberOfLines={1}>
          {patient.diagnosis || 'No Diagnosis'}
        </Text>
      </View>

      {patient.vitals && (
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>HR</Text>
            <Text style={styles.vitalValue}>{patient.vitals.hr}</Text>
          </View>
          <View style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>BP</Text>
            <Text style={styles.vitalValue}>{patient.vitals.bp}</Text>
          </View>
          <View style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>Temp</Text>
            <Text style={styles.vitalValue}>{patient.vitals.temp}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.lg,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  badge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginBottom: theme.spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
  },
  detailText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
  },
  diagnosis: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  vitalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  vitalBox: {
    alignItems: 'center',
  },
  vitalLabel: {
    ...theme.typography.label,
    fontSize: 10,
    marginBottom: 2,
  },
  vitalValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default EMRCard;
