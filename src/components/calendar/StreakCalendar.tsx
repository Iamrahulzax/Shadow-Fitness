import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Shield,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Calendar as CalendarIcon,
  Award,
  Zap,
  Dumbbell,
  Droplets,
  Moon,
  Clock,
  TrendingUp,
  AlertCircle,
  Key,
  RotateCcw,
  Edit2,
  Check,
  X,
  Target,
  Trophy,
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatDateKey } from '../../store/initialData';
import {
  getCalendarGrid,
  getMonthMetrics,
  calculateStreakStats,
  CalendarDayCell,
} from '../../utils/streakCalendar';
import { DayGoalRecord, DayGoalStatus } from '../../types';
import { GlassCard } from '../common/GlassCard';

interface StreakCalendarProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ onClose, isModal = false }) => {
  const [state, actions] = usePlayerStore();
  const { dayGoals = {}, player } = state;

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'shielded' | 'missed'>('all');
  const [activeTab, setActiveTab] = useState<'grid' | 'milestones' | 'breakdown'>('grid');

  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Calendar cells & metrics
  const gridCells = useMemo(
    () => getCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const monthMetrics = useMemo(
    () => getMonthMetrics(currentYear, currentMonth, dayGoals),
    [currentYear, currentMonth, dayGoals]
  );

  const streakStats = useMemo(
    () => calculateStreakStats(dayGoals, today),
    [dayGoals, today]
  );

  // Selected Day Record
  const selectedRecord: DayGoalRecord | undefined = dayGoals[selectedDateKey];
  const isSelectedToday = selectedDateKey === todayKey;

  // Selected date formatted
  const selectedDateObj = useMemo(() => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateKey]);

