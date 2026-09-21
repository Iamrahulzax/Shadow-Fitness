import { PlayerStats, Rank } from './index';

export interface HunterLeaderboardEntry {
  id: string;
  name: string;
  title: string;
  rank: Rank;
  guild: string;
  hunterClass: string;
  avatar: string;
  level: number;
  xp: number;
  powerRating: number;
  workoutVolumeKg: number;
  streakDays: number;
  dungeonFloor: number;
  shadowsCount: number;
  respectCount: number;
  recentFeat: string;
  bio: string;
  bestLift: string;
  stats: PlayerStats;
  rankChange: number; // e.g. +2, 0, -1
  isPlayer?: boolean;
  division?: 'Global' | 'Weekly Raid' | 'My Bracket';
}

export type LeaderboardCategory = 'power' | 'volume' | 'streak' | 'floor' | 'shadows';

export type DivisionFilter = 'all' | 'weekly' | 'my_tier' | 'top10';

export interface LiveActivityEvent {
  id: string;
  hunterName: string;
  avatar: string;
  rank: Rank;
  message: string;
  timestamp: string;
  type: 'pr' | 'gate_clear' | 'streak' | 'level_up' | 'mana';
}
