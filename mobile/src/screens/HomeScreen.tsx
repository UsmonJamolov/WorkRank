import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../components/Header';
import StoryBar from '../components/StoryBar';
import PostCard from '../components/PostCard';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { posts, stories, notifications, likePost, dislikePost, addComment } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        unreadCount={unreadCount}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <StoryBar
            stories={stories}
            onStoryPress={(index) => navigation.navigate('StoryViewer', { startIndex: index })}
          />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => likePost(item.id)}
            onDislike={(cat, comment) => dislikePost(item.id, cat, comment)}
            onComment={(text) => addComment(item.id, text)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 20 },
});
