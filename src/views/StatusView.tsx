import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Plus,
  Dumbbell,
  Droplets,
  Footprints,
  Moon,
  Flame,
  Shield,
  Award,
  ChevronRight,
  Edit3,
  User,
  Camera,
  Calendar,
} from 'lucide-react';
import { PlayerStats, Rank } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { GlassCard } from '../components/common/GlassCard';
import { HUDBar } from '../components/common/HUDBar';
import { StatRadarChart } from '../components/common/StatRadarChart';
import { StreakFlame } from '../components/common/StreakFlame';
import { StreakCalendar } from '../components/calendar/StreakCalendar';
import { AVATAR_PRESETS } from '../components/modals/EditProfileModal';
import { isPhotoAvatar, processImageFile } from '../utils/image';
import { LeaderboardSection } from '../components/leaderboard/LeaderboardSection';

interface StatusViewProps {
  onNavigateTab: (tab: 'workout' | 'nutrition' | 'quests' | 'army' | 'leaderboard' | 'analytics') => void;
}

export const StatusView: React.FC<StatusViewProps> = ({ onNavigateTab }) => {
  const [state, actions] = usePlayerStore();
  const { player, nutrition, sleep, steps } = state;
  const [hoveredStat, setHoveredStat] = useState<keyof PlayerStats | null>(null);
  const [showCalendar, setShowCalendar] = useState(true);

  const statMetadata: Record<
    keyof PlayerStats,
    { label: string; mapping: string; icon: React.ElementType; color: string }
  > = {
    STR: { label: 'STR (Strength)', mapping: 'Workout volume & heavy sets', icon: Dumbbell, color: 'text-rose-400' },
    VIT: { label: 'VIT (Vitality)', mapping: 'Sleep consistency & rest score', icon: Moon, color: 'text-emerald-400' },
    AGI: { label: 'AGI (Agility)', mapping: 'Steps walked & cardio depth', icon: Footprints, color: 'text-amber-400' },
    INT: { label: 'INT (Intelligence)', mapping: 'Hydration & nutrition balance', icon: Droplets, color: 'text-cyan-400' },
    PER: { label: 'PER (Perception)', mapping: 'Streak consistency & discipline', icon: Flame, color: 'text-violet-400' },
  };

  // Quick photo upload from status view
  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await processImageFile(file, 360, 0.85);
      actions.updateAvatar(optimized);
    } catch (err) {
      console.error('Failed to update avatar photo:', err);
    }
    e.target.value = '';
  };

  // HP and MP calculations
  const currentHP = Math.min(100, Math.round((sleep.recoveryPercentage / 100) * 100));
  const mpPercent = Math.min(100, Math.round((nutrition.caloriesConsumed / (nutrition.calorieGoal || 1)) * 100));

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Central Hunter Status Window */}
      <GlassCard variant="cyan" cornerCut="both" className="p-5 md:p-6 overflow-hidden">
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-none shadow-[0_0_8px_#00D4FF]" />
            <span className="font-tech text-xs tracking-widest text-cyan-300 uppercase">
              STATUS WINDOW • HUNTER SYSTEM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-tech text-xs text-slate-400 flex items-center gap-1">
              <span>ID:</span>
              <span className="font-hud text-cyan-400 tracking-wider">
                {player.hunterId || 'SL-7709'}
              </span>
            </div>
            <button
              onClick={() => actions.openEditProfile('identity')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-400/60 hover:border-cyan-400 text-cyan-300 font-hud text-[11px] font-bold tracking-wider uppercase rounded-none shadow-[0_0_10px_rgba(0,212,255,0.2)] hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all active:scale-95 cursor-pointer"
              title="Edit Hunter Profile"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Player Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Info & Resource Bars */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                {/* Hunter Avatar & Photo Frame */}
                {(() => {
                  const avatarPreset =
                    AVATAR_PRESETS.find((p) => p.id === player.avatar) || AVATAR_PRESETS[0];
                  const Icon = avatarPreset.icon;
                  const isCustomImage = isPhotoAvatar(player.avatar);

                  return (
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => actions.openEditProfile('avatar')}
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-sm border-2 border-cyan-400 overflow-hidden bg-black/80 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:border-cyan-300 hover:shadow-[0_0_22px_rgba(0,212,255,0.5)] transition-all cursor-pointer"
                        title="Click to customize profile photo and avatar"
                      >
                        {isCustomImage ? (
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${avatarPreset.textColor}`} />
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-cyan-300">
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span className="font-hud text-[8px] uppercase tracking-wider font-bold">
                            Photo
                          </span>
                        </div>
                      </button>

                      {/* Quick Photo Upload Corner Button */}
                      <label
                        className="absolute -bottom-1 -right-1 p-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 hover:text-white rounded-none cursor-pointer shadow-[0_0_8px_rgba(0,212,255,0.5)] transition-all z-10"
                        title="Quick upload profile photo"
                      >
                        <Camera className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleQuickPhotoUpload}
                        />
                      </label>
                    </div>
                  );
                })()}

                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      onClick={() => actions.openEditProfile('identity')}
                      className="font-hud text-2xl md:text-3xl font-black text-white tracking-wide cursor-pointer hover:text-cyan-300 transition-colors flex items-center gap-2 group"
                      title="Click to edit hunter identity"
                    >
                      <span>{player.name}</span>
                      <Edit3 className="w-4 h-4 text-cyan-400/40 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-tech text-xs px-2 py-0.5 bg-violet-950/70 border border-violet-500/40 text-violet-300 rounded-sm">
                      Title: {player.title}
                    </span>
                    <span className="font-hud text-xs px-2 py-0.5 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold rounded-sm">
                      {player.rank} RANK
                    </span>
                  </div>

                  {player.hunterClass && (
                    <div className="font-tech text-xs text-cyan-400/90 font-medium tracking-wide mt-1">
                      Class: {player.hunterClass}
                    </div>
                  )}

                  {player.bio && (
                    <p className="font-sans text-xs italic text-slate-400/90 mt-1 border-l-2 border-cyan-500/30 pl-2 line-clamp-1">
                      "{player.bio}"
                    </p>
                  )}
                </div>
              </div>

              {/* Level Hex */}
              <div className="text-right">
                <span className="block font-tech text-[11px] text-slate-400 uppercase">Current Level</span>
                <span className="font-hud text-3xl font-black text-cyan-300 drop-shadow-[0_0_12px_#00D4FF]">
                  LV. {player.level}
                </span>
              </div>
            </div>

            {/* Level XP Bar */}
            <div className="space-y-1">
              <HUDBar
                current={player.xp}
                max={player.xpToNextLevel}
                label="Experience Gauge"
                variant="cyan"
                unit="XP"
                showPercentage
                size="md"
              />
            </div>

            {/* Health (HP) & Mana (MP) Resource Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <HUDBar
                current={currentHP}
                max={100}
                label="HP (Vessel Vitality)"
                sublabel={`${currentHP}%`}
                variant="emerald"
                size="sm"
              />
              <HUDBar
                current={nutrition.caloriesConsumed}
                max={nutrition.calorieGoal}
                label="MP (Energy Budget)"
                unit="kcal"
                variant="violet"
                size="sm"
              />
            </div>

            {/* AP Available Notification */}
            {player.unallocatedPoints > 0 && (
              <div className="p-3 bg-cyan-950/60 border border-cyan-400/60 flex items-center justify-between clip-corner-br">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="font-tech text-xs tracking-wider text-cyan-200">
                    <strong>{player.unallocatedPoints} ABILITY POINTS (AP)</strong> AVAILABLE TO ALLOCATE
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Signature 5-Stat Radar Visualizer */}
          <div className="flex flex-col items-center justify-center bg-black/40 border border-cyan-500/20 p-2 clip-corner-tl">
            <StatRadarChart
              stats={player.stats}
              highlightStat={hoveredStat}
              onStatClick={(stat) => {
                if (player.unallocatedPoints > 0) {
                  actions.allocateStat(stat);
                }
              }}
            />
          </div>
        </div>

        {/* 5-Stat Allocation Panel */}
        <div className="mt-6 pt-5 border-t border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-hud text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              Stat Attributes Distribution
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Unallocated AP: <strong className="font-hud text-cyan-400 text-sm">{player.unallocatedPoints}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {(Object.keys(player.stats) as (keyof PlayerStats)[]).map((key) => {
              const meta = statMetadata[key];
              const Icon = meta.icon;
              const val = player.stats[key];

              return (
                <div
                  key={key}
                  onMouseEnter={() => setHoveredStat(key)}
                  onMouseLeave={() => setHoveredStat(null)}
                  className={`p-3 bg-black/50 border transition-all duration-200 rounded-sm relative ${
                    hoveredStat === key
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      <span className="font-hud font-bold text-xs text-slate-200">{key}</span>
                    </div>
                    <span className="font-hud font-black text-sm text-cyan-400">{val}</span>
                  </div>

                  <p className="font-sans text-[10px] text-slate-400 line-clamp-1">
                    {meta.mapping}
                  </p>

                  {/* Allocate Point Button */}
                  {player.unallocatedPoints > 0 && (
                    <button
                      onClick={() => actions.allocateStat(key)}
                      className="mt-2 w-full py-1 bg-cyan-900/60 hover:bg-cyan-700/80 border border-cyan-400/50 text-cyan-200 font-hud text-[10px] font-bold tracking-wider uppercase rounded-none flex items-center justify-center gap-1 transition-colors active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+1 {key}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Streak Gate Clearance Flame Banner */}
      <StreakFlame
        streakDays={player.streakDays}
        streakProtected={player.streakProtected}
        streakKeys={player.streakKeys}
        missedDayDimmed={player.missedDayDimmed}
        onUseKey={() => actions.useStreakProtection()}
        onOpenCalendar={() => actions.openStreakCalendar()}
      />

      {/* Goal Streak & Daily Gate Clearance Calendar Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
            <h3 className="font-hud text-xs uppercase tracking-widest text-slate-300 flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Goal Streak & Gate Clearance Calendar
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-2 py-0.5 font-tech text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 rounded-sm bg-cyan-950/40 transition-colors"
            >
              {showCalendar ? 'Collapse Calendar' : 'Expand Calendar'}
            </button>
            <button
              onClick={() => actions.openStreakCalendar()}
              className="px-2.5 py-0.5 font-hud text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/60 hover:border-cyan-400 rounded-sm shadow-[0_0_8px_rgba(0,212,255,0.2)] transition-all"
            >
              Full Screen
            </button>
          </div>
        </div>

        {showCalendar ? (
          <StreakCalendar />
        ) : (
          <GlassCard
            onClick={() => setShowCalendar(true)}
            variant="cyan"
            interactive
            className="p-3.5 flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="font-hud text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Goal Streak Cadence Hidden
                </span>
                <p className="font-tech text-[10px] text-slate-400">
                  Tap to view 7-column calendar, completed daily mandates, and monthly clearance %
                </p>
              </div>
            </div>
            <span className="font-tech text-xs text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Open Calendar →
            </span>
          </GlassCard>
        )}
      </div>

      {/* Quick Action Matrix for Rapid Logging */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-tech text-xs uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Rapid Action Directives
          </h3>
          <span className="font-tech text-xs text-slate-500">Tap to instantly feed stats</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Quick Workout Button */}
          <button
            onClick={() => onNavigateTab('workout')}
            className="p-3.5 bg-gradient-to-br from-slate-900/90 to-black border border-cyan-500/30 hover:border-cyan-400/60 text-left clip-corner-br group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-sm bg-rose-950/60 border border-rose-500/40 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-hud text-[10px] text-rose-400 font-bold">+STR</span>
            </div>
            <h4 className="font-hud text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
              Raid Dungeon
            </h4>
            <p className="font-sans text-[10px] text-slate-400 mt-0.5">Log exercise sets</p>
          </button>

          {/* Quick Water Button */}
          <button
            onClick={() => actions.addWater(250)}
            className="p-3.5 bg-gradient-to-br from-slate-900/90 to-black border border-cyan-500/30 hover:border-cyan-400/60 text-left clip-corner-br group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-sm bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-hud text-[10px] text-cyan-400 font-bold">+INT</span>
            </div>
            <h4 className="font-hud text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
              Drink Mana
            </h4>
            <p className="font-sans text-[10px] text-slate-400 mt-0.5">+250ml Flask</p>
          </button>

          {/* Quick Steps Button */}
          <button
            onClick={() => actions.addSteps(1000)}
            className="p-3.5 bg-gradient-to-br from-slate-900/90 to-black border border-cyan-500/30 hover:border-cyan-400/60 text-left clip-corner-br group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-sm bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
                <Footprints className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-hud text-[10px] text-amber-400 font-bold">+AGI</span>
            </div>
            <h4 className="font-hud text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
              Traverse Floor
            </h4>
            <p className="font-sans text-[10px] text-slate-400 mt-0.5">+1,000 Steps</p>
          </button>

          {/* Quick Protein Button */}
          <button
            onClick={() => actions.addProtein(25)}
            className="p-3.5 bg-gradient-to-br from-slate-900/90 to-black border border-cyan-500/30 hover:border-cyan-400/60 text-left clip-corner-br group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-sm bg-violet-950/60 border border-violet-500/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-hud text-[10px] text-violet-400 font-bold">+STR</span>
            </div>
            <h4 className="font-hud text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
              STR Elixir
            </h4>
            <p className="font-sans text-[10px] text-slate-400 mt-0.5">+25g Protein</p>
          </button>
        </div>
      </div>

      {/* Live Hunter Leaderboard Arena Section */}
      <LeaderboardSection onOpenLeaderboard={() => onNavigateTab('leaderboard')} />

      {/* Active Daily Quests Preview */}
      <GlassCard variant="default" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h3 className="font-hud text-xs font-bold uppercase tracking-wider text-slate-200">
              Active System Quests
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('quests')}
            className="font-tech text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {state.quests.slice(0, 3).map((q) => (
            <div
              key={q.id}
              onClick={() => actions.toggleQuest(q.id)}
              className="flex items-center justify-between p-2.5 bg-black/40 border border-slate-800 hover:border-cyan-500/40 cursor-pointer rounded-sm transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-none border flex items-center justify-center text-[10px] ${
                    q.completed ? 'bg-cyan-500 border-cyan-400 text-black font-bold' : 'border-slate-600'
                  }`}
                >
                  {q.completed ? '✓' : ''}
                </div>
                <span className={`font-tech text-xs ${q.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {q.title}
                </span>
              </div>
              <span className="font-hud text-[11px] text-cyan-400">
                +{q.xpReward} XP
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
