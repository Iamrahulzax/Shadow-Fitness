import { Player, NutritionData, SleepData, StepsData, Quest, Achievement, WorkoutLog } from '../types';

export const INITIAL_PLAYER: Player = {
  name: 'Hunter Jin',
  title: 'Wolf Slayer',
  rank: 'D',
  level: 18,
  xp: 1420,
  xpToNextLevel: 2000,
  unallocatedPoints: 3,
  streakDays: 14,
  streakProtected: true,
  streakKeys: 2,
  missedDayDimmed: false,
  gold: 4850,
  stats: {
    STR: 48, // Driven by workout volume
    VIT: 42, // Driven by sleep recovery
    AGI: 39, // Driven by steps & cardio
    INT: 45, // Driven by hydration & nutrition
    PER: 40, // Driven by consistency & quests
  }
};

export const INITIAL_NUTRITION: NutritionData = {
  calorieGoal: 2400,
  caloriesConsumed: 1820,
  proteinGoal: 175,
  proteinConsumed: 140,
  carbsGoal: 260,
  carbsConsumed: 195,
  fatGoal: 65,
  fatConsumed: 48,
  waterGoalMl: 3000,
  waterConsumedMl: 2250,
  foodLogs: [
    { id: '1', name: 'Eggs, Oatmeal & Whey Elixir', calories: 620, protein: 48, carbs: 72, fat: 16, time: '08:30' },
    { id: '2', name: 'Grilled Chicken Beast & Jasmine Rice', calories: 750, protein: 62, carbs: 88, fat: 14, time: '13:15' },
    { id: '3', name: 'Greek Yogurt & Blueberries', calories: 450, protein: 30, carbs: 35, fat: 18, time: '17:45' }
  ]
};

export const INITIAL_SLEEP: SleepData = {
  hours: 7.5,
  targetHours: 8.0,
  quality: 'Restful',
  debuffActive: false,
  recoveryPercentage: 94
};

export const INITIAL_STEPS: StepsData = {
  currentSteps: 7850,
  targetSteps: 10000,
  dungeonFloor: 14,
  maxFloor: 100,
  distanceKm: 5.9,
  loreDiscovered: [
    "Floor 1: The awakening portal materialized in the underground depths.",
    "Floor 5: Cerberus the Gatekeeper fell before relentless leg drive.",
    "Floor 10: Ancient rune fragments whispered: 'Consistency surpasses raw talent.'"
  ]
};

export const INITIAL_QUESTS: Quest[] = [
  // Daily System Quests (Solo Leveling Iconic)
  {
    id: 'q-sys-1',
    title: '[Daily System Quest] 100 Push-ups',
    category: 'daily_system',
    description: 'Forge the upper body of a true vanguard. Failure is not an option.',
    current: 80,
    target: 100,
    unit: 'reps',
    xpReward: 150,
    statReward: 'STR',
    completed: false,
    iconName: 'Dumbbell'
  },
  {
    id: 'q-sys-2',
    title: '[Daily System Quest] 100 Sit-ups',
    category: 'daily_system',
    description: 'Reinforce the core armor against external shockwaves.',
    current: 100,
    target: 100,
    unit: 'reps',
    xpReward: 150,
    statReward: 'PER',
    completed: true,
    iconName: 'Shield'
  },
  {
    id: 'q-sys-3',
    title: '[Daily System Quest] 100 Squats',
    category: 'daily_system',
    description: 'Establish the immovable foundation of a high-rank hunter.',
    current: 100,
    target: 100,
    unit: 'reps',
    xpReward: 150,
    statReward: 'STR',
    completed: true,
    iconName: 'Zap'
  },
  {
    id: 'q-sys-4',
    title: '[Daily System Quest] 10km Run or Traversal',
    category: 'daily_system',
    description: 'Sprint through the shadow realm to hone evasive agility.',
    current: 6.8,
    target: 10,
    unit: 'km',
    xpReward: 200,
    statReward: 'AGI',
    completed: false,
    iconName: 'Footprints'
  },

  // Daily Habit Quests
  {
    id: 'q-hab-1',
    title: 'Mana Infusion (Hydrate 2,500ml)',
    category: 'daily_habit',
    description: 'Replenish bodily mana reservoirs for cell regeneration.',
    current: 2250,
    target: 2500,
    unit: 'ml',
    xpReward: 100,
    statReward: 'INT',
    completed: false,
    iconName: 'Droplets'
  },
  {
    id: 'q-hab-2',
    title: 'STR Potion Requirement (140g Protein)',
    category: 'daily_habit',
    description: 'Feed the muscle fibers with pure amino elixir.',
    current: 140,
    target: 140,
    unit: 'g',
    xpReward: 120,
    statReward: 'STR',
    completed: true,
    iconName: 'FlaskConical'
  },
  {
    id: 'q-hab-3',
    title: 'Vitality Sleep Chamber (7+ Hours)',
    category: 'daily_habit',
    description: 'Enter deep cryo-rest to prevent physical debuffs.',
    current: 7.5,
    target: 7.0,
    unit: 'hrs',
    xpReward: 120,
    statReward: 'VIT',
    completed: true,
    iconName: 'Moon'
  },

  // Weekly Raid Gate
  {
    id: 'q-raid-1',
    title: '[Weekly Raid] Conquer the Red Gate: 30,000kg Volume',
    category: 'weekly_raid',
    description: 'Team up with your shadow extraction to overcome the massive frost giants.',
    current: 22400,
    target: 30000,
    unit: 'kg',
    xpReward: 850,
    statReward: 'STR',
    completed: false,
    iconName: 'Swords'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    name: 'Bloodred Commander',
    shadowAlias: 'Igris',
    role: 'Knight Marshal',
    description: 'Lift an aggregate total of 50,000kg in volume across all dungeons.',
    requirement: '50,000kg Cumulative Strength Volume',
    unlocked: true,
    unlockedDate: '2 days ago',
    titleReward: 'The Bloodred Knight',
    badgeIcon: 'ShieldAlert'
  },
  {
    id: 'ach-2',
    name: 'Unyielding Vanguard',
    shadowAlias: 'Iron',
    role: 'Heavy Tank',
    description: 'Maintain an unbroken streak of 10 consecutive Gate Clearances.',
    requirement: '10-Day Gate Streak',
    unlocked: true,
    unlockedDate: '4 days ago',
    titleReward: 'Iron Will',
    badgeIcon: 'Shield'
  },
  {
    id: 'ach-3',
    name: 'Glacial Beast',
    shadowAlias: 'Tank',
    role: 'Ice Bear Rider',
    description: 'Traverse 70,000 steps through the freezing wilderness.',
    requirement: '70,000 Total Steps',
    unlocked: true,
    unlockedDate: '1 week ago',
    titleReward: 'Beast Slayer',
    badgeIcon: 'Flame'
  },
  {
    id: 'ach-4',
    name: 'The Ant King',
    shadowAlias: 'Beru',
    role: 'Apex Monarch',
    description: 'Attain Hunter Rank S and conquer 50 total workout raids.',
    requirement: 'Reach Rank S & 50 Raids',
    unlocked: false,
    titleReward: 'The Undefeated Monarch',
    badgeIcon: 'Crown'
  },
  {
    id: 'ach-5',
    name: 'High Orc Sovereign',
    shadowAlias: 'Tusk',
    role: 'Mystic Arch-Mage',
    description: 'Maintain 100% hydration and nutrition goals for 7 consecutive days.',
    requirement: '7 Days Optimal Nutrition',
    unlocked: false,
    titleReward: 'Hydration Monarch',
    badgeIcon: 'Sparkles'
  },
  {
    id: 'ach-6',
    name: 'Sky Sovereign',
    shadowAlias: 'Kaisel',
    role: 'Wyvern Mount',
    description: 'Reach Level 30 and unlock the National Hunter candidate trials.',
    requirement: 'Reach Level 30',
    unlocked: false,
    titleReward: 'Lord of the Skies',
    badgeIcon: 'Compass'
  }
];

