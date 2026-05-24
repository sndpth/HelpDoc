import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, StatusBar, Platform } from 'react-native';
import { ChevronLeft, Plus, X, Heart, Thermometer, Activity, Wind, Info, Calendar, Clock, AlertCircle } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, ZoomIn, SlideInDown, useSharedValue, useAnimatedStyle, useAnimatedProps, withTiming } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';
import AnimatedMount from '../components/AnimatedMount';
import BottomSheet from '../components/BottomSheet';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';
import VitalsChart from '../components/VitalsChart';
import useStore from '../store/useStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BpGauge = ({ latestReading, progress }) => {
  const size = 150;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const sysVal = latestReading ? latestReading.bpSystolic : 120;
  const diaVal = latestReading ? latestReading.bpDiastolic : 80;
  
  const sysPercent = Math.min(sysVal / 200, 1);
  const diaPercent = Math.min(diaVal / 120, 1);

  const sysProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - (sysPercent * progress.value)),
  }));

  const diaProps = useAnimatedProps(() => ({
    strokeDashoffset: (radius - 18) * 2 * Math.PI * (1 - (diaPercent * progress.value)),
  }));

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size}>
        {/* Outer Ring (Systolic) Background */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Outer Ring (Systolic) Progress */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="#10B981" // Green
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={sysProps}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Inner Ring (Diastolic) Background */}
        <Circle
          cx={center}
          cy={center}
          r={radius - 18}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Inner Ring (Diastolic) Progress */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius - 18}
          stroke="#3B82F6" // Blue
          strokeWidth={strokeWidth}
          strokeDasharray={(radius - 18) * 2 * Math.PI}
          animatedProps={diaProps}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.gaugeCenterLabel}>
        <Text style={styles.gaugeMainValue}>{sysVal}/{diaVal}</Text>
        <Text style={styles.gaugeUnit}>mmHg</Text>
      </View>
    </View>
  );
};

const SingleGauge = ({ activeCategory, latestReading, progress }) => {
  const size = 150;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let progressColor = theme.colors.primary;
  let maxVal = 100;
  let currentVal = 0;
  let unit = '';

  if (activeCategory === 'T') {
    progressColor = '#F97316'; // Orange
    maxVal = 42;
    currentVal = latestReading ? latestReading.temp : 37.0;
    unit = '°C';
  } else if (activeCategory === 'HR') {
    progressColor = '#EF4444'; // Red
    maxVal = 180;
    currentVal = latestReading ? latestReading.hr : 75;
    unit = 'bpm';
  } else if (activeCategory === 'RR') {
    progressColor = '#06B6D4'; // Cyan
    maxVal = 40;
    currentVal = latestReading ? (latestReading.rr || 16) : 16;
    unit = 'bpm';
  } else if (activeCategory === 'SpO2') {
    progressColor = '#3B82F6'; // Blue
    maxVal = 100;
    currentVal = latestReading ? (latestReading.spo2 || 98) : 98;
    unit = '%';
  } else if (activeCategory === 'Su') {
    progressColor = '#8B5CF6'; // Purple
    maxVal = 300;
    currentVal = latestReading ? (latestReading.sugar || 100) : 100;
    unit = 'mg/dL';
  }

  const valPercent = Math.min(currentVal / maxVal, 1);

  const valProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - (valPercent * progress.value)),
  }));

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={valProps}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.gaugeCenterLabel}>
        <Text style={styles.gaugeMainValue}>{currentVal}</Text>
        <Text style={styles.gaugeUnit}>{unit}</Text>
      </View>
    </View>
  );
};

const VisualGauge = ({ activeCategory, latestReading, progress }) => {
  if (activeCategory === 'Bp') {
    return <BpGauge latestReading={latestReading} progress={progress} />;
  }
  return <SingleGauge activeCategory={activeCategory} latestReading={latestReading} progress={progress} />;
};

const VITAL_TYPES = {
  BP: 'Bp',
  TEMP: 'T',
  HR: 'HR',
  RR: 'RR',
  SPO2: 'SpO2',
  SUGAR: 'Su',
};

