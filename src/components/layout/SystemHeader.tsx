import React from 'react';
import { Volume2, VolumeX, Eye, Sparkles, PlusCircle } from 'lucide-react';
import { Player } from '../../types';

interface SystemHeaderProps {
  player: Player;
  soundEnabled: boolean;
  reducedGlow: boolean;
  onToggleSound: () => void;
  onToggleReducedGlow: () => void;
  onOpenAPModal?: () => void;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  player,
  soundEnabled,
  reducedGlow,
  onToggleSound,
  onToggleReducedGlow,
  onOpenAPModal,
}) => {
  const rankColors = {
    E: 'bg-slate-700 text-slate-300 border-slate-500',
    D: 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.4)]',
    C: 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    B: 'bg-indigo-950 text-indigo-300 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)]',
    A: 'bg-purple-950 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    S: 'bg-amber-950 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    National: 'bg-rose-950 text-rose-300 border-rose-400 shadow-[0_0_18px_rgba(239,68,68,0.6)]',
  }[player.rank];

  const xpPercent = Math.min(100, Math.round((player.xp / player.xpToNextLevel) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07070B]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Player Identity & Title */}
        <div className="flex items-center gap-3">
          {/* Rank Hex Badge */}
          <div
            className={`w-10 h-10 flex items-center justify-center font-hud text-lg font-black clip-hex-btn border ${rankColors} transition-all`}
          >
            {player.rank}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-hud text-sm md:text-base font-black text-white tracking-wide flex items-center gap-1.5">
                {player.name}
              </h1>
              <span className="font-tech text-[10px] uppercase px-1.5 py-0.5 bg-violet-950/80 border border-violet-500/40 text-violet-300 rounded-sm">
                {player.title}
              </span>
            </div>

            {/* Level & XP bar mini */}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-hud text-xs font-bold text-cyan-400">
                LV. {player.level}
              </span>
              <div className="w-24 md:w-36 h-1.5 bg-black/60 border border-cyan-500/30 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_6px_#00D4FF]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="font-tech text-[11px] text-slate-400 hidden sm:inline">
                {player.xp}/{player.xpToNextLevel} XP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Ability Points & Accessibility */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ability Points Banner if available */}
          {player.unallocatedPoints > 0 && (
            <button
              onClick={onOpenAPModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-hud text-xs font-bold rounded-sm animate-pulse shadow-[0_0_12px_rgba(0,212,255,0.4)]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+{player.unallocatedPoints} AP</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound Effects"
            className="p-2 rounded-sm bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reduced Glow / Motion Toggle */}
          <button
            onClick={onToggleReducedGlow}
            aria-label="Toggle High-Glow Mode"
            title={reducedGlow ? 'Glow Reduced (Click to Restore)' : 'High Neon Glow Active'}
            className={`p-2 rounded-sm border transition-colors ${
              reducedGlow
                ? 'bg-slate-800 border-slate-600 text-slate-400'
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(0,212,255,0.2)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
