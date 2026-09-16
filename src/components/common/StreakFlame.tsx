import React from 'react';
import { Flame, Shield, ShieldAlert, Sparkles, Key } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StreakFlameProps {
  streakDays: number;
  streakProtected: boolean;
  streakKeys: number;
  missedDayDimmed: boolean;
  onUseKey?: () => void;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  streakDays,
  streakProtected,
  streakKeys,
  missedDayDimmed,
  onUseKey,
}) => {
  // Determine flame aura tier
  let tierName = 'Novice Gate Aura';
  let flameColor = 'text-cyan-400 drop-shadow-[0_0_12px_#00D4FF]';
  let auraBg = 'from-cyan-500/10 via-blue-500/5 to-transparent';
  let borderGlow = 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]';
  let badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

  if (streakDays >= 21) {
    tierName = 'Sovereign Solar Flame';
    flameColor = 'text-amber-400 drop-shadow-[0_0_20px_#F59E0B]';
    auraBg = 'from-amber-500/20 via-yellow-500/10 to-transparent';
    borderGlow = 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (streakDays >= 7) {
    tierName = 'Monarch Void Plasma';
    flameColor = 'text-violet-400 drop-shadow-[0_0_16px_#7B5CFF]';
    auraBg = 'from-violet-500/15 via-purple-500/10 to-transparent';
    borderGlow = 'border-violet-500/40 shadow-[0_0_20px_rgba(123,92,255,0.2)]';
    badgeColor = 'bg-violet-500/20 text-violet-300 border-violet-500/40';
  }

  if (missedDayDimmed) {
    tierName = 'Dormant Gate (Awaiting Clearance)';
    flameColor = 'text-slate-500';
    auraBg = 'from-slate-800/40 to-transparent';
    borderGlow = 'border-slate-700/60';
    badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
  }

  return (
    <GlassCard
      cornerCut="both"
      className={`p-4 overflow-hidden relative border ${borderGlow} transition-all duration-500`}
    >
      {/* Background Radiance */}
      <div className={`absolute inset-0 bg-gradient-to-r ${auraBg} pointer-events-none`} />

      <div className="relative flex items-center justify-between gap-4">
        {/* Left: Flame Icon and Streak Number */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-sm bg-black/50 border border-white/10">
            <Flame
              className={`w-9 h-9 ${flameColor} ${!missedDayDimmed ? 'animate-pulse' : ''} transition-all`}
            />
            {!missedDayDimmed && (
              <Sparkles className="w-3.5 h-3.5 text-white absolute top-1 right-1 animate-ping opacity-60" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud text-2xl font-black tracking-tight text-white">
                {streakDays}
              </span>
              <span className="font-tech text-xs uppercase tracking-widest text-slate-300">
                Gate Clearances
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-tech uppercase px-2 py-0.5 border rounded-sm ${badgeColor}`}>
                {tierName}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Protection Key Info */}
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="flex items-center gap-1.5 text-xs font-tech text-slate-300">
            {streakProtected ? (
              <span className="flex items-center gap-1 text-cyan-300">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> Aegis Active
              </span>
            ) : streakKeys > 0 ? (
              <button
                onClick={onUseKey}
                className="flex items-center gap-1 px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[11px] text-cyan-300 font-hud tracking-wide rounded-sm transition-all"
              >
                <Key className="w-3 h-3 text-cyan-400" /> Equip Key ({streakKeys})
              </button>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500/70" /> Unprotected
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            {missedDayDimmed
              ? 'The Gate remains open — return when ready'
              : streakProtected
              ? '1 missed gate will be shielded'
              : `${streakKeys} Aegis Key${streakKeys === 1 ? '' : 's'} in inventory`}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
