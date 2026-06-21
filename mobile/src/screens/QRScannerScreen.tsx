import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Spacing } from '../constants/theme';

const VALID_QR_DEMO = 'WRK-SMART-2026-001';

function isValidWorkQr(data: string) {
  return data.startsWith('WRK-') || data.includes('WORKRANK');
}

export default function QRScannerScreen() {
  const navigation = useNavigation();
  const { attendanceStatus, completeEveningCheckOut } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const isCheckout = attendanceStatus === 'working';
  const hint = isCheckout ? 'Ketish uchun QR kodni skanerlang' : 'Ishxona QR kodini skanerlang';

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

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    if (!isValidWorkQr(data)) {
      Alert.alert('Xato', "Noto'g'ri QR kod", [
        { text: 'Qayta', onPress: () => setScanned(false) },
      ]);
      return;
    }

    if (!isCheckout) {
      Alert.alert('Xato', 'Avval ertalab ishga kelish QR skanerini bajaring.');
      return;
    }

    setScanned(true);
    try {
      await completeEveningCheckOut();
      Alert.alert('Muvaffaqiyat', 'Ish kuni yakunlandi. Xayr!');
    } catch {
      setScanned(false);
      Alert.alert('Xato', "Ketish qayd etilmadi. Qayta urinib ko'ring.");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="front"
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
        <Text style={styles.hint}>{hint}</Text>
        <TouchableOpacity style={styles.demoBtn} onPress={() => handleScan({ data: VALID_QR_DEMO })}>
          <Text style={styles.demoBtnText}>Demo: QR skanerlash</Text>
        </TouchableOpacity>
        <Text style={styles.qrDemo}>Demo QR: {VALID_QR_DEMO}</Text>
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
  demoBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  demoBtnText: { color: '#fff', fontWeight: '700' },
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
