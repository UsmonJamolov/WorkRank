import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post, DislikeCategory } from '../types';
import { DISLIKE_CATEGORIES } from '../types';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onDislike: (category: DislikeCategory, comment: string) => void;
  onComment: (text: string) => void;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function PostCard({ post, onLike, onDislike, onComment }: PostCardProps) {
  const [showDislike, setShowDislike] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [category, setCategory] = useState<DislikeCategory>('Sifat xatosi');
  const [dislikeComment, setDislikeComment] = useState('');
  const [commentText, setCommentText] = useState('');

  const handleDislikeSave = () => {
    if (!dislikeComment.trim()) return;
    onDislike(category, dislikeComment.trim());
    setShowDislike(false);
    setDislikeComment('');
  };

  const handleCommentSend = () => {
    if (!commentText.trim()) return;
    onComment(commentText.trim());
    setCommentText('');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.employeeAvatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{post.employeeName}</Text>
          <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      {post.description ? <Text style={styles.desc}>{post.description}</Text> : null}

      <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />

      <View style={styles.stats}>
        <Text style={styles.statText}>👍 Like: {post.likesCount}</Text>
        <Text style={styles.statText}>👎 Dislike: {post.dislikesCount}</Text>
        <Text style={styles.statText}>💬 Comment: {post.commentsCount}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, post.userLiked && styles.actionActiveLike]}
          onPress={onLike}
        >
          <Ionicons
            name={post.userLiked ? 'thumbs-up' : 'thumbs-up-outline'}
            size={20}
            color={post.userLiked ? Colors.success : Colors.textSecondary}
          />
          <Text style={[styles.actionText, post.userLiked && { color: Colors.success }]}>
            Tasdiqlayman
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, post.userDisliked && styles.actionActiveDislike]}
          onPress={() => setShowDislike(true)}
        >
          <Ionicons
            name={post.userDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
            size={20}
            color={post.userDisliked ? Colors.danger : Colors.textSecondary}
          />
          <Text style={[styles.actionText, post.userDisliked && { color: Colors.danger }]}>
            Kamchilik topdim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(true)}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionText}>Izohlar</Text>
        </TouchableOpacity>
      </View>

      {/* Dislike Modal */}
      <Modal visible={showDislike} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDislike(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Kamchilik haqida ma'lumot</Text>

            <Text style={styles.label}>Kamchilik turi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {DISLIKE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Izoh yozing...</Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              placeholder="Kamchilik tavsifini yozing..."
              placeholderTextColor={Colors.textSecondary}
              value={dislikeComment}
              onChangeText={setDislikeComment}
            />

            <TouchableOpacity
              style={[styles.saveBtn, !dislikeComment.trim() && styles.saveBtnDisabled]}
              onPress={handleDislikeSave}
              disabled={!dislikeComment.trim()}
            >
              <Text style={styles.saveBtnText}>Saqlash</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Comments Modal */}
      <Modal visible={showComments} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowComments(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Izohlar</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Izoh yozing..."
              placeholderTextColor={Colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleCommentSend}>
              <Text style={styles.saveBtnText}>Yuborish</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    ...Shadow.card,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  headerText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  time: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  image: { width: '100%', height: 220 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statText: { fontSize: 12, color: Colors.textSecondary },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  actionActiveLike: { backgroundColor: '#F0FDF4' },
  actionActiveDislike: { backgroundColor: '#FEF2F2' },
  actionText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  chips: { marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  textarea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
