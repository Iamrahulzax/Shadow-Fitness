import React from 'react';
import { Trophy, Crown, ArrowUp, ChevronRight, Radio, Flame, Dumbbell } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { usePlayerStore } from '../../store/usePlayerStore';
import {
  INITIAL_HUNTERS,
  createPlayerLeaderboardEntry,
  getRankedHunters,
} from '../../data/leaderboardData';
import { isPhotoAvatar } from '../../utils/image';
import { soundFx } from '../../utils/audio';

interface LeaderboardSectionProps {
  onOpenLeaderboard: () => void;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ onOpenLeaderboard }) => {
  const [state] = usePlayerStore();
  const { player, workouts, steps, achievements } = state;

  const playerEntry = createPlayerLeaderboardEntry(player, workouts, steps, achievements);
  const allHunters = [playerEntry, ...INITIAL_HUNTERS];
  const rankedHunters = getRankedHunters(allHunters, 'power');

  const playerRankIndex = rankedHunters.findIndex((h) => h.isPlayer);
  const playerRankNum = playerRankIndex + 1;
  const rivalAhead = playerRankIndex > 0 ? rankedHunters[playerRankIndex - 1] : null;
  const pwrGap = rivalAhead ? rivalAhead.powerRating - playerEntry.powerRating : 0;

  const top3 = rankedHunters.slice(0, 3);

  const handleClick = () => {
    soundFx.playClick();
    onOpenLeaderboard();
  };

  return (
    <GlassCard variant="cyan" cornerCut="both" className="p-4 sm:p-5 relative overflow-hidden">
      {/* Background glow & radar sweep effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/25 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <h3 className="font-hud text-xs sm:text-sm font-black tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>LIVE HUNTER LEADERBOARD</span>
          </h3>
        </div>

        <button
          onClick={handleClick}
          className="font-tech text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group font-bold tracking-wider uppercase transition-colors"
        >
          <span>Full Arena</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Grid: Player Standing + Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: Your Live Position Highlight */}
        <div className="md:col-span-5 p-3.5 bg-black/60 border border-cyan-500/30 clip-corner-tl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-tech text-[10px] uppercase text-slate-400 tracking-wider">
              Your Current Standing
            </span>
            <span className="font-tech text-[10px] text-emerald-400 flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3" /> Rising
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 border-2 border-cyan-400 bg-cyan-950/80 flex items-center justify-center font-hud text-lg font-black text-cyan-300 shadow-[0_0_15px_#00D4FF]">
              #{playerRankNum}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-hud text-sm font-black text-white">{player.name}</h4>
                <span className="font-hud text-[9px] px-1 py-0.2 bg-cyan-400 text-black font-bold uppercase">
                  {player.rank}
                </span>
              </div>
              <p className="font-tech text-xs text-cyan-400 font-bold">
                {playerEntry.powerRating.toLocaleString()} Combat Power
              </p>
            </div>
          </div>

          {/* Immediate Rival Tracker */}
          {rivalAhead ? (
            <div className="p-2 bg-slate-900/60 border border-slate-800 text-[11px] font-sans">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Rival Ahead:</span>
                <span className="text-amber-300 font-hud font-bold">#{playerRankIndex} {rivalAhead.name}</span>
              </div>
              <div className="text-slate-400 mt-1 flex items-center justify-between">
                <span>Surpass Distance:</span>
                <span className="text-cyan-300 font-tech font-bold">+{pwrGap.toLocaleString()} PWR to overtake</span>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 font-hud text-center">
              👑 You are currently #1 on the leaderboard!
            </div>
          )}
        </div>

        {/* Right Column: Top 3 Global Champions Snapshot */}
        <div className="md:col-span-7 space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
              Top 3 Global Champions
            </span>
            <span className="font-tech text-[10px] text-amber-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" /> Live Telemetry
            </span>
          </div>

          {top3.map((hunter, idx) => {
            const crownColors = [
              'text-amber-400 border-amber-400/50 bg-amber-950/30',
              'text-slate-300 border-slate-400/50 bg-slate-900/30',
              'text-orange-400 border-orange-400/50 bg-orange-950/30',
            ];

            return (
              <div
                key={hunter.id}
                onClick={handleClick}
                className={`p-2 border flex items-center justify-between gap-2.5 cursor-pointer hover:border-cyan-400 transition-all ${
                  crownColors[idx]
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 text-center font-hud text-xs font-black">
                    {idx === 0 ? '👑' : `#${idx + 1}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-hud text-xs font-bold text-white truncate">
                        {hunter.name}
                      </span>
                      <span className="font-tech text-[10px] text-slate-400 uppercase">
                        [{hunter.guild}]
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-hud text-xs font-bold text-cyan-300">
                    {hunter.powerRating.toLocaleString()}
                  </span>
                  <span className="font-tech text-[9px] text-slate-400 block -mt-0.5">PWR</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch CTA Button */}
      <button
        onClick={handleClick}
        className="mt-3 w-full py-2 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-cyan-950/80 hover:from-cyan-900/90 hover:to-cyan-900/90 border border-cyan-400/60 font-hud text-xs font-black text-cyan-300 hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all cursor-pointer"
      >
        <span>Enter Leaderboard Arena & View Full Rankings</span>
        <ChevronRight className="w-4 h-4 text-cyan-400" />
      </button>
    </GlassCard>
  );
};
