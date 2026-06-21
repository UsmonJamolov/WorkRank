import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export default function ProfileScreen() {
  const { user, logout, attendanceStatus } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!user) return null;

  const qrLabel =
    attendanceStatus === 'working'
      ? 'QR — Ishdan ketish'
      : attendanceStatus === 'finished'
        ? 'Ish kuni yakunlangan'
        : 'QR — Ishni boshlash';
  const qrDisabled = attendanceStatus === 'finished';

  const stats = [
    { label: 'Like', value: user.likes, icon: 'thumbs-up' as const, color: Colors.success },
    { label: 'Dislike', value: user.dislikes, icon: 'thumbs-down' as const, color: Colors.danger },
    { label: 'Ishlar', value: user.postsCount, icon: 'briefcase' as const, color: Colors.primary },
    { label: 'Ball', value: user.points, icon: 'trophy' as const, color: Colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.position}>{user.position}</Text>
          <Text style={styles.department}>{user.department} bo'limi</Text>
        </View>

        <View style={styles.attendanceCard}>
          <Text style={styles.cardTitle}>Davomat</Text>
          <View style={styles.attendanceRow}>
            <View style={styles.attendanceItem}>
              <Ionicons name="log-in-outline" size={24} color={Colors.success} />
              <Text style={styles.attLabel}>Kelgan</Text>
              <Text style={styles.attValue}>{user.checkIn || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.attendanceItem}>
              <Ionicons name="log-out-outline" size={24} color={Colors.danger} />
              <Text style={styles.attLabel}>Ketgan</Text>
              <Text style={styles.attValue}>{user.checkOut || '—'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.qrBtn, qrDisabled && styles.qrBtnDisabled]}
            disabled={qrDisabled}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Ionicons name="qr-code" size={20} color="#fff" />
            <Text style={styles.qrBtnText}>{qrLabel}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Statistika</Text>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={28} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.statsBtn}>
          <Ionicons name="bar-chart" size={20} color={Colors.primary} />
          <Text style={styles.statsBtnText}>Statistika</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Chiqish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: Spacing.md },
  name: { fontSize: 24, fontWeight: '800', color: Colors.text },
  position: { fontSize: 15, color: Colors.textSecondary, marginTop: 4 },
  department: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  attendanceCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  attendanceRow: { flexDirection: 'row', alignItems: 'center' },
  attendanceItem: { flex: 1, alignItems: 'center', gap: 4 },
  attLabel: { fontSize: 12, color: Colors.textSecondary },
  attValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  divider: { width: 1, height: 50, backgroundColor: Colors.border },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    marginTop: Spacing.md,
  },
  qrBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  qrBtnDisabled: { opacity: 0.55 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 4 },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  statsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  statsBtnText: { color: Colors.primary, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
  },
  logoutText: { color: Colors.danger, fontWeight: '600' },
});
