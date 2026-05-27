import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, Edit2, Activity, ClipboardList, Stethoscope, Pill, FileText, UserCheck, ChevronRight, X, User, ArrowRightLeft, Plus, MessageSquare, AlertCircle, FileCheck, Shield, BookOpen, Trash2, ClipboardCheck } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn, SlideInDown, FadeInLeft, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';
import AnimatedMount from '../components/AnimatedMount';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';
import BottomSheet from '../components/BottomSheet';
import useStore from '../store/useStore';
import { sendRoomMessage } from '../services/socket';

const PatientDetail = ({ route, navigation }) => {
  const { patient: initialPatient } = route.params;
  const patients = useStore((state) => state.patients);
  const { 
    addProgressReport, 
    changePatientStatus, 
    addLabReport, 
    getOrCreatePatientChat, 
    addMedication, 
    removeMedication, 
    updateMedicationStatus,
    administerMedication,
    fetchMedicationAdministrations,
    addShiftHandover,
    fetchShiftHandovers,
    addCarePlan,
    updateCarePlan,
    fetchCarePlans,
    fetchPractitioners
  } = useStore();
  const practitioners = useStore((state) => state.practitioners || []);
  const offlineQueue = useStore((state) => state.offlineQueue || []);
  const pendingCount = offlineQueue.length;
  const userProfile = useStore((state) => state.userProfile);
  const isNurse = userProfile?.role === 'NURSE';
  
  // Get live patient data from store
  const patient = patients.find(p => p.recordID === initialPatient.recordID) || initialPatient;

  const scrollRef = React.useRef(null);
  const tcRef = useRef(null);
  const plateletsRef = useRef(null);
  const inrRef = useRef(null);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'diagnosis' | 'medication' | 'labs' | 'soap'
  const [selectedNoteTab, setSelectedNoteTab] = useState('Clinical'); // 'Clinical' | 'Consultant' | 'Nurse'
  const [inlineNoteText, setInlineNoteText] = useState('');

  const pulseOpacity = useSharedValue(0.85);
  const noteHighlight = useSharedValue(0);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.85, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const triggerNoteHighlight = () => {
    noteHighlight.value = 1;
    noteHighlight.value = withTiming(0, { duration: 1200 });
  };

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
    };
  });

  const noteHighlightStyle = useAnimatedStyle(() => {
    const backgroundColor = noteHighlight.value > 0
      ? `rgba(255, 237, 213, ${noteHighlight.value})`
      : 'transparent';
    return {
      backgroundColor,
      borderRadius: theme.borderRadius.lg,
      padding: noteHighlight.value > 0 ? 4 : 0,
    };
  });
  
  const [showAddLab, setShowAddLab] = useState(false);
  const [newLab, setNewLab] = useState({
    date: new Date().toLocaleDateString(),
    hb: '',
    tc: '',
    platelets: '',
    inr: ''
  });

  const [discussing, setDiscussing] = useState(false);

  // Medication form state
  const [showAddMed, setShowAddMed] = useState(false);
  const [medLoading, setMedLoading] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', route: 'Oral', frequency: '', indication: '' });
  const ROUTE_OPTIONS = ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Rectal', 'Sublingual', 'Inhaled'];
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  // SOAP Note state
  const [soapNote, setSoapNote] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [soapLoading, setSoapLoading] = useState(false);

  // MAR state
  const [selectedMedForMar, setSelectedMedForMar] = useState(null);
  const [marStatus, setMarStatus] = useState('Given'); // 'Given' | 'Held' | 'Refused'
  const [marNotes, setMarNotes] = useState('');
  const [marLoading, setMarLoading] = useState(false);

  // Handover state
  const [handoverShift, setHandoverShift] = useState('Morning'); // 'Morning' | 'Evening' | 'Night'
  const [handoverIncoming, setHandoverIncoming] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverLoading, setHandoverLoading] = useState(false);

  // Care Plan state
  const [carePlanDiagnosis, setCarePlanDiagnosis] = useState('');
  const [carePlanGoals, setCarePlanGoals] = useState('');
  const [carePlanInterventions, setCarePlanInterventions] = useState('');
  const [carePlanLoading, setCarePlanLoading] = useState(false);
  const [selectedCarePlanForEval, setSelectedCarePlanForEval] = useState(null);
  const [carePlanEvaluation, setCarePlanEvaluation] = useState('');

  const handleDiscussCase = async () => {
    setDiscussing(true);
    const res = await getOrCreatePatientChat(patient.recordID);
    setDiscussing(false);
    if (res.success) {
      navigation.navigate('Chats', {
        screen: 'ChatThread',
        params: {
          chatId: res.room.id,
          doctorName: `${patient.fullName} (Case)`
        }
      });
    } else {
      Alert.alert('Error', res.error || 'Failed to open discussion.');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAddInlineNote = () => {
    if (!inlineNoteText.trim()) return;
    const { userProfile } = useStore.getState();
    addProgressReport(patient.recordID, {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: `${selectedNoteTab} Note: ${inlineNoteText}`,
      author: userProfile.name,
      role: 'Doctor'
    });
    setInlineNoteText('');
  };

  const handleAddLab = () => {
    addLabReport(patient.recordID, newLab);
    setShowAddLab(false);
    setNewLab({ date: new Date().toLocaleDateString(), hb: '', tc: '', platelets: '', inr: '' });
  };

  // Medication handlers
  const handleAddMedication = async () => {
    if (!newMed.name.trim() || !newMed.frequency.trim()) {
      Alert.alert('Required', 'Drug name and frequency are required.');
      return;
    }
    setMedLoading(true);
    const res = await addMedication(patient.recordID, {
      name: newMed.name,
      route: ROUTE_OPTIONS[selectedRouteIdx],
      frequency: newMed.frequency,
      indication: newMed.indication
    });
    setMedLoading(false);
    if (res.success) {
      setNewMed({ name: '', route: 'Oral', frequency: '', indication: '' });
      setSelectedRouteIdx(0);
      setShowAddMed(false);
    } else {
      Alert.alert('Error', res.error || 'Failed to add medication.');
    }
  };

  const handleToggleMedStatus = async (med) => {
    const newStatus = med.status === 'active' ? 'stopped' : 'active';
    await updateMedicationStatus(patient.recordID, med.id, newStatus);
  };

  const handleDeleteMedication = (med) => {
    Alert.alert(
      'Delete Medication',
      `Remove "${med.name}" permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeMedication(patient.recordID, med.id) }
      ]
    );
  };

  // SOAP Note handlers
  const handleSaveSoapNote = async (shareToChat = false) => {
    const { subjective, objective, assessment, plan } = soapNote;
    if (!subjective.trim() && !objective.trim() && !assessment.trim() && !plan.trim()) {
      Alert.alert('Empty Note', 'Please fill at least one section.');
      return;
    }
    setSoapLoading(true);
    const formatted = `SOAP Note: S: ${subjective} | O: ${objective} | A: ${assessment} | P: ${plan}`;
    const { userProfile } = useStore.getState();
    await addProgressReport(patient.recordID, {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: formatted,
      author: userProfile?.name || 'Doctor',
      role: 'Doctor'
    });

    if (shareToChat) {
      const chatRes = await getOrCreatePatientChat(patient.recordID);
      if (chatRes.success) {
        const chatText = `📝 SOAP NOTE\n━━━━━━━━━━\nS: ${subjective}\nO: ${objective}\nA: ${assessment}\nP: ${plan}\n━━━━━━━━━━\nBy ${userProfile?.name || 'Doctor'}`;
        sendRoomMessage(chatRes.room.id, chatText, null, null);
      }
    }

    setSoapNote({ subjective: '', objective: '', assessment: '', plan: '' });
    setSoapLoading(false);
    setActiveModal(null);
    Alert.alert('Saved', shareToChat ? 'SOAP note saved and shared to chat.' : 'SOAP note saved to progress logs.');
  };

  // Phase 4: Nursing Handlers
  const handleOpenHandover = async () => {
    setActiveModal('handover');
    await fetchShiftHandovers(patient.recordID);
    await fetchPractitioners();
  };

  const handleOpenCarePlan = async () => {
    setActiveModal('careplan');
    await fetchCarePlans(patient.recordID);
  };

  const handleOpenMar = async (med) => {
    setSelectedMedForMar(med);
    await fetchMedicationAdministrations(patient.recordID, med.id);
  };

  const handleSaveMar = async () => {
    if (!selectedMedForMar) return;
    setMarLoading(true);
    const res = await administerMedication(patient.recordID, selectedMedForMar.id, {
      status: marStatus,
      notes: marNotes
    });
    setMarLoading(false);
    if (res.success) {
      setMarNotes('');
      await fetchMedicationAdministrations(patient.recordID, selectedMedForMar.id);
      Alert.alert('Success', 'Medication administration logged successfully.');
    } else {
      Alert.alert('Error', res.error || 'Failed to record administration.');
    }
  };

  const handleSaveHandover = async () => {
    if (!handoverIncoming) {
      Alert.alert('Required', 'Please select incoming staff.');
      return;
    }
    if (!handoverNotes.trim()) {
      Alert.alert('Required', 'Please enter handover notes.');
      return;
    }
    setHandoverLoading(true);
    const res = await addShiftHandover(patient.recordID, {
      date: new Date().toLocaleDateString(),
      shift: handoverShift,
      incomingStaff: handoverIncoming,
      notes: handoverNotes
    });
    setHandoverLoading(false);
    if (res.success) {
      setHandoverNotes('');
      setHandoverIncoming('');
      Alert.alert('Success', 'Shift handover recorded successfully.');
    } else {
      Alert.alert('Error', res.error || 'Failed to record shift handover.');
    }
  };

  const handleSaveCarePlan = async () => {
    if (!carePlanDiagnosis.trim() || !carePlanGoals.trim() || !carePlanInterventions.trim()) {
      Alert.alert('Required', 'All care plan fields are required.');
      return;
    }
    setCarePlanLoading(true);
    const res = await addCarePlan(patient.recordID, {
      nursingDiagnosis: carePlanDiagnosis,
      goals: carePlanGoals,
      interventions: carePlanInterventions
    });
    setCarePlanLoading(false);
    if (res.success) {
      setCarePlanDiagnosis('');
      setCarePlanGoals('');
      setCarePlanInterventions('');
      Alert.alert('Success', 'Nursing care plan created.');
    } else {
      Alert.alert('Error', res.error || 'Failed to create care plan.');
    }
  };

  const handleSaveCarePlanEvaluation = async (carePlanId) => {
    if (!carePlanEvaluation.trim()) {
      Alert.alert('Required', 'Please enter evaluation notes.');
      return;
    }
    setCarePlanLoading(true);
    const res = await updateCarePlan(patient.recordID, carePlanId, carePlanEvaluation);
    setCarePlanLoading(false);
    if (res.success) {
      setCarePlanEvaluation('');
      setSelectedCarePlanForEval(null);
      Alert.alert('Success', 'Care plan evaluated.');
    } else {
      Alert.alert('Error', res.error || 'Failed to update care plan.');
    }
  };

  const renderQuickStat = (label, val) => (
    <View style={styles.statCell}>
      <Text style={styles.statVal}>{val || '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View style={styles.header}>
        <AnimatedPressable 
          onPress={handleGoBack} 
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={theme.colors.primary} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Patient Detail</Text>
        <AnimatedPressable 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('AddPatient', { patient })}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Edit patient details"
          accessibilityRole="button"
        >
          <Edit2 size={16} color={theme.colors.primary} />
        </AnimatedPressable>
      </View>

      {pendingCount > 0 && (
        <View style={styles.syncBanner}>
          <AlertCircle size={16} color="#D97706" style={{ marginRight: 8 }} />
          <Text style={styles.syncBannerText}>
            Offline Mode: {pendingCount} record{pendingCount > 1 ? 's' : ''} pending sync.
          </Text>
        </View>
      )}

      {/* Status Change Bar */}
      {patient.status !== 'Deceased' && (
        <Animated.View style={pulseStyle}>
          <TouchableOpacity
            style={styles.statusChangeBar}
            onPress={() => {
              const current = patient.status || 'Admitted';
              const next = current === 'Admitted' ? 'Discharged' : 'Deceased';
              const message = next === 'Discharged'
                ? `Discharge ${patient.fullName}? This will set today as discharge date.`
                : `Mark ${patient.fullName} as Deceased? This action is significant.`;
              Alert.alert(
                `Change Status to ${next}`,
                message,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: `Yes, ${next === 'Discharged' ? 'Discharge' : 'Mark Deceased'}`,
                    style: next === 'Deceased' ? 'destructive' : 'default',
                    onPress: () => changePatientStatus(patient.recordID, next)
                  }
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <ArrowRightLeft size={14} color={patient.status === 'Admitted' ? '#10B981' : '#EF4444'} />
            <Text style={[styles.statusChangeText, { color: patient.status === 'Admitted' ? '#10B981' : '#EF4444' }]}>
              {(patient.status || 'Admitted') === 'Admitted' ? 'Discharge Patient' : 'Mark Deceased'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Metadata Bar */}
      <View style={styles.metadataHeader}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>IPD ID: <Text style={styles.metaVal}>{patient.ipdId || '783918'}</Text></Text>
          <Text style={styles.metaLabel}>Patient ID: <Text style={styles.metaVal}>{patient.patientId || '81552753'}</Text></Text>
        </View>
        <Text style={styles.admissionText}>Admission: {patient.dateOfAdmission} {patient.admissionTime || '12:05 PM'}</Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <AnimatedMount slide delay={50}>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{patient.fullName.charAt(0)}</Text>
              </View>
              <View style={styles.patientMeta}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.patientName}>{patient.fullName}</Text>
                  <View style={[styles.detailStatusBadge, { backgroundColor: patient.status === 'Discharged' ? '#D1FAE5' : patient.status === 'Deceased' ? '#FEE2E2' : '#EFF6FF', marginLeft: 8 }]}>
                    <Text style={[styles.detailStatusText, { color: patient.status === 'Discharged' ? '#10B981' : patient.status === 'Deceased' ? '#EF4444' : '#3B82F6' }]}>
                      {patient.status || 'Admitted'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.patientLoc}>{patient.status === 'Deceased' ? 'Critical Care Record' : patient.status === 'Discharged' ? 'Discharged Outpatient' : patient.wardName}</Text>
                <Text style={styles.patientBed}>{patient.status === 'Admitted' ? `${patient.roomType} / Bed ${patient.bedNo}` : `Record ID: ${patient.recordID}`}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.inchargeRow}>
              <Text style={styles.inchargeLabel}>Consultant Incharge:</Text>
              <Text style={styles.inchargeVal}>{patient.inchargeDoctor || 'Dr. Niraj Bam'}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.discussButton}
              onPress={handleDiscussCase}
              disabled={discussing}
            >
              {discussing ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <MessageSquare size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.discussButtonText}>Discuss Case</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedMount>

        {/* Circular Quick Stats Bar */}
        <AnimatedMount slide delay={100}>
          <View style={styles.quickStatsRow}>
            {renderQuickStat('Age', `${patient.age} Y`)}
            {renderQuickStat('Height', patient.height || '5.5 ft')}
            {renderQuickStat('Weight', `${patient.weight || '65'} kg`)}
            {renderQuickStat('Gender', patient.gender)}
          </View>
        </AnimatedMount>

        {/* Primary Diagnosis Banner */}
        <AnimatedMount slide delay={150}>
          <View style={styles.diagnosisBanner}>
            <View style={styles.diagnosisBannerIcon}>
              <Stethoscope size={20} color="#047857" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.diagnosisBannerLabel}>Primary Diagnosis</Text>
              <Text style={styles.diagnosisBannerText}>{patient.diagnosis || 'No Diagnosis Recorded'}</Text>
            </View>
          </View>
        </AnimatedMount>

        {/* Grid Menu */}
        <AnimatedMount slide delay={200}>
          <View style={styles.gridContainer}>
            <AnimatedPressable 
              style={styles.gridCell}
              onPress={() => navigation.navigate('VitalsScreen', { patientId: patient.recordID })}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Activity size={24} color="#3B82F6" />
              </View>
              <Text style={styles.gridCellTitle}>Vitals</Text>
              <Text style={styles.gridCellDesc}>Updates & TPR Trend</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={() => setActiveModal('diagnosis')}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Stethoscope size={24} color="#22C55E" />
              </View>
              <Text style={styles.gridCellTitle}>Diagnosis</Text>
              <Text style={styles.gridCellDesc}>Medical Assessments</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={() => setActiveModal('medication')}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Pill size={24} color="#EF4444" />
              </View>
              <Text style={styles.gridCellTitle}>Medication</Text>
              <Text style={styles.gridCellDesc}>Prescription Logs</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={() => setActiveModal('soap')}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#FFF7ED' }]}>
                <BookOpen size={24} color="#F97316" />
              </View>
              <Text style={styles.gridCellTitle}>SOAP Note</Text>
              <Text style={styles.gridCellDesc}>Structured clinical note</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={() => navigation.navigate('DischargeSummary', { patientId: patient.recordID })}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#FAF5FF' }]}>
                <FileCheck size={24} color="#A855F7" />
              </View>
              <Text style={styles.gridCellTitle}>Discharge</Text>
              <Text style={styles.gridCellDesc}>Summary & follow-up</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={() => { setSelectedNoteTab('Clinical'); scrollRef.current?.scrollTo({ y: 550, animated: true }); triggerNoteHighlight(); }}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#ECFEFF' }]}>
                <ClipboardList size={24} color="#06B6D4" />
              </View>
              <Text style={styles.gridCellTitle}>Progress Log</Text>
              <Text style={styles.gridCellDesc}>Daily ward reports</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={() => {
                setActiveModal('mar');
                setSelectedMedForMar(null);
              }}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#E6F4F1' }]}>
                <ClipboardCheck size={24} color="#0E7490" />
              </View>
              <Text style={styles.gridCellTitle}>MAR Log</Text>
              <Text style={styles.gridCellDesc}>Medication dosing logs</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={handleOpenHandover}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#F0FDF4' }]}>
                <ArrowRightLeft size={24} color="#15803D" />
              </View>
              <Text style={styles.gridCellTitle}>Handover</Text>
              <Text style={styles.gridCellDesc}>Shift handover sheets</Text>
            </AnimatedPressable>

            <AnimatedPressable 
              style={styles.gridCell}
              onPress={handleOpenCarePlan}
            >
              <View style={[styles.gridIconBox, { backgroundColor: '#EFF6FF' }]}>
                <ClipboardList size={24} color="#1D4ED8" />
              </View>
              <Text style={styles.gridCellTitle}>Care Plan</Text>
              <Text style={styles.gridCellDesc}>Nursing care plans</Text>
            </AnimatedPressable>
          </View>
        </AnimatedMount>

        {/* Investigation Reports Full-Width Button */}
        <TouchableOpacity 
          style={styles.fullWidthBtn}
          onPress={() => setActiveModal('labs')}
          activeOpacity={0.85}
        >
          <View style={styles.fullWidthBtnLeft}>
            <View style={[styles.gridIconBox, { backgroundColor: '#F1F5F9', marginBottom: 0, marginRight: 12 }]}>
              <ClipboardList size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.fullWidthBtnTitle}>Investigation Reports</Text>
              <Text style={styles.fullWidthBtnDesc}>Lab results, USG, X-Ray, CT scans</Text>
            </View>
          </View>
          <ChevronRight size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Progress & Clinical Notes Hub */}
        <Animated.View style={noteHighlightStyle}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress & Ward Logs</Text>
          
          {/* Tabs */}
          <View style={styles.notesTabContainer}>
            {['Clinical', 'Consultant', 'Nurse'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.notesTab,
                  selectedNoteTab === tab && styles.notesTabActive,
                  selectedNoteTab === tab && {
                    borderBottomColor: tab === 'Clinical' ? '#F97316' : tab === 'Consultant' ? '#A855F7' : '#06B6D4'
                  }
                ]}
                onPress={() => setSelectedNoteTab(tab)}
              >
                <Text style={[
                  styles.notesTabText,
                  selectedNoteTab === tab && styles.notesTabTextActive,
                  selectedNoteTab === tab && {
                    color: tab === 'Clinical' ? '#F97316' : tab === 'Consultant' ? '#A855F7' : '#06B6D4'
                  }
                ]}>
                  {tab} Logs
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Add Inline Form */}
          <View style={styles.inlineAddBox}>
            <TextInput
              style={styles.inlineInput}
              placeholder={`Add to ${selectedNoteTab} progress logs...`}
              placeholderTextColor={theme.colors.textSecondary}
              value={inlineNoteText}
              onChangeText={setInlineNoteText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.inlineSubmitBtn, 
                { backgroundColor: selectedNoteTab === 'Clinical' ? '#F97316' : selectedNoteTab === 'Consultant' ? '#A855F7' : '#06B6D4' }
              ]} 
              onPress={handleAddInlineNote}
              activeOpacity={0.8}
            >
              <Text style={styles.inlineSubmitText}>Add Log</Text>
            </TouchableOpacity>
          </View>

          {/* List of Logs */}
          <View style={styles.logsTimeline}>
            {patient.dailyReports && patient.dailyReports.filter(r => r.note.startsWith(selectedNoteTab)).length > 0 ? (
              patient.dailyReports
                .filter(r => r.note.startsWith(selectedNoteTab))
                .slice()
                .reverse()
                .map((report, idx) => {
                  const cleanedText = report.note.replace(`${selectedNoteTab} Note: `, '').replace(`${selectedNoteTab} Note:`, '');
                  const accentColor = selectedNoteTab === 'Clinical' ? '#F97316' : selectedNoteTab === 'Consultant' ? '#A855F7' : '#06B6D4';
                  return (
                    <Animated.View key={idx} entering={FadeInLeft.delay(Math.min(idx * 50, 300)).duration(350)} style={styles.timelineNode}>
                      <View style={[styles.timelineLine, { backgroundColor: accentColor }]} />
                      <View style={[styles.timelineDot, { borderColor: accentColor }]} />
                      
                      <View style={styles.timelineCard}>
                        <View style={styles.timelineCardHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                            <Text style={styles.timelineDate}>{report.date} • {report.time}</Text>
                            {report.isOffline && (
                              <View style={styles.offlineBadge}>
                                <Text style={styles.offlineBadgeText}>Pending Sync</Text>
                              </View>
                            )}
                          </View>
                          <View style={[styles.userBadge, { backgroundColor: accentColor + '20' }]}>
                            <Text style={[styles.userBadgeText, { color: accentColor }]}>{report.author || 'MD'}</Text>
                          </View>
                        </View>
                        <Text style={styles.timelineText}>{cleanedText}</Text>
                      </View>
                    </Animated.View>
                  );
                })
            ) : (
              <View style={styles.emptyLogsCard}>
                <Text style={styles.emptyLogsText}>No {selectedNoteTab.toLowerCase()} logs recorded for this patient.</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

        {/* Additional Doctors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Clinicians</Text>
          <View style={styles.doctorsCard}>
            {patient.additionalDoctors && patient.additionalDoctors.length > 0 ? (
              patient.additionalDoctors.map((doc, idx) => (
                <View key={idx} style={styles.doctorRow}>
                  <View style={styles.docIconBox}>
                    <User size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.doctorName}>{doc}</Text>
                  <Text style={styles.doctorSpecialty}>Collaborator</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No collaborating doctors assigned.</Text>
            )}
          </View>
        </View>

      </ScrollView>

      {/* OVERLAY MODALS */}

      {/* Diagnosis Modal */}
      <BottomSheet
        visible={activeModal === 'diagnosis'}
        onClose={() => setActiveModal(null)}
        title="Diagnosis Detail"
        height="70%"
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Primary Diagnosis</Text>
            <Text style={styles.detailText}>{patient.diagnosis}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Nature of Illness</Text>
            <Text style={styles.detailText}>{patient.natureOfDisease || 'Acute'}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Duration of Illness</Text>
            <Text style={styles.detailText}>{patient.durationOfIllness || 'N/A'}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>History of Present Illness</Text>
            <Text style={styles.detailText}>{patient.historyOfPresentIllness || 'None recorded.'}</Text>
          </View>
        </ScrollView>
      </BottomSheet>

      {/* Medication Modal — Enhanced */}
      <BottomSheet
        visible={activeModal === 'medication'}
        onClose={() => { setActiveModal(null); setShowAddMed(false); }}
        title="Medications & Orders"
        height="85%"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6 }}>
          {(() => {
            const meds = patient.medications || [];
            const activeCount = meds.filter(m => m.status === 'active').length;
            return (
              <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#047857' }}>Active: {activeCount} of {meds.length}</Text>
              </View>
            );
          })()}

          {/* Add Medication Toggle */}
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            onPress={() => setShowAddMed(!showAddMed)}
          >
            <Plus size={16} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 13 }}>
              {showAddMed ? 'Cancel' : 'Add Medication'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Medication Form */}
        {showAddMed && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F8FAFC', marginHorizontal: 12, borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: '700', fontSize: 12, color: '#374151', marginTop: 12, marginBottom: 6 }}>Drug Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Amoxicillin 500mg"
              value={newMed.name}
              onChangeText={t => setNewMed(prev => ({ ...prev, name: t }))}
            />
            <Text style={{ fontWeight: '700', fontSize: 12, color: '#374151', marginTop: 8, marginBottom: 6 }}>Route</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {ROUTE_OPTIONS.map((r, idx) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setSelectedRouteIdx(idx)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6, backgroundColor: selectedRouteIdx === idx ? theme.colors.primary : '#E5E7EB' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: selectedRouteIdx === idx ? '#FFF' : '#4B5563' }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{ fontWeight: '700', fontSize: 12, color: '#374151', marginTop: 4, marginBottom: 6 }}>Frequency *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. BD, TDS, OD"
              value={newMed.frequency}
              onChangeText={t => setNewMed(prev => ({ ...prev, frequency: t }))}
            />
            <Text style={{ fontWeight: '700', fontSize: 12, color: '#374151', marginTop: 8, marginBottom: 6 }}>Indication</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Infection, Pain"
              value={newMed.indication}
              onChangeText={t => setNewMed(prev => ({ ...prev, indication: t }))}
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, { marginTop: 12 }]}
              onPress={handleAddMedication}
              disabled={medLoading}
            >
              {medLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Save Medication</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={{ flex: 1 }}>
          {(patient.medications && patient.medications.length > 0) ? (
            patient.medications.map((med, idx) => (
              <TouchableOpacity
                key={med.id || idx}
                style={[styles.medicationItem, { borderLeftWidth: 3, borderLeftColor: med.status === 'active' ? '#10B981' : '#D1D5DB' }]}
                onLongPress={() => handleDeleteMedication(med)}
                activeOpacity={0.8}
              >
                <Pill size={16} color={med.status === 'active' ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medName, med.status !== 'active' && { color: theme.colors.textSecondary, textDecorationLine: 'line-through' }]}>{med.name}</Text>
                  <Text style={styles.medDose}>{med.route} • {med.frequency}{med.indication ? ` • ${med.indication}` : ''}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.medStatusBadge, { backgroundColor: med.status === 'active' ? '#FEF2F2' : '#F0FDF4' }]}
                  onPress={() => handleToggleMedStatus(med)}
                >
                  <Text style={[styles.medStatusText, { color: med.status === 'active' ? '#EF4444' : '#10B981' }]}>
                    {med.status === 'active' ? 'Stop' : 'Restart'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyLogsCard}>
              <Text style={styles.emptyLogsText}>No medications prescribed yet.</Text>
            </View>
          )}
        </ScrollView>
      </BottomSheet>

      {/* Labs / Investigation Reports Modal */}
      <BottomSheet
        visible={activeModal === 'labs'}
        onClose={() => { setActiveModal(null); setShowAddLab(false); }}
        title="Investigation Reports"
        height="85%"
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.subSectionTitle}>Imaging Studies</Text>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>USG Findings</Text>
            <Text style={styles.detailText}>{patient.usg || 'Normal'}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>CT Scan Findings</Text>
            <Text style={styles.detailText}>{patient.ctScan || 'Normal'}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
            <Text style={[styles.subSectionTitle, { marginTop: 0, marginBottom: 0 }]}>Laboratory Records</Text>
            <TouchableOpacity onPress={() => setShowAddLab(!showAddLab)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Plus size={16} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 12, marginLeft: 4 }}>Add Report</Text>
            </TouchableOpacity>
          </View>

          {showAddLab && (
            <View style={[styles.labCard, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: theme.colors.primaryLight }]}>
              <Text style={styles.labDate}>Add New Report ({newLab.date})</Text>
              <View style={styles.labGrid}>
                <View style={styles.labCell}>
                  <Text style={styles.labCellLabel}>Hb (Hemoglobin)</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="e.g. 14.2" 
                    value={newLab.hb} 
                    onChangeText={(t) => setNewLab({ ...newLab, hb: t })} 
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => tcRef.current?.focus()}
                  />
                </View>
                <View style={styles.labCell}>
                  <Text style={styles.labCellLabel}>TC (Total Count)</Text>
                  <TextInput 
                    ref={tcRef}
                    style={styles.modalInput} 
                    placeholder="e.g. 8500" 
                    value={newLab.tc} 
                    onChangeText={(t) => setNewLab({ ...newLab, tc: t })} 
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => plateletsRef.current?.focus()}
                  />
                </View>
                <View style={styles.labCell}>
                  <Text style={styles.labCellLabel}>Platelets</Text>
                  <TextInput 
                    ref={plateletsRef}
                    style={styles.modalInput} 
                    placeholder="e.g. 240000" 
                    value={newLab.platelets} 
                    onChangeText={(t) => setNewLab({ ...newLab, platelets: t })} 
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => inrRef.current?.focus()}
                  />
                </View>
                <View style={styles.labCell}>
                  <Text style={styles.labCellLabel}>INR</Text>
                  <TextInput 
                    ref={inrRef}
                    style={styles.modalInput} 
                    placeholder="e.g. 1.0" 
                    value={newLab.inr} 
                    onChangeText={(t) => setNewLab({ ...newLab, inr: t })} 
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>
              <View style={styles.modalButtonGroup}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddLab(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleAddLab}>
                  <Text style={styles.modalSubmitBtnText}>Save Lab Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {patient.investigations?.map((inv, idx) => (
            <View key={idx} style={styles.labCard}>
              <Text style={styles.labDate}>Report Date: {inv.date}</Text>
              <View style={styles.labGrid}>
                <View style={styles.labCell}><Text style={styles.labCellLabel}>Hb (Hemoglobin)</Text><Text style={styles.labCellVal}>{inv.hb} g/dL</Text></View>
                <View style={styles.labCell}><Text style={styles.labCellLabel}>TC (Total Count)</Text><Text style={styles.labCellVal}>{inv.tc} /cumm</Text></View>
                <View style={styles.labCell}><Text style={styles.labCellLabel}>Platelets</Text><Text style={styles.labCellVal}>{inv.platelets} /cumm</Text></View>
                <View style={styles.labCell}><Text style={styles.labCellLabel}>INR</Text><Text style={styles.labCellVal}>{inv.inr}</Text></View>
              </View>
            </View>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* SOAP Note Modal */}
      <BottomSheet
        visible={activeModal === 'soap'}
        onClose={() => setActiveModal(null)}
        title="SOAP Note"
        height="85%"
      >
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
          {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section) => (
            <View key={section} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: section === 'Subjective' ? '#DBEAFE' : section === 'Objective' ? '#D1FAE5' : section === 'Assessment' ? '#FEF3C7' : '#FCE7F3', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: section === 'Subjective' ? '#3B82F6' : section === 'Objective' ? '#10B981' : section === 'Assessment' ? '#F59E0B' : '#EC4899' }}>
                    {section.charAt(0)}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#374151' }}>{section}</Text>
              </View>
              <TextInput
                style={[styles.modalInput, { minHeight: 70, textAlignVertical: 'top' }]}
                placeholder={`Enter ${section.toLowerCase()} findings...`}
                placeholderTextColor="#9CA3AF"
                value={soapNote[section.toLowerCase()]}
                onChangeText={t => setSoapNote(prev => ({ ...prev, [section.toLowerCase()]: t }))}
                multiline
              />
            </View>
          ))}
          <View style={styles.modalButtonGroup}>
            <TouchableOpacity
              style={[styles.modalSubmitBtn, { flex: 1 }]}
              onPress={() => handleSaveSoapNote(false)}
              disabled={soapLoading}
            >
              {soapLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.modalSubmitBtnText}>Save & Log</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSubmitBtn, { flex: 1, backgroundColor: '#047857' }]}
              onPress={() => handleSaveSoapNote(true)}
              disabled={soapLoading}
            >
              <Text style={styles.modalSubmitBtnText}>Save & Share</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      </BottomSheet>

      {/* MAR Log Modal */}
      <BottomSheet
        visible={activeModal === 'mar'}
        onClose={() => { setActiveModal(null); setSelectedMedForMar(null); }}
        title="Medication Administration"
        height="85%"
      >
        {selectedMedForMar ? (
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} 
              onPress={() => setSelectedMedForMar(null)}
            >
              <ChevronLeft size={16} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 13, marginLeft: 4 }}>
                Back to Med List
              </Text>
            </TouchableOpacity>

            <View style={[styles.detailCard, { borderLeftWidth: 4, borderLeftColor: '#0E7490' }]}>
              <Text style={{ fontWeight: '800', fontSize: 14, color: theme.colors.textPrimary }}>
                {selectedMedForMar.name}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                Route: {selectedMedForMar.route} • Frequency: {selectedMedForMar.frequency}
              </Text>
              {selectedMedForMar.indication ? (
                <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 }}>
                  Indication: {selectedMedForMar.indication}
                </Text>
              ) : null}
            </View>

            {isNurse && (
              <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                <Text style={{ fontWeight: '700', fontSize: 12, color: '#374151', marginBottom: 6 }}>
                  Record Administration
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {['Given', 'Held', 'Refused'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setMarStatus(st)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignItems: 'center',
                        backgroundColor: marStatus === st 
                          ? (st === 'Given' ? '#D1FAE5' : st === 'Held' ? '#FEF3C7' : '#FEE2E2') 
                          : '#E2E8F0',
                        borderWidth: 1,
                        borderColor: marStatus === st 
                          ? (st === 'Given' ? '#10B981' : st === 'Held' ? '#F59E0B' : '#EF4444') 
                          : 'transparent'
                      }}
                    >
                      <Text style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: marStatus === st 
                          ? (st === 'Given' ? '#065F46' : st === 'Held' ? '#92400E' : '#991B1B') 
                          : '#4B5563'
                      }}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.modalInput, { minHeight: 40, backgroundColor: '#FFF', paddingHorizontal: 8, borderRadius: 8 }]}
                  placeholder="Add administration notes (optional)..."
                  value={marNotes}
                  onChangeText={setMarNotes}
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { marginTop: 8, paddingVertical: 10 }]}
                  onPress={handleSaveMar}
                  disabled={marLoading}
                >
                  {marLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Log Dose</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.subSectionTitle}>Dose Administration History</Text>
            <ScrollView style={{ flex: 1 }}>
              {(() => {
                const liveMed = (patient.medications || []).find(m => m.id === selectedMedForMar.id);
                const admins = liveMed?.administrations || [];
                if (admins.length === 0) {
                  return (
                    <View style={styles.emptyLogsCard}>
                      <Text style={styles.emptyLogsText}>No administrations logged for this medication.</Text>
                    </View>
                  );
                }
                return admins.map((admin, idx) => (
                  <View key={admin.id || idx} style={styles.marHistoryItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={[styles.statusBadge, {
                        backgroundColor: admin.status === 'Given' ? '#D1FAE5' : admin.status === 'Held' ? '#FEF3C7' : '#FEE2E2'
                      }]}>
                        <Text style={{
                          fontSize: 9,
                          fontWeight: '800',
                          color: admin.status === 'Given' ? '#065F46' : admin.status === 'Held' ? '#92400E' : '#991B1B'
                        }}>{admin.status.toUpperCase()}</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
                        {new Date(admin.administeredAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: theme.colors.textPrimary, marginTop: 4 }}>
                      By: {admin.administeredBy}
                    </Text>
                    {admin.notes ? (
                      <Text style={{ fontSize: 11, color: theme.colors.textSecondary, fontStyle: 'italic', marginTop: 2 }}>
                        Note: {admin.notes}
                      </Text>
                    ) : null}
                  </View>
                ));
              })()}
            </ScrollView>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8 }}>
              Select an active medication to view history or record administration:
            </Text>
            {(() => {
              const activeMeds = (patient.medications || []).filter(m => m.status === 'active');
              if (activeMeds.length === 0) {
                return (
                  <View style={styles.emptyLogsCard}>
                    <Text style={styles.emptyLogsText}>No active medications prescribed for this patient.</Text>
                  </View>
                );
              }
              return activeMeds.map((med, idx) => (
                <TouchableOpacity
                  key={med.id || idx}
                  style={[styles.medicationItem, { borderLeftWidth: 3, borderLeftColor: '#0E7490' }]}
                  onPress={() => handleOpenMar(med)}
                  activeOpacity={0.8}
                >
                  <Pill size={16} color="#0E7490" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDose}>{med.route} • {med.frequency}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ));
            })()}
          </ScrollView>
        )}
      </BottomSheet>

      {/* Shift Handover Modal */}
      <BottomSheet
        visible={activeModal === 'handover'}
        onClose={() => setActiveModal(null)}
        title="Shift Handover Sheets"
        height="85%"
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {isNurse && (
            <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ fontWeight: '800', fontSize: 13, color: '#374151', marginBottom: 8 }}>
                Log New Handover
              </Text>

              <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginBottom: 4 }}>Select Shift</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                {['Morning', 'Evening', 'Night'].map((sh) => (
                  <TouchableOpacity
                    key={sh}
                    onPress={() => setHandoverShift(sh)}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 6,
                      alignItems: 'center',
                      backgroundColor: handoverShift === sh ? '#D1FAE5' : '#E2E8F0',
                      borderWidth: 1,
                      borderColor: handoverShift === sh ? '#10B981' : 'transparent'
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: handoverShift === sh ? '#065F46' : '#4B5563' }}>
                      {sh}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginBottom: 4 }}>Select Incoming Staff</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {practitioners.length > 0 ? (
                  practitioners.map((doc, idx) => (
                    <TouchableOpacity
                      key={doc.id || idx}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        marginRight: 6,
                        backgroundColor: handoverIncoming === doc.name ? '#15803D' : '#E2E8F0',
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      onPress={() => setHandoverIncoming(doc.name)}
                    >
                      <User size={12} color={handoverIncoming === doc.name ? '#FFF' : '#4B5563'} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: handoverIncoming === doc.name ? '#FFF' : '#4B5563' }}>
                        {doc.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ fontSize: 10, color: theme.colors.textSecondary, paddingVertical: 4 }}>
                    Loading practitioners...
                  </Text>
                )}
              </ScrollView>

              <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginBottom: 4 }}>Handover Summary / Notes</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 60, textAlignVertical: 'top', backgroundColor: '#FFF', paddingHorizontal: 8, borderRadius: 8 }]}
                placeholder="Summarize vitals, pending lab reviews, and special tasks..."
                placeholderTextColor="#9CA3AF"
                value={handoverNotes}
                onChangeText={setHandoverNotes}
                multiline
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { marginTop: 10, paddingVertical: 10, backgroundColor: '#15803D' }]}
                onPress={handleSaveHandover}
                disabled={handoverLoading}
              >
                {handoverLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Submit Handover</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.subSectionTitle}>Handover Timeline</Text>
          {(() => {
            const handovers = patient.shiftHandovers || [];
            if (handovers.length === 0) {
              return (
                <View style={styles.emptyLogsCard}>
                  <Text style={styles.emptyLogsText}>No shift handovers logged yet.</Text>
                </View>
              );
            }
            return handovers.map((h, idx) => (
              <View key={h.id || idx} style={styles.handoverTimelineItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 12, color: theme.colors.textPrimary }}>
                    {h.shift} Shift
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>{h.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <Text style={{ fontSize: 10, color: '#4B5563', backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    From: {h.outgoingStaff}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#4B5563', backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    To: {h.incomingStaff}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.colors.textPrimary, marginTop: 6, lineHeight: 16 }}>
                  {h.notes}
                </Text>
              </View>
            ));
          })()}
        </ScrollView>
      </BottomSheet>

      {/* Nursing Care Plan Modal */}
      <BottomSheet
        visible={activeModal === 'careplan'}
        onClose={() => { setActiveModal(null); setSelectedCarePlanForEval(null); }}
        title="Nursing Care Plans"
        height="85%"
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {isNurse && (
            selectedCarePlanForEval ? (
              <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: '#374151', marginBottom: 8 }}>
                  Evaluate Care Plan
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textPrimary, marginBottom: 4, fontWeight: '700' }}>
                  Diagnosis: {selectedCarePlanForEval.nursingDiagnosis}
                </Text>
                <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginBottom: 8 }}>
                  Goals: {selectedCarePlanForEval.goals}
                </Text>

                <TextInput
                  style={[styles.modalInput, { minHeight: 60, textAlignVertical: 'top', backgroundColor: '#FFF', paddingHorizontal: 8, borderRadius: 8 }]}
                  placeholder="Enter outcomes (e.g. Achieved - pain resolved. Or Partially Achieved - temp reduced to 37.5°C)..."
                  placeholderTextColor="#9CA3AF"
                  value={carePlanEvaluation}
                  onChangeText={text => setCarePlanEvaluation(text)}
                  multiline
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.modalCancelBtn, { flex: 1 }]}
                    onPress={() => setSelectedCarePlanForEval(null)}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalSubmitBtn, { flex: 1, backgroundColor: '#1D4ED8' }]}
                    onPress={() => handleSaveCarePlanEvaluation(selectedCarePlanForEval.id)}
                    disabled={carePlanLoading}
                  >
                    {carePlanLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.modalSubmitBtnText}>Submit Eval</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: '#374151', marginBottom: 8 }}>
                  Create New Care Plan
                </Text>

                <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginBottom: 2 }}>Nursing Diagnosis</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: '#FFF', paddingHorizontal: 8, borderRadius: 8, marginBottom: 8 }]}
                  placeholder="e.g. Acute pain related to surgical incision"
                  value={carePlanDiagnosis}
                  onChangeText={text => setCarePlanDiagnosis(text)}
                />

                <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginBottom: 2 }}>Expected Goals</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: '#FFF', paddingHorizontal: 8, borderRadius: 8, marginBottom: 8 }]}
                  placeholder="e.g. Pain scale reduced to <3/10 within 2 hours"
                  value={carePlanGoals}
                  onChangeText={text => setCarePlanGoals(text)}
                />

                <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginBottom: 2 }}>Interventions</Text>
                <TextInput
                  style={[styles.modalInput, { minHeight: 50, textAlignVertical: 'top', backgroundColor: '#FFF', paddingHorizontal: 8, borderRadius: 8 }]}
                  placeholder="e.g. Administer analgesics as ordered, position comfortably"
                  value={carePlanInterventions}
                  onChangeText={text => setCarePlanInterventions(text)}
                  multiline
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { marginTop: 10, paddingVertical: 10, backgroundColor: '#1D4ED8' }]}
                  onPress={handleSaveCarePlan}
                  disabled={carePlanLoading}
                >
                  {carePlanLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Create Care Plan</Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          )}

          <Text style={styles.subSectionTitle}>Active Care Plans</Text>
          {(() => {
            const carePlans = patient.carePlans || [];
            if (carePlans.length === 0) {
              return (
                <View style={styles.emptyLogsCard}>
                  <Text style={styles.emptyLogsText}>No nursing care plans logged yet.</Text>
                </View>
              );
            }
            return carePlans.map((cp, idx) => (
              <View key={cp.id || idx} style={styles.carePlanCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 12, color: '#1D4ED8' }}>
                    Diagnosis
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>By: {cp.authoredBy}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 2 }}>
                  {cp.nursingDiagnosis}
                </Text>
                
                <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginTop: 6 }}>Goals</Text>
                <Text style={{ fontSize: 11, color: theme.colors.textPrimary }}>{cp.goals}</Text>

                <Text style={{ fontWeight: '700', fontSize: 11, color: '#4B5563', marginTop: 6 }}>Interventions</Text>
                <Text style={{ fontSize: 11, color: theme.colors.textPrimary }}>{cp.interventions}</Text>

                {cp.evaluation ? (
                  <View style={{ backgroundColor: '#D1FAE5', padding: 8, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#10B981' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#065F46' }}>EVALUATION OUTCOME</Text>
                    <Text style={{ fontSize: 11, color: '#064E3B', marginTop: 2 }}>{cp.evaluation}</Text>
                  </View>
                ) : (
                  isNurse && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#FFF',
                        borderWidth: 1,
                        borderColor: '#1D4ED8',
                        borderRadius: 6,
                        paddingVertical: 6,
                        alignItems: 'center',
                        marginTop: 10
                      }}
                      onPress={() => {
                        setSelectedCarePlanForEval(cp);
                        setCarePlanEvaluation('');
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
                        Evaluate Progress
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            ));
          })()}
        </ScrollView>
      </BottomSheet>

    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  editBtn: {
    backgroundColor: theme.colors.primaryLight,
    padding: 8,
    borderRadius: theme.borderRadius.md,
  },
  statusChangeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  statusChangeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metadataHeader: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  scrollContent: {
    paddingBottom: 80,
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
    marginBottom: theme.spacing.md,
  },
  avatarBox: {
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
  patientMeta: {
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: theme.spacing.sm,
  },
  inchargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inchargeLabel: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '600',
  },
  inchargeVal: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700',
  },
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  diagnosisBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  diagnosisBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  diagnosisBannerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  diagnosisBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#064E3B',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  gridCell: {
    width: '50%',
    padding: theme.spacing.sm,
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  gridCellTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  gridCellDesc: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  fullWidthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  fullWidthBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidthBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  fullWidthBtnDesc: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  doctorsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  docIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  doctorName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  doctorSpecialty: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medName: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  medDose: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  medStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    marginLeft: 8,
  },
  medStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  addNoteBox: {
    marginBottom: theme.spacing.lg,
  },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    height: 80,
    fontSize: 13,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  noteSubmitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  noteSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  reportCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportHeader: {
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  reportNote: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  labCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  labDate: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  labGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  labCell: {
    width: '47%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  labCellLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  labCellVal: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  detailStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  detailStatusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  notesTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  notesTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  notesTabActive: {
    borderBottomWidth: 2,
  },
  notesTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  notesTabTextActive: {
    fontWeight: '800',
  },
  inlineAddBox: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  inlineInput: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
    paddingVertical: theme.spacing.xs,
  },
  inlineSubmitBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
  },
  inlineSubmitText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  logsTimeline: {
    marginTop: theme.spacing.xs,
  },
  timelineNode: {
    flexDirection: 'row',
    paddingLeft: theme.spacing.md,
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  timelineLine: {
    position: 'absolute',
    left: 8,
    top: 14,
    bottom: -22,
    width: 2,
    opacity: 0.15,
  },
  timelineDot: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  userBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  userBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  timelineText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  emptyLogsCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLogsText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalInput: {
    padding: 0,
    margin: 0,
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginTop: 4,
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalCancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.md,
  },
  discussButton: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  discussButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
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
  marHistoryItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
    alignSelf: 'flex-start',
  },
  handoverTimelineItem: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  practitionerCard: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  practitionerCardSelected: {
    backgroundColor: '#15803D',
  },
  carePlanCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
});

export default PatientDetail;