  const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Navigate month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateKey(todayKey);
  };

  // Day click
  const handleSelectDay = (cell: CalendarDayCell) => {
    setSelectedDateKey(cell.dateKey);
    setEditingNote(false);
    if (cell.record?.notes) {
      setNoteText(cell.record.notes);
    } else {
      setNoteText('');
    }
  };

  // Toggle goal status for selected day
  const handleToggleCurrentDayGoal = () => {
    actions.toggleDayGoal(selectedDateKey);
  };

  // Shield current day with Aegis key
  const handleShieldCurrentDay = () => {
    actions.shieldDayWithKey(selectedDateKey);
  };

  // Save note
  const handleSaveNote = () => {
    const existing = dayGoals[selectedDateKey] || {
      date: selectedDateKey,
      status: 'partial' as DayGoalStatus,
      completedGoals: ['Field notes added'],
      totalVolumeKg: 0,
      xpEarned: 0,
    };
    actions.updateDayGoal({
      ...existing,
      notes: noteText.trim(),
    });
    setEditingNote(false);
  };

  // Milestones definition
  const milestones = [
    {
      days: 3,
      name: 'Awakened Spark',
      tier: 'Rank E Vanguard',
      description: 'Clear 3 consecutive daily gates.',
      reward: '+250 Gold • Spark Badge',
      icon: Zap,
      color: 'cyan',
    },
    {
      days: 7,
      name: 'Monarch Void Plasma',
      tier: 'Rank C Knight',
      description: '7-day unbroken gate clearance cadence.',
      reward: '+750 Gold • Violet Aura Effect',
      icon: Flame,
      color: 'violet',
    },
    {
      days: 14,
      name: 'Sovereign Solar Flame',
      tier: 'Rank A Commander',
      description: '14 consecutive daily goal completions.',
      reward: '+1,500 Gold • Solar Flame Trail',
      icon: Sparkles,
      color: 'amber',
    },
    {
      days: 21,
      name: 'Shadow Realm Domain',
      tier: 'Rank S Sovereign',
      description: 'Maintain iron gate discipline for 21 days.',
      reward: '+3,000 Gold • Aegis Key Drop',
      icon: Trophy,
      color: 'rose',
    },
    {
      days: 30,
      name: 'Transcendent Monarch',
      tier: 'National Level Titan',
      description: 'Conquer a full month with unbroken clearance.',
      reward: '+5,000 Gold • National Hunter Title',
      icon: Award,
      color: 'emerald',
    },
    {
      days: 60,
      name: 'Iron Will Eternal',
      tier: 'Sovereign of Shadows',
      description: '60 days unbroken streak. Legendary status achieved.',
      reward: 'Mythic Status Frame • Sovereign Crown',
      icon: Target,
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner / Holographic Header */}
      <GlassCard variant="cyan" cornerCut="both" className="p-4 sm:p-5 overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#00D4FF]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Goal Streak Calendar
                </span>
                <span className="px-2 py-0.5 text-[10px] font-tech font-bold uppercase rounded-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Gate Cadence
                </span>
              </div>
              <p className="font-tech text-xs text-slate-400">
                Track every day you conquer your daily mandates, workouts, and hunter goals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-xs font-hud tracking-wider bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 rounded-sm transition-all"
            >
              Today
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-white/10 transition-colors"
                title="Close Calendar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Executive Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Total Days Cleared */}
          <div className="p-3 bg-black/50 border border-cyan-500/30 rounded-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-400">
                Total Days Cleared
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-hud text-2xl font-bold text-cyan-300">
                {streakStats.totalCompletedDays}
              </span>
              <span className="font-tech text-xs text-slate-400">Days</span>
            </div>
            <span className="font-tech text-[10px] text-cyan-400/80 block mt-0.5">
              Goal mandates fulfilled
            </span>
          </div>

          {/* Current Iron Streak */}
          <div className="p-3 bg-black/50 border border-amber-500/30 rounded-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-400">
                Current Streak
              </span>
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-hud text-2xl font-bold text-amber-400">
                {streakStats.currentStreak}
              </span>
              <span className="font-tech text-xs text-slate-400">Days</span>
            </div>
            <span className="font-tech text-[10px] text-amber-400/80 block mt-0.5">
              {streakStats.tierName}
            </span>
          </div>

          {/* Longest Streak Record */}
          <div className="p-3 bg-black/50 border border-violet-500/30 rounded-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-400">
                Longest Streak
              </span>
              <Trophy className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-hud text-2xl font-bold text-violet-300">
                {streakStats.longestStreak}
              </span>
              <span className="font-tech text-xs text-slate-400">Days</span>
            </div>
            <span className="font-tech text-[10px] text-violet-400/80 block mt-0.5">
              All-time record
            </span>
          </div>

          {/* Monthly Clearance Rate */}
          <div className="p-3 bg-black/50 border border-emerald-500/30 rounded-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-400">
                {monthMetrics.monthName} Rate
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-hud text-2xl font-bold text-emerald-400">
                {monthMetrics.clearanceRate}%
              </span>
              <span className="font-tech text-xs text-slate-400">
                ({monthMetrics.completedDays}/{monthMetrics.elapsedDays})
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_6px_#10B981]"
                style={{ width: `${monthMetrics.clearanceRate}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'grid', label: 'Calendar Grid', icon: CalendarIcon },
            { id: 'milestones', label: 'Streak Milestones', icon: Trophy },
            { id: 'breakdown', label: 'Monthly Telemetry', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-hud text-xs uppercase tracking-wider rounded-sm transition-all ${
                  isActive
                    ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                    : 'bg-black/40 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        {activeTab === 'grid' && (
          <div className="flex items-center gap-3 text-[11px] font-tech text-slate-400 overflow-x-auto py-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-none bg-cyan-400 border border-cyan-300 shadow-[0_0_5px_#00D4FF]" />
              Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-none bg-violet-500 border border-violet-400" />
              Partial
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-none bg-cyan-900 border border-cyan-500 flex items-center justify-center">
                <Shield className="w-2 h-2 text-cyan-300" />
              </span>
              Shielded
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-none bg-indigo-950 border border-indigo-500" />
              Rest
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-none bg-rose-950 border border-rose-600" />
              Missed
            </span>
          </div>
        )}
      </div>

      {/* TAB 1: CALENDAR GRID */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Month Calendar Box (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-3">
            <GlassCard variant="default" className="p-4 sm:p-5">
              {/* Month Selector Bar */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 rounded-sm transition-all"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <h3 className="font-hud text-base sm:text-lg font-bold text-white tracking-wider uppercase">
                    {monthMetrics.monthName} {currentYear}
                  </h3>
                  <span className="font-tech text-xs text-slate-400">
                    • {monthMetrics.completedDays} Cleared Days
                  </span>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 rounded-sm transition-all"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div
                    key={day}
                    className="text-center font-tech text-[10px] sm:text-xs text-slate-400 font-bold py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 7-Column Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {gridCells.map((cell) => {
                  const rec = dayGoals[cell.dateKey];
                  const status = rec?.status || (cell.isFuture ? undefined : 'missed');
                  const isSelected = cell.dateKey === selectedDateKey;

                  // Compute styles based on status
                  let statusBg = 'bg-black/40 border-slate-800/80 text-slate-400';
                  let statusGlow = '';
                  let statusBadge = null;

                  if (status === 'completed') {
                    statusBg = 'bg-cyan-950/40 border-cyan-400/80 text-white';
                    statusGlow = 'shadow-[0_0_12px_rgba(0,212,255,0.25)]';
                    statusBadge = (
                      <Flame className="w-3 h-3 text-cyan-300 animate-pulse drop-shadow-[0_0_6px_#00D4FF]" />
                    );
                  } else if (status === 'partial') {
                    statusBg = 'bg-violet-950/40 border-violet-500/70 text-slate-200';
                    statusBadge = <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />;
                  } else if (status === 'shielded') {
                    statusBg = 'bg-blue-950/50 border-cyan-500/70 text-cyan-200';
                    statusBadge = <Shield className="w-3 h-3 text-cyan-400" />;
                  } else if (status === 'rest') {
                    statusBg = 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300';
                    statusBadge = <Moon className="w-2.5 h-2.5 text-indigo-400" />;
                  } else if (status === 'missed' && !cell.isFuture) {
                    statusBg = 'bg-black/60 border-slate-800 text-slate-600 hover:border-slate-700';
                    statusBadge = <span className="w-1.5 h-1.5 rounded-full bg-rose-500/40" />;
                  }

                  if (cell.isFuture) {
                    statusBg = 'bg-transparent border-dashed border-slate-800/40 text-slate-600';
                    statusBadge = null;
                  }

                  if (!cell.isCurrentMonth) {
                    statusBg = 'opacity-30 bg-transparent border-slate-900 text-slate-600';
                  }

                  return (
                    <button
                      key={cell.dateKey}
                      onClick={() => handleSelectDay(cell)}
                      disabled={!cell.isCurrentMonth && cell.isFuture}
                      className={`relative min-h-[58px] sm:min-h-[70px] p-1.5 flex flex-col justify-between items-start border rounded-sm transition-all duration-200 text-left group ${statusBg} ${statusGlow} ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 scale-[1.03] z-10 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                          : 'hover:scale-[1.01] hover:border-cyan-500/50'
                      }`}
                    >
                      {/* Top row: day number & today pill */}
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`font-hud text-xs sm:text-sm font-bold ${
                            cell.isToday
                              ? 'text-cyan-300'
                              : cell.isCurrentMonth
                              ? 'text-slate-200'
                              : 'text-slate-600'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.isToday && (
                          <span className="px-1 py-0.2 text-[8px] sm:text-[9px] font-tech font-black tracking-widest bg-cyan-400 text-black uppercase rounded-none animate-pulse">
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Middle/Bottom: Status badge and XP */}
                      <div className="w-full flex items-end justify-between mt-1">
                        <div>{statusBadge}</div>
                        {rec?.xpEarned && rec.xpEarned > 0 && status === 'completed' ? (
                          <span className="font-tech text-[9px] text-cyan-300/80 font-bold hidden sm:inline">
                            +{rec.xpEarned}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Monthly Cadence Progress Summary */}
            <div className="p-3.5 bg-black/40 border border-slate-800 rounded-sm flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Flame className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-hud text-xs font-bold text-white uppercase tracking-wider">
                    {monthMetrics.monthName} Mandate Completion
                  </h4>
                  <p className="font-tech text-xs text-slate-400">
                    {monthMetrics.completedDays} of {monthMetrics.elapsedDays} active days achieved full goal clearance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-hud text-lg font-bold text-emerald-400">
                  {monthMetrics.clearanceRate}%
                </span>
                <span className="font-tech text-xs text-slate-400">Pass Rate</span>
              </div>
            </div>
          </div>

          {/* Day Inspector Card (1 col on right) */}
          <div className="space-y-4">
            <GlassCard variant="cyan" cornerCut="br" className="p-4 sm:p-5">
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-3">
                <div>
                  <span className="font-tech text-[10px] text-cyan-400 uppercase tracking-widest block">
                    INSPECTING DAY RECORD
                  </span>
                  <h3 className="font-hud text-sm font-bold text-white tracking-wider">
                    {selectedDateFormatted}
                  </h3>
                </div>

                {isSelectedToday && (
                  <span className="px-2 py-0.5 text-[10px] font-hud bg-cyan-500/20 border border-cyan-400 text-cyan-300 uppercase font-bold rounded-sm">
                    Today
                  </span>
                )}
              </div>

              {/* Status Pill & Badge */}
              <div className="mb-4">
                {selectedRecord?.status === 'completed' ? (
                  <div className="p-2.5 bg-cyan-950/60 border border-cyan-400/80 rounded-sm flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-hud text-xs font-bold text-cyan-300 block uppercase">
                        Gate Conquered • 100% Goal Met
                      </span>
                      <span className="font-tech text-[10px] text-slate-300">
                        All required daily mandates verified and cleared
                      </span>
                    </div>
                  </div>
                ) : selectedRecord?.status === 'partial' ? (
                  <div className="p-2.5 bg-violet-950/60 border border-violet-500/80 rounded-sm flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-violet-400 shrink-0" />
                    <div>
                      <span className="font-hud text-xs font-bold text-violet-300 block uppercase">
                        Partial Clearance
                      </span>
                      <span className="font-tech text-[10px] text-slate-300">
                        Some daily mandates completed; workout or quests remaining
                      </span>
                    </div>
                  </div>
                ) : selectedRecord?.status === 'shielded' ? (
                  <div className="p-2.5 bg-blue-950/60 border border-cyan-400/80 rounded-sm flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-cyan-300 shrink-0" />
                    <div>
                      <span className="font-hud text-xs font-bold text-cyan-200 block uppercase">
                        Protected by Aegis Key
                      </span>
                      <span className="font-tech text-[10px] text-slate-300">
                        Streak preserved without gate breach penalty
                      </span>
                    </div>
                  </div>
                ) : selectedRecord?.status === 'rest' ? (
                  <div className="p-2.5 bg-indigo-950/60 border border-indigo-400/80 rounded-sm flex items-center gap-2.5">
                    <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-hud text-xs font-bold text-indigo-300 block uppercase">
                        Active Gate Recovery
                      </span>
                      <span className="font-tech text-[10px] text-slate-300">
                        Cryo-chamber rest cycle; streak maintained
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-rose-950/50 border border-rose-500/60 rounded-sm flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-hud text-xs font-bold text-rose-300 block uppercase">
                        Gate Incomplete / Missed
                      </span>
                      <span className="font-tech text-[10px] text-slate-300">
                        No goal record recorded for this date
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Day Metrics Mini Matrix */}
              <div className="grid grid-cols-2 gap-2 mb-4 font-tech text-xs">
                <div className="p-2 bg-black/50 border border-slate-800 rounded-sm">
                  <span className="text-slate-400 block text-[10px]">Volume Lifted</span>
                  <span className="font-hud text-white font-bold">
                    {(selectedRecord?.totalVolumeKg || 0).toLocaleString()} kg
                  </span>
                </div>
                <div className="p-2 bg-black/50 border border-slate-800 rounded-sm">
                  <span className="text-slate-400 block text-[10px]">XP Yielded</span>
                  <span className="font-hud text-cyan-400 font-bold">
                    +{selectedRecord?.xpEarned || 0} XP
                  </span>
                </div>
              </div>

              {/* Completed Mandates & Goals Checklist */}
              <div className="space-y-2 mb-4">
                <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block">
                  Mandates & Achievements Cleared ({selectedRecord?.completedGoals?.length || 0})
                </span>

                {selectedRecord?.completedGoals && selectedRecord.completedGoals.length > 0 ? (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {selectedRecord.completedGoals.map((g, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 bg-black/40 border border-slate-800/80 rounded-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-tech text-xs text-slate-200 truncate">{g}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-tech text-xs text-slate-500 italic p-2 bg-black/30 border border-slate-800 rounded-sm">
                    No mandates recorded on this date.
                  </p>
                )}
              </div>

              {/* Hunter's Field Note */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
                    Hunter's Log Note
                  </span>
                  {!editingNote && (
                    <button
                      onClick={() => {
                        setNoteText(selectedRecord?.notes || '');
                        setEditingNote(true);
                      }}
                      className="text-[10px] font-tech text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      {selectedRecord?.notes ? 'Edit' : 'Add Note'}
                    </button>
                  )}
                </div>

                {editingNote ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter details about workout, PRs, or goals achieved..."
                      rows={2}
                      className="w-full p-2 bg-black/70 border border-cyan-400/60 rounded-sm font-sans text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingNote(false)}
                        className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-2.5 py-0.5 bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-hud rounded-sm hover:bg-cyan-900"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="font-sans text-xs text-slate-300 p-2 bg-black/30 border border-slate-800 rounded-sm min-h-[38px] italic">
                    {selectedRecord?.notes || 'No log notes recorded for this date.'}
                  </p>
                )}
              </div>

              {/* Day Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleToggleCurrentDayGoal}
                  className="w-full py-2 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-hud text-xs font-bold tracking-wider uppercase rounded-sm shadow-[0_0_12px_rgba(0,212,255,0.2)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {selectedRecord?.status === 'completed'
                      ? 'Mark As Recovery / Rest Day'
                      : selectedRecord?.status === 'rest'
                      ? 'Mark As Incomplete'
                      : 'Mark Goal Cleared (Conquer Gate)'}
                  </span>
                </button>

                {selectedRecord?.status !== 'completed' && selectedRecord?.status !== 'shielded' && (
                  <button
                    disabled={player.streakKeys <= 0}
                    onClick={handleShieldCurrentDay}
                    className="w-full py-1.5 bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 disabled:opacity-40 text-blue-300 font-hud text-[11px] font-bold tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3 h-3 text-cyan-400" />
                    <span>Shield With Aegis Key ({player.streakKeys} Available)</span>
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: STREAK MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <GlassCard variant="gold" className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 border-b border-amber-500/20 pb-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-hud text-sm font-bold uppercase tracking-wider text-white">
                Hunter Streak Progression & Aura Tiers
              </h3>
            </div>
            <p className="font-tech text-xs text-slate-300">
              Maintain consecutive daily gate clearances to ignite advanced aura tiers, unlock passive XP multipliers, and claim rare system armaments.
            </p>
          </GlassCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {milestones.map((m) => {
              const Icon = m.icon;
              const isUnlocked = streakStats.currentStreak >= m.days || streakStats.longestStreak >= m.days;
              const isCurrent = streakStats.currentStreak >= m.days && (streakStats.currentStreak < m.days * 1.5 || m.days === 14);

              return (
                <GlassCard
                  key={m.days}
                  variant={isUnlocked ? 'gold' : 'default'}
                  className={`p-4 transition-all ${
                    isCurrent ? 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-sm bg-black/60 border border-white/10 flex items-center justify-center">
                      <Icon
                        className={`w-5 h-5 ${
                          isUnlocked ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                        }`}
                      />
                    </div>
                    <span
                      className={`font-tech text-[10px] uppercase px-2 py-0.5 border rounded-sm font-bold ${
                        isUnlocked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isUnlocked ? 'CONQUERED' : `${m.days} DAYS REQUIRED`}
                    </span>
                  </div>

                  <h4 className="font-hud text-sm font-bold text-white uppercase">{m.name}</h4>
                  <span className="font-tech text-xs text-cyan-400 block mb-2">{m.tier}</span>

                  <p className="font-sans text-xs text-slate-300 leading-relaxed mb-3">
                    {m.description}
                  </p>

                  <div className="p-2 bg-black/40 border border-slate-800 rounded-sm flex items-center justify-between">
                    <span className="font-tech text-[10px] text-slate-400">Reward</span>
                    <span className="font-tech text-[11px] text-amber-300 font-bold">{m.reward}</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY BREAKDOWN */}
      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard variant="cyan" className="p-5 space-y-4">
            <h3 className="font-hud text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-cyan-500/20 pb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              {monthMetrics.monthName} {currentYear} Cadence Telemetry
            </h3>

            <div className="space-y-2.5 font-tech text-xs">
              <div className="flex items-center justify-between p-2.5 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-slate-300">Total Month Days</span>
                <span className="font-hud text-white font-bold">{monthMetrics.totalDaysInMonth} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-cyan-300">Days Goal Fully Cleared</span>
                <span className="font-hud text-cyan-400 font-bold">{monthMetrics.completedDays} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-violet-300">Partial Clearance Days</span>
                <span className="font-hud text-violet-400 font-bold">{monthMetrics.partialDays} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-blue-300">Aegis Key Shielded Days</span>
                <span className="font-hud text-blue-400 font-bold">{monthMetrics.shieldedDays} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-indigo-300">Active Rest & Recovery Days</span>
                <span className="font-hud text-indigo-400 font-bold">{monthMetrics.restDays} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-rose-400">Missed / Gate Breaches</span>
                <span className="font-hud text-rose-400 font-bold">{monthMetrics.missedDays} Days</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="emerald" className="p-5 space-y-4">
            <h3 className="font-hud text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-emerald-500/20 pb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Volume & Experience Yields
            </h3>

            <div className="space-y-3 font-tech text-xs">
              <div className="p-3 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Total Volume Lifted During Cleared Gates
                </span>
                <span className="font-hud text-2xl font-bold text-white">
                  {monthMetrics.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>

              <div className="p-3 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-slate-400 block text-[10px] uppercase">
                  XP Harvested From Daily Mandates
                </span>
                <span className="font-hud text-2xl font-bold text-emerald-400">
                  +{monthMetrics.totalXp.toLocaleString()} XP
                </span>
              </div>

              <div className="p-3 bg-black/40 border border-slate-800 rounded-sm">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Discipline Consistency Rating
                </span>
                <span className="font-hud text-lg font-bold text-cyan-300">
                  {monthMetrics.clearanceRate >= 80 ? 'S-Rank Elite Vanguard' : 'A-Rank Consistent Hunter'}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