const VitalsScreen = ({ route, navigation }) => {
  const { patientId: routePatientId } = route.params;
  const { patients, addVitals } = useStore();
  const offlineQueue = useStore((state) => state.offlineQueue || []);
  const pendingCount = offlineQueue.length;
  
  const patient = patients.find(p => p.recordID === routePatientId || p.patientId === routePatientId) || patients[0];
  
  const [activeCategory, setActiveCategory] = useState(VITAL_TYPES.BP);
  const [showChart, setShowChart] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 800 });
  }, [activeCategory]);
  
  // Date/Time pickers for Modal
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [newVitals, setNewVitals] = useState({
    hr: '75',
    bpSystolic: '120',
    bpDiastolic: '80',
    temp: '37.0',
    tempUnit: '°C',
    rr: '16',
    spo2: '98',
    sugar: '100',
    date: new Date(),
    time: new Date()
  });

  const handleAddVitalsSubmit = () => {
    const entry = {
      date: newVitals.date.toLocaleDateString(),
      time: newVitals.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hr: parseInt(newVitals.hr) || 75,
      bpSystolic: parseInt(newVitals.bpSystolic) || 120,
      bpDiastolic: parseInt(newVitals.bpDiastolic) || 80,
      temp: parseFloat(newVitals.temp) || 37.0,
      tempDisplay: `${newVitals.temp}${newVitals.tempUnit}`,
      rr: parseInt(newVitals.rr) || 16,
      spo2: parseInt(newVitals.spo2) || 98,
      sugar: parseInt(newVitals.sugar) || 100
    };

    addVitals(patient.recordID, entry);
    setShowAddModal(false);
  };

  const getLatestReading = (category) => {
    const history = patient.vitalsHistory || [];
    if (history.length === 0) return null;
    return history[history.length - 1];
  };

  const latestReading = getLatestReading(activeCategory);

  const getStatusText = (category, reading) => {
    if (!reading) return 'Unknown';
    if (category === VITAL_TYPES.BP) {
      const sys = reading.bpSystolic;
      const dia = reading.bpDiastolic;
      if (sys > 140 || dia > 90) return 'High BP';
      if (sys < 90 || dia < 60) return 'Low BP';
      return 'Normal';
    }
    if (category === VITAL_TYPES.TEMP) {
      const t = reading.temp;
      if (t > 37.5) return 'Fever';
      if (t < 35.5) return 'Hypothermia';
      return 'Normal';
    }
    if (category === VITAL_TYPES.HR) {
      const hr = reading.hr;
      if (hr > 100) return 'Tachycardia';
      if (hr < 60) return 'Bradycardia';
      return 'Normal';
    }
    if (category === VITAL_TYPES.RR) {
      const rr = reading.rr || 16;
      if (rr > 20) return 'Tachypnea';
      if (rr < 12) return 'Bradypnea';
      return 'Normal';
    }
    if (category === VITAL_TYPES.SPO2) {
      const spo2 = reading.spo2 || 98;
      if (spo2 < 95) return 'Hypoxia';
      return 'Normal';
    }
    if (category === VITAL_TYPES.SUGAR) {
      const sug = reading.sugar || 100;
      if (sug > 140) return 'Hyperglycemia';
      if (sug < 70) return 'Hypoglycemia';
      return 'Normal';
    }
    return 'Normal';
  };

  const getStatusColor = (status) => {
    if (status === 'Normal') return theme.colors.success;
    if (status === 'Unknown') return theme.colors.textSecondary;
    return theme.colors.danger;
  };

  // Visual gauge drawing logic removed here as it is now inside the VisualGauge sub-component.

  const getHistoryList = () => {
    return (patient.vitalsHistory || []).slice().reverse();
  };

  const historyList = getHistoryList();

  const getIconForCategory = (cat) => {
    if (cat === VITAL_TYPES.TEMP) return <Thermometer size={16} color="#F97316" />;
    if (cat === VITAL_TYPES.HR) return <Heart size={16} color="#EF4444" />;
    if (cat === VITAL_TYPES.RR) return <Wind size={16} color="#06B6D4" />;
    return <Activity size={16} color={theme.colors.primary} />;
  };

  const getReadingDisplay = (item, cat) => {
    if (cat === VITAL_TYPES.BP) return `${item.bpSystolic}/${item.bpDiastolic} mmHg`;
    if (cat === VITAL_TYPES.TEMP) return `${item.tempDisplay || item.temp + '°C'}`;
    if (cat === VITAL_TYPES.HR) return `${item.hr} bpm`;
    if (cat === VITAL_TYPES.RR) return `${item.rr || 16} bpm`;
    if (cat === VITAL_TYPES.SPO2) return `${item.spo2 || 98} %`;
    if (cat === VITAL_TYPES.SUGAR) return `${item.sugar || 100} mg/dL`;
    return '';
  };

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <AnimatedPressable 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={theme.colors.primary} />
        </AnimatedPressable>
        <Text style={styles.titleText}>Vitals Log</Text>
        <View style={{ width: 24 }} />
      </View>

      {pendingCount > 0 && (
        <View style={styles.syncBanner}>
          <AlertCircle size={16} color="#D97706" style={{ marginRight: 8 }} />
          <Text style={styles.syncBannerText}>
            Offline Mode: {pendingCount} record{pendingCount > 1 ? 's' : ''} pending sync.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Metadata Header */}
        <View style={styles.metadataHeader}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>IPD ID: <Text style={styles.metaVal}>{patient.ipdId || '783918'}</Text></Text>
            <Text style={styles.metaLabel}>Patient ID: <Text style={styles.metaVal}>{patient.patientId || '81552753'}</Text></Text>
          </View>
          <Text style={styles.admissionText}>Admission: {patient.dateOfAdmission} {patient.admissionTime || '12:05 PM'}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.patientAvatar}>
              <Text style={styles.avatarText}>{patient.fullName.charAt(0)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.fullName}</Text>
              <Text style={styles.patientLoc}>{patient.wardName}</Text>
              <Text style={styles.patientBed}>{patient.roomType} / Bed {patient.bedNo}</Text>
            </View>
          </View>
          <AnimatedPressable style={styles.tprBtn} onPress={() => setShowChart(!showChart)}>
            <Activity size={14} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.tprBtnText}>{showChart ? 'Hide Trend Chart' : 'View TPR Chart'}</Text>
          </AnimatedPressable>
        </View>

        {/* Chart View */}
        {showChart && (
          <View style={styles.chartWrapper}>
            <VitalsChart data={patient.vitalsHistory} />
          </View>
        )}

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {Object.values(VITAL_TYPES).map((cat) => (
            <AnimatedPressable
              key={cat}
              style={[styles.tabItem, activeCategory === cat && styles.tabItemActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                {cat}
              </Text>
              {activeCategory === cat && (
                <Animated.View 
                  entering={FadeIn.duration(200)}
                  style={styles.tabIndicator} 
                />
              )}
            </AnimatedPressable>
          ))}
        </ScrollView>

        {/* Visual Gauge panel */}
        <View style={styles.gaugePanel}>
          <View style={styles.gaugeRow}>
            <VisualGauge activeCategory={activeCategory} latestReading={latestReading} progress={progress} />
            
            <View style={styles.gaugeInfo}>
              <Text style={styles.latestLabel}>Latest Reading</Text>
              <Text style={styles.latestTime}>
                {latestReading ? `${latestReading.date} • ${latestReading.time}` : 'No records'}
              </Text>
              
              <View style={styles.statusBadgeRow}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(getStatusText(activeCategory, latestReading)) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(getStatusText(activeCategory, latestReading)) }]}>
                  {getStatusText(activeCategory, latestReading)}
                </Text>
              </View>

              {activeCategory === VITAL_TYPES.BP && (
                <View style={styles.bpLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendLabel}>Systolic</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.legendLabel}>Diastolic</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Compact TPR Sheet */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Compact TPR Sheet</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.5 }]}>Date/Time</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>T (°C)</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>HR</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>RR</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.2 }]}>BP</Text>
            </View>
            {historyList.length === 0 ? (
              <Text style={styles.emptyText}>No records available.</Text>
            ) : (
              historyList.map((item, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, { flex: 1.5, fontSize: 10 }, item.isOffline && { color: '#D97706', fontWeight: 'bold' }]}>
                    {item.date.slice(5)} {item.time}{item.isOffline ? ' (P)' : ''}
                  </Text>
                  <Text style={styles.tableCell}>{item.temp}</Text>
                  <Text style={styles.tableCell}>{item.hr}</Text>
                  <Text style={styles.tableCell}>{item.rr || '--'}</Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.bpSystolic}/{item.bpDiastolic}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* History Log List */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Measurement History</Text>
            <AnimatedPressable 
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.addBtnText}>Add</Text>
            </AnimatedPressable>
          </View>

          {historyList.length === 0 ? (
            <Text style={styles.emptyText}>No measurement records available.</Text>
          ) : (
            historyList.map((item, idx) => (
              <AnimatedMount key={idx} slide delay={Math.min(idx * 50, 400)}>
                <View style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.timeRow}>
                      <Calendar size={12} color={theme.colors.textSecondary} />
                      <Text style={styles.historyDate}>{item.date}</Text>
                      <View style={styles.microDot} />
                      <Clock size={12} color={theme.colors.textSecondary} />
                      <Text style={styles.historyTime}>{item.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {item.isOffline && (
                        <View style={styles.offlineBadge}>
                          <Text style={styles.offlineBadgeText}>Pending Sync</Text>
                        </View>
                      )}
                      <View style={[styles.microStatusBadge, { backgroundColor: getStatusColor(getStatusText(activeCategory, item)) + '15' }]}>
                        <Text style={[styles.microStatusText, { color: getStatusColor(getStatusText(activeCategory, item)) }]}>
                          {getStatusText(activeCategory, item)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.historyBody}>
                    {getIconForCategory(activeCategory)}
                    <Text style={styles.historyValue}>
                      {getReadingDisplay(item, activeCategory)}
                    </Text>
                  </View>
                </View>
              </AnimatedMount>
            ))
          )}
        </View>

      </ScrollView>

      {/* Add Vitals Modal */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record Daily Vitals"
        height="85%"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Date & Time selectors */}
          <View style={styles.modalGridRow}>
            <AnimatedPressable style={styles.dateTimeField} onPress={() => setShowDatePicker(true)}>
              <Calendar size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.dateTimeText}>{newVitals.date.toLocaleDateString()}</Text>
            </AnimatedPressable>
            
            <AnimatedPressable style={styles.dateTimeField} onPress={() => setShowTimePicker(true)}>
              <Clock size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.dateTimeText}>
                {newVitals.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </AnimatedPressable>
          </View>

          {/* Form Input fields */}
          <Text style={styles.inputLabel}>Blood Pressure (mmHg)</Text>
          <View style={styles.modalGridRow}>
            <TextInput 
              style={[styles.modalInput, { flex: 1 }]} 
              placeholder="Systolic (e.g. 120)" 
              keyboardType="numeric" 
              value={newVitals.bpSystolic}
              onChangeText={t => setNewVitals(prev => ({ ...prev, bpSystolic: t }))}
            />
            <TextInput 
              style={[styles.modalInput, { flex: 1 }]} 
              placeholder="Diastolic (e.g. 80)" 
              keyboardType="numeric" 
              value={newVitals.bpDiastolic}
              onChangeText={t => setNewVitals(prev => ({ ...prev, bpDiastolic: t }))}
            />
          </View>

          <Text style={styles.inputLabel}>Temperature (°C)</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="e.g. 37.0" 
            keyboardType="numeric" 
            value={newVitals.temp}
            onChangeText={t => setNewVitals(prev => ({ ...prev, temp: t }))}
          />

          <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="e.g. 75" 
            keyboardType="numeric" 
            value={newVitals.hr}
            onChangeText={t => setNewVitals(prev => ({ ...prev, hr: t }))}
          />

          <Text style={styles.inputLabel}>Respiratory Rate (bpm)</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="e.g. 16" 
            keyboardType="numeric" 
            value={newVitals.rr}
            onChangeText={t => setNewVitals(prev => ({ ...prev, rr: t }))}
          />

          <Text style={styles.inputLabel}>Oxygen Saturation SpO2 (%)</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="e.g. 98" 
            keyboardType="numeric" 
            value={newVitals.spo2}
            onChangeText={t => setNewVitals(prev => ({ ...prev, spo2: t }))}
          />

          <Text style={styles.inputLabel}>Blood Sugar (mg/dL)</Text>
          <TextInput 
            style={styles.modalInput} 
            placeholder="e.g. 100" 
            keyboardType="numeric" 
            value={newVitals.sugar}
            onChangeText={t => setNewVitals(prev => ({ ...prev, sugar: t }))}
          />

          <AnimatedPressable style={styles.modalSubmitBtn} onPress={handleAddVitalsSubmit}>
            <Text style={styles.modalSubmitBtnText}>Save Measurements</Text>
          </AnimatedPressable>

        </ScrollView>
      </BottomSheet>

      {showDatePicker && (
        <DateTimePicker
          value={newVitals.date}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setNewVitals(prev => ({ ...prev, date }));
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={newVitals.time}
          mode="time"
          display="default"
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) setNewVitals(prev => ({ ...prev, time }));
          }}
        />
      )}

    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    padding: theme.spacing.xs,
  },
  titleText: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  metadataHeader: {
    backgroundColor: theme.colors.surfaceDim,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  metaVal: {
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  admissionText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xxl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  patientLoc: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '600',
    marginBottom: 2,
  },
  patientBed: {
    fontSize: 11,
    color: '#E0F2FE',
    fontWeight: '500',
  },
  tprBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 10,
  },
  tprBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  chartWrapper: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  tabsScroll: {
    marginTop: theme.spacing.lg,
    maxHeight: 44,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
  },
  gaugePanel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
  },
  gaugeCenterLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeMainValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  gaugeUnit: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  gaugeInfo: {
    flex: 1,
  },
  latestLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  latestTime: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bpLegend: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  historySection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.lg,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.xl,
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  microDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: 6,
  },
  historyTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  microStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  microStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  historyBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  historyValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    color: theme.colors.textPrimary,
    fontWeight: '800',
  },
  modalGridRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dateTimeField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    height: 48,
  },
  dateTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  modalSubmitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    marginBottom: 20,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  tableContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceDim,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tableRowAlt: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: theme.colors.textPrimary,
  },
  tableHeaderCell: {
    fontWeight: '700',
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
  },
  syncBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    flex: 1,
  },
  offlineBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  offlineBadgeText: {
    fontSize: 9,
    color: '#D97706',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 2,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: '#FFF',
    borderRadius: 1.5,
  },
});

export default VitalsScreen;
