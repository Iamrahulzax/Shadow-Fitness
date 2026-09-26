import React from 'react';
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  Camera,
  ChevronRight,
  Crown,
  Timer,
  Play,
  Award,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { usePlayerStore } from '../../store/usePlayerStore';
import { CONTEST_RIVALS } from '../../data/pushContestData';
import { PushContestRival } from '../../types';

interface PushContestSectionProps {
  onOpenArena: (rivalId?: string) => void;
}

export const PushContestSection: React.FC<PushContestSectionProps> = ({ onOpenArena }) => {
  const [state] = usePlayerStore();
  const { pushContestStats, player } = state;

  const winRate =
    pushContestStats.wins + pushContestStats.losses > 0
      ? Math.round(
          (pushContestStats.wins / (pushContestStats.wins + pushContestStats.losses)) * 100
        )
      : 0;

  // Featured boss challenger (e.g. Cha Hae-In or Thomas Andre)
  const featuredChallenger: PushContestRival =
    CONTEST_RIVALS.find((r) => r.id === 'rival-cha-hae-in') || CONTEST_RIVALS[0];

  return (
    <GlassCard variant="danger" cornerCut="both" className="p-4 sm:p-5 relative overflow-hidden">
      {/* Background Radiance & Battle Aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar with Live Indicator */}
      <div className="flex items-center justify-between border-b border-rose-500/25 pb-3 mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 shadow-[0_0_8px_#FF3B5C]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-hud text-sm sm:text-base font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>LIVE PUSH-UP CONTEST ARENA</span>
              </h3>
              <span className="px-1.5 py-0.2 bg-rose-950 border border-rose-500/50 text-[10px] font-tech text-rose-300 font-bold uppercase rounded-none shadow-[0_0_8px_rgba(255,59,92,0.3)]">
                PVP DUELS
              </span>
            </div>
            <p className="font-tech text-xs text-slate-400">
              Live head-to-head push-up battles. Most verified reps before buzzer takes victory!
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenArena()}
          className="px-3 py-1.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-hud text-xs font-bold uppercase tracking-widest clip-hex-btn shadow-[0_0_20px_rgba(255,59,92,0.4)] flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Enter Live Arena</span>
        </button>
      </div>

      {/* Top Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
        {/* Record */}
        <div className="p-3 bg-black/60 border border-rose-500/30 rounded-none relative">
          <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block">
            Arena Record
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-hud text-xl sm:text-2xl font-black text-rose-400">
              {pushContestStats.wins}W
            </span>
            <span className="font-tech text-xs text-slate-500">-</span>
            <span className="font-hud text-xl sm:text-2xl font-black text-slate-400">
              {pushContestStats.losses}L
            </span>
          </div>
          <span className="font-tech text-[10px] text-emerald-400 block mt-0.5">
            {winRate}% Victory Ratio
          </span>
        </div>

        {/* Win Streak */}
        <div className="p-3 bg-black/60 border border-amber-500/30 rounded-none relative">
          <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block">
            Arena Streak
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-hud text-xl sm:text-2xl font-black text-amber-400">
              {pushContestStats.currentWinStreak}
            </span>
            <span className="font-tech text-xs text-slate-400">Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse ml-0.5" />
          </div>
          <span className="font-tech text-[10px] text-amber-300 block mt-0.5">
            Undefeated Run
          </span>
        </div>

        {/* Highest Score */}
        <div className="p-3 bg-black/60 border border-cyan-500/30 rounded-none relative">
          <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block">
            Personal Best
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-hud text-xl sm:text-2xl font-black text-cyan-300">
              {pushContestStats.highestRepScore}
            </span>
            <span className="font-tech text-xs text-slate-400">Reps / 60s</span>
          </div>
          <span className="font-tech text-[10px] text-cyan-400 block mt-0.5">
            Apex Rep Speed
          </span>
        </div>

        {/* Total Contest Reps */}
        <div className="p-3 bg-black/60 border border-violet-500/30 rounded-none relative">
          <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block">
            Total Arena Reps
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-hud text-xl sm:text-2xl font-black text-violet-300">
              {pushContestStats.totalContestReps.toLocaleString()}
            </span>
            <span className="font-tech text-xs text-slate-400">Reps</span>
          </div>
          <span className="font-tech text-[10px] text-violet-400 block mt-0.5">
            All-time Combat Volume
          </span>
        </div>
      </div>

      {/* Featured Arena Bounty Card */}
      <div className="p-4 bg-gradient-to-r from-black/80 via-[#130A14] to-black/80 border border-rose-500/40 clip-corner-both mb-4 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Rival Profile */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-900 to-black border-2 border-rose-500/60 flex items-center justify-center font-hud text-xl font-black text-rose-300 shadow-[0_0_15px_rgba(255,59,92,0.4)]">
                {featuredChallenger.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-rose-600 text-white font-hud text-[9px] font-bold uppercase rounded-none">
                Rank {featuredChallenger.rank}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                  CURRENT BOUNTY TARGET
                </span>
                <span className="px-1.5 py-0.2 bg-rose-950/80 border border-rose-500/40 text-[9px] font-tech text-rose-300 uppercase">
                  MONARCH TIER
                </span>
              </div>
              <h4 className="font-hud text-base font-black text-white">
                {featuredChallenger.name} • {featuredChallenger.title}
              </h4>
              <p className="font-tech text-xs text-slate-300 mt-0.5">
                Guild: <span className="text-white">{featuredChallenger.guild}</span> • Pace Target:{' '}
                <strong className="text-rose-400">{featuredChallenger.baseRepsPerMin} Reps / Min</strong>
              </p>
            </div>
          </div>

          {/* Quick Match Buttons & Bounty Reward */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="p-2 bg-black/60 border border-white/10 text-center font-tech text-xs">
              <span className="text-slate-400 text-[10px] block">Victory Yield</span>
              <span className="font-hud text-amber-300 font-bold text-xs">
                +350 XP • +500 Gold • +1 STR
              </span>
            </div>

            <button
              onClick={() => onOpenArena(featuredChallenger.id)}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-hud text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,59,92,0.4)] active:scale-95 transition-all"
            >
              <Swords className="w-4 h-4" />
              <span>Challenge {featuredChallenger.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster of Challengers (Carousel / Quick Cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-tech text-xs text-slate-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Active Challenger Division
          </span>
          <span className="font-tech text-xs text-slate-400">
            Select any hunter to start instant 1v1 battle
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CONTEST_RIVALS.map((rival) => {
            const isGod = rival.difficulty === 'god';
            const isMonarch = rival.difficulty === 'monarch';

            return (
              <div
                key={rival.id}
                onClick={() => onOpenArena(rival.id)}
                className="p-3 bg-black/60 hover:bg-black/80 border border-slate-800 hover:border-rose-500/60 rounded-none cursor-pointer group transition-all duration-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 flex items-center justify-center font-hud text-sm font-bold border rounded-none shrink-0 ${
                      isGod
                        ? 'border-amber-400 bg-amber-950/80 text-amber-300'
                        : isMonarch
                        ? 'border-rose-400 bg-rose-950/80 text-rose-300'
                        : 'border-cyan-400 bg-cyan-950/80 text-cyan-300'
                    }`}
                  >
                    {rival.rank}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-hud text-xs font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                        {rival.name}
                      </span>
                    </div>
                    <span className="font-tech text-[10px] text-slate-400 block truncate">
                      Pace: ~{rival.baseRepsPerMin} reps/min • {rival.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenArena(rival.id);
                  }}
                  className="px-2.5 py-1 bg-slate-900 group-hover:bg-rose-950/90 border border-slate-700 group-hover:border-rose-500 text-slate-300 group-hover:text-rose-300 font-hud text-[10px] font-bold uppercase rounded-none transition-all shrink-0"
                >
                  Duel
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
