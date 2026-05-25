import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Image, Alert, Keyboard, ScrollView } from 'react-native';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import useStore from '../store/useStore';
import EMRCard from '../components/EMRCard';
import AnimatedPressable from '../components/AnimatedPressable';
import BottomSheet from '../components/BottomSheet';
import { Send, Paperclip, X, Camera, Image as ImageIcon, ChevronLeft } from 'lucide-react-native';
import { theme, getSpringConfig } from '../constants/theme';
import ClinicalCanvas from '../components/ClinicalCanvas';
import { joinRoom, leaveRoom, sendRoomMessage } from '../services/socket';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const KeyboardAvoidingViewWrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;


const ChatScreen = ({ route, navigation }) => {
  const { chatId, doctorName } = route.params || { chatId: '1', doctorName: 'Consultation' };
  const { 
    chats, 
    fetchMessages, 
    setActiveChatRoomId, 
    patients,
    apiUrl
  } = useStore();

  const insets = useSafeAreaInsets();
  const [initialBottomInset] = useState(insets.bottom);
  const flatListRef = React.useRef(null);
  const [text, setText] = useState('');
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomImageUri, setZoomImageUri] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);

  const sendButtonScale = useSharedValue(0.8);
  const sendButtonRotate = useSharedValue(-30);
  const canSend = text.trim() || selectedImage;

  useEffect(() => {
    if (canSend) {
      sendButtonScale.value = withSpring(1, getSpringConfig({ damping: 20, stiffness: 160 }));
      sendButtonRotate.value = withSpring(0, getSpringConfig({ damping: 20, stiffness: 160 }));
    } else {
      sendButtonScale.value = withSpring(0.8, getSpringConfig({ damping: 20, stiffness: 160 }));
      sendButtonRotate.value = withSpring(-30, getSpringConfig({ damping: 20, stiffness: 160 }));
    }
  }, [canSend]);

  const animatedSendStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: sendButtonScale.value },
        { rotate: `${sendButtonRotate.value}deg` }
      ],
    };
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
    });
    
    // Android listener fallback
    const showSubscriptionAndroid = Keyboard.addListener('keyboardDidShow', () => {
      if (Platform.OS === 'android') setKeyboardVisible(true);
    });
    const hideSubscriptionAndroid = Keyboard.addListener('keyboardDidHide', () => {
      if (Platform.OS === 'android') setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      showSubscriptionAndroid.remove();
      hideSubscriptionAndroid.remove();
    };
  }, []);

  const messages = chats[chatId] || [];

  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      setActiveChatRoomId(chatId);
      await fetchMessages(chatId);
      joinRoom(chatId);
      setLoading(false);
    };

    initChat();

    return () => {
      setActiveChatRoomId(null);
      leaveRoom(chatId);
    };
  }, [chatId, fetchMessages, setActiveChatRoomId]);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('file://')) return imagePath;
    const baseUrl = apiUrl ? apiUrl.replace(/\/$/, '') : 'https://sndpth-doctorsaap-backend.hf.space';
    return `${baseUrl}${imagePath}`;
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Cooperation from the gallery is needed to attach screenshots/scans.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setShowAttachmentModal(false);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to capture patient logs/scans.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setShowAttachmentModal(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !selectedImage) return;

    setIsUploading(true);
    let imagePathOnServer = null;

    try {
      if (selectedImage) {
        const formData = new FormData();
        const filename = selectedImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
          uri: selectedImage,
          name: filename,
          type
        });

        const token = useStore.getState().token;
        const baseUrl = apiUrl ? apiUrl.replace(/\/$/, '') : 'https://sndpth-doctorsaap-backend.hf.space';

        const response = await axios.post(`${baseUrl}/api/chats/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          imagePathOnServer = response.data.fileUrl;
        } else {
          throw new Error('Upload request failed on server');
        }
      }

      sendRoomMessage(chatId, text.trim(), null, imagePathOnServer);
      setText('');
      setSelectedImage(null);
    } catch (err) {
      console.error('Failed to send message with image:', err);
      Alert.alert('Upload Error', 'Could not share attachment. Please verify your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSharePatient = (patient) => {
    sendRoomMessage(chatId, '', patient.recordID);
    setShowAttachmentModal(false);
  };

  const renderMessage = ({ item }) => {
    const isMine = item.isMine;
    
    return (
      <Animated.View 
        entering={FadeInUp.springify().mass(0.6)}
        style={[styles.messageWrapper, isMine ? styles.messageMine : styles.messageOther]}
      >
        {!isMine && <Text style={styles.senderName}>{item.sender}</Text>}
        
        {item.sharedRecord ? (
          <View style={styles.sharedRecordBubble}>
            <Text style={styles.sharedLabel}>Attached EMR Record:</Text>
            <EMRCard 
              patient={item.sharedRecord} 
              onPress={(p) => navigation.navigate('PatientDetail', { patient: p })}
              style={styles.embeddedCard}
            />
          </View>
        ) : (
          <View style={[styles.messageBubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
            {item.imageUri && (
              <TouchableOpacity 
                onPress={() => setZoomImageUri(getFullImageUrl(item.imageUri))}
                activeOpacity={0.9}
                style={styles.messageImageWrapper}
              >
                <Image 
                  source={{ uri: getFullImageUrl(item.imageUri) }} 
                  style={styles.messageImage} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {item.text ? (
              <Text style={[styles.messageText, isMine ? styles.textMine : styles.textOther]}>{item.text}</Text>
            ) : null}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <ClinicalCanvas style={styles.canvas}>
      <KeyboardAvoidingViewWrapper 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{doctorName}</Text>
            <View style={styles.statusDot} />
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Loading message history...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Selected Image Preview Area */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
              <X size={16} color="#FFF" />
            </TouchableOpacity>
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            )}
          </View>
        )}

        <View style={[
          styles.inputArea,
          {
            paddingBottom: keyboardVisible ? theme.spacing.md : Math.max(initialBottomInset, theme.spacing.md)
          }
        ]}>
          <AnimatedPressable 
            style={styles.attachBtn} 
            onPress={() => setShowAttachmentModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Add attachment"
            accessibilityRole="button"
          >
            <Paperclip size={22} color={theme.colors.primary} />
          </AnimatedPressable>
          <TextInput
            style={[styles.input, { height: Math.min(100, Math.max(40, inputHeight)) }]}
            multiline={true}
            onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
            placeholder={isUploading ? "Uploading rich media..." : "Type a clinical message..."}
            placeholderTextColor={theme.colors.textSecondary}
            value={text}
            onChangeText={(val) => {
              setText(val);
              if (val === '') setInputHeight(40);
            }}
            editable={!isUploading}
          />
          <Animated.View style={animatedSendStyle}>
            <AnimatedPressable 
              style={[styles.sendBtn, (isUploading || (!text.trim() && !selectedImage)) && styles.sendBtnDisabled]} 
              onPress={handleSend}
              disabled={isUploading || (!text.trim() && !selectedImage)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <Send size={18} color={theme.colors.surface} />
            </AnimatedPressable>
          </Animated.View>
        </View>

        {/* Attachment Options Modal */}
        <BottomSheet
          visible={showAttachmentModal}
          onClose={() => setShowAttachmentModal(false)}
          title="Add Attachment"
          height="80%"
        >
          {/* Media buttons */}
          <View style={styles.mediaButtonsRow}>
            <TouchableOpacity style={styles.mediaBtn} onPress={handleTakePhoto}>
              <View style={[styles.mediaIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                <Camera size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.mediaBtnText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaBtn} onPress={handlePickImage}>
              <View style={[styles.mediaIconWrapper, { backgroundColor: '#F0FDF4' }]}>
                <ImageIcon size={24} color="#15803D" />
              </View>
              <Text style={styles.mediaBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SHARE EMR</Text>
            <View style={styles.dividerLine} />
          </View>

          <FlatList
            data={patients}
            keyExtractor={(item) => item.recordID}
            ListHeaderComponent={<Text style={styles.emrListHeader}>Select Patient Record</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.patientShareItem} onPress={() => handleSharePatient(item)}>
                <Text style={styles.shareItemName}>{item.fullName}</Text>
                <Text style={styles.shareItemDetails}>{item.ipNumber || 'No IP'} • {item.diagnosis || 'No Diagnosis'}</Text>
              </TouchableOpacity>
            )}
          />
        </BottomSheet>

        {/* Fullscreen Lightbox Zoom Modal */}
        <Modal visible={!!zoomImageUri} transparent={true} animationType="fade">
          <View style={styles.lightboxOverlay}>
            <TouchableOpacity style={styles.lightboxCloseBtn} onPress={() => setZoomImageUri(null)}>
              <X size={28} color="#FFF" />
            </TouchableOpacity>
            {zoomImageUri && (
              <ScrollView
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.lightboxImageContainer}
              >
                <Image 
                  source={{ uri: zoomImageUri }} 
                  style={styles.lightboxImage} 
                  resizeMode="contain" 
                />
              </ScrollView>
            )}
          </View>
        </Modal>
      </KeyboardAvoidingViewWrapper>
    </ClinicalCanvas>
  );
};

const styles = StyleSheet.create({
  canvas: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
    paddingBottom: 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginLeft: theme.spacing.sm,
  },
  headerRightPlaceholder: {
    width: 32,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
    ...theme.typography.bodySmall,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  messageWrapper: {
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  messageMine: {
    alignSelf: 'flex-end',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  senderName: {
    ...theme.typography.label,
    marginBottom: 4,
    marginLeft: 4,
    color: theme.colors.primary,
  },
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    ...theme.typography.body,
  },
  textMine: {
    color: theme.colors.surface,
  },
  textOther: {
    color: theme.colors.textPrimary,
  },
  sharedRecordBubble: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderBottomRightRadius: 4,
    width: 300,
  },
  sharedLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  embeddedCard: {
    marginVertical: 0,
    marginHorizontal: 0,
    shadowOpacity: 0,
    elevation: 0,
    padding: theme.spacing.sm,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  attachBtn: {
    padding: theme.spacing.sm,
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  sendBtnDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.5,
  },
  
  // Image Preview Style
  imagePreviewContainer: {
    position: 'relative',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imagePreview: {
    width: 100,
    height: 100,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Message Image Style
  messageImageWrapper: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 150,
  },

  // Lightbox Zoom Style
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: '95%',
    height: '80%',
  },
  lightboxImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    padding: 10,
    zIndex: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    minHeight: 450,
    maxHeight: '80%',
    padding: theme.spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h2,
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.md,
  },
  mediaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  mediaBtnText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
    fontWeight: 'bold',
  },
  emrListHeader: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  patientShareItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  shareItemName: {
    ...theme.typography.h3,
    marginBottom: 2,
  },
  shareItemDetails: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

export default ChatScreen;

