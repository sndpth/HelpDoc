import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { theme } from '../constants/theme';
import SkeletonLoader from './SkeletonLoader';

const ImageWithShimmer = ({ uri }) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri }} 
        style={styles.previewImage} 
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading && (
        <SkeletonLoader 
          variant="square" 
          style={styles.shimmerOverlay} 
        />
      )}
    </View>
  );
};

const MediaAttachment = ({ attachments, onAdd, onRemove }) => {
  const pickImage = async (useCamera = false) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert(`Permission to access ${useCamera ? 'camera' : 'gallery'} is required!`);
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });

    if (!result.canceled) {
      onAdd(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clinical Media & Attachments</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(true)}>
          <Camera size={20} color={theme.colors.primary} />
          <Text style={styles.btnText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { marginLeft: theme.spacing.sm }]} onPress={() => pickImage(false)}>
          <ImageIcon size={20} color={theme.colors.primary} />
          <Text style={styles.btnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {attachments && attachments.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
          {attachments.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <ImageWithShimmer uri={uri} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
                <X size={12} color={theme.colors.surface} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  title: {
    ...theme.typography.label,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  btnText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  previewScroll: {
    marginTop: theme.spacing.md,
  },
  imageWrapper: {
    marginRight: theme.spacing.sm,
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.borderLight,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.borderLight,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default MediaAttachment;
