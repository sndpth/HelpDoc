import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronDown, ChevronRight, Save } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useStore from '../store/useStore';
import { theme } from '../constants/theme';
import MediaAttachment from '../components/MediaAttachment';
import ClinicalCanvas from '../components/ClinicalCanvas';
import AnimatedPressable from '../components/AnimatedPressable';
import AnimatedMount from '../components/AnimatedMount';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const KeyboardAvoidingViewWrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

const AddPatientScreen = ({ navigation, route }) => {
  const { patient } = route.params || {};
  const isEditing = !!patient;

  const { addPatient, updatePatient } = useStore();
  
  const insets = useSafeAreaInsets();
  const [initialBottomInset] = useState(insets.bottom);
  
  const [form, setForm] = useState(() => {
    if (patient) {
      const inv = (patient.investigations && patient.investigations.length > 0) ? patient.investigations[0] : {};
      return {
        ...patient,
        type: patient.type || 'IPD',
        complications: Array.isArray(patient.complications) ? patient.complications.join(', ') : patient.complications || '',
        additionalDoctors: Array.isArray(patient.additionalDoctors) ? patient.additionalDoctors.join(', ') : patient.additionalDoctors || '',
        hb: inv.hb || '',
        tc: inv.tc || '',
        neu: inv.neu || '',
        lym: inv.lym || '',
        platelets: inv.platelets || '',
        pt: inv.pt || '',
        inr: inv.inr || '',
      };
    }
    return {
      type: 'IPD',
      fullName: '',
      ipNumber: '',
      ipdId: '',
      patientId: '',
      fileNo: '',
      age: '',
      gender: '',
      address: '',
      dateOfAdmission: new Date().toLocaleDateString(),
      admissionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateOfOperation: '',
      dateOfDischarge: '',
      stayDuration: '',
      postOpStay: '',
      wardName: '',
      roomType: '',
      bedNo: '',
      inchargeDoctor: '',
      additionalDoctors: '',
      diagnosis: '',
      natureOfDisease: '',
      durationOfIllness: '',
      historyOfPresentIllness: '',
      pastHistory: '',
      comorbidities: '',
      generalExam: '',
      weight: '',
      height: '',
      abdomenExam: '',
      otherFindings: '',
      usg: '',
      ctScan: '',
      operation: '',
      operationFindings: '',
      surgeon: '',
      assistant1: '',
      assistant2: '',
      postOpProgress: '',
      hpeReport: '',
      bloodTransfusion: 'No',
      wbPrbcUnits: '0',
      ffpUnits: '0',
      prpUnits: '0',
      complications: '',
      complicationGrade: 'I',
      hb: '',
      tc: '',
      neu: '',
      lym: '',
      platelets: '',
      pt: '',
      inr: '',
      attachments: [],
    };
  });

  const [datePickerField, setDatePickerField] = useState(null); // track which field is being edited
  const scrollViewRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState({
    demographics: false,
    location: false,
    timeline: false,
    clinical: true,
    operative: true,
    labs: true,
    attachments: true,
  });

  const toggleCollapsed = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    setSaving(true);
    const formattedForm = {
      ...form,
      complications: typeof form.complications === 'string' ? form.complications.split(',').map(c => c.trim()).filter(c => c) : form.complications,
      additionalDoctors: typeof form.additionalDoctors === 'string' ? form.additionalDoctors.split(',').map(d => d.trim()).filter(d => d) : form.additionalDoctors,
      investigations: isEditing ? (
        form.investigations && form.investigations.length > 0 ? [
          { ...form.investigations[0], hb: form.hb || '', tc: form.tc || '', neu: form.neu || '', lym: form.lym || '', platelets: form.platelets || '', pt: form.pt || '', inr: form.inr || '' },
          ...form.investigations.slice(1)
        ] : [{ date: form.dateOfAdmission, hb: form.hb || '', tc: form.tc || '', neu: form.neu || '', lym: form.lym || '', platelets: form.platelets || '', pt: form.pt || '', inr: form.inr || '' }]
      ) : [{
        date: form.dateOfAdmission,
        hb: form.hb || '',
        tc: form.tc || '',
        neu: form.neu || '',
        lym: form.lym || '',
        platelets: form.platelets || '',
        pt: form.pt || '',
        inr: form.inr || ''
      }]
    };

    if (isEditing) {
      updatePatient(patient.recordID, formattedForm);
      setSaving(false);
      Alert.alert('Success', 'Patient record updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      addPatient(formattedForm);
      setSaving(false);
      Alert.alert('Success', 'New patient admitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const onDateChange = (event, selectedDate) => {
    setDatePickerField(null);
    if (selectedDate) {
      updateField(datePickerField, selectedDate.toLocaleDateString());
    }
  };

  const DateInput = ({ label, field }) => (
    <TouchableOpacity 
      style={[styles.input, styles.flex1, { justifyContent: 'center' }]} 
      onPress={() => setDatePickerField(field)}
    >
      <Text style={{ color: form[field] ? theme.colors.textPrimary : theme.colors.textSecondary }}>
        {form[field] || label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ClinicalCanvas style={styles.canvas}>
      <KeyboardAvoidingViewWrapper 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
        >
          {/* Admission Type Selection */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity 
              style={[styles.segmentedTab, form.type === 'IPD' && styles.segmentedTabActive]} 
              onPress={() => updateField('type', 'IPD')}
            >
              <Text style={[styles.segmentedText, form.type === 'IPD' && styles.segmentedTextActive]}>Inpatient (IPD)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentedTab, form.type === 'OPD' && styles.segmentedTabActive]} 
              onPress={() => updateField('type', 'OPD')}
            >
              <Text style={[styles.segmentedText, form.type === 'OPD' && styles.segmentedTextActive]}>Outpatient (OPD)</Text>
            </TouchableOpacity>
          </View>

          {/* Patient Clinical Identifiers */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => toggleCollapsed('demographics')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Demographics & Identifiers</Text>
              {collapsed.demographics ? (
                <ChevronRight size={18} color={theme.colors.primary} />
              ) : (
                <ChevronDown size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            {!collapsed.demographics && (
              <Animated.View entering={FadeInUp.duration(200)}>
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Patient Full Name" value={form.fullName} onChangeText={(t) => updateField('fullName', t)} />
                
                <View style={styles.row}>
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Patient ID (e.g. 81552753)" value={form.patientId} onChangeText={(t) => updateField('patientId', t)} />
                  <View style={styles.spacer} />
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="File No (e.g. F-8812)" value={form.fileNo} onChangeText={(t) => updateField('fileNo', t)} />
                </View>

                <View style={styles.row}>
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Age" keyboardType="numeric" value={form.age.toString()} onChangeText={(t) => updateField('age', t)} />
                  <View style={styles.spacer} />
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Gender" value={form.gender} onChangeText={(t) => updateField('gender', t)} />
                </View>
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Address" value={form.address} onChangeText={(t) => updateField('address', t)} />
              </Animated.View>
            )}
          </View>

          {form.type === 'IPD' ? (
            <>
              {/* Hospital Ward & Location Details */}
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.collapsibleHeader} 
                  onPress={() => toggleCollapsed('location')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>Ward & Location Details</Text>
                  {collapsed.location ? (
                    <ChevronRight size={18} color={theme.colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
                {!collapsed.location && (
                  <Animated.View entering={FadeInUp.duration(200)}>
                    <View style={styles.row}>
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="IPD ID (e.g. 783918)" value={form.ipdId} onChangeText={(t) => updateField('ipdId', t)} />
                      <View style={styles.spacer} />
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="IP Number" value={form.ipNumber} onChangeText={(t) => updateField('ipNumber', t)} />
                    </View>

                    <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Ward Name" value={form.wardName} onChangeText={(t) => updateField('wardName', t)} />
                    
                    <View style={styles.row}>
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Room Type (e.g. CABIN)" value={form.roomType} onChangeText={(t) => updateField('roomType', t)} />
                      <View style={styles.spacer} />
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Bed No (e.g. 1701)" value={form.bedNo} onChangeText={(t) => updateField('bedNo', t)} />
                    </View>

                    <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Consultant Incharge" value={form.inchargeDoctor} onChangeText={(t) => updateField('inchargeDoctor', t)} />
                    <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Collaborators (comma separated e.g. Dr. Susan Giri)" value={form.additionalDoctors} onChangeText={(t) => updateField('additionalDoctors', t)} />
                  </Animated.View>
                )}
              </View>

              {/* Timeline */}
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.collapsibleHeader} 
                  onPress={() => toggleCollapsed('timeline')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>Timeline</Text>
                  {collapsed.timeline ? (
                    <ChevronRight size={18} color={theme.colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
                {!collapsed.timeline && (
                  <Animated.View entering={FadeInUp.duration(200)}>
                    <View style={styles.row}>
                      <DateInput label="Adm. Date" field="dateOfAdmission" />
                      <View style={styles.spacer} />
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Admission Time" value={form.admissionTime} onChangeText={(t) => updateField('admissionTime', t)} />
                    </View>
                    <View style={styles.row}>
                      <DateInput label="Op. Date" field="dateOfOperation" />
                      <View style={styles.spacer} />
                      <DateInput label="Disch. Date" field="dateOfDischarge" />
                    </View>
                    <View style={styles.row}>
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Stay Duration" value={form.stayDuration} onChangeText={(t) => updateField('stayDuration', t)} />
                      <View style={styles.spacer} />
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Post-Op Stay" value={form.postOpStay} onChangeText={(t) => updateField('postOpStay', t)} />
                    </View>
                  </Animated.View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Outpatient OPD Details */}
              <View style={styles.card}>
                <TouchableOpacity 
                  style={styles.collapsibleHeader} 
                  onPress={() => toggleCollapsed('location')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>OPD Consultation Details</Text>
                  {collapsed.location ? (
                    <ChevronRight size={18} color={theme.colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
                {!collapsed.location && (
                  <Animated.View entering={FadeInUp.duration(200)}>
                    <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="OPD Ticket Number (e.g. OPD-2025-102)" value={form.ipNumber} onChangeText={(t) => updateField('ipNumber', t)} />
                    <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Consultant Incharge" value={form.inchargeDoctor} onChangeText={(t) => updateField('inchargeDoctor', t)} />
                    <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Collaborators (comma separated)" value={form.additionalDoctors} onChangeText={(t) => updateField('additionalDoctors', t)} />
                    
                    <View style={styles.row}>
                      <DateInput label="Consultation Date" field="dateOfAdmission" />
                      <View style={styles.spacer} />
                      <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Consultation Time" value={form.admissionTime} onChangeText={(t) => updateField('admissionTime', t)} />
                    </View>
                  </Animated.View>
                )}
              </View>
            </>
          )}

          {/* Clinical & Examination */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => toggleCollapsed('clinical')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Clinical & Examination</Text>
              {collapsed.clinical ? (
                <ChevronRight size={18} color={theme.colors.primary} />
              ) : (
                <ChevronDown size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            {!collapsed.clinical && (
              <Animated.View entering={FadeInUp.duration(200)}>
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Diagnosis" value={form.diagnosis} onChangeText={(t) => updateField('diagnosis', t)} />
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Nature (Malignant/Benign)" value={form.natureOfDisease} onChangeText={(t) => updateField('natureOfDisease', t)} />
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholderTextColor={theme.colors.textSecondary} 
                  placeholder="History of Present Illness" 
                  multiline 
                  value={form.historyOfPresentIllness} 
                  onChangeText={(t) => updateField('historyOfPresentIllness', t)} 
                />
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="General Examination" value={form.generalExam} onChangeText={(t) => updateField('generalExam', t)} />
                <View style={styles.row}>
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Weight (kg)" keyboardType="numeric" value={form.weight} onChangeText={(t) => updateField('weight', t)} />
                  <View style={styles.spacer} />
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Height (ft or m)" value={form.height} onChangeText={(t) => updateField('height', t)} />
                </View>
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Abdomen Examination" value={form.abdomenExam} onChangeText={(t) => updateField('abdomenExam', t)} />
              </Animated.View>
            )}
          </View>

          {/* Operative Details */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => toggleCollapsed('operative')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Operative Details</Text>
              {collapsed.operative ? (
                <ChevronRight size={18} color={theme.colors.primary} />
              ) : (
                <ChevronDown size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            {!collapsed.operative && (
              <Animated.View entering={FadeInUp.duration(200)}>
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Operation Name" value={form.operation} onChangeText={(t) => updateField('operation', t)} />
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="Surgeon" value={form.surgeon} onChangeText={(t) => updateField('surgeon', t)} />
                <View style={styles.row}>
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Assistant 1" value={form.assistant1} onChangeText={(t) => updateField('assistant1', t)} />
                  <View style={styles.spacer} />
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Assistant 2" value={form.assistant2} onChangeText={(t) => updateField('assistant2', t)} />
                </View>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholderTextColor={theme.colors.textSecondary} 
                  placeholder="Operative Findings" 
                  multiline 
                  value={form.operationFindings} 
                  onChangeText={(t) => updateField('operationFindings', t)} 
                />
                <TextInput style={styles.input} placeholderTextColor={theme.colors.textSecondary} placeholder="HPE Report" value={form.hpeReport} onChangeText={(t) => updateField('hpeReport', t)} />
              </Animated.View>
            )}
          </View>

          {/* Initial Lab Investigations */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => toggleCollapsed('labs')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Initial Lab Investigations</Text>
              {collapsed.labs ? (
                <ChevronRight size={18} color={theme.colors.primary} />
              ) : (
                <ChevronDown size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            {!collapsed.labs && (
              <Animated.View entering={FadeInUp.duration(200)}>
                <View style={styles.row}>
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Hb" value={form.hb} onChangeText={(t) => updateField('hb', t)} />
                  <View style={styles.spacer} />
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="TC" value={form.tc} onChangeText={(t) => updateField('tc', t)} />
                  <View style={styles.spacer} />
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Neu" value={form.neu} onChangeText={(t) => updateField('neu', t)} />
                </View>
                <View style={styles.row}>
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Lym" value={form.lym} onChangeText={(t) => updateField('lym', t)} />
                  <View style={styles.spacer} />
                  <TextInput style={[styles.input, styles.flex1]} placeholderTextColor={theme.colors.textSecondary} placeholder="Platelets" value={form.platelets} onChangeText={(t) => updateField('platelets', t)} />
                </View>
              </Animated.View>
            )}
          </View>

          {/* Media Attachments */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.collapsibleHeader} 
              onPress={() => toggleCollapsed('attachments')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Media & Case Files</Text>
              {collapsed.attachments ? (
                <ChevronRight size={18} color={theme.colors.primary} />
              ) : (
                <ChevronDown size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            {!collapsed.attachments && (
              <Animated.View entering={FadeInUp.duration(200)}>
                <MediaAttachment 
                  attachments={form.attachments} 
                  onAdd={(uri) => updateField('attachments', [...form.attachments, uri])} 
                  onRemove={(idx) => updateField('attachments', form.attachments.filter((_, i) => i !== idx))} 
                />
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Save Button Footer */}
        <View style={[styles.fixedFooter, { paddingBottom: Math.max(initialBottomInset, theme.spacing.md) }]}>
          <AnimatedPressable 
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Update Patient Record' : 'Admit Patient Record'}
              </Text>
            )}
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingViewWrapper>

      {datePickerField && (
        <DateTimePicker
          value={form[datePickerField] ? new Date(form[datePickerField]) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: theme.colors.background, paddingBottom: 0 },
  container: { flex: 1 },
  scroll: { padding: theme.spacing.lg, paddingBottom: 100 },
  card: { 
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.md, 
    marginBottom: theme.spacing.md, 
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.primary, marginBottom: theme.spacing.sm },
  input: { 
    backgroundColor: theme.colors.surfaceSecondary, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    borderRadius: theme.borderRadius.sm, 
    paddingHorizontal: theme.spacing.md, 
    paddingVertical: theme.spacing.sm, 
    marginBottom: theme.spacing.sm, 
    ...theme.typography.body,
    height: 44, // Touch target minimum
  },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  spacer: { width: theme.spacing.sm },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { 
    backgroundColor: theme.colors.primary, 
    borderRadius: theme.borderRadius.md, 
    paddingVertical: theme.spacing.md, 
    alignItems: 'center', 
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: { ...theme.typography.h3, color: theme.colors.surface },
  fixedFooter: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  segmentedTabActive: {
    backgroundColor: '#FFF',
    ...theme.shadows.card,
  },
  segmentedText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  segmentedTextActive: {
    color: theme.colors.primary,
  },
});

export default AddPatientScreen;
