import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Plus, Users, User, Search, Check, X, MessageSquare } from 'lucide-react-native';
import useStore from '../store/useStore';
import { theme } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';

const ChatListScreen = ({ navigation }) => {
  const { 
    chatRooms, 
    chats,
    userProfile, 
    unreadCounts, 
    resetUnread, 
    fetchChats, 
    fetchPractitioners, 
    practitioners,
    createGroupChat,
    getOrCreateDirectChat
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'group'
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedPractitioners, setSelectedPractitioners] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchChats(), fetchPractitioners()]);
      setLoading(false);
    };
    loadInitialData();
  }, [fetchChats, fetchPractitioners]);

  const handleOpenRoom = (room) => {
    resetUnread(room.id);
    const displayName = getRoomDisplayName(room);
    navigation.navigate('ChatThread', { chatId: room.id, doctorName: displayName });
  };

  const getRoomDisplayName = (room) => {
    if (room.type === 'DIRECT') {
      const other = room.members.find(m => m.user.id !== userProfile?.id)?.user;
      return other?.name || 'Direct Chat';
    }
    return room.name || 'Group Discussion';
  };

  const getRoomSpecialty = (room) => {
    if (room.type === 'DIRECT') {
      const other = room.members.find(m => m.user.id !== userProfile?.id)?.user;
      return other?.specialty || 'Clinician';
    }
    if (room.type === 'PATIENT') {
      return 'Patient Discussion';
    }
    return 'Group Channel';
  };

  const getRoomAvatarChar = (room) => {
    return getRoomDisplayName(room).charAt(0);
  };

  const toggleSelectPractitioner = (id) => {
    if (selectedPractitioners.includes(id)) {
      setSelectedPractitioners(selectedPractitioners.filter(item => item !== id));
    } else {
      setSelectedPractitioners([...selectedPractitioners, id]);
    }
  };

  const handleStartDirectChat = async (practitioner) => {
    setSubmitting(true);
    const res = await getOrCreateDirectChat(practitioner.id);
    setSubmitting(false);
    if (res.success) {
      setModalVisible(false);
      setSearchQuery('');
      navigation.navigate('ChatThread', { chatId: res.room.id, doctorName: practitioner.name });
    } else {
      Alert.alert('Error', res.error || 'Failed to start chat.');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Validation Error', 'Please enter a group name.');
      return;
    }
    if (selectedPractitioners.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one team member.');
      return;
    }

    setSubmitting(true);
    const res = await createGroupChat(groupName.trim(), selectedPractitioners);
    setSubmitting(false);
    
    if (res.success) {
      setModalVisible(false);
      setGroupName('');
      setSelectedPractitioners([]);
      setSearchQuery('');
      navigation.navigate('ChatThread', { chatId: res.room.id, doctorName: groupName.trim() });
    } else {
      Alert.alert('Error', res.error || 'Failed to create group.');
    }
  };

  const filteredPractitioners = practitioners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.specialty && p.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderChatItem = ({ item }) => {
    const thread = chats[item.id] || [];
    const lastMessage = thread.length > 0 ? thread[thread.length - 1] : (item.messages && item.messages.length > 0 ? item.messages[0] : null);
    const unreadCount = unreadCounts[item.id] || 0;
    const displayName = getRoomDisplayName(item);
    const subtitle = getRoomSpecialty(item);

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => handleOpenRoom(item)}
      >
        <View style={[
          styles.avatar, 
          item.type === 'GROUP' && styles.groupAvatar,
          item.type === 'PATIENT' && styles.patientAvatar
        ]}>
          {item.type === 'GROUP' ? (
            <Users size={20} color={theme.colors.primary} />
          ) : item.type === 'PATIENT' ? (
            <MessageSquare size={20} color="#E28743" />
          ) : (
            <Text style={styles.avatarText}>{getRoomAvatarChar(item)}</Text>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.doctorName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.time}>Active</Text>
          </View>
          <Text style={styles.specialty}>{subtitle}</Text>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage ? (lastMessage.sharedRecord ? '[Patient Record]' : lastMessage.text) : 'No messages yet'}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ClinicalCanvas style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Conversations</Text>
          <Text style={styles.headerSubtitle}>T.U. Teaching Hospital</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.newContactBtn}>
            <Plus size={20} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Syncing medical channels...</Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={item => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.md }} />
              <Text style={styles.emptyTitle}>No active channels</Text>
              <Text style={styles.emptyDescription}>
                Tap the &apos;+&apos; icon to start a 1:1 chat or create a ward team discussion.
              </Text>
            </View>
          }
        />
      )}

      {/* New Conversation / Group Creation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Conversation</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setGroupName('');
                setSelectedPractitioners([]);
                setSearchQuery('');
              }}>
                <View style={styles.closeBtn}>
                  <X size={20} color={theme.colors.textPrimary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Modal Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'direct' && styles.activeTabButton]}
                onPress={() => setActiveTab('direct')}
              >
                <User size={16} color={activeTab === 'direct' ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>Direct Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'group' && styles.activeTabButton]}
                onPress={() => setActiveTab('group')}
              >
                <Users size={16} color={activeTab === 'group' ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>Group Team</Text>
              </TouchableOpacity>
            </View>

            {/* Group Name input (Only for Group tab) */}
            {activeTab === 'group' && (
              <TextInput
                style={styles.groupNameInput}
                placeholder="Enter Ward/Group Name (e.g. Pediatrics Round)"
                placeholderTextColor={theme.colors.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
              />
            )}

            {/* Search practitioner */}
            <View style={styles.searchBar}>
              <Search size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search staff by name or specialty..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Practitioner List */}
            <Text style={styles.sectionLabel}>
              {activeTab === 'group' ? 'Select Team Members' : 'Choose practitioner'}
            </Text>

            <FlatList
              data={filteredPractitioners}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
              renderItem={({ item }) => {
                const isSelected = selectedPractitioners.includes(item.id);
                return (
                  <TouchableOpacity 
                    style={styles.practitionerItem}
                    onPress={() => {
                      if (activeTab === 'group') {
                        toggleSelectPractitioner(item.id);
                      } else {
                        handleStartDirectChat(item);
                      }
                    }}
                  >
                    <View style={styles.practitionerAvatar}>
                      <Text style={styles.practitionerAvatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.practitionerInfo}>
                      <Text style={styles.practitionerName}>{item.name}</Text>
                      <Text style={styles.practitionerSpecialty}>{item.specialty || 'General Clinician'} • {item.role}</Text>
                    </View>
                    
                    {activeTab === 'group' && (
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Check size={14} color={theme.colors.surface} />}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyPractitioners}>
                  <Text style={styles.emptyText}>No practitioners found.</Text>
                </View>
              }
            />

            {/* Action Button for Group Chat */}
            {activeTab === 'group' && (
              <TouchableOpacity 
                style={[styles.submitButton, (submitting || !groupName.trim() || selectedPractitioners.length === 0) && styles.submitButtonDisabled]}
                onPress={handleCreateGroup}
                disabled={submitting || !groupName.trim() || selectedPractitioners.length === 0}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={theme.colors.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>Create Group ({selectedPractitioners.length} Selected)</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg, 
    paddingTop: theme.spacing.lg, 
    paddingBottom: theme.spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border 
  },
  headerTitle: { ...theme.typography.h1 },
  headerSubtitle: { ...theme.typography.bodySmall, color: theme.colors.primary, fontWeight: '600', marginTop: 2 },
  newContactBtn: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    ...theme.typography.bodySmall,
  },
  listContent: { paddingTop: theme.spacing.xs },
  chatItem: { 
    flexDirection: 'row', 
    padding: theme.spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.borderLight, 
    alignItems: 'center' 
  },
  avatar: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    backgroundColor: theme.colors.primaryLight, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: theme.spacing.md 
  },
  groupAvatar: {
    backgroundColor: '#E6F4EA',
  },
  patientAvatar: {
    backgroundColor: '#FFF2E6',
  },
  avatarText: { ...theme.typography.h2 },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  doctorName: { ...theme.typography.h3, flex: 1, marginRight: theme.spacing.sm },
  time: { ...theme.typography.bodySmall, fontSize: 10 },
  specialty: { ...theme.typography.label, color: theme.colors.secondary, marginBottom: 2 },
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { ...theme.typography.bodySmall, flex: 1, marginRight: theme.spacing.md },
  unreadBadge: { 
    backgroundColor: theme.colors.primary, 
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  unreadText: { color: theme.colors.surface, fontSize: 10, fontWeight: '700' },

  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  emptyDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    height: '85%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h2,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.borderLight,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  activeTabButton: {
    backgroundColor: theme.colors.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 42,
    marginBottom: theme.spacing.md,
    ...theme.typography.body,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 42,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  practitionerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  practitionerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  practitionerAvatarText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  practitionerInfo: {
    flex: 1,
  },
  practitionerName: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  practitionerSpecialty: {
    ...theme.typography.bodySmall,
    fontSize: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.surface,
    fontWeight: '700',
    ...theme.typography.body,
  },
  emptyPractitioners: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.bodySmall,
  }
});

export default ChatListScreen;
