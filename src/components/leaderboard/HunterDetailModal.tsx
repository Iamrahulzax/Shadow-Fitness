import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Trophy,
  Dumbbell,
  Flame,
  Footprints,
  Shield,
  Heart,
  ExternalLink,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { HunterLeaderboardEntry } from '../../types/leaderboard';
import { AVATAR_PRESETS } from '../modals/EditProfileModal';
import { isPhotoAvatar } from '../../utils/image';
import { soundFx } from '../../utils/audio';

interface HunterDetailModalProps {
  hunter: HunterLeaderboardEntry | null;
  onClose: () => void;
  onRespect: (hunterId: string) => void;
  hasRespected: boolean;
  isGhostRival: boolean;
  onToggleGhostRival: (hunterId: string) => void;
}

export const HunterDetailModal: React.FC<HunterDetailModalProps> = ({
  hunter,
  onClose,
  onRespect,
  hasRespected,
  isGhostRival,
  onToggleGhostRival,
}) => {
  const [manaBurst, setManaBurst] = useState(false);

  if (!hunter) return null;

  const rankColor = {
    E: 'text-slate-400 border-slate-600 bg-slate-900/80',
    D: 'text-cyan-400 border-cyan-500 bg-cyan-950/80',
    C: 'text-emerald-400 border-emerald-500 bg-emerald-950/80',
    B: 'text-indigo-400 border-indigo-500 bg-indigo-950/80',
    A: 'text-purple-400 border-purple-500 bg-purple-950/80',
    S: 'text-amber-400 border-amber-500 bg-amber-950/80',
    National: 'text-rose-400 border-rose-500 bg-rose-950/80',
  }[hunter.rank];

  const avatarPreset =
    AVATAR_PRESETS.find((p) => p.id === hunter.avatar) || AVATAR_PRESETS[0];
  const Icon = avatarPreset.icon;
  const isCustomPhoto = isPhotoAvatar(hunter.avatar);

  const handleSendMana = () => {
    soundFx.playManaSent();
    setManaBurst(true);
    onRespect(hunter.id);
    setTimeout(() => setManaBurst(false), 900);
  };

  const handleToggleRival = () => {
    soundFx.playClick();
    onToggleGhostRival(hunter.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0A0B12] border-2 border-cyan-500/60 p-5 sm:p-7 clip-corner-both shadow-[0_0_40px_rgba(0,212,255,0.35)] overflow-hidden">
        {/* Holographic scanner top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/25 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
            <h3 className="font-hud text-xs sm:text-sm font-black tracking-widest text-cyan-300 uppercase">
              HUNTER ASSOCIATION • OFFICIAL DOSSIER
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity & Rank Badge */}
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar Frame */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 border-2 border-cyan-400 bg-black/80 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            {isCustomPhoto ? (
              <img
                src={hunter.avatar}
                alt={hunter.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon className={`w-9 h-9 sm:w-11 sm:h-11 ${avatarPreset.textColor}`} />
            )}
            <span className={`absolute -bottom-2 -right-2 px-1.5 py-0.5 text-[9px] font-hud font-black border ${rankColor}`}>
              {hunter.rank}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-hud text-lg sm:text-xl font-black text-white tracking-wide truncate">
                {hunter.name}
              </h2>
              {hunter.isPlayer && (
                <span className="px-1.5 py-0.5 bg-cyan-500 text-black font-hud text-[9px] font-black uppercase">
                  YOU
                </span>
              )}
            </div>

            <p className="font-tech text-xs text-violet-300 tracking-wider uppercase mt-0.5">
              Title: {hunter.title}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="font-tech text-[11px] px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-sm">
                Guild: {hunter.guild}
              </span>
              <span className="font-tech text-[11px] px-2 py-0.5 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 rounded-sm">
                Class: {hunter.hunterClass}
              </span>
              <span className="font-hud text-[11px] text-amber-400 font-bold">
                LV. {hunter.level}
              </span>
            </div>
          </div>
        </div>

        {/* Bio / Hunter Oath */}
        {hunter.bio && (
          <div className="mb-5 p-3 bg-black/50 border-l-2 border-cyan-400 font-sans text-xs italic text-slate-300">
            "{hunter.bio}"
          </div>
        )}

        {/* Grid of Hunter Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <div className="p-2.5 bg-black/60 border border-cyan-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-tech text-[10px] uppercase">Power Rating</span>
            </div>
            <div className="font-hud text-sm font-black text-white">
              {hunter.powerRating.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 bg-black/60 border border-rose-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-400 mb-1">
              <Dumbbell className="w-3.5 h-3.5" />
              <span className="font-tech text-[10px] uppercase">Total Volume</span>
            </div>
            <div className="font-hud text-sm font-black text-white">
              {hunter.workoutVolumeKg.toLocaleString()} <span className="text-[10px] text-slate-400">kg</span>
            </div>
          </div>

          <div className="p-2.5 bg-black/60 border border-violet-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-violet-400 mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span className="font-tech text-[10px] uppercase">Gate Streak</span>
            </div>
            <div className="font-hud text-sm font-black text-white">
              {hunter.streakDays} <span className="text-[10px] text-slate-400">days</span>
            </div>
          </div>

          <div className="p-2.5 bg-black/60 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <Footprints className="w-3.5 h-3.5" />
              <span className="font-tech text-[10px] uppercase">Dungeon Floor</span>
            </div>
            <div className="font-hud text-sm font-black text-white">
              F.{hunter.dungeonFloor}
            </div>
          </div>
        </div>

        {/* Detailed Attributes Breakdown */}
        <div className="space-y-2 mb-5 p-3.5 bg-black/40 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-hud text-[11px] font-bold uppercase text-slate-300">
              Assigned Attribute Matrix
            </span>
            <span className="font-tech text-[10px] text-cyan-400">Verified System Data</span>
          </div>

          {(['STR', 'VIT', 'AGI', 'INT', 'PER'] as const).map((statKey) => {
            const val = hunter.stats[statKey] || 50;
            const maxVal = Math.max(350, val);
            const pct = Math.min(100, Math.round((val / maxVal) * 100));

            return (
              <div key={statKey} className="flex items-center gap-2 text-xs">
                <span className="font-hud font-bold w-9 text-slate-300 text-[11px]">
                  {statKey}
                </span>
                <div className="flex-1 h-2 bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-tech font-bold text-cyan-300 w-10 text-right">
                  {val}
                </span>
              </div>
            );
          })}
        </div>

        {/* Best Lift & Accomplishment */}
        <div className="space-y-2 mb-6 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800">
            <span className="font-tech text-slate-400 uppercase">PR Milestone:</span>
            <span className="font-hud text-cyan-300 font-bold">{hunter.bestLift}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800">
            <span className="font-tech text-slate-400 uppercase">Notable Feat:</span>
            <span className="font-tech text-amber-300 font-bold text-right truncate max-w-[260px]">
              {hunter.recentFeat}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3">
          {/* Send Mana Button */}
          <button
            onClick={handleSendMana}
            disabled={hasRespected}
            className={`relative flex-1 py-2.5 px-4 font-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
              hasRespected
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 cursor-default'
                : 'bg-gradient-to-r from-rose-900/80 to-purple-900/80 border-rose-400 text-white hover:brightness-110 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95'
            }`}
          >
            <Heart className={`w-4 h-4 text-rose-400 ${manaBurst ? 'scale-150 animate-ping' : ''}`} />
            <span>
              {hasRespected ? `Mana Sent (${hunter.respectCount})` : `Send Mana (${hunter.respectCount})`}
            </span>
          </button>

          {/* Set Ghost Rival Button */}
          {!hunter.isPlayer && (
            <button
              onClick={handleToggleRival}
              className={`py-2.5 px-4 font-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                isGhostRival
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50'
              }`}
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>{isGhostRival ? 'Active Rival' : 'Track as Rival'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white font-hud text-xs uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
