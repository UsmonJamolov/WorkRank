import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Spacing } from '../constants/theme';

export default function QRScannerScreen() {
  const navigation = useNavigation();
  const { checkIn } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Kamera ruxsati kerak</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Ruxsat berish</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    if (data.startsWith('WRK-') || data.includes('WORKRANK')) {
      checkIn();
      Alert.alert('Muvaffaqiyat', 'Davomat muvaffaqiyatli qayd etildi!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Xato', 'Noto\'g\'ri QR kod', [
        { text: 'Qayta', onPress: () => setScanned(false) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.scanArea}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>
        <Text style={styles.hint}>Ishxona QR kodini skanerlang</Text>
        <Text style={styles.qrDemo}>Demo QR: WRK-SMART-2026-001</Text>
      </SafeAreaView>
    </View>
  );
}

const corner = { position: 'absolute' as const, width: 30, height: 30, borderColor: '#fff' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  scanArea: { width: 250, height: 250, position: 'relative' },
  cornerTL: { ...corner, top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTR: { ...corner, top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBL: { ...corner, bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBR: { ...corner, bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  hint: { color: '#fff', fontSize: 16, marginTop: Spacing.lg, fontWeight: '600' },
  qrDemo: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: Spacing.sm },
  message: { textAlign: 'center', color: Colors.text, fontSize: 16, margin: Spacing.lg },
  btn: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
