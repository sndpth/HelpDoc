import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, StatusBar, Alert, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Plus, X, Search, Check, Ban, User, Stethoscope } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme, getSpringConfig } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';
import useStore from '../store/useStore';
import AnimatedMount from '../components/AnimatedMount';
import AnimatedPressable from '../components/AnimatedPressable';
import EmptyState from '../components/EmptyState';
import BottomSheet from '../components/BottomSheet';

const OPDSchedulingScreen = ({ navigation }) => {
  const { 
    upcomingAppointments, 
    patients, 
    userProfile, 
    fetchUpcomingAppointments, 
    scheduleAppointment, 
    updateAppointmentStatus 
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPatientSelect, setShowPatientSelect] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');

  // Scheduling Form State
  const [form, setForm] = useState({
    doctorName: userProfile?.name ? `Dr. ${userProfile.name}` : '',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: '',
  });

  const [datePickerMode, setDatePickerMode] = useState(null); // 'date' | 'time' | null
  const [selectedDateFilter, setSelectedDateFilter] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    await fetchUpcomingAppointments();
    setLoading(false);
  };

  const handleCreateAppointment = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient.');
      return;
    }
    if (!form.doctorName || !form.date || !form.time) {
      Alert.alert('Error', 'Doctor name, date, and time are required.');
      return;
    }

    setLoading(true);
    const res = await scheduleAppointment(selectedPatient.recordID, {
      doctorName: form.doctorName,
      date: form.date,
      time: form.time,
      notes: form.notes
    });
    setLoading(false);

    if (res.success) {
      Alert.alert('Success', 'OPD consultation scheduled successfully.');
      setShowAddModal(false);
      setSelectedPatient(null);
      setForm({
        doctorName: userProfile?.name ? `Dr. ${userProfile.name}` : '',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: '',
      });
      loadAppointments();
    } else {
      Alert.alert('Error', res.error || 'Failed to schedule appointment.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const actionText = status === 'Completed' ? 'complete' : 'cancel';
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to mark this appointment as ${status.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setLoading(true);
            const res = await updateAppointmentStatus(id, status);
            setLoading(false);
            if (res.success) {
              loadAppointments();
            } else {
              Alert.alert('Error', 'Failed to update status.');
            }
          }
        }
      ]
    );
  };

  // Generate Date Tabs (Today + next 4 days)
  const getDateFilters = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString([], { weekday: 'short' }),
        fullDate: d.toLocaleDateString()
      });
    }
    return dates;
  };

  const dateFilters = getDateFilters();

  const activeIndex = dateFilters.findIndex(df => df.fullDate === selectedDateFilter);
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    indicatorPosition.value = withSpring(activeIndex >= 0 ? activeIndex : 0, getSpringConfig({ damping: 24, stiffness: 180 }));
  }, [activeIndex]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const { width } = Dimensions.get('window');
    const containerWidth = width - 32;
    const tabWidth = containerWidth / 5;
    return {
      transform: [
        { translateX: indicatorPosition.value * tabWidth }
      ],
    };
  });

  const filteredAppointments = (upcomingAppointments || []).filter(app => {
    // Return appointments matching selected date
    return app.date === selectedDateFilter;
  });

  const getStatusColor = (status) => {
    if (status === 'Completed') return { bg: '#D1FAE5', text: '#10B981' };
    if (status === 'Cancelled') return { bg: '#F3F4F6', text: '#6B7280' };
    return { bg: '#FEF3C7', text: '#D97706' }; // Scheduled
  };

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={theme.colors.primary} />
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <CalendarIcon size={18} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>OPD Consultation Scheduler</Text>
        </View>
        <AnimatedPressable 
          onPress={() => setShowAddModal(true)} 
          style={styles.headerRight}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Schedule new consultation"
          accessibilityRole="button"
        >
          <Plus size={22} color={theme.colors.primary} />
        </AnimatedPressable>
      </View>

      {/* Date Filter Bar */}
      <View style={styles.dateBar}>
        <Animated.View style={[styles.activeTabIndicator, animatedIndicatorStyle]} />
        {dateFilters.map((df, idx) => {
          const isActive = selectedDateFilter === df.fullDate;
          return (
            <TouchableOpacity 
              key={idx} 
              style={styles.dateTab}
              onPress={() => setSelectedDateFilter(df.fullDate)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateTabLabel, isActive && styles.dateTabLabelActive]}>{df.label}</Text>
              <Text style={[styles.dateTabDate, isActive && styles.dateTabDateActive]}>
                {df.fullDate.split('/')[1] || df.fullDate.split('-')[2]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && (!upcomingAppointments || upcomingAppointments.length === 0) ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Loading scheduled consultations...</Text>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState 
            icon={CalendarIcon}
            title="No Consultations Scheduled"
            description="No outpatient sessions on this day."
          />
        ) : (
          <View style={styles.appointmentList}>
            {filteredAppointments.map((app, index) => {
              const statusStyle = getStatusColor(app.status);
              return (
                <AnimatedMount key={app.id} slide delay={Math.min(index * 60, 400)}>
                  <View style={styles.appCard}>
                    <View style={styles.appCardHeader}>
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('PatientDetail', { patient: app.patient })}
                        style={styles.patientLink}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{app.patient?.fullName ? app.patient.fullName.charAt(0) : '?'}</Text>
                        </View>
                        <View style={styles.patientMeta}>
                          <Text style={styles.patientName}>{app.patient?.fullName}</Text>
                          <Text style={styles.patientSub}>IPID: {app.patient?.ipid || 'N/A'}</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{app.status}</Text>
                      </View>
                    </View>

                    <View style={styles.appDivider} />

                    <View style={styles.appDetails}>
                      <View style={styles.detailRow}>
                        <Clock size={14} color="#9CA3AF" />
                        <Text style={styles.detailText}>{app.time}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Stethoscope size={14} color="#9CA3AF" />
                        <Text style={styles.detailText}>{app.doctorName}</Text>
                      </View>
                      {app.notes ? (
                        <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
                          <Text style={styles.notesLabel}>Notes:</Text>
                          <Text style={styles.notesText}>{app.notes}</Text>
                        </View>
                      ) : null}
                    </View>

                    {app.status === 'Scheduled' && (
                      <View style={styles.actionRow}>
                        <AnimatedPressable 
                          style={[styles.actionBtn, styles.completeBtn]}
                          onPress={() => handleUpdateStatus(app.id, 'Completed')}
                        >
                          <Check size={14} color="#10B981" />
                          <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Complete</Text>
                        </AnimatedPressable>
                        
                        <AnimatedPressable 
                          style={[styles.actionBtn, styles.cancelBtn]}
                          onPress={() => handleUpdateStatus(app.id, 'Cancelled')}
                        >
                          <Ban size={14} color="#EF4444" />
                          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Cancel</Text>
                        </AnimatedPressable>
                      </View>
                    )}
                  </View>
                </AnimatedMount>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ADD APPOINTMENT MODAL */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule OPD Consult"
        height="85%"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Patient Selector trigger */}
          <Text style={styles.inputLabel}>Patient Affiliation</Text>
          <TouchableOpacity 
            style={styles.selectorTrigger}
            onPress={() => setShowPatientSelect(true)}
          >
            <User size={16} color={theme.colors.primary} />
            <Text style={[styles.selectorText, !selectedPatient && { color: theme.colors.textSecondary }]}>
              {selectedPatient ? selectedPatient.fullName : 'Select Patient...'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Consultant In-Charge</Text>
          <TextInput
            style={styles.input}
            value={form.doctorName}
            onChangeText={t => setForm(p => ({ ...p, doctorName: t }))}
            placeholder="Doctor Name"
          />

          <View style={styles.dateTimeGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity style={styles.dateTimeInput} onPress={() => setDatePickerMode('date')}>
                <Text style={styles.dateTimeText}>{form.date}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity style={styles.dateTimeInput} onPress={() => setDatePickerMode('time')}>
                <Text style={styles.dateTimeText}>{form.time}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.inputLabel}>Clinical Notes / Indication</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.notes}
            onChangeText={t => setForm(p => ({ ...p, notes: t }))}
            placeholder="Enter clinical indication, symptoms or OPD ticket details..."
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleCreateAppointment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Schedule Consultation</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </BottomSheet>

      {/* Date Time Pickers */}
      {datePickerMode && (
        <DateTimePicker
          value={new Date()}
          mode={datePickerMode}
          is24Hour={false}
          display="default"
          onChange={(e, val) => {
            setDatePickerMode(null);
            if (val) {
              if (datePickerMode === 'date') {
                setForm(p => ({ ...p, date: val.toLocaleDateString() }));
              } else {
                setForm(p => ({ ...p, time: val.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
              }
            }
          }}
        />
      )}

      {/* PATIENT SELECTOR DRAWER */}
      <BottomSheet
        visible={showPatientSelect}
        onClose={() => setShowPatientSelect(false)}
        title="Select Patient"
        height="80%"
      >
        <View style={styles.searchBox}>
          <Search size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient name or ID..."
            value={patientSearch}
            onChangeText={setPatientSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {patients
            .filter(p => p.fullName.toLowerCase().includes(patientSearch.toLowerCase()))
            .map(p => (
              <TouchableOpacity
                key={p.recordID}
                style={styles.patientSelectItem}
                onPress={() => {
                  setSelectedPatient(p);
                  setShowPatientSelect(false);
                  setPatientSearch('');
                }}
              >
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniText}>{p.fullName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientSelectName}>{p.fullName}</Text>
                  <Text style={styles.patientSelectSub}>{p.ipid || p.recordID} ({p.age} Y / {p.gender})</Text>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </BottomSheet>
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
  headerRight: { padding: theme.spacing.xs },

  dateBar: {
    flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  dateTab: {
    flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: theme.borderRadius.lg,
    zIndex: 2,
  },
  activeTabIndicator: {
    position: 'absolute',
    top: theme.spacing.sm,
    bottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    zIndex: 1,
    left: theme.spacing.lg,
  },
  dateTabLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase' },
  dateTabLabelActive: { color: '#FFF' },
  dateTabDate: { fontSize: 15, fontWeight: '900', color: theme.colors.textPrimary, marginTop: 2 },
  dateTabDateActive: { color: '#FFF' },

  scrollContent: { padding: theme.spacing.lg, paddingBottom: 80 },
  appointmentList: { gap: theme.spacing.md },
  
  appCard: {
    backgroundColor: '#FFF', borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: '#E2E8F0',
    padding: theme.spacing.md,
  },
  appCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientLink: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '900', color: theme.colors.primary },
  patientMeta: { flex: 1 },
  patientName: { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary },
  patientSub: { fontSize: 10, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  appDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: theme.spacing.sm },
  
  appDetails: { gap: 6, paddingLeft: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  notesLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textPrimary, marginRight: 4 },
  notesText: { fontSize: 11, color: '#4B5563', flex: 1 },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: theme.spacing.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    height: 32, borderRadius: theme.borderRadius.md, borderWidth: 1,
  },
  actionBtnText: { fontSize: 11, fontWeight: '700' },
  completeBtn: { borderColor: '#10B981', backgroundColor: '#D1FAE530' },
  cancelBtn: { borderColor: '#EF4444', backgroundColor: '#FEE2E230' },

  loaderBox: { alignItems: 'center', paddingVertical: 80 },
  loaderText: { marginTop: 8, color: theme.colors.textSecondary, fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 80, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.textSecondary },
  emptyText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: theme.borderRadius.xxl, borderTopRightRadius: theme.borderRadius.xxl, padding: theme.spacing.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  modalTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.textPrimary },
  
  inputLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 4, marginTop: theme.spacing.sm },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, height: 44, fontSize: 12, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  textArea: { height: 70, paddingTop: 10, textAlignVertical: 'top' },
  selectorTrigger: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, height: 44, marginBottom: theme.spacing.sm },
  selectorText: { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary },

  dateTimeGrid: { flexDirection: 'row', gap: 10, marginBottom: theme.spacing.sm },
  dateTimeInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, height: 44, justifyContent: 'center' },
  dateTimeText: { fontSize: 12, color: theme.colors.textPrimary, fontWeight: '700' },
  
  submitBtn: { backgroundColor: theme.colors.primary, height: 46, borderRadius: theme.borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.md, marginBottom: 10 },
  submitText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  // Patient Select Mini styles
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, height: 40, marginBottom: theme.spacing.md },
  searchInput: { flex: 1, fontSize: 12, color: theme.colors.textPrimary },
  patientSelectItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatarMini: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  avatarMiniText: { fontSize: 11, fontWeight: '800', color: '#475569' },
  patientSelectName: { fontSize: 12, fontWeight: '800', color: theme.colors.textPrimary },
  patientSelectSub: { fontSize: 10, color: theme.colors.textSecondary },
});

export default OPDSchedulingScreen;
