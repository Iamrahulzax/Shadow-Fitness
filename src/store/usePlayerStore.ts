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
  DayGoalRecord,
  DayGoalStatus,
  PushContestStats,
  PushContestResult,
} from '../types';
import {
  INITIAL_PLAYER,
  INITIAL_NUTRITION,
  INITIAL_SLEEP,
  INITIAL_STEPS,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_WORKOUTS,
  INITIAL_DAY_GOALS,
  formatDateKey,
} from './initialData';
import { soundFx } from '../utils/audio';
import { HunterAccount } from '../types/auth';
import { authService } from '../services/authService';
import { calculateStreakStats } from '../utils/streakCalendar';
import { INITIAL_CONTEST_STATS } from '../data/pushContestData';

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
  dayGoals: Record<string, DayGoalRecord>;
  pushContestStats: PushContestStats;
  activeModal: 'levelUp' | 'dungeonClear' | 'dailyNotification' | 'editProfile' | 'aiRepTracker' | 'streakCalendar' | 'pushContestArena' | null;
  aiTrackerTarget?: 'quest' | 'workout';
  activeContestRivalId?: string;
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
      dayGoals: INITIAL_DAY_GOALS,
      pushContestStats: INITIAL_CONTEST_STATS,
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
      const dayGoals = parsed.dayGoals && Object.keys(parsed.dayGoals).length > 0
        ? parsed.dayGoals
        : INITIAL_DAY_GOALS;

      return {
        ...parsed,
        dayGoals,
        pushContestStats: parsed.pushContestStats || INITIAL_CONTEST_STATS,
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
    dayGoals: INITIAL_DAY_GOALS,
    pushContestStats: INITIAL_CONTEST_STATS,
    activeModal: 'dailyNotification',
    lastLoot: null,
    lastCompletedWorkout: null,
    levelUpInfo: null,
    soundEnabled: true,
    reducedGlow: false,
  };
}


export function syncTodayGoalRecord(state: AppState): Record<string, DayGoalRecord> {
  const todayKey = formatDateKey(new Date());
  const existing = state.dayGoals ? state.dayGoals[todayKey] : undefined;

  const completedQuests = (state.quests || []).filter((q) => q.completed).map((q) => q.title);
  const todaysWorkouts = (state.workouts || []).filter((w) => w.date === 'Today' || w.date === 'Just now');
  const totalVolume = todaysWorkouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
  const workoutDone = todaysWorkouts.length > 0;
  const workoutName = todaysWorkouts[0]?.dungeonName;

  const habitGoals: string[] = [];
  if (state.nutrition?.waterConsumedMl >= 2000) habitGoals.push('Hydration Mandate (2,000ml+)');
  if (state.nutrition?.proteinConsumed >= 120) habitGoals.push('Protein Elixir (120g+)');
  if (state.sleep?.hours >= 7) habitGoals.push('Vitality Sleep Chamber (7h+)');

  const allCompletedGoals = Array.from(new Set([
    ...completedQuests,
    ...(workoutDone && workoutName ? [workoutName] : []),
    ...habitGoals,
    ...(existing?.completedGoals || []),
  ]));

  let status: DayGoalStatus = existing?.status || 'partial';
  if (allCompletedGoals.length >= 3 || workoutDone) {
    status = 'completed';
  } else if (allCompletedGoals.length > 0) {
    status = existing?.status === 'completed' ? 'completed' : 'partial';
  }

  const updatedTodayRecord: DayGoalRecord = {
    date: todayKey,
    status,
    completedGoals: allCompletedGoals,
    totalVolumeKg: Math.max(totalVolume, existing?.totalVolumeKg || 0),
    xpEarned: (existing?.xpEarned || 0) + (todaysWorkouts[0]?.xpGained || 0),
    workoutCompleted: workoutDone || (existing?.workoutCompleted ?? false),
    workoutName: workoutName || existing?.workoutName,
    notes: existing?.notes || (workoutDone ? `Cleared dungeon raid: ${workoutName}` : 'Daily system mandates in progress.'),
  };

  return {
    ...(state.dayGoals || {}),
    [todayKey]: updatedTodayRecord,
  };
}


