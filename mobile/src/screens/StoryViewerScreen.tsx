import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors, Spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'StoryViewer'>>();
  const navigation = useNavigation();
  const { stories, markStoryViewed } = useApp();
  const [index, setIndex] = useState(route.params.startIndex);

  const story = stories[index];

  if (!story) {
    navigation.goBack();
    return null;
  }

  React.useEffect(() => {
    markStoryViewed(story.id);
  }, [story.id]);

  const goNext = () => {
    if (index < stories.length - 1) setIndex(index + 1);
    else navigation.goBack();
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: story.imageUrl }} style={styles.image} resizeMode="cover" />

      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.progressRow}>
            {stories.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  { flex: 1 },
                  i < index && styles.progressDone,
                  i === index && styles.progressActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.topRow}>
            <Image source={{ uri: story.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{story.employeeName}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.bottom}>
          <Text style={styles.title}>{story.title}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Kunlik ball</Text>
              <Text style={styles.statValue}>{story.dailyPoints}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Like</Text>
              <Text style={styles.statValue}>{story.likesCount}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Dislike</Text>
              <Text style={styles.statValue}>{story.dislikesCount}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <TouchableOpacity style={styles.tapLeft} onPress={goPrev} />
      <TouchableOpacity style={styles.tapRight} onPress={goNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { width, height, position: 'absolute' },
  gradient: { flex: 1, justifyContent: 'space-between' },
  safe: { paddingHorizontal: Spacing.md },
  progressRow: { flexDirection: 'row', gap: 4, marginTop: Spacing.sm },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  progressDone: { backgroundColor: '#fff' },
  progressActive: { backgroundColor: '#fff' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  name: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' },
  closeBtn: { padding: 4 },
  bottom: { padding: Spacing.lg, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: Spacing.md },
  stats: { flexDirection: 'row', gap: Spacing.lg },
  stat: { alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '800' },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%' },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '65%' },
});
