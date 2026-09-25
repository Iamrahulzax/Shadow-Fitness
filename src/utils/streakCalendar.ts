import { DayGoalRecord, DayGoalStatus } from '../types';
import { formatDateKey } from '../store/initialData';

export interface MonthMetrics {
  year: number;
  month: number; // 0-indexed (0 = Jan, 8 = Sep)
  monthName: string;
  totalDaysInMonth: number;
  completedDays: number;
  partialDays: number;
  shieldedDays: number;
  restDays: number;
  missedDays: number;
  elapsedDays: number;
  clearanceRate: number; // 0 - 100
  totalVolumeKg: number;
  totalXp: number;
}

export interface CalendarDayCell {
  date: Date;
  dateKey: string; // 'YYYY-MM-DD'
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  record?: DayGoalRecord;
}

export interface StreakStats {
  totalCompletedDays: number;
  currentStreak: number;
  longestStreak: number;
  tierName: string;
  flameColor: string;
  auraTier: 'novice' | 'plasma' | 'solar' | 'transcendent';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns complete matrix of days for calendar display (typically 35 or 42 cells)
 */
export function getCalendarGrid(year: number, month: number): CalendarDayCell[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 6 = Sat

  const today = new Date();
  const todayKey = formatDateKey(today);

  const cells: CalendarDayCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const key = formatDateKey(d);
    cells.push({
      date: d,
      dateKey: key,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: key === todayKey,
      isFuture: d > today,
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const key = formatDateKey(d);
    cells.push({
      date: d,
      dateKey: key,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: key === todayKey,
      isFuture: d > today,
    });
  }

  // Next month leading days to complete full grid (multiples of 7)
  const remainingCells = 7 - (cells.length % 7);
  if (remainingCells < 7) {
    for (let day = 1; day <= remainingCells; day++) {
      const d = new Date(year, month + 1, day);
      const key = formatDateKey(d);
      cells.push({
        date: d,
        dateKey: key,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isFuture: d > today,
      });
    }
  }

  return cells;
}

/**
 * Compute monthly aggregated metrics for streak and goal clearances
 */
export function getMonthMetrics(
  year: number,
  month: number,
  dayGoals: Record<string, DayGoalRecord>
): MonthMetrics {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonthAndYear = today.getFullYear() === year && today.getMonth() === month;
  const elapsedDays = isCurrentMonthAndYear ? Math.min(totalDays, today.getDate()) : totalDays;

  let completedDays = 0;
  let partialDays = 0;
  let shieldedDays = 0;
  let restDays = 0;
  let missedDays = 0;
  let totalVolumeKg = 0;
  let totalXp = 0;

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const key = formatDateKey(d);
    const rec = dayGoals[key];

    if (rec) {
      if (rec.status === 'completed') completedDays++;
      else if (rec.status === 'partial') partialDays++;
      else if (rec.status === 'shielded') shieldedDays++;
      else if (rec.status === 'rest') restDays++;
      else if (rec.status === 'missed') missedDays++;

      totalVolumeKg += rec.totalVolumeKg || 0;
      totalXp += rec.xpEarned || 0;
    } else if (d < today) {
      missedDays++;
    }
  }

  const qualifyingClearedDays = completedDays + shieldedDays + restDays;
  const clearanceRate = elapsedDays > 0 ? Math.min(100, Math.round((qualifyingClearedDays / elapsedDays) * 100)) : 0;

  return {
    year,
    month,
    monthName: MONTH_NAMES[month],
    totalDaysInMonth: totalDays,
    completedDays,
    partialDays,
    shieldedDays,
    restDays,
    missedDays,
    elapsedDays,
    clearanceRate,
    totalVolumeKg,
    totalXp,
  };
}

/**
 * Calculate unbroken current streak, all-time total completed days, and longest streak
 */
export function calculateStreakStats(
  dayGoals: Record<string, DayGoalRecord>,
  today: Date = new Date()
): StreakStats {
  const allRecords = Object.values(dayGoals);
  const totalCompletedDays = allRecords.filter((r) => r.status === 'completed').length;

  // Calculate current active streak
  // Start from today: if today is completed/rest/shielded, count it, else if today is in-progress check yesterday
  let streak = 0;
  const checkDate = new Date(today);
  const todayKey = formatDateKey(today);
  const todayRec = dayGoals[todayKey];

  // If today is not marked completed/shielded/rest yet, start streak check from yesterday
  if (!todayRec || (todayRec.status !== 'completed' && todayRec.status !== 'shielded' && todayRec.status !== 'rest')) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Walk backwards day by day
  while (true) {
    const k = formatDateKey(checkDate);
    const rec = dayGoals[k];
    if (rec && (rec.status === 'completed' || rec.status === 'shielded' || rec.status === 'rest')) {
      // Completed or shielded/rest counts towards maintaining streak
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak in history by scanning all sorted date keys
  const sortedKeys = Object.keys(dayGoals).sort();
  let maxStreak = 0;
  let currentRun = 0;
  let lastDate: Date | null = null;

  for (const k of sortedKeys) {
    const rec = dayGoals[k];
    const [y, m, d] = k.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (rec && (rec.status === 'completed' || rec.status === 'shielded' || rec.status === 'rest')) {
      if (lastDate) {
        const diffMs = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun++;
        } else {
          currentRun = 1;
        }
      } else {
        currentRun = 1;
      }
      lastDate = currentDate;
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
    } else {
      currentRun = 0;
      lastDate = null;
    }
  }

  if (streak > maxStreak) {
    maxStreak = streak;
  }

  // Determine aura tier
  let tierName = 'Novice Gate Aura';
  let flameColor = 'text-cyan-400';
  let auraTier: StreakStats['auraTier'] = 'novice';

  if (streak >= 30) {
    tierName = 'Transcendent Void Sovereign';
    flameColor = 'text-rose-400';
    auraTier = 'transcendent';
  } else if (streak >= 14) {
    tierName = 'Sovereign Solar Flame';
    flameColor = 'text-amber-400';
    auraTier = 'solar';
  } else if (streak >= 7) {
    tierName = 'Monarch Void Plasma';
    flameColor = 'text-violet-400';
    auraTier = 'plasma';
  }

  return {
    totalCompletedDays,
    currentStreak: streak,
    longestStreak: Math.max(maxStreak, streak),
    tierName,
    flameColor,
    auraTier,
  };
}
