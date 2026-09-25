export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'National';

export interface PlayerStats {
  STR: number; // Strength -> Workout volume/strength training
  VIT: number; // Vitality -> Sleep quality/consistency & HP
  AGI: number; // Agility -> Steps/cardio distance
  INT: number; // Intelligence -> Water intake & nutrition balance
  PER: number; // Perception/Discipline -> Streak length & daily consistency
}

export interface Player {
  name: string;
  title: string;
  rank: Rank;
  level: number;
  xp: number;
  xpToNextLevel: number;
  unallocatedPoints: number;
  streakDays: number;
  streakProtected: boolean;
  streakKeys: number;
  missedDayDimmed: boolean;
  stats: PlayerStats;
  gold: number;
  hunterId?: string;
  hunterClass?: string;
  avatar?: string;
  bio?: string;
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
  sets: ExerciseSet[];
}

export interface LootItem {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  type: 'title' | 'badge' | 'key' | 'theme';
  description: string;
  icon: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  dungeonName: string;
  gateRank: Rank;
  durationMinutes: number;
  totalVolumeKg: number;
  xpGained: number;
  exercises: WorkoutExercise[];
  notes?: string;
  lootEarned?: LootItem;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface NutritionData {
  calorieGoal: number;
  caloriesConsumed: number;
  proteinGoal: number;
  proteinConsumed: number;
  carbsGoal: number;
  carbsConsumed: number;
  fatGoal: number;
  fatConsumed: number;
  waterGoalMl: number;
  waterConsumedMl: number;
  foodLogs: FoodItem[];
}

export interface SleepData {
  hours: number;
  targetHours: number;
  quality: 'Restful' | 'Average' | 'Restless';
  debuffActive: boolean;
  recoveryPercentage: number;
}

export interface StepsData {
  currentSteps: number;
  targetSteps: number;
  dungeonFloor: number;
  maxFloor: number;
  distanceKm: number;
  loreDiscovered: string[];
}

export interface Quest {
  id: string;
  title: string;
  category: 'daily_system' | 'daily_habit' | 'weekly_raid';
  description: string;
  current: number;
  target: number;
  unit: string;
  xpReward: number;
  statReward?: keyof PlayerStats;
  completed: boolean;
  iconName: string;
}

export interface Achievement {
  id: string;
  name: string;
  shadowAlias: string;
  role: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  unlockedDate?: string;
  titleReward?: string;
  badgeIcon: string;
}

export type DayGoalStatus = 'completed' | 'partial' | 'shielded' | 'rest' | 'missed';

export interface DayGoalRecord {
  date: string; // ISO date 'YYYY-MM-DD'
  status: DayGoalStatus;
  completedGoals: string[];
  totalVolumeKg?: number;
  xpEarned?: number;
  workoutCompleted?: boolean;
  workoutName?: string;
  notes?: string;
}

