import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';

export default function UploadScreen() {
  const { addPost } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Ruxsat kerak', 'Kamera yoki galereyaga ruxsat bering.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    if (!title.trim() || !imageUri) {
      Alert.alert('Xato', 'Ish nomi va rasm majburiy');
      return;
    }
    addPost(title.trim(), description.trim(), imageUri);
    setTitle('');
    setDescription('');
    setImageUri(null);
    Alert.alert('Muvaffaqiyat', 'Ish muvaffaqiyatli yuklandi!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Yangi ish yuklash</Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.uploadBox}>
            <Ionicons name="cloud-upload-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.uploadHint}>Rasm yuklash</Text>
          </View>
        )}

        <View style={styles.mediaBtns}>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={24} color={Colors.primary} />
            <Text style={styles.mediaBtnText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickImage(false)}>
            <Ionicons name="images" size={24} color={Colors.primary} />
            <Text style={styles.mediaBtnText}>Galereya</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Ish nomi</Text>
        <TextInput
          style={styles.input}
          placeholder="Masalan: 3-qavat elektr montaji"
          placeholderTextColor={Colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Ish tavsifi</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Qisqa tavsif yozing..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleUpload}>
          <Text style={styles.submitText}>Yuklash</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  heading: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: Spacing.lg },
  uploadBox: {
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  uploadHint: { marginTop: Spacing.sm, color: Colors.textSecondary, fontSize: 14 },
  preview: { width: '100%', height: 200, borderRadius: Radius.lg },
  mediaBtns: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.md },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    ...Shadow.card,
  },
  mediaBtnText: { color: Colors.primary, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.text,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
