import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { DEMO_RATINGS } from '../constants/mockData';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';

type Period = 'daily' | 'weekly' | 'monthly';

const TABS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Kunlik' },
  { key: 'weekly', label: 'Haftalik' },
  { key: 'monthly', label: 'Oylik' },
];

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function RatingScreen() {
  const [period, setPeriod] = useState<Period>('daily');
  const data = DEMO_RATINGS[period];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Top 10 Xodim</Text>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, period === tab.key && styles.tabActive]}
            onPress={() => setPeriod(tab.key)}
          >
            <Text style={[styles.tabText, period === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => `${item.rank}-${period}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, item.rank <= 3 && styles.topCard]}>
            <View style={styles.rankBox}>
              {item.rank <= 3 ? (
                <Text style={[styles.medal, { color: MEDAL_COLORS[item.rank - 1] }]}>
                  #{item.rank}
                </Text>
              ) : (
                <Text style={styles.rank}>#{item.rank}</Text>
              )}
            </View>
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.user.fullName}</Text>
              <Text style={styles.position}>{item.user.position}</Text>
            </View>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsLabel}>Ball</Text>
              <Text style={styles.points}>{item.points}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  topCard: { borderWidth: 2, borderColor: Colors.primary },
  rankBox: { width: 36 },
  rank: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  medal: { fontSize: 18, fontWeight: '900' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: Spacing.sm },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text },
  position: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  pointsBox: { alignItems: 'center' },
  pointsLabel: { fontSize: 11, color: Colors.textSecondary },
  points: { fontSize: 20, fontWeight: '800', color: Colors.primary },
});
