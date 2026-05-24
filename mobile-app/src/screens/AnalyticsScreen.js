import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { ChevronLeft, BarChart2, Bed, Calendar, Users, Clock, RefreshCw, Layers } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';
import useStore from '../store/useStore';

const AnalyticsScreen = ({ navigation }) => {
  const { analytics, fetchAnalytics } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchAnalytics();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  // Helper to render Circular Progress
  const renderOccupancyCircle = (rate, current, capacity) => {
    const radius = 50;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const numericRate = parseFloat(rate) || 0;
    const cappedRate = Math.min(Math.max(numericRate, 0), 100);
    const strokeDashoffset = circumference - (cappedRate / 100) * circumference;

    return (
      <View style={styles.circleContainer}>
        <Svg width={140} height={140} viewBox="0 0 120 120">
          {/* Background circle */}
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <SvgText
            x="60"
            y="58"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill={theme.colors.textPrimary}
          >
            {`${cappedRate.toFixed(0)}%`}
          </SvgText>
          <SvgText
            x="60"
            y="76"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={theme.colors.textSecondary}
          >
            Occupied
          </SvgText>
        </Svg>
        <View style={styles.circleDetails}>
          <Text style={styles.circleNumber}>{current} / {capacity}</Text>
          <Text style={styles.circleLabel}>Total Beds Occupied</Text>
        </View>
      </View>
    );
  };

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <BarChart2 size={20} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Hospital Analytics</Text>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.headerRight} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <RefreshCw size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {loading && !analytics ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Compiling census calculations...</Text>
          </View>
        ) : !analytics ? (
          <View style={styles.emptyBox}>
            <BarChart2 size={40} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Analytics Unavailable</Text>
            <Text style={styles.emptyText}>Could not retrieve reporting data from backend.</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Top Cards Grid */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                  <Users size={16} color="#FFF" />
                </View>
                <Text style={styles.metricVal}>{analytics.inpatientCensus}</Text>
                <Text style={styles.metricLabel}>Inpatients</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                <View style={[styles.iconBox, { backgroundColor: '#22C55E' }]}>
                  <Calendar size={16} color="#FFF" />
                </View>
                <Text style={styles.metricVal}>{analytics.opdAppointmentsToday}</Text>
                <Text style={styles.metricLabel}>OPD Appts Today</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' }]}>
                <View style={[styles.iconBox, { backgroundColor: '#8B5CF6' }]}>
                  <Clock size={16} color="#FFF" />
                </View>
                <Text style={styles.metricVal}>{analytics.averageLOS} d</Text>
                <Text style={styles.metricLabel}>Avg. Stay (LOS)</Text>
              </View>
            </View>

            {/* Bed Occupancy Circle */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bed Occupancy Census</Text>
              {renderOccupancyCircle(
                analytics.bedOccupancyRate, 
                analytics.inpatientCensus, 
                analytics.bedCapacity
              )}
            </View>

            {/* Ward Distribution */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Layers size={18} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { marginLeft: 8, marginBottom: 0 }]}>Ward Distribution</Text>
              </View>
              {analytics.wardOccupancies && analytics.wardOccupancies.length > 0 ? (
                analytics.wardOccupancies.map((w, index) => {
                  const maxCount = Math.max(...analytics.wardOccupancies.map(o => o.count), 1);
                  const pct = (w.count / maxCount) * 100;
                  return (
                    <View key={index} style={styles.distributionRow}>
                      <View style={styles.distMeta}>
                        <Text style={styles.distName} numberOfLines={1}>{w.wardName}</Text>
                        <Text style={styles.distCount}>{w.count} Patient{w.count !== 1 ? 's' : ''}</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: '#3B82F6' }]} />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noDataText}>No inpatients currently admitted to wards.</Text>
              )}
            </View>

            {/* Doctor Workload */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Bed size={18} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { marginLeft: 8, marginBottom: 0 }]}>Attending Doctor Workload</Text>
              </View>
              {analytics.doctorWorkloads && analytics.doctorWorkloads.length > 0 ? (
                analytics.doctorWorkloads.map((doc, index) => {
                  const maxWorkload = Math.max(...analytics.doctorWorkloads.map(o => o.count), 1);
                  const pct = (doc.count / maxWorkload) * 100;
                  return (
                    <View key={index} style={styles.distributionRow}>
                      <View style={styles.distMeta}>
                        <Text style={styles.distName} numberOfLines={1}>{doc.doctorName}</Text>
                        <Text style={styles.distCount}>{doc.count} Active IPD</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: '#8B5CF6' }]} />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noDataText}>No workload recorded.</Text>
              )}
            </View>

            {/* General Patient Status Metrics */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Global Status Overview</Text>
              <View style={styles.statusGrid}>
                {analytics.statusDistribution && analytics.statusDistribution.length > 0 ? (
                  analytics.statusDistribution.map((item, idx) => {
                    let color = theme.colors.primary;
                    let bg = theme.colors.primaryLight;
                    if (item.status === 'Discharged') { color = '#10B981'; bg = '#D1FAE5'; }
                    if (item.status === 'Deceased') { color = '#EF4444'; bg = '#FEE2E2'; }

                    return (
                      <View key={idx} style={[styles.statusBox, { backgroundColor: bg }]}>
                        <Text style={[styles.statusBoxCount, { color }]}>{item.count}</Text>
                        <Text style={[styles.statusBoxLabel, { color }]}>{item.status}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noDataText}>No records stored in EMR database.</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: theme.spacing.xs },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { ...theme.typography.h2, color: theme.colors.primary, fontWeight: '800' },
  headerRight: { padding: theme.spacing.xs, minWidth: 24, alignItems: 'center' },
  
  scrollContent: { paddingBottom: 80 },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  
  metricsGrid: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  metricCard: {
    flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.xl,
    borderWidth: 1, alignItems: 'flex-start',
  },
  iconBox: {
    width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  metricVal: { fontSize: 18, fontWeight: '900', color: theme.colors.textPrimary, marginBottom: 2 },
  metricLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textSecondary },

  card: {
    backgroundColor: '#FFF', borderRadius: theme.borderRadius.xxl, padding: theme.spacing.xl,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10,
    elevation: 1,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  cardTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  
  circleContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  circleDetails: { flex: 1 },
  circleNumber: { fontSize: 22, fontWeight: '900', color: theme.colors.textPrimary, marginBottom: 2 },
  circleLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },

  distributionRow: { marginBottom: theme.spacing.md },
  distMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  distName: { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary, flex: 1, marginRight: 8 },
  distCount: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  statusGrid: { flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginTop: 4 },
  statusBox: {
    flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center', borderRadius: theme.borderRadius.lg,
  },
  statusBoxCount: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statusBoxLabel: { fontSize: 11, fontWeight: '700' },

  noDataText: { fontSize: 12, color: theme.colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  loaderBox: { alignItems: 'center', paddingVertical: 120 },
  loaderText: { marginTop: 12, color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingVertical: 100, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textSecondary },
  emptyText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});

export default AnalyticsScreen;