let globalState: AppState = getInitialState();
const listeners = new Set<(state: AppState) => void>();

function checkAchievements(state: AppState): AppState {
  let changed = false;
  const updatedAchievements = state.achievements.map((ach) => {
    if (ach.unlocked) return ach;
    let shouldUnlock = false;

    if (ach.id === 'ach-1') {
      const totalVolume = state.workouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
      if (totalVolume >= 50000) shouldUnlock = true;
    }
    if (ach.id === 'ach-2' && state.player.streakDays >= 10) {
      shouldUnlock = true;
    }
    if (ach.id === 'ach-3' && state.steps.currentSteps >= 70000) {
      shouldUnlock = true;
    }
    if (
      ach.id === 'ach-4' &&
      (state.player.rank === 'S' || state.player.rank === 'National') &&
      state.workouts.length >= 50
    ) {
      shouldUnlock = true;
    }
    if (ach.id === 'ach-6' && state.player.level >= 30) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      changed = true;
      return {
        ...ach,
        unlocked: true,
        unlockedDate: 'Just now',
      };
    }
    return ach;
  });

  return changed ? { ...state, achievements: updatedAchievements } : state;
}

function notify() {
  globalState = checkAchievements(globalState);
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

    if (globalState.player.hunterId) {
      authService.updateHunterAccount({
        id: globalState.player.hunterId,
        hunterName: updates.name ?? globalState.player.name,
        title: updates.title ?? globalState.player.title,
        rank,
        avatar: updates.avatar ?? globalState.player.avatar,
      });
    }

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
    const updatedGoals = syncTodayGoalRecord(globalState);
    globalState = {
      ...globalState,
      dayGoals: updatedGoals,
    };
    notify();
  },


  openAIRepTracker(target: 'quest' | 'workout' = 'quest') {
    soundFx.playClick();
    globalState = {
      ...globalState,
      activeModal: 'aiRepTracker',
      aiTrackerTarget: target,
    };
    notify();
  },

  commitAIReps(reps: number, target: 'quest' | 'workout' = 'quest') {
    if (reps <= 0) {
      playerStoreActions.closeModal();
      return;
    }

    soundFx.playStatUp();

    if (target === 'quest') {
      const pushupQuest = globalState.quests.find((q) => q.id === 'q-sys-1');
      if (pushupQuest) {
        const nextCurrent = Math.min(pushupQuest.target, pushupQuest.current + reps);
        const willComplete = nextCurrent >= pushupQuest.target && !pushupQuest.completed;

        globalState = {
          ...globalState,
          activeModal: null,
          quests: globalState.quests.map((q) =>
            q.id === pushupQuest.id
              ? {
                  ...q,
                  current: nextCurrent,
                  completed: willComplete ? true : q.completed,
                }
              : q
          ),
          player: {
            ...globalState.player,
            stats: {
              ...globalState.player.stats,
              STR: globalState.player.stats.STR + Math.max(1, Math.floor(reps / 20)),
            },
          },
        };

        if (willComplete) {
          soundFx.playQuestComplete();
          playerStoreActions.addXP(pushupQuest.xpReward);
        } else {
          playerStoreActions.addXP(Math.round(reps * 1.5));
        }
      } else {
        playerStoreActions.closeModal();
      }
    } else {
      const estimatedVolume = reps * 45; // 45kg equivalent press
      const xpGained = Math.round(150 + estimatedVolume / 40);

      const aiWorkout: WorkoutLog = {
        id: 'w-' + Date.now(),
        date: 'Just now',
        dungeonName: 'Solo Trial: AI Push-Up Crucible',
        gateRank: reps >= 50 ? 'A' : reps >= 30 ? 'B' : 'C',
        durationMinutes: Math.max(5, Math.round(reps * 0.1)),
        totalVolumeKg: estimatedVolume,
        xpGained,
        exercises: [
          {
            id: 'ex-ai-pushup',
            name: 'AI-Verified Push-ups',
            category: 'Chest',
            sets: [
              {
                setNumber: 1,
                reps,
                weightKg: 45,
                completed: true,
              },
            ],
          },
        ],
      };

      soundFx.playDungeonClear();

      globalState = {
        ...globalState,
        activeModal: null,
        workouts: [aiWorkout, ...globalState.workouts],
        player: {
          ...globalState.player,
          stats: {
            ...globalState.player.stats,
            STR: globalState.player.stats.STR + 1,
            PER: globalState.player.stats.PER + 1,
          },
        },
      };

      playerStoreActions.addXP(xpGained);
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

    // Auto-credit weekly raid quest if available
    const raidQuest = globalState.quests.find((q) => q.category === 'weekly_raid');
    if (raidQuest && !raidQuest.completed && calculatedVolume > 0) {
      const updatedVolume = Math.min(raidQuest.target, raidQuest.current + calculatedVolume);
      const willCompleteRaid = updatedVolume >= raidQuest.target;
      globalState = {
        ...globalState,
        quests: globalState.quests.map((q) =>
          q.id === raidQuest.id
            ? {
                ...q,
                current: updatedVolume,
                completed: willCompleteRaid ? true : q.completed,
              }
            : q
        ),
      };
      if (willCompleteRaid) {
        soundFx.playQuestComplete();
        playerStoreActions.addXP(raidQuest.xpReward);
        if (raidQuest.statReward) {
          globalState = {
            ...globalState,
            player: {
              ...globalState.player,
              stats: {
                ...globalState.player.stats,
                [raidQuest.statReward]: globalState.player.stats[raidQuest.statReward] + 1,
              },
            },
          };
        }
      }
    }

    playerStoreActions.addXP(xpGained);
    const updatedGoals = syncTodayGoalRecord(globalState);
    globalState = {
      ...globalState,
      dayGoals: updatedGoals,
    };
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

    const proteinQuest = globalState.quests.find((q) => q.id === 'q-hab-2');
    if (proteinQuest && !proteinQuest.completed) {
      const updatedCurrent = Math.min(newTotal, proteinQuest.target);
      if (updatedCurrent >= proteinQuest.target || hitGoal) {
        playerStoreActions.toggleQuest(proteinQuest.id);
      } else {
        globalState = {
          ...globalState,
          quests: globalState.quests.map((q) =>
            q.id === proteinQuest.id ? { ...q, current: updatedCurrent } : q
          ),
        };
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

    const newProtein = globalState.nutrition.proteinConsumed + item.protein;

    globalState = {
      ...globalState,
      nutrition: {
        ...globalState.nutrition,
        caloriesConsumed: globalState.nutrition.caloriesConsumed + item.calories,
        proteinConsumed: newProtein,
        carbsConsumed: globalState.nutrition.carbsConsumed + item.carbs,
        fatConsumed: globalState.nutrition.fatConsumed + item.fat,
        foodLogs: [newFood, ...globalState.nutrition.foodLogs],
      },
    };

    const proteinQuest = globalState.quests.find((q) => q.id === 'q-hab-2');
    if (proteinQuest && !proteinQuest.completed) {
      const updatedCurrent = Math.min(newProtein, proteinQuest.target);
      if (updatedCurrent >= proteinQuest.target || newProtein >= globalState.nutrition.proteinGoal) {
        playerStoreActions.toggleQuest(proteinQuest.id);
      } else {
        globalState = {
          ...globalState,
          quests: globalState.quests.map((q) =>
            q.id === proteinQuest.id ? { ...q, current: updatedCurrent } : q
          ),
        };
      }
    }

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
    if (sleepQuest) {
      if (!sleepQuest.completed && hours >= sleepQuest.target) {
        playerStoreActions.toggleQuest(sleepQuest.id);
      } else if (!sleepQuest.completed) {
        globalState = {
          ...globalState,
          quests: globalState.quests.map((q) =>
            q.id === sleepQuest.id ? { ...q, current: hours } : q
          ),
        };
      }
    }

    notify();
  },

  addSteps(stepsToAdd: number) {
    soundFx.playClick();
    const oldTotal = globalState.steps.currentSteps;
    const newTotal = oldTotal + stepsToAdd;
    const newDistance = Number((newTotal * 0.00075).toFixed(2));
    const newFloor = Math.min(100, Math.floor(newTotal / 600) + 1);
    const agiGain = Math.floor(newTotal / 2000) - Math.floor(oldTotal / 2000);

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
          AGI: agiGain > 0 ? globalState.player.stats.AGI + agiGain : globalState.player.stats.AGI,
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

  openStreakCalendar() {
    soundFx.playClick();
    globalState = {
      ...globalState,
      activeModal: 'streakCalendar',
    };
    notify();
  },

  toggleDayGoal(dateKey: string, targetStatus?: DayGoalStatus) {
    soundFx.playQuestComplete();
    const existing = (globalState.dayGoals || {})[dateKey];
    let nextStatus: DayGoalStatus = targetStatus || 'completed';

    if (!targetStatus) {
      if (!existing || existing.status === 'missed') {
        nextStatus = 'completed';
      } else if (existing.status === 'completed') {
        nextStatus = 'rest';
      } else if (existing.status === 'rest') {
        nextStatus = 'missed';
      } else {
        nextStatus = 'completed';
      }
    }

    const updatedRecord: DayGoalRecord = {
      date: dateKey,
      status: nextStatus,
      completedGoals: existing?.completedGoals && existing.completedGoals.length > 0
        ? existing.completedGoals
        : nextStatus === 'completed'
        ? ['Daily System Mandates Fulfilled', '100s Routine']
        : nextStatus === 'rest'
        ? ['Active Gate Recovery']
        : [],
      totalVolumeKg: existing?.totalVolumeKg ?? (nextStatus === 'completed' ? 5500 : 0),
      xpEarned: existing?.xpEarned ?? (nextStatus === 'completed' ? 350 : 0),
      workoutCompleted: existing?.workoutCompleted ?? (nextStatus === 'completed'),
      workoutName: existing?.workoutName ?? (nextStatus === 'completed' ? 'Daily Gate Clearance' : undefined),
      notes: existing?.notes || (nextStatus === 'completed' ? 'Goal verified and conquered.' : nextStatus === 'rest' ? 'Recovery chamber cycle.' : 'Gate incomplete.'),
    };

    const newDayGoals = {
      ...(globalState.dayGoals || {}),
      [dateKey]: updatedRecord,
    };

    const stats = calculateStreakStats(newDayGoals);

    globalState = {
      ...globalState,
      dayGoals: newDayGoals,
      player: {
        ...globalState.player,
        streakDays: stats.currentStreak,
      },
    };
    notify();
  },

  updateDayGoal(record: DayGoalRecord) {
    soundFx.playClick();
    const newDayGoals = {
      ...(globalState.dayGoals || {}),
      [record.date]: record,
    };
    const stats = calculateStreakStats(newDayGoals);
    globalState = {
      ...globalState,
      dayGoals: newDayGoals,
      player: {
        ...globalState.player,
        streakDays: stats.currentStreak,
      },
    };
    notify();
  },

  shieldDayWithKey(dateKey: string) {
    if (globalState.player.streakKeys <= 0) return;
    soundFx.playStatUp();
    const existing = (globalState.dayGoals || {})[dateKey];
    const updatedRecord: DayGoalRecord = {
      date: dateKey,
      status: 'shielded',
      completedGoals: ['Aegis Key Shield Used'],
      totalVolumeKg: existing?.totalVolumeKg || 0,
      xpEarned: existing?.xpEarned || 0,
      workoutCompleted: existing?.workoutCompleted || false,
      workoutName: existing?.workoutName,
      notes: 'Missed gate shielded by Hunter Aegis Key. Streak protected.',
    };

    const newDayGoals = {
      ...(globalState.dayGoals || {}),
      [dateKey]: updatedRecord,
    };

    const stats = calculateStreakStats(newDayGoals);

    globalState = {
      ...globalState,
      dayGoals: newDayGoals,
      player: {
        ...globalState.player,
        streakKeys: Math.max(0, globalState.player.streakKeys - 1),
        streakDays: stats.currentStreak,
        streakProtected: true,
      },
    };
    notify();
  },


  openPushContest(rivalId?: string) {
    soundFx.playClick();
    globalState = {
      ...globalState,
      activeModal: 'pushContestArena',
      activeContestRivalId: rivalId,
    };
    notify();
  },

  recordPushContestMatch(result: PushContestResult) {
    const isWin = result.isWin;
    const currentStats = globalState.pushContestStats || INITIAL_CONTEST_STATS;

    const newWins = isWin ? currentStats.wins + 1 : currentStats.wins;
    const newLosses = isWin ? currentStats.losses : currentStats.losses + 1;
    const newStreak = isWin ? currentStats.currentWinStreak + 1 : 0;
    const newTotalReps = currentStats.totalContestReps + result.playerReps;
    const newHighest = Math.max(currentStats.highestRepScore, result.playerReps);
    const updatedMatches = [result, ...(currentStats.recentMatches || []).slice(0, 19)];

    if (isWin) {
      soundFx.playDungeonClear();
      playerStoreActions.addXP(result.xpEarned);
    } else {
      soundFx.playClick();
      if (result.xpEarned > 0) {
        playerStoreActions.addXP(result.xpEarned);
      }
    }

    // Auto-credit reps to daily pushup quest (q-sys-1)
    const pushupQuest = globalState.quests.find((q) => q.id === 'q-sys-1');
    let updatedQuests = globalState.quests;
    if (pushupQuest && result.playerReps > 0) {
      const nextCurrent = Math.min(pushupQuest.target, pushupQuest.current + result.playerReps);
      const willComplete = nextCurrent >= pushupQuest.target;
      updatedQuests = globalState.quests.map((q) =>
        q.id === 'q-sys-1' ? { ...q, current: nextCurrent, completed: willComplete || q.completed } : q
      );
    }

    globalState = {
      ...globalState,
      quests: updatedQuests,
      pushContestStats: {
        wins: newWins,
        losses: newLosses,
        totalContestReps: newTotalReps,
        highestRepScore: newHighest,
        currentWinStreak: newStreak,
        recentMatches: updatedMatches,
      },
      player: {
        ...globalState.player,
        gold: globalState.player.gold + result.goldEarned,
        stats: {
          ...globalState.player.stats,
          STR: isWin ? globalState.player.stats.STR + 1 : globalState.player.stats.STR,
        },
      },
    };

    const updatedGoals = syncTodayGoalRecord(globalState);
    globalState = {
      ...globalState,
      dayGoals: updatedGoals,
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
      dayGoals: INITIAL_DAY_GOALS,
      pushContestStats: INITIAL_CONTEST_STATS,
      activeModal: null,
      lastLoot: null,
      lastCompletedWorkout: null,
      levelUpInfo: null,
      soundEnabled: true,
      reducedGlow: false,
    };


    notify();
  },

  syncWithHunterAccount(hunter: HunterAccount) {
    const isSameHunter = globalState.player.hunterId === hunter.id;
    globalState = {
      ...globalState,
      player: {
        ...globalState.player,
        name: hunter.hunterName,
        title: isSameHunter ? (globalState.player.title || hunter.title) : hunter.title,
        rank: isSameHunter ? (globalState.player.rank || hunter.rank) : hunter.rank,
        hunterClass: hunter.hunterClass,
        hunterId: hunter.id,
        avatar: isSameHunter ? (globalState.player.avatar || hunter.avatar) : hunter.avatar,
        stats: isSameHunter && globalState.player.stats
          ? globalState.player.stats
          : (hunter.starterStats || globalState.player.stats),
      },
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
