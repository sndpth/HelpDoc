import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { User, LogOut, ChevronRight, X, Settings, Key, Info, BookOpen, HeartHandshake, Shield, BarChart2, Building2 } from 'lucide-react-native';
import useStore from '../store/useStore';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';
import AnimatedPressable from '../components/AnimatedPressable';
import BottomSheet from '../components/BottomSheet';

const ProfileScreen = ({ navigation }) => {
  const { userProfile, logout, hospitalDetails, updateHospitalDetails } = useStore();
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'password' | 'disclaimer' | 'terms' | 'about' | 'hospital'
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [hospitalForm, setHospitalForm] = useState({ name: '', address: '', bedCapacity: '50' });

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 260],
      [0, -130],
      'clamp'
    );
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.3, 1],
      'clamp'
    );
    return {
      transform: [
        { translateY },
        { scale }
      ],
    };
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of HelpDoc?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return 'HP';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleChangePassword = () => {
    if (passwordForm.new === passwordForm.confirm && passwordForm.new.trim()) {
      Alert.alert('Success', 'Password updated successfully!');
      setActiveModal(null);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } else {
      Alert.alert('Error', 'New passwords do not match or are empty.');
    }
  };

  const MenuItem = ({ icon: Icon, title, color = theme.colors.primary, onPress }) => (
    <AnimatedPressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '12' }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <ChevronRight size={18} color={theme.colors.textSecondary} />
    </AnimatedPressable>
  );

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top Profile Blue Panel (Parallax Header) */}
      <Animated.View style={[styles.profileHeaderCard, animatedHeaderStyle]}>
        <AnimatedPressable 
          style={styles.settingsHeaderBtn} 
          onPress={() => setActiveModal('profile')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Edit profile details"
          accessibilityRole="button"
        >
          <Settings size={20} color="#FFF" />
        </AnimatedPressable>
        
        {userProfile?.avatar ? (
          <Image 
            source={{ uri: userProfile.avatar }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{getInitials(userProfile?.name)}</Text>
          </View>
        )}
        
        <Text style={styles.userName}>Dr. {userProfile?.name}</Text>
        <Text style={styles.userSpecialty}>{userProfile?.specialty}</Text>
        
        <View style={styles.badgeRow}>
          <Shield size={12} color="#10B981" />
          <Text style={styles.badgeText}>Verified Clinical Specialist</Text>
        </View>

        <Text style={styles.userHospital}>{userProfile?.hospital || 'T.U. Teaching Hospital'}</Text>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* List Menu Section */}
        <View style={styles.menuCard}>
          <MenuItem 
            icon={User} 
            title="My Profile" 
            color="#3B82F6" 
            onPress={() => setActiveModal('profile')} 
          />
          <View style={styles.divider} />
          
          <MenuItem 
            icon={Key} 
            title="Change Password" 
            color="#A855F7" 
            onPress={() => setActiveModal('password')} 
          />
          <View style={styles.divider} />

          <MenuItem 
            icon={Info} 
            title="Disclaimer and Privacy" 
            color="#06B6D4" 
            onPress={() => setActiveModal('disclaimer')} 
          />
          <View style={styles.divider} />

          <MenuItem 
            icon={BookOpen} 
            title="Terms and Conditions" 
            color="#F97316" 
            onPress={() => setActiveModal('terms')} 
          />
          <View style={styles.divider} />

          <MenuItem 
            icon={Shield} 
            title="Audit Trail" 
            color="#EF4444" 
            onPress={() => navigation.navigate('AuditLog')} 
          />
          <View style={styles.divider} />

          <MenuItem 
            icon={BarChart2} 
            title="Hospital Analytics" 
            color="#3B82F6" 
            onPress={() => navigation.navigate('Analytics')} 
          />
          <View style={styles.divider} />

          <MenuItem 
            icon={Building2} 
            title="Hospital Settings" 
            color="#059669" 
            onPress={() => {
              setHospitalForm({
                name: hospitalDetails?.name || userProfile?.hospital || 'T.U. Teaching Hospital',
                address: hospitalDetails?.address || 'Maharajgunj, Kathmandu, Nepal',
                bedCapacity: String(hospitalDetails?.bedCapacity || 50)
              });
              setActiveModal('hospital');
            }} 
          />
          <View style={styles.divider} />

          <MenuItem 
            icon={HeartHandshake} 
            title="About Us" 
            color="#22C55E" 
            onPress={() => setActiveModal('about')} 
          />
        </View>

        {/* Logout Button */}
        <AnimatedPressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out of HelpDoc</Text>
        </AnimatedPressable>

      </Animated.ScrollView>

      {/* MODALS */}

      {/* My Profile Modal */}
      <BottomSheet
        visible={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        title="Practitioner Details"
        height="50%"
      >
        <ScrollView>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <Text style={styles.fieldVal}>Dr. {userProfile?.name}</Text>
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>Specialization</Text>
            <Text style={styles.fieldVal}>{userProfile?.specialty}</Text>
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>Hospital Affiliate</Text>
            <Text style={styles.fieldVal}>{userProfile?.hospital || 'T.U. Teaching Hospital'}</Text>
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldLabel}>License Number</Text>
            <Text style={styles.fieldVal}>NMC Registry #228491</Text>
          </View>
        </ScrollView>
      </BottomSheet>

      {/* Change Password Modal */}
      <BottomSheet
        visible={activeModal === 'password'}
        onClose={() => setActiveModal(null)}
        title="Change Password"
        height="50%"
      >
        <TextInput
          style={styles.modalInput}
          placeholder="Current Password"
          secureTextEntry
          value={passwordForm.current}
          onChangeText={t => setPasswordForm(p => ({ ...p, current: t }))}
        />
        <TextInput
          style={styles.modalInput}
          placeholder="New Password"
          secureTextEntry
          value={passwordForm.new}
          onChangeText={t => setPasswordForm(p => ({ ...p, new: t }))}
        />
        <TextInput
          style={styles.modalInput}
          placeholder="Confirm New Password"
          secureTextEntry
          value={passwordForm.confirm}
          onChangeText={t => setPasswordForm(p => ({ ...p, confirm: t }))}
        />
        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleChangePassword}>
          <Text style={styles.modalSubmitText}>Update Password</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Disclaimer Modal */}
      <BottomSheet
        visible={activeModal === 'disclaimer'}
        onClose={() => setActiveModal(null)}
        title="Disclaimer & Privacy"
        height="50%"
      >
        <ScrollView>
          <Text style={styles.docText}>
            HelpDoc is an advanced Electronic Medical Record (EMR) and clinical messaging workspace. All communication inside the platform is encrypted and adheres to international HIPAA guidelines for transmitting Protected Health Information (PHI).
          </Text>
          <Text style={styles.docText}>
            Clinicians are advised to cross-examine and verify all patient measurements manually before making significant clinical decisions. HelpDoc does not replace independent clinical judgment.
          </Text>
        </ScrollView>
      </BottomSheet>

      {/* Terms Modal */}
      <BottomSheet
        visible={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms and Conditions"
        height="50%"
      >
        <ScrollView>
          <Text style={styles.docText}>
            By accessing this application, you verify that you are a certified medical practitioner with an active license.
          </Text>
          <Text style={styles.docText}>
            You agree not to share credentials, violate patient confidentiality, or capture screenshot recordings of patient PHI without standard operational consensus.
          </Text>
        </ScrollView>
      </BottomSheet>

      {/* About Us Modal */}
      <BottomSheet
        visible={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title="About HelpDoc Workspace"
        height="55%"
      >
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <View style={styles.aboutIconBox}>
            <HeartHandshake size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.aboutVersion}>HelpDoc Workspace v3.1.2</Text>
          <Text style={styles.aboutDesc}>
            HelpDoc represents the next generation of clinical messaging and electronic records management, providing high-density, real-time connectivity between physicians, nurses, and laboratory teams.
          </Text>
        </ScrollView>
      </BottomSheet>

      {/* Hospital Settings Modal */}
      <BottomSheet
        visible={activeModal === 'hospital'}
        onClose={() => setActiveModal(null)}
        title="Hospital Settings"
        height="65%"
      >
        <ScrollView>
          <Text style={styles.fieldLabel}>Hospital Name</Text>
          <TextInput
            style={styles.modalInput}
            value={hospitalForm.name}
            onChangeText={t => setHospitalForm(p => ({ ...p, name: t }))}
            placeholder="Hospital Name"
          />
          <Text style={styles.fieldLabel}>Address</Text>
          <TextInput
            style={styles.modalInput}
            value={hospitalForm.address}
            onChangeText={t => setHospitalForm(p => ({ ...p, address: t }))}
            placeholder="Address"
          />
          <Text style={styles.fieldLabel}>Total Bed Capacity</Text>
          <TextInput
            style={styles.modalInput}
            value={hospitalForm.bedCapacity}
            onChangeText={t => setHospitalForm(p => ({ ...p, bedCapacity: t }))}
            placeholder="Bed Capacity"
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.modalSubmitBtn} 
            onPress={async () => {
              const capacity = parseInt(hospitalForm.bedCapacity) || 50;
              const res = await updateHospitalDetails({
                name: hospitalForm.name,
                address: hospitalForm.address,
                bedCapacity: capacity
              });
              if (res.success) {
                Alert.alert('Success', 'Hospital details updated successfully!');
                setActiveModal(null);
              } else {
                Alert.alert('Error', 'Failed to update hospital details: ' + (res.error || 'Unknown error'));
              }
            }}
          >
            <Text style={styles.modalSubmitText}>Save Settings</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingTop: 270,
    paddingBottom: 60,
  },
  profileHeaderCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 10,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 24,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  settingsHeaderBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
    right: theme.spacing.lg,
    padding: theme.spacing.xs,
    zIndex: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFF',
    marginBottom: theme.spacing.md,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 2,
  },
  userSpecialty: {
    fontSize: 13,
    color: '#93C5FD',
    fontWeight: '600',
    marginBottom: 2,
  },
  userHospital: {
    fontSize: 11,
    color: '#E0F2FE',
    fontWeight: '500',
    marginBottom: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xxl,
    marginHorizontal: theme.spacing.lg,
    marginTop: 0,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFF',
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: theme.typography.fontFamily,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
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
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  fieldBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldVal: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  modalSubmitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: 10,
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  docText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  aboutIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  aboutVersion: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  aboutDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ProfileScreen;