export const INITIAL_WORKOUTS: WorkoutLog[] = [
  {
    id: 'w-101',
    date: 'Today',
    dungeonName: 'B-Rank Fortress: Iron Pectorals',
    gateRank: 'B',
    durationMinutes: 52,
    totalVolumeKg: 7850,
    xpGained: 460,
    lootEarned: {
      id: 'loot-1',
      name: 'Rune of Hypertrophy',
      rarity: 'Rare',
      type: 'badge',
      description: '+5% passive STR progression for 48 hours.',
      icon: 'Zap'
    },
    exercises: [
      {
        id: 'e-1',
        name: 'Barbell Bench Press',
        category: 'Chest',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 80, completed: true },
          { setNumber: 2, reps: 8, weightKg: 90, completed: true },
          { setNumber: 3, reps: 6, weightKg: 95, completed: true },
          { setNumber: 4, reps: 5, weightKg: 100, completed: true },
        ]
      },
      {
        id: 'e-2',
        name: 'Incline Dumbbell Press',
        category: 'Chest',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 32, completed: true },
          { setNumber: 2, reps: 10, weightKg: 32, completed: true },
          { setNumber: 3, reps: 8, weightKg: 34, completed: true },
        ]
      },
      {
        id: 'e-3',
        name: 'Weighted Chest Dips',
        category: 'Arms',
        sets: [
          { setNumber: 1, reps: 12, weightKg: 15, completed: true },
          { setNumber: 2, reps: 10, weightKg: 20, completed: true },
          { setNumber: 3, reps: 8, weightKg: 25, completed: true },
        ]
      }
    ]
  },
  {
    id: 'w-100',
    date: 'Yesterday',
    dungeonName: 'C-Rank Cavern: Colossal Back Raid',
    gateRank: 'C',
    durationMinutes: 58,
    totalVolumeKg: 8900,
    xpGained: 520,
    lootEarned: {
      id: 'loot-2',
      name: 'Shadow Key of Immunity',
      rarity: 'Epic',
      type: 'key',
      description: 'Protects streak from breaking if a daily gate is missed.',
      icon: 'Key'
    },
    exercises: [
      {
        id: 'e-4',
        name: 'Deadlift',
        category: 'Back',
        sets: [
          { setNumber: 1, reps: 8, weightKg: 120, completed: true },
          { setNumber: 2, reps: 6, weightKg: 140, completed: true },
          { setNumber: 3, reps: 4, weightKg: 155, completed: true },
        ]
      },
      {
        id: 'e-5',
        name: 'Weighted Pull-ups',
        category: 'Back',
        sets: [
          { setNumber: 1, reps: 8, weightKg: 10, completed: true },
          { setNumber: 2, reps: 8, weightKg: 10, completed: true },
          { setNumber: 3, reps: 6, weightKg: 15, completed: true },
        ]
      }
    ]
  }
];
