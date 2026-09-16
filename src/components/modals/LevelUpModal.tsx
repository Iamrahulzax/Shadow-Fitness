import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowUpRight, Zap, Shield, Crown } from 'lucide-react';
import { LevelUpPayload } from '../../store/usePlayerStore';

interface LevelUpModalProps {
  info: LevelUpPayload | null;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ info, onClose }) => {
  useEffect(() => {
    // Fire festive cinematic blue and cyan particles
    try {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#00D4FF', '#5B7FFF', '#7B5CFF', '#FFFFFF'],
      });
    } catch {
      // ignore
    }
  }, []);

  if (!info) return null;

  const isRankUp = info.newRank !== info.oldRank;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background Radial Flare */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.25)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0A0A10] border-2 border-cyan-400 shadow-[0_0_50px_rgba(0,212,255,0.4)] clip-corner-both p-6 md:p-8 text-center overflow-hidden">
        {/* Animated Scanlines */}
        <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

        {/* Top Alert Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950 border border-cyan-400/60 text-cyan-300 font-tech text-xs tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          System Awakening Alert
        </div>

        {/* Level Up Announcement */}
        <h2 className="font-hud text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 tracking-tight drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]">
          LEVEL UP!
        </h2>
        <p className="font-tech text-slate-300 text-sm tracking-wider uppercase mt-1">
          Your vessel has accommodated higher spiritual density
        </p>

        {/* Level Transition Badge */}
        <div className="my-6 py-4 px-6 bg-black/60 border border-cyan-500/30 rounded-none flex items-center justify-center gap-6">
          <div className="text-center">
            <span className="block font-tech text-xs text-slate-400 uppercase">Previous</span>
            <span className="font-hud text-3xl text-slate-400 font-bold">LV. {info.oldLevel}</span>
          </div>

          <ArrowUpRight className="w-8 h-8 text-cyan-400 animate-pulse" />

          <div className="text-center">
            <span className="block font-tech text-xs text-cyan-300 uppercase">Ascended</span>
            <span className="font-hud text-4xl text-cyan-400 font-black drop-shadow-[0_0_12px_#00D4FF]">
              LV. {info.newLevel}
            </span>
          </div>
        </div>

        {/* Rank Up Notification if rank tier progressed */}
        {isRankUp && (
          <div className="mb-5 p-3 bg-amber-950/40 border border-amber-400/50 flex items-center justify-center gap-2 text-amber-300 font-tech text-sm tracking-wider">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>
              HUNTER RANK ADVANCEMENT:{' '}
              <strong className="font-hud text-white font-bold">{info.oldRank} → {info.newRank} RANK</strong>
            </span>
          </div>
        )}

        {/* Rewards Received */}
        <div className="space-y-2 mb-6 text-left">
          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-700/60 font-tech text-xs tracking-wider">
            <span className="flex items-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-cyan-400" /> Free Ability Points (AP)
            </span>
            <span className="font-hud text-cyan-300 font-bold text-sm">+{info.gainedAP} AP</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-700/60 font-tech text-xs tracking-wider">
            <span className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-violet-400" /> Maximum Vitality & Mana
            </span>
            <span className="font-hud text-violet-300 font-bold text-sm">Fully Restored</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-hud font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(0,212,255,0.6)] clip-hex-btn active:scale-95"
        >
          Acknowledge & Allocate Stats
        </button>
      </div>
    </div>
  );
};
