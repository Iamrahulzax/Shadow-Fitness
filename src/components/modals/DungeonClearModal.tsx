import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Swords, Zap, Key, ShieldCheck, Flame, Sparkles, Trophy } from 'lucide-react';
import { WorkoutLog, LootItem } from '../../types';

interface DungeonClearModalProps {
  workout: WorkoutLog | null;
  loot: LootItem | null;
  onClose: () => void;
}

export const DungeonClearModal: React.FC<DungeonClearModalProps> = ({ workout, loot, onClose }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#7B5CFF', '#00D4FF', '#FFC94A'],
      });
    } catch {
      // ignore
    }
  }, []);

  if (!workout) return null;

  const rarityColor = {
    Common: 'text-slate-300 border-slate-600 bg-slate-900/80',
    Rare: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,212,255,0.25)]',
    Epic: 'text-violet-300 border-violet-500/50 bg-violet-950/40 shadow-[0_0_20px_rgba(123,92,255,0.3)]',
    Legendary: 'text-amber-300 border-amber-500/60 bg-amber-950/40 shadow-[0_0_25px_rgba(245,158,11,0.35)]',
  }[loot?.rarity || 'Rare'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0A0A12] border-2 border-violet-500 shadow-[0_0_45px_rgba(123,92,255,0.35)] clip-corner-both p-6 md:p-8 text-center overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-950 border border-violet-400/50 text-violet-300 font-tech text-xs tracking-widest uppercase mb-3">
          <Swords className="w-3.5 h-3.5" />
          Raid Clear Confirmed
        </div>

        {/* Title */}
        <h2 className="font-hud text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-violet-200 to-violet-400 tracking-tight drop-shadow-[0_0_15px_rgba(123,92,255,0.6)]">
          GATE CLEARED!
        </h2>
        <p className="font-tech text-slate-300 text-sm tracking-wider mt-1 truncate">
          {workout.dungeonName}
        </p>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3 bg-black/60 border border-slate-700/60 text-left">
            <span className="block font-tech text-[11px] text-slate-400 uppercase">Total Volume Lifted</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-hud text-xl font-bold text-cyan-300">
                {workout.totalVolumeKg.toLocaleString()}
              </span>
              <span className="font-tech text-xs text-slate-400">KG</span>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-slate-700/60 text-left">
            <span className="block font-tech text-[11px] text-slate-400 uppercase">XP Extraction</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-hud text-xl font-bold text-amber-300">
                +{workout.xpGained}
              </span>
              <span className="font-tech text-xs text-slate-400">XP</span>
            </div>
          </div>
        </div>

        {/* Loot Drop Section */}
        {loot && (
          <div className="mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="font-tech text-xs uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Dungeon Loot Extracted
              </span>
              <span className="font-hud text-[11px] text-amber-400 uppercase tracking-wider">
                {loot.rarity} DROP
              </span>
            </div>

            <div className={`p-4 border rounded-none flex items-start gap-3.5 ${rarityColor}`}>
              <div className="w-10 h-10 rounded-sm bg-black/60 flex items-center justify-center border border-white/10 shrink-0">
                {loot.type === 'key' ? (
                  <Key className="w-5 h-5 text-cyan-400" />
                ) : loot.type === 'title' ? (
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-violet-400" />
                )}
              </div>
              <div>
                <h4 className="font-hud text-sm font-bold tracking-wide text-white">
                  {loot.name}
                </h4>
                <p className="font-sans text-xs text-slate-300 mt-1 leading-relaxed">
                  {loot.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Claim Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-hud font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(123,92,255,0.5)] clip-hex-btn active:scale-95"
        >
          Collect Rewards & Resume
        </button>
      </div>
    </div>
  );
};
