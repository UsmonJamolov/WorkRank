import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export default function StoryListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stories } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Bugungi Storylar</Text>
      <Text style={styles.subtitle}>24 soat ichida avtomatik yo'qoladi</Text>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StoryViewer', { startIndex: index })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
            <View style={styles.info}>
              <View style={styles.row}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <Text style={styles.name}>{item.employeeName}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.stats}>
                <Text style={styles.stat}>⭐ {item.dailyPoints} ball</Text>
                <Text style={styles.stat}>👍 {item.likesCount}</Text>
                <Text style={styles.stat}>👎 {item.dislikesCount}</Text>
              </View>
            </View>
            {!item.viewed && <View style={styles.newDot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heading: { fontSize: 22, fontWeight: '800', color: Colors.text, padding: Spacing.lg, paddingBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  thumb: { width: 100, height: 100 },
  info: { flex: 1, padding: Spacing.sm, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.text },
  title: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: { fontSize: 11, color: Colors.textSecondary },
  newDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
