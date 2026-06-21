import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';

const VALID_QR_PREFIX = 'WRK-';
const VALID_QR_DEMO = 'WRK-SMART-2026-001';

function isValidWorkQr(data: string) {
  return data.startsWith(VALID_QR_PREFIX) || data.includes('WORKRANK');
}

export default function MorningCheckInScreen() {
  const { checkInMode, completeMorningCheckIn, resetTodayAttendance } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isFinished = checkInMode === 'finished';
  const isArrival = checkInMode === 'arrival';

  const title = isFinished
    ? 'Ish kuni yakunlandi'
    : isArrival
      ? 'Ishga keldingizmi?'
      : 'Ishdan ketayapsizmi?';

  const subtitle = isFinished
    ? "Bugungi ish vaqtingiz tugadi. Ertaga ko'rishguncha!"
    : isArrival
      ? 'QR kodni skaner qiling — ish kuni boshlanadi'
      : 'QR kodni skaner qiling — ish kuni yakunlanadi';

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned || processing || isFinished) return;

    if (!isValidWorkQr(data)) {
      Alert.alert('Xato', "Noto'g'ri QR kod. Ishxona QR kodini skaner qiling.", [
        { text: 'Qayta urinish' },
      ]);
      return;
    }

    setScanned(true);
    setProcessing(true);
    try {
      await completeMorningCheckIn();
      Alert.alert('Muvaffaqiyat', 'Ish kuni boshlandi! Davomat qayd etildi.');
    } catch {
      setScanned(false);
      Alert.alert('Xato', "Davomat saqlanmadi. Qayta urinib ko'ring.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRestart = async () => {
    setProcessing(true);
    try {
      await resetTodayAttendance();
      await completeMorningCheckIn();
      Alert.alert('Muvaffaqiyat', 'Demo: Ish kuni qayta boshlandi!');
    } catch {
      Alert.alert('Xato', "Qayta ochib bo'lmadi.");
    } finally {
      setProcessing(false);
    }
  };

  const renderScanner = () => {
    if (isFinished) {
      return (
        <View style={styles.finishedWrap}>
          <Text style={styles.finishedIcon}>✅</Text>
          <Text style={styles.finishedText}>
            Ertalab QR skaner qiling. Sinov uchun pastdagi demo tugmadan foydalaning.
          </Text>
        </View>
      );
    }

    if (!permission) {
      return (
        <View style={styles.scanPlaceholder}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.scanPlaceholder}>
          <Ionicons name="camera-outline" size={48} color={Colors.primary} />
          <Text style={styles.permissionText}>Kamera ruxsati kerak</Text>
          <Text style={styles.permissionBtn} onPress={requestPermission}>
            Ruxsat berish
          </Text>
        </View>
      );
    }

    return (
      <CameraView
        style={styles.camera}
        facing="front"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showMenu={false} showNotification={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.scanCard}>
          {renderScanner()}
          {!isFinished && (
            <>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </>
          )}
          {processing && (
            <View style={styles.processing}>
              <ActivityIndicator color="#fff" size="large" />
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            {isFinished
              ? 'Ertalab ishga kelganingizda QR skaner qiling.'
              : 'QR kodni ish joyingizdagi qurilmada skaner qiling.'}
          </Text>
        </View>

        {!isFinished ? (
          <>
            <View style={styles.card}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="time-outline" size={22} color={Colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardLabel}>Sizning ish vaqtingiz</Text>
                <Text style={styles.cardValue}>09:00 - 18:00</Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardHighlight]}>
              <View style={[styles.cardIconWrap, styles.cardIconHighlight]}>
                <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Joylashuv nazorati yoqilgan</Text>
                <Text style={styles.cardDesc}>
                  Ishga kelganingiz joylashuv orqali tasdiqlanadi.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.demoBtn} onPress={() => handleScan({ data: VALID_QR_DEMO })}>
              <Text style={styles.demoBtnText}>Demo: QR skanerlash</Text>
            </TouchableOpacity>
            <Text style={styles.demoHint}>Demo QR: {VALID_QR_DEMO}</Text>
          </>
        ) : (
          <TouchableOpacity style={styles.demoBtn} onPress={handleRestart} disabled={processing}>
            <Text style={styles.demoBtnText}>Demo: Qayta ishni boshlash</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const corner = {
  position: 'absolute' as const,
  width: 28,
  height: 28,
  borderColor: Colors.primary,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.lg,
  },
  scanCard: {
    height: 280,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    ...Shadow.card,
    position: 'relative',
  },
  camera: { flex: 1 },
  finishedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: '#F8FAFC',
  },
  finishedIcon: { fontSize: 64, marginBottom: Spacing.md },
  finishedText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  scanPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#F1F5F9',
  },
  permissionText: { color: Colors.textSecondary, fontSize: 14 },
  permissionBtn: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
    marginTop: Spacing.sm,
  },
  cornerTL: { ...corner, top: 16, left: 16, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  cornerTR: { ...corner, top: 16, right: 16, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  cornerBL: { ...corner, bottom: 16, left: 16, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  cornerBR: { ...corner, bottom: 16, right: 16, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  processing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: 4,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cardHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardIconHighlight: { backgroundColor: '#DBEAFE' },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: 13, color: Colors.textSecondary },
  cardValue: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginTop: 2 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  cardDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 17 },
  demoBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  demoBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  demoHint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
