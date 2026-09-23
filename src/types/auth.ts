import { Rank, PlayerStats } from './index';

export type HunterClassArchetype =
  | 'Shadow Monarch'
  | 'Shadow Assassin'
  | 'Iron Vanguard'
  | 'Blood Necromancer'
  | 'Storm Striker';

export interface HunterAccount {
  id: string;
  email: string;
  hunterName: string;
  hunterClass: HunterClassArchetype;
  rank: Rank;
  title: string;
  avatar: string;
  password: string; // Stored locally for authentication check
  createdAt: string;
  lastLogin: string;
  starterStats?: PlayerStats;
}

export interface AuthSessionState {
  currentUser: HunterAccount | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

export interface SignUpPayload {
  email: string;
  password: string;
  hunterName: string;
  hunterClass: HunterClassArchetype;
  title: string;
  avatar?: string;
}

export interface LoginPayload {
  emailOrHunterId: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: HunterAccount;
}
