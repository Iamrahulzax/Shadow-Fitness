import { useState, useEffect } from 'react';
import {
  Player,
  Rank,
  PlayerStats,
  NutritionData,
  SleepData,
  StepsData,
  Quest,
  Achievement,
  WorkoutLog,
  LootItem,
  FoodItem,
} from '../types';
import {
  INITIAL_PLAYER,
  INITIAL_NUTRITION,
  INITIAL_SLEEP,
  INITIAL_STEPS,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_WORKOUTS,
} from './initialData';
import { soundFx } from '../utils/audio';

const STORAGE_KEY = 'shadow_fitness_save_v1';

export interface LevelUpPayload {
  oldLevel: number;
  newLevel: number;
  oldRank: Rank;
  newRank: Rank;
  gainedAP: number;
}

export interface AppState {
  player: Player;
  nutrition: NutritionData;
  sleep: SleepData;
  steps: StepsData;
  quests: Quest[];
  achievements: Achievement[];
  workouts: WorkoutLog[];
  activeModal: 'levelUp' | 'dungeonClear' | 'dailyNotification' | 'editProfile' | null;
  editProfileTab?: 'identity' | 'rank' | 'avatar' | 'stats';
  lastLoot: LootItem | null;
  lastCompletedWorkout: WorkoutLog | null;
  levelUpInfo: LevelUpPayload | null;
  soundEnabled: boolean;
  reducedGlow: boolean;
}

function calculateRank(level: number): Rank {
  if (level >= 70) return 'National';
  if (level >= 50) return 'S';
  if (level >= 40) return 'A';
  if (level >= 30) return 'B';
  if (level >= 20) return 'C';
  if (level >= 10) return 'D';
  return 'E';
}

function getXpRequirement(level: number): number {
  return Math.floor(1000 * Math.pow(1.15, level - 1));
}

const POSSIBLE_LOOTS: LootItem[] = [
  {
    id: 'loot-demon-ring',
    name: 'Ring of the Monarch',
    rarity: 'Legendary',
    type: 'badge',
    description: 'A dark talisman radiating necrotic shadow mana. +10% all stat gains.',
    icon: 'Crown'
  },
  {
    id: 'loot-kasaka-fang',
    name: 'Kasaka Poison Fang',
    rarity: 'Epic',
    type: 'badge',
    description: 'Forged from the serpent king. Grants resistance to physical fatigue.',
    icon: 'Flame'
  },
  {
    id: 'loot-shadow-key',
    name: 'Gate Aegis Key',
    rarity: 'Epic',
    type: 'key',
    description: 'Absorbs the penalty of a missed workout day, preserving your Gate Streak.',
    icon: 'Key'
  },
  {
    id: 'loot-rune-beast',
    name: 'Rune of Iron Will',
    rarity: 'Rare',
    type: 'badge',
    description: 'Etched with ancient runes. Emits a vibrant violet aura around your status frame.',
    icon: 'Sparkles'
  },
  {
    id: 'loot-title-undefeated',
    name: 'The Undefeated',
    rarity: 'Legendary',
    type: 'title',
    description: 'Title unlocked: Display on your Hunter license as a National Level Candidate.',
    icon: 'ShieldCheck'
  },
  {
    id: 'loot-title-iron-fist',
    name: 'Iron Fist Monarch',
    rarity: 'Rare',
    type: 'title',
    description: 'Title unlocked: Awarded to hunters with exceptional compound volume.',
    icon: 'Zap'
  }
];

// Load persisted state or initial seed
function getInitialState(): AppState {
  if (typeof window === 'undefined') {
    return {
      player: INITIAL_PLAYER,
      nutrition: INITIAL_NUTRITION,
      sleep: INITIAL_SLEEP,
      steps: INITIAL_STEPS,
      quests: INITIAL_QUESTS,
      achievements: INITIAL_ACHIEVEMENTS,
      workouts: INITIAL_WORKOUTS,
      activeModal: 'dailyNotification',
      lastLoot: null,
      lastCompletedWorkout: null,
      levelUpInfo: null,
      soundEnabled: true,
      reducedGlow: false,
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        player: {
          ...INITIAL_PLAYER,
          ...(parsed.player || {}),
          stats: {
            ...INITIAL_PLAYER.stats,
            ...(parsed.player?.stats || {}),
          },
        },
        activeModal: 'dailyNotification', // Show daily quest notification on load
        lastLoot: null,
        levelUpInfo: null,
      };
    }
  } catch {
    // ignore parsing failure
  }

  return {
    player: INITIAL_PLAYER,
    nutrition: INITIAL_NUTRITION,
    sleep: INITIAL_SLEEP,
    steps: INITIAL_STEPS,
    quests: INITIAL_QUESTS,
    achievements: INITIAL_ACHIEVEMENTS,
    workouts: INITIAL_WORKOUTS,
    activeModal: 'dailyNotification',
    lastLoot: null,
    lastCompletedWorkout: null,
    levelUpInfo: null,
    soundEnabled: true,
    reducedGlow: false,
  };
}

