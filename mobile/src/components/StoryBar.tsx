import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Story } from '../types';
import { Colors, Spacing } from '../constants/theme';

interface StoryBarProps {
  stories: Story[];
  onStoryPress: (index: number) => void;
}

export default function StoryBar({ stories, onStoryPress }: StoryBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {stories.map((story, index) => (
        <TouchableOpacity
          key={story.id}
          style={styles.item}
          onPress={() => onStoryPress(index)}
        >
          <View style={[styles.ring, !story.viewed && styles.ringActive]}>
            <Image source={{ uri: story.avatar }} style={styles.avatar} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {story.employeeName.split(' ')[0]}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={styles.item}>
        <View style={styles.moreRing}>
          <Text style={styles.moreText}>+{Math.max(stories.length, 20)}</Text>
        </View>
        <Text style={styles.name}>Ko'proq</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  ring: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringActive: {
    borderColor: Colors.storyRing,
    borderWidth: 3,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  moreRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
});
