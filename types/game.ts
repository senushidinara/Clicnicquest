/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  roles: Role[];
  points: number;
  badges: Badge[];
  avatarConfig: AvatarConfig;
  streaks: Record<string, number>;
  currentRole: Role;
  level: number;
  experience: number;
}

export interface Role {
  id: string;
  name: string;
  department: string;
  color: string;
  icon: string;
  description: string;
  unlockLevel: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  role: string;
  department: string;
  points: number;
  deadline?: Date;
  status: 'pending' | 'active' | 'completed' | 'expired';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  requirements?: string[];
}

export interface Department {
  id: string;
  name: string;
  location: { x: number; y: number };
  color: string;
  taskQueue: Task[];
  staffAssigned: string[];
  status: 'normal' | 'busy' | 'critical' | 'completed';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
}

export interface AvatarConfig {
  skinTone: string;
  hair: string;
  outfit: string;
  accessories: string[];
  expression: 'happy' | 'focused' | 'tired' | 'excited';
}

export interface QuestProgress {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  pointsEarned: number;
  badgesEarned: Badge[];
  level: number;
  nextLevelProgress: number;
}