let globalState: AppState = getInitialState();
const listeners = new Set<(state: AppState) => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch {
    // localStorage full or disabled
  }
  listeners.forEach((listener) => listener(globalState));
}

export const playerStoreActions = {
  getState(): AppState {
    return globalState;
  },

  closeModal() {
    globalState = {
      ...globalState,
      activeModal: null,
    };
    notify();
  },

  toggleSound() {
    const nextVal = !globalState.soundEnabled;
    soundFx.setMuted(!nextVal);
    globalState = {
      ...globalState,
      soundEnabled: nextVal,
    };
    notify();
  },

  toggleReducedGlow() {
    const nextVal = !globalState.reducedGlow;
    if (typeof document !== 'undefined') {
      if (nextVal) {
        document.body.classList.add('reduced-glow');
      } else {
        document.body.classList.remove('reduced-glow');
      }
    }
    globalState = {
      ...globalState,
      reducedGlow: nextVal,
    };
    notify();
  },

  addXP(amount: number) {
    let { level, xp, xpToNextLevel, rank, unallocatedPoints } = globalState.player;
    const oldLevel = level;
    const oldRank = rank;

    let newXp = xp + amount;
    let newLevel = level;
    let gainedAP = 0;

    while (newXp >= xpToNextLevel) {
      newXp -= xpToNextLevel;
      newLevel += 1;
      gainedAP += 3; // 3 Ability Points per level up
      xpToNextLevel = getXpRequirement(newLevel);
    }

    const newRank = calculateRank(newLevel);

    globalState = {
      ...globalState,
      player: {
        ...globalState.player,
        level: newLevel,
        rank: newRank,
        xp: newXp,
        xpToNextLevel,
        unallocatedPoints: unallocatedPoints + gainedAP,
      },
    };

    if (newLevel > oldLevel) {
      soundFx.playLevelUp();
      globalState = {
        ...globalState,
        activeModal: 'levelUp',
        levelUpInfo: {
          oldLevel,
          newLevel,
          oldRank,
          newRank,
          gainedAP,
        },
      };
    }
    notify();
  },

  allocateStat(statName: keyof PlayerStats) {
    if (globalState.player.unallocatedPoints <= 0) return;

    soundFx.playStatUp();
    globalState = {
      ...globalState,
      player: {
        ...globalState.player,
        unallocatedPoints: globalState.player.unallocatedPoints - 1,
        stats: {
          ...globalState.player.stats,
          [statName]: globalState.player.stats[statName] + 1,
        },
      },
    };
    notify();
  },

  equipTitle(newTitle: string) {
    soundFx.playClick();
    globalState = {
      ...globalState,
      player: {
        ...globalState.player,
        title: newTitle,
      },
    };
    notify();
  },

  openEditProfile(tab?: 'identity' | 'rank' | 'avatar' | 'stats' | unknown) {
    soundFx.playClick();
    const resolvedTab = (typeof tab === 'string' && ['identity', 'rank', 'avatar', 'stats'].includes(tab))
      ? (tab as 'identity' | 'rank' | 'avatar' | 'stats')
      : 'identity';
    globalState = {
      ...globalState,
      activeModal: 'editProfile',
      editProfileTab: resolvedTab,
    };
    notify();
  },

  updateAvatar(avatarUrlOrData: string) {
    soundFx.playStatUp();
    globalState = {
      ...globalState,
      player: {
        ...globalState.player,
        avatar: avatarUrlOrData,
      },
    };
    notify();
  },

  updatePlayerProfile(updates: Partial<Player>) {
    soundFx.playStatUp();

    let xpToNextLevel = updates.xpToNextLevel ?? globalState.player.xpToNextLevel;
    if (updates.level && updates.level !== globalState.player.level && updates.xpToNextLevel === undefined) {
      xpToNextLevel = getXpRequirement(updates.level);
    }

    let rank = updates.rank ?? globalState.player.rank;
    if (updates.level && updates.rank === undefined) {
      rank = calculateRank(updates.level);
    }

    globalState = {
      ...globalState,
      player: {
        ...globalState.player,
        ...updates,
        rank,
        xpToNextLevel,
        stats: updates.stats
          ? { ...globalState.player.stats, ...updates.stats }
          : globalState.player.stats,
      },
      activeModal: null,
    };
    notify();
  },

  resetPlayerProfile() {
    soundFx.playClick();
    globalState = {
      ...globalState,
      player: {
        ...INITIAL_PLAYER,
      },
      activeModal: null,
    };
    notify();
  },

  toggleQuest(questId: string) {
    const quest = globalState.quests.find((q) => q.id === questId);
    if (!quest) return;

    const willComplete = !quest.completed;
    if (willComplete) {
      soundFx.playQuestComplete();
    } else {
      soundFx.playClick();
    }

    const updatedQuests = globalState.quests.map((q) => {
      if (q.id === questId) {
        return {
          ...q,
          completed: willComplete,
          current: willComplete ? q.target : 0,
        };
      }
      return q;
    });

    globalState = {
      ...globalState,
      quests: updatedQuests,
    };

    if (willComplete) {
      // Award XP
      playerStoreActions.addXP(quest.xpReward);
      // Award Stat increment if assigned
      if (quest.statReward) {
        globalState = {
          ...globalState,
          player: {
            ...globalState.player,
            stats: {
              ...globalState.player.stats,
              [quest.statReward]: globalState.player.stats[quest.statReward] + 1,
            },
          },
        };
      }
    }
    notify();
  },

  logWorkout(workoutData: Omit<WorkoutLog, 'id' | 'date' | 'xpGained' | 'lootEarned'>) {
    // Calculate total volume and XP
    let calculatedVolume = 0;
    workoutData.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          calculatedVolume += set.reps * set.weightKg;
        }
      });
    });

    // Base XP: 200 + 1 XP per 30kg lifted
    const xpGained = Math.round(200 + calculatedVolume / 30);
    const randomLoot = POSSIBLE_LOOTS[Math.floor(Math.random() * POSSIBLE_LOOTS.length)];

    const newWorkout: WorkoutLog = {
      ...workoutData,
      id: 'w-' + Date.now(),
      date: 'Just now',
      totalVolumeKg: calculatedVolume,
      xpGained,
      lootEarned: randomLoot,
    };

    // Update STR stat based on volume milestone
    const strGain = calculatedVolume > 5000 ? 2 : 1;

    // Gate streak progress
    const newStreak = globalState.player.streakDays + 1;
    let newKeys = globalState.player.streakKeys;
    if (randomLoot.type === 'key') {
      newKeys += 1;
    }

    soundFx.playDungeonClear();

    globalState = {
      ...globalState,
      workouts: [newWorkout, ...globalState.workouts],
      lastCompletedWorkout: newWorkout,
      lastLoot: randomLoot,
      activeModal: 'dungeonClear',
      player: {
        ...globalState.player,
        streakDays: newStreak,
        streakKeys: newKeys,
        missedDayDimmed: false,
        stats: {
          ...globalState.player.stats,
          STR: globalState.player.stats.STR + strGain,
          PER: globalState.player.stats.PER + 1,
        },
      },
    };

    // Auto-credit workout quest if available
    const habitQuest = globalState.quests.find((q) => q.id === 'q-hab-2' || q.category === 'daily_habit');
    if (habitQuest && !habitQuest.completed) {
      // credit
    }

    playerStoreActions.addXP(xpGained);
    notify();
  },

  addWater(amountMl: number) {
    soundFx.playClick();
    const newTotal = globalState.nutrition.waterConsumedMl + amountMl;
    const hitGoal = newTotal >= globalState.nutrition.waterGoalMl;

    globalState = {
      ...globalState,
      nutrition: {
        ...globalState.nutrition,
        waterConsumedMl: newTotal,
      },
      player: {
        ...globalState.player,
        stats: {
          ...globalState.player.stats,
          INT: hitGoal ? globalState.player.stats.INT + 1 : globalState.player.stats.INT,
        },
      },
    };

    // Check water quest
    const waterQuest = globalState.quests.find((q) => q.id === 'q-hab-1');
    if (waterQuest && !waterQuest.completed) {
      const updatedCurrent = Math.min(newTotal, waterQuest.target);
      if (updatedCurrent >= waterQuest.target) {
        playerStoreActions.toggleQuest(waterQuest.id);
      } else {
        globalState = {
          ...globalState,
          quests: globalState.quests.map((q) =>
            q.id === waterQuest.id ? { ...q, current: updatedCurrent } : q
          ),
        };
      }
    }

    notify();
  },

  addProtein(amountGrams: number) {
    soundFx.playClick();
    const newTotal = globalState.nutrition.proteinConsumed + amountGrams;
    const hitGoal = newTotal >= globalState.nutrition.proteinGoal;

    globalState = {
      ...globalState,
      nutrition: {
        ...globalState.nutrition,
        proteinConsumed: newTotal,
      },
    };

    if (hitGoal) {
      const proteinQuest = globalState.quests.find((q) => q.id === 'q-hab-2');
      if (proteinQuest && !proteinQuest.completed) {
        playerStoreActions.toggleQuest(proteinQuest.id);
      }
    }
    notify();
  },

  addFood(item: Omit<FoodItem, 'id' | 'time'>) {
    soundFx.playClick();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newFood: FoodItem = {
      ...item,
      id: 'f-' + Date.now(),
      time: timeStr,
    };

    globalState = {
      ...globalState,
      nutrition: {
        ...globalState.nutrition,
        caloriesConsumed: globalState.nutrition.caloriesConsumed + item.calories,
        proteinConsumed: globalState.nutrition.proteinConsumed + item.protein,
        carbsConsumed: globalState.nutrition.carbsConsumed + item.carbs,
        fatConsumed: globalState.nutrition.fatConsumed + item.fat,
        foodLogs: [newFood, ...globalState.nutrition.foodLogs],
      },
    };
    notify();
  },

  logSleep(hours: number, quality: SleepData['quality']) {
    soundFx.playClick();
    const debuff = hours < 6;
    const recoveryPct = Math.min(100, Math.round((hours / 8) * 100));

    globalState = {
      ...globalState,
      sleep: {
        ...globalState.sleep,
        hours,
        quality,
        debuffActive: debuff,
        recoveryPercentage: recoveryPct,
      },
      player: {
        ...globalState.player,
        stats: {
          ...globalState.player.stats,
          VIT: debuff ? Math.max(10, globalState.player.stats.VIT - 2) : globalState.player.stats.VIT + 1,
        },
      },
    };

    const sleepQuest = globalState.quests.find((q) => q.id === 'q-hab-3');
    if (sleepQuest && !sleepQuest.completed && hours >= sleepQuest.target) {
      playerStoreActions.toggleQuest(sleepQuest.id);
    }

    notify();
  },

  addSteps(stepsToAdd: number) {
    soundFx.playClick();
    const newTotal = globalState.steps.currentSteps + stepsToAdd;
    const newDistance = Number((newTotal * 0.00075).toFixed(2));
    const newFloor = Math.min(100, Math.floor(newTotal / 600) + 1);

    globalState = {
      ...globalState,
      steps: {
        ...globalState.steps,
        currentSteps: newTotal,
        distanceKm: newDistance,
        dungeonFloor: newFloor,
      },
      player: {
        ...globalState.player,
        stats: {
          ...globalState.player.stats,
          AGI: globalState.player.stats.AGI + Math.floor(stepsToAdd / 2000),
        },
      },
    };

    // Update 10km quest
    const runQuest = globalState.quests.find((q) => q.id === 'q-sys-4');
    if (runQuest && !runQuest.completed) {
      if (newDistance >= runQuest.target) {
        playerStoreActions.toggleQuest(runQuest.id);
      } else {
        globalState = {
          ...globalState,
          quests: globalState.quests.map((q) =>
            q.id === runQuest.id ? { ...q, current: newDistance } : q
          ),
        };
      }
    }

    notify();
  },

  useStreakProtection() {
    if (globalState.player.streakKeys <= 0) return;
    soundFx.playClick();
    globalState = {
      ...globalState,
      player: {
        ...globalState.player,
        streakKeys: globalState.player.streakKeys - 1,
        streakProtected: true,
        missedDayDimmed: false,
      },
    };
    notify();
  },

  resetDemoData() {
    soundFx.playClick();
    localStorage.removeItem(STORAGE_KEY);
    globalState = {
      player: INITIAL_PLAYER,
      nutrition: INITIAL_NUTRITION,
      sleep: INITIAL_SLEEP,
      steps: INITIAL_STEPS,
      quests: INITIAL_QUESTS,
      achievements: INITIAL_ACHIEVEMENTS,
      workouts: INITIAL_WORKOUTS,
      activeModal: null,
      lastLoot: null,
      lastCompletedWorkout: null,
      levelUpInfo: null,
      soundEnabled: true,
      reducedGlow: false,
    };
    notify();
  },
};

export function usePlayerStore(): [AppState, typeof playerStoreActions] {
  const [state, setState] = useState<AppState>(globalState);

  useEffect(() => {
    const listener = (newState: AppState) => setState(newState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return [state, playerStoreActions];
}
