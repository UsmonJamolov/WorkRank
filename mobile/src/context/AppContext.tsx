import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import {
  CURRENT_USER,
  DEMO_COMMENTS,
  DEMO_NOTIFICATIONS,
  DEMO_POSTS,
  DEMO_STORIES,
} from '../constants/mockData';
import { Comment, DislikeCategory, Notification, Post, Story, User } from '../types';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  posts: Post[];
  stories: Story[];
  comments: Comment[];
  notifications: Notification[];
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  likePost: (postId: string) => void;
  dislikePost: (postId: string, category: DislikeCategory, comment: string) => void;
  addComment: (postId: string, text: string) => void;
  addPost: (title: string, description: string, imageUrl: string) => void;
  markStoryViewed: (storyId: string) => void;
  markNotificationRead: (id: string) => void;
  checkIn: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [stories, setStories] = useState<Story[]>(DEMO_STORIES);
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);

  const login = (phone: string, _password: string) => {
    if (phone.length >= 9) {
      setUser(CURRENT_USER);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const likePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (p.userLiked) return p;
        return {
          ...p,
          likesCount: p.likesCount + 1,
          dislikesCount: p.userDisliked ? p.dislikesCount - 1 : p.dislikesCount,
          userLiked: true,
          userDisliked: false,
        };
      })
    );
  };

  const dislikePost = (postId: string, category: DislikeCategory, comment: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (p.userDisliked) return p;
        return {
          ...p,
          dislikesCount: p.dislikesCount + 1,
          likesCount: p.userLiked ? p.likesCount - 1 : p.likesCount,
          userDisliked: true,
          userLiked: false,
        };
      })
    );
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        title: `${user?.fullName} kamchilik qoldirdi`,
        body: `${category}: ${comment}`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addComment = (postId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      postId,
      employeeId: user?.id || '1',
      employeeName: user?.fullName || 'Azizbek',
      text,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
  };

  const addPost = (title: string, description: string, imageUrl: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      employeeId: user?.id || '1',
      employeeName: user?.fullName || 'Azizbek',
      employeeAvatar: user?.avatar || '',
      imageUrl,
      title,
      description,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setStories((prev) => [
      {
        id: `s${Date.now()}`,
        employeeId: user?.id || '1',
        employeeName: user?.fullName || 'Azizbek',
        avatar: user?.avatar || '',
        imageUrl,
        title,
        dailyPoints: 10,
        likesCount: 0,
        dislikesCount: 0,
        viewed: false,
      },
      ...prev,
    ]);
  };

  const markStoryViewed = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, viewed: true } : s))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const checkIn = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setUser((prev) => (prev ? { ...prev, checkIn: time } : prev));
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      posts,
      stories,
      comments,
      notifications,
      login,
      logout,
      likePost,
      dislikePost,
      addComment,
      addPost,
      markStoryViewed,
      markNotificationRead,
      checkIn,
    }),
    [user, posts, stories, comments, notifications]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
