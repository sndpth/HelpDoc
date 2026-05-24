import React from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AnimatedMount from './AnimatedMount';
import { theme } from '../constants/theme';

const VitalsChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No vitals recorded yet</Text>
    </View>
  );

  // Keep only the last 6 data points for better visibility on mobile
  const displayData = data.slice(-6);

  const chartData = {
    labels: displayData.map(d => d.time),
    datasets: [
      {
        data: displayData.map(d => d.bpSystolic || 0),
        color: (opacity = 1) => `rgba(0, 64, 128, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: displayData.map(d => d.hr || 0),
        color: (opacity = 1) => `rgba(72, 149, 239, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: displayData.map(d => d.temp || 0),
        color: (opacity = 1) => `rgba(239, 71, 111, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['BP', 'HR', 'Temp'],
  };

  return (
    <AnimatedMount slide>
      <View style={styles.container} key={data.length}>
        <Text style={styles.title}>Vitals Trend (Last 6 Readings)</Text>
        <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 64, 128, ${opacity})`,
          labelColor: (opacity = 1) => theme.colors.textSecondary,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary },
          propsForLabels: { fontSize: 9 },
        }}
        bezier
        style={styles.chart}
        fromZero
        verticalLabelRotation={30}
      />
      </View>
    </AnimatedMount>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  title: {
    ...theme.typography.label,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
});

export default VitalsChart;
