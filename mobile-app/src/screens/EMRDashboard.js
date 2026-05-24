import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, StatusBar, TouchableOpacity, Image, TextInput, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { Search, Users, ClipboardList, Bed, Calendar, Clock, Plus, UserPlus, Activity, FileText, MessageCircle, X, Stethoscope, BarChart2 } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn, SlideInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';
import AnimatedMount from '../components/AnimatedMount';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import BottomSheet from '../components/BottomSheet';
import useStore from '../store/useStore';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';

const EMRDashboard = ({ navigation }) => {
  const { patients, userProfile, fetchPatients } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Admitted'); // 'Admitted' | 'Discharged' | 'Deceased'
  const [refreshing, setRefreshing] = useState(false);
  const [quickActionPatient, setQuickActionPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const tabIndex = useSharedValue(0);

  useEffect(() => {
    const loadData = async () => {
      if (patients.length === 0) {
        setIsLoading(true);
        await fetchPatients();
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const idx = ['Admitted', 'Discharged', 'Deceased'].indexOf(activeTab);
    tabIndex.value = withSpring(idx, theme.animation.spring);
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  const handleTabPress = (tab, idx) => {
    setActiveTab(tab);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const leftOffset = tabIndex.value * 33.33;
    return {
      left: `${leftOffset + 0.5}%`,
    };
  });

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.diagnosis && p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.patientId && p.patientId.includes(searchQuery))
  );

  const displayedPatients = filteredPatients.filter(p => {
    const status = p.status || (p.dateOfDischarge ? 'Discharged' : 'Admitted');
    return status.toLowerCase() === activeTab.toLowerCase();
  });

  // treat active inpatients for top slider
  const admittedPatients = filteredPatients.filter(p => {
    const status = p.status || (p.dateOfDischarge ? 'Discharged' : 'Admitted');
    return status === 'Admitted';
  });

  const handlePatientPress = (patient) => {
    navigation.navigate('PatientDetail', { patient });
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderAdmittedPatient = ({ item, index }) => (
    <AnimatedMount slide delay={Math.min(index * 50, 400)}>
      <AnimatedPressable 
        style={styles.admittedCard} 
        onPress={() => handlePatientPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
          </View>
          <View style={styles.patientMeta}>
            <Text style={styles.admittedName}>{item.fullName}</Text>
            <Text style={styles.admittedSub}>{item.patientId || item.recordID} ({item.age} Y / {item.gender})</Text>
          </View>
        </View>

        <View style={styles.cardLocation}>
          <Bed size={16} color="#93C5FD" style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.roomType} / Bed {item.bedNo}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Calendar size={14} color="#93C5FD" />
          <Text style={styles.footerText}>{item.dateOfAdmission}</Text>
          <View style={styles.dot} />
          <Clock size={14} color="#93C5FD" />
          <Text style={styles.footerText}>{item.admissionTime || '12:00 PM'}</Text>
        </View>
      </AnimatedPressable>
    </AnimatedMount>
  );

  const getStatusStyle = (status) => {
    if (status === 'Discharged') return { color: '#10B981', bg: '#D1FAE5', label: 'Discharged' };
    if (status === 'Deceased') return { color: '#EF4444', bg: '#FEE2E2', label: 'Deceased' };
    return { color: theme.colors.primary, bg: theme.colors.primaryLight, label: 'Admitted' };
  };

  const renderAllPatient = ({ item, index }) => {
    const status = item.status || (item.dateOfDischarge ? 'Discharged' : 'Admitted');
    const badge = getStatusStyle(status);

    return (
      <AnimatedMount slide delay={Math.min(index * 50, 400)}>
        <AnimatedPressable 
          style={styles.allPatientCard} 
          onPress={() => handlePatientPress(item)}
          onLongPress={() => setQuickActionPatient(item)}
        >
          <View style={styles.allCardHeader}>
            <View style={[styles.allAvatarBox, { backgroundColor: badge.bg }]}>
              <Text style={[styles.allAvatarText, { color: badge.color }]}>{item.fullName.charAt(0)}</Text>
            </View>
            <View style={styles.allPatientMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.allName}>{item.fullName}</Text>
                <Text style={[styles.dateTag, { color: badge.color, backgroundColor: badge.bg }]}>
                  {badge.label}
                </Text>
              </View>
              <Text style={styles.allSub}>{item.patientId || item.recordID} ({item.age} Y / {item.gender})</Text>
              
              <View style={styles.allLocationRow}>
                {status === 'Admitted' ? (
                  <>
                    <Bed size={14} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.allLocationText}>{item.roomType} - Bed {item.bedNo}</Text>
                  </>
                ) : status === 'Discharged' ? (
                  <>
                    <Calendar size={14} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={[styles.allLocationText, { color: '#10B981', fontWeight: '600' }]}>
                      Discharged on {item.dateOfDischarge}
                    </Text>
                  </>
                ) : (
                  <>
                    <Clock size={14} color="#EF4444" style={{ marginRight: 4 }} />
                    <Text style={[styles.allLocationText, { color: '#EF4444', fontWeight: '600' }]}>
                      Deceased (ABSCE. Shock)
                    </Text>
                  </>
                )}
              </View>

              {/* Diagnosis Row */}
              <View style={styles.allDiagnosisRow}>
                <Stethoscope size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.allDiagnosisText} numberOfLines={1}>
                  {item.diagnosis || 'No Diagnosis Recorded'}
                </Text>
              </View>
            </View>
          </View>
        </AnimatedPressable>
      </AnimatedMount>
    );
  };

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Greetings Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.docName}>Dr. {userProfile.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AnimatedPressable 
            style={{ padding: 6 }} 
            onPress={() => navigation.navigate('Analytics')}
          >
            <BarChart2 size={24} color={theme.colors.primary} />
          </AnimatedPressable>
          {userProfile.avatar && !avatarError ? (
            <Image 
              source={{ uri: userProfile.avatar }} 
              style={styles.docAvatar} 
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={[styles.docAvatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>
                {userProfile.name ? userProfile.name.charAt(0) : 'D'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={displayedPatients}
        keyExtractor={(item) => item.recordID}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
        }
        ListHeaderComponent={
          <>
            {/* Consultation Cards Grid */}
            <View style={styles.consultGrid}>
              <AnimatedPressable 
                style={[styles.consultCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}
                onPress={() => navigation.navigate('OPDScheduling')}
              >
                <View style={[styles.consultIconBox, { backgroundColor: '#3B82F6' }]}>
                  <Users size={20} color="#FFF" />
                </View>
                <Text style={styles.consultTitle}>General Consultation</Text>
                <Text style={styles.consultDesc}>Schedule and view general outpatient OPD consults.</Text>
              </AnimatedPressable>

              <AnimatedPressable 
                style={[styles.consultCard, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}
                onPress={() => navigation.navigate('OPDScheduling')}
              >
                <View style={[styles.consultIconBox, { backgroundColor: '#22C55E' }]}>
                  <ClipboardList size={20} color="#FFF" />
                </View>
                <Text style={styles.consultTitle}>EHS Consultation</Text>
                <Text style={styles.consultDesc}>Extended hospital service outpatient consults.</Text>
              </AnimatedPressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <Search size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search patient, diagnosis, ID..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <AnimatedPressable 
                  onPress={() => setSearchQuery('')} 
                  style={{ padding: 4 }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                >
                  <X size={18} color={theme.colors.textSecondary} />
                </AnimatedPressable>
              )}
            </View>

            {/* Admitted Patients Section (Only active inpatients) */}
            {(admittedPatients.length > 0 || isLoading) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Active Inpatients ({admittedPatients.length})</Text>
                  <AnimatedPressable onPress={() => setActiveTab('Admitted')}>
                    <Text style={styles.viewAllText}>View list</Text>
                  </AnimatedPressable>
                </View>
                <FlatList
                  data={isLoading ? [1, 2] : admittedPatients}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => isLoading ? `skeleton_adm_${index}` : 'adm_' + item.recordID}
                  renderItem={isLoading ? () => <SkeletonLoader variant="card" style={{ width: 280, marginRight: 12 }} /> : renderAdmittedPatient}
                  contentContainerStyle={styles.horizontalList}
                  snapToInterval={292}
                  decelerationRate="fast"
                  snapToAlignment="start"
                />
              </View>
            )}

            {/* Tab Navigation Section */}
            <View style={styles.tabSectionHeader}>
              <Text style={styles.tabSectionTitle}>Clinical Directory</Text>
            </View>
            
            <View style={styles.segmentedContainer}>
              <Animated.View style={[styles.segmentedIndicator, animatedIndicatorStyle]} />
              {['Admitted', 'Discharged', 'Deceased'].map((tab, idx) => {
                const count = filteredPatients.filter(p => {
                  const status = p.status || (p.dateOfDischarge ? 'Discharged' : 'Admitted');
                  return status.toLowerCase() === tab.toLowerCase();
                }).length;
                
                return (
                  <TouchableOpacity
                    key={tab}
                    style={styles.segmentedTab}
                    onPress={() => handleTabPress(tab, idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentedTabText, activeTab === tab && styles.segmentedTabTextActive]}>
                      {tab} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        renderItem={isLoading ? () => <SkeletonLoader variant="card" style={{ marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm }} /> : ({ item, index }) => renderAllPatient({ item, index })}
        ListEmptyComponent={
          <EmptyState 
            icon={Users}
            title="No Patient Records Found"
            description="Try searching with a different name or add a new record."
            actionLabel="Add Patient Record"
            onAction={() => navigation.navigate('AddPatient')}
          />
        }
      />

      {/* Floating Add Patient Button */}
      <Animated.View entering={ZoomIn.delay(400).duration(400)} style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <AnimatedPressable 
          style={styles.fab} 
          onPress={() => navigation.navigate('AddPatient')}
          accessibilityLabel="Add new patient"
          accessibilityRole="button"
        >
          <Plus size={24} color="#FFF" />
        </AnimatedPressable>
      </Animated.View>

      {/* Quick Action Modal (Long Press) */}
      <BottomSheet
        visible={!!quickActionPatient}
        onClose={() => setQuickActionPatient(null)}
        title={quickActionPatient?.fullName || 'Quick Actions'}
        height="40%"
      >
        <View style={{ paddingTop: theme.spacing.xs }}>
          <AnimatedPressable
            style={styles.quickActionItem}
            onPress={() => {
              const p = quickActionPatient;
              setQuickActionPatient(null);
              navigation.navigate('VitalsScreen', { patientId: p.recordID });
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Activity size={18} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.quickActionLabel}>Add Vitals</Text>
              <Text style={styles.quickActionDesc}>Record BP, HR, Temp, SpO2</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.quickActionItem}
            onPress={() => {
              const p = quickActionPatient;
              setQuickActionPatient(null);
              navigation.navigate('PatientDetail', { patient: p });
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF7ED' }]}>
              <FileText size={18} color="#F97316" />
            </View>
            <View>
              <Text style={styles.quickActionLabel}>Add Progress Note</Text>
              <Text style={styles.quickActionDesc}>Clinical, Consultant, or Nurse log</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.quickActionItem, { borderBottomWidth: 0 }]}
            onPress={() => {
              const p = quickActionPatient;
              setQuickActionPatient(null);
              navigation.navigate('PatientDetail', { patient: p });
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
              <MessageCircle size={18} color="#22C55E" />
            </View>
            <View>
              <Text style={styles.quickActionLabel}>View Detail</Text>
              <Text style={styles.quickActionDesc}>Full patient record</Text>
            </View>
          </AnimatedPressable>
        </View>
      </BottomSheet>
    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  greetingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  docName: {
    ...theme.typography.h2,
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  docAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  consultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  consultCard: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  consultIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  consultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  consultDesc: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    lineHeight: 14,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  horizontalList: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
  },
  admittedCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.lg,
    marginRight: theme.spacing.md,
    width: 280,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  patientMeta: {
    flex: 1,
  },
  admittedName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  admittedSub: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '600',
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.md,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#E0F2FE',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '600',
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#93C5FD',
    marginHorizontal: 8,
  },
  allPatientCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  allCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  allAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  allPatientMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  allName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  dateTag: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  allSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  allLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allLocationText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabSectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  tabSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: 4,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  segmentedTabActive: {
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  segmentedTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  quickActionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  quickActionSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  allDiagnosisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: theme.colors.surfaceDim,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  allDiagnosisText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  avatarFallback: {
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: theme.typography.fontFamily,
  },
  segmentedIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '32%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyCTA: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.lg,
  },
  emptyCTAText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    marginTop: theme.spacing.xl,
  },
});

export default EMRDashboard;

