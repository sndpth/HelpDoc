import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { ChevronLeft, Shield, Clock, User, Plus, Edit2, Trash2, Eye, ArrowRightLeft, FileText } from 'lucide-react-native';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';
import useStore from '../store/useStore';

const ACTION_CONFIG = {
  CREATE:        { color: '#10B981', bg: '#D1FAE5', icon: Plus,          label: 'Created' },
  UPDATE:        { color: '#3B82F6', bg: '#DBEAFE', icon: Edit2,         label: 'Updated' },
  DELETE:        { color: '#EF4444', bg: '#FEE2E2', icon: Trash2,        label: 'Deleted' },
  VIEW:          { color: '#6B7280', bg: '#F3F4F6', icon: Eye,           label: 'Viewed' },
  STATUS_CHANGE: { color: '#F59E0B', bg: '#FEF3C7', icon: ArrowRightLeft, label: 'Status Changed' },
};

const RESOURCE_LABELS = {
  PATIENT:    'Patient',
  VITALS:     'Vitals',
  MEDICATION: 'Medication',
  LAB:        'Lab Report',
  NOTE:       'Progress Note',
  DISCHARGE:  'Discharge Summary',
};

const FILTER_TABS = ['All', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'];

const AuditLogScreen = ({ navigation }) => {
  const { fetchAuditLogs } = useStore();
  const patients = useStore((state) => state.patients);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const res = await fetchAuditLogs({ limit: 200 });
    if (res.success) {
      setLogs(res.logs);
    }
    setLoading(false);
  };

  const filteredLogs = activeFilter === 'All' ? logs : logs.filter(l => l.action === activeFilter);

  const getPatientName = (patientId) => {
    if (!patientId) return null;
    const p = patients.find(pt => pt.recordID === patientId);
    return p ? p.fullName : patientId.substring(0, 8) + '...';
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const parseDetails = (details) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  };

  const renderLogEntry = (log, idx) => {
    const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.VIEW;
    const Icon = config.icon;
    const patientName = getPatientName(log.patientId);
    const details = parseDetails(log.details);

    return (
      <View key={log.id || idx} style={styles.logEntry}>
        <View style={styles.timelineConnector}>
          <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
          {idx < filteredLogs.length - 1 && <View style={styles.timelineLine} />}
        </View>

        <View style={styles.logCard}>
          <View style={styles.logCardTop}>
            <View style={[styles.actionBadge, { backgroundColor: config.bg }]}>
              <Icon size={12} color={config.color} />
              <Text style={[styles.actionText, { color: config.color }]}>{config.label}</Text>
            </View>
            <View style={[styles.resourceBadge]}>
              <Text style={styles.resourceText}>{RESOURCE_LABELS[log.resource] || log.resource}</Text>
            </View>
          </View>

          <View style={styles.logCardBody}>
            <View style={styles.logMeta}>
              <User size={12} color="#9CA3AF" />
              <Text style={styles.logMetaText}>{log.userName}</Text>
            </View>
            {patientName && (
              <View style={styles.logMeta}>
                <FileText size={12} color="#9CA3AF" />
                <Text style={styles.logMetaText}>{patientName}</Text>
              </View>
            )}
            <View style={styles.logMeta}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.logMetaText}>{formatTime(log.createdAt)}</Text>
            </View>
          </View>

          {details && (
            <View style={styles.detailsBox}>
              {Object.entries(details).map(([key, val]) => (
                <Text key={key} style={styles.detailText}>
                  <Text style={styles.detailKey}>{key}:</Text> {String(val)}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Shield size={18} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Audit Trail</Text>
        </View>
        <TouchableOpacity onPress={loadLogs} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            const config = ACTION_CONFIG[tab];
            const count = tab === 'All' ? logs.length : logs.filter(l => l.action === tab).length;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isActive && { backgroundColor: config?.bg || '#EFF6FF', borderColor: config?.color || theme.colors.primary }]}
                onPress={() => setActiveFilter(tab)}
              >
                <Text style={[styles.filterTabText, isActive && { color: config?.color || theme.colors.primary, fontWeight: '700' }]}>
                  {tab === 'All' ? 'All' : ACTION_CONFIG[tab]?.label || tab}
                </Text>
                <View style={[styles.filterCount, isActive && { backgroundColor: config?.color || theme.colors.primary }]}>
                  <Text style={[styles.filterCountText, isActive && { color: '#FFF' }]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Loading audit trail...</Text>
          </View>
        ) : filteredLogs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Shield size={40} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Activity Found</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'All' ? 'No audit records yet.' : `No ${ACTION_CONFIG[activeFilter]?.label || activeFilter} actions recorded.`}
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {filteredLogs.map((log, idx) => renderLogEntry(log, idx))}
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
  refreshBtn: { padding: 8 },
  refreshText: { fontSize: 20, color: theme.colors.primary, fontWeight: '700' },

  filterContainer: {
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    paddingVertical: theme.spacing.sm,
  },
  filterScroll: { paddingHorizontal: theme.spacing.lg, gap: 8 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterTabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterCount: {
    backgroundColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
    minWidth: 20, alignItems: 'center',
  },
  filterCountText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },

  scrollContent: { padding: theme.spacing.lg, paddingBottom: 80 },

  timeline: {},
  logEntry: { flexDirection: 'row', marginBottom: 0 },
  timelineConnector: { width: 24, alignItems: 'center', marginRight: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 14 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4, marginBottom: -4 },

  logCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: '#E2E8F0', padding: theme.spacing.md, marginBottom: theme.spacing.sm,
  },
  logCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  actionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  actionText: { fontSize: 11, fontWeight: '700' },
  resourceBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  resourceText: { fontSize: 11, fontWeight: '600', color: '#475569' },

  logCardBody: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logMetaText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  detailsBox: {
    backgroundColor: '#F8FAFC', borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm, marginTop: theme.spacing.sm,
    borderLeftWidth: 3, borderLeftColor: '#E5E7EB',
  },
  detailText: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  detailKey: { fontWeight: '700', color: '#374151' },

  loaderBox: { alignItems: 'center', paddingVertical: 60 },
  loaderText: { marginTop: 8, color: theme.colors.textSecondary, fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

export default AuditLogScreen;
