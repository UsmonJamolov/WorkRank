export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  department: string;
  position: string;
  avatar: string;
  points: number;
  likes: number;
  dislikes: number;
  postsCount: number;
  checkIn?: string;
  checkOut?: string;
}

export interface Post {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  imageUrl: string;
  title: string;
  description: string;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  createdAt: string;
  userLiked?: boolean;
  userDisliked?: boolean;
}

export interface Story {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  imageUrl: string;
  title: string;
  dailyPoints: number;
  likesCount: number;
  dislikesCount: number;
  viewed: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  employeeId: string;
  employeeName: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface RatingEntry {
  rank: number;
  user: User;
  points: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export type DislikeCategory =
  | 'Sifat xatosi'
  | 'Xavfsizlik xatosi'
  | 'Tugallanmagan ish'
  | "Noto'g'ri material"
  | 'Boshqa';

export const DISLIKE_CATEGORIES: DislikeCategory[] = [
  'Sifat xatosi',
  'Xavfsizlik xatosi',
  'Tugallanmagan ish',
  "Noto'g'ri material",
  'Boshqa',
];
