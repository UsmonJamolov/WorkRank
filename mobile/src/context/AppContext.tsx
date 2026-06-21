import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CURRENT_USER,
  DEMO_COMMENTS,
  DEMO_NOTIFICATIONS,
  DEMO_POSTS,
  DEMO_STORIES,
} from '../constants/mockData';
import { Comment, DislikeCategory, Notification, Post, Story, User } from '../types';

const CHECKIN_STORAGE_KEY = 'workrank_morning_checkin';

export type AttendanceStatus = 'none' | 'working' | 'finished';
export type CheckInMode = 'arrival' | 'departure' | 'finished';

interface CheckInRecord {
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string | null;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  attendanceStatus: AttendanceStatus;
  checkInMode: CheckInMode;
  isBootstrapping: boolean;
  posts: Post[];
  stories: Story[];
  comments: Comment[];
  notifications: Notification[];
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeMorningCheckIn: () => Promise<void>;
  completeEveningCheckOut: () => Promise<void>;
  resetTodayAttendance: () => Promise<void>;
  likePost: (postId: string) => void;
  dislikePost: (postId: string, category: DislikeCategory, comment: string) => void;
  addComment: (postId: string, text: string) => void;
  addPost: (title: string, description: string, imageUrl: string) => void;
  markStoryViewed: (storyId: string) => void;
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function statusFromRecord(record: CheckInRecord | null): AttendanceStatus {
  if (!record) return 'none';
  if (record.checkOut) return 'finished';
  if (record.checkIn) return 'working';
  return 'none';
}

async function readCheckIn(userId: string): Promise<CheckInRecord | null> {
  const raw = await AsyncStorage.getItem(CHECKIN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as CheckInRecord & { time?: string };
    if (record.userId !== userId || record.date !== todayKey()) return null;
    if (!record.checkIn && record.time) {
      record.checkIn = record.time;
    }
    return record;
  } catch {
    return null;
  }
}

function applyRecordToUser(user: User, record: CheckInRecord | null): User {
  if (!record) return user;
  return {
    ...user,
    checkIn: record.checkIn,
    checkOut: record.checkOut || undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('none');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [stories, setStories] = useState<Story[]>(DEMO_STORIES);
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);

  const checkInMode: CheckInMode =
    attendanceStatus === 'finished' ? 'finished' : attendanceStatus === 'working' ? 'departure' : 'arrival';

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('workrank_session_user');
      if (raw) {
        try {
          const savedUser = JSON.parse(raw) as User;
          const checkIn = await readCheckIn(savedUser.id);
          setAttendanceStatus(statusFromRecord(checkIn));
          setUser(applyRecordToUser(savedUser, checkIn));
        } catch {
          await AsyncStorage.removeItem('workrank_session_user');
        }
      }
      setIsBootstrapping(false);
    })();
  }, []);

  const login = async (phone: string, _password: string) => {
    if (phone.length < 9) return false;
    const checkIn = await readCheckIn(CURRENT_USER.id);
    const status = statusFromRecord(checkIn);
    setAttendanceStatus(status);
    setUser(applyRecordToUser(CURRENT_USER, checkIn));
    await AsyncStorage.setItem('workrank_session_user', JSON.stringify(CURRENT_USER));
    return true;
  };

  const logout = async () => {
    setUser(null);
    setAttendanceStatus('none');
    await AsyncStorage.removeItem('workrank_session_user');
  };

  const completeMorningCheckIn = async () => {
    if (!user) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const record: CheckInRecord = { userId: user.id, date: todayKey(), checkIn: time, checkOut: null };
    await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(record));
    setUser((prev) => (prev ? { ...prev, checkIn: time, checkOut: undefined } : prev));
    setAttendanceStatus('working');
  };

  const completeEveningCheckOut = async () => {
    if (!user) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const existing = (await readCheckIn(user.id)) || {
      userId: user.id,
      date: todayKey(),
      checkIn: user.checkIn || '—',
    };
    const record: CheckInRecord = { ...existing, checkOut: time };
    await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(record));
    setUser((prev) => (prev ? { ...prev, checkOut: time } : prev));
    setAttendanceStatus('finished');
  };

  const resetTodayAttendance = async () => {
    await AsyncStorage.removeItem(CHECKIN_STORAGE_KEY);
    setAttendanceStatus('none');
    setUser((prev) => (prev ? { ...prev, checkIn: undefined, checkOut: undefined } : prev));
  };

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

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      attendanceStatus,
      checkInMode,
      isBootstrapping,
      posts,
      stories,
      comments,
      notifications,
      login,
      logout,
      completeMorningCheckIn,
      completeEveningCheckOut,
      resetTodayAttendance,
      likePost,
      dislikePost,
      addComment,
      addPost,
      markStoryViewed,
      markNotificationRead,
    }),
    [user, attendanceStatus, checkInMode, isBootstrapping, posts, stories, comments, notifications]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
