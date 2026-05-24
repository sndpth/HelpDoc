import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { User, LogOut, ChevronRight, X, Settings, Key, Info, BookOpen, HeartHandshake, Shield, BarChart2, Building2 } from 'lucide-react-native';
import useStore from '../store/useStore';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';

const ProfileScreen = ({ navigation }) => {
  const { userProfile, logout, hospitalDetails, updateHospitalDetails } = useStore();
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'password' | 'disclaimer' | 'terms' | 'about' | 'hospital'
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [hospitalForm, setHospitalForm] = useState({ name: '', address: '', bedCapacity: '50' });

  const handleLogout = () => {
    logout();
  };

  const handleChangePassword = () => {
    if (passwordForm.new === passwordForm.confirm && passwordForm.new.trim()) {
      alert('Password updated successfully!');
      setActiveModal(null);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } else {
      alert('New passwords do not match or are empty.');
    }
  };

  const MenuItem = ({ icon: Icon, title, color = theme.colors.primary, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '12' }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <ChevronRight size={18} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Profile Blue Panel */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity style={styles.settingsHeaderBtn} onPress={() => setActiveModal('profile')}>
            <Settings size={20} color="#FFF" />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: userProfile?.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop' }} 
            style={styles.avatar} 
          />
          
          <Text style={styles.userName}>Dr. {userProfile?.name}</Text>
          <Text style={styles.userSpecialty}>{userProfile?.specialty}</Text>
          <Text style={styles.userHospital}>{userProfile?.hospital || 'T.U. Teaching Hospital'}</Text>

          <View style={styles.badgeRow}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.badgeText}>Verified Clinical Specialist</Text>
          </View>
        </View>

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
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out of HelpDoc</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODALS */}

      {/* My Profile Modal */}
      <Modal visible={activeModal === 'profile'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Practitioner Details</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={activeModal === 'password'} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Disclaimer Modal */}
      <Modal visible={activeModal === 'disclaimer'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disclaimer & Privacy</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.docText}>
                HelpDoc is an advanced Electronic Medical Record (EMR) and clinical messaging workspace. All communication inside the platform is encrypted and adheres to international HIPAA guidelines for transmitting Protected Health Information (PHI).
              </Text>
              <Text style={styles.docText}>
                Clinicians are advised to cross-examine and verify all patient measurements manually before making significant clinical decisions. HelpDoc does not replace independent clinical judgment.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Terms Modal */}
      <Modal visible={activeModal === 'terms'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.docText}>
                By accessing this application, you verify that you are a certified medical practitioner with an active license.
              </Text>
              <Text style={styles.docText}>
                You agree not to share credentials, violate patient confidentiality, or capture screenshot recordings of patient PHI without standard operational consensus.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Us Modal */}
      <Modal visible={activeModal === 'about'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About HelpDoc Workspace</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ alignItems: 'center' }}>
              <View style={styles.aboutIconBox}>
                <HeartHandshake size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.aboutVersion}>HelpDoc Workspace v3.1.2</Text>
              <Text style={styles.aboutDesc}>
                HelpDoc represents the next generation of clinical messaging and electronic records management, providing high-density, real-time connectivity between physicians, nurses, and laboratory teams.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hospital Settings Modal */}
      <Modal visible={activeModal === 'hospital'} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hospital Settings</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  profileHeaderCard: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    position: 'relative',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  settingsHeaderBtn: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.lg,
    padding: theme.spacing.xs,
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
    marginBottom: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    marginTop: theme.spacing.xl,
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
