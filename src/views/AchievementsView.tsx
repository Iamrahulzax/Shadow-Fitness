import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Award,
  Crown,
  Check,
  Flame,
  Shield,
  Zap,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { GlassCard } from '../components/common/GlassCard';
import { HUDBar } from '../components/common/HUDBar';

export const AchievementsView: React.FC = () => {
  const [state, actions] = usePlayerStore();
  const { achievements, player, workouts, steps } = state;
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const filteredAchievements = achievements.filter((item) => {
    if (activeFilter === 'unlocked') return item.unlocked;
    if (activeFilter === 'locked') return !item.unlocked;
    return true;
  });

  // Calculate live progress for locked achievements
  const getAchievementProgress = (achId: string) => {
    switch (achId) {
      case 'ach-1': {
        const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
        return { current: totalVolume, target: 50000, unit: 'kg' };
      }
      case 'ach-2':
        return { current: player.streakDays, target: 10, unit: 'days' };
      case 'ach-3':
        return { current: steps.currentSteps, target: 70000, unit: 'steps' };
      case 'ach-4':
        return { current: workouts.length, target: 50, unit: 'raids' };
      case 'ach-5':
        return { current: Math.min(7, player.streakDays), target: 7, unit: 'days' };
      case 'ach-6':
        return { current: player.level, target: 30, unit: 'levels' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <GlassCard variant="violet" cornerCut="both" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              <span className="font-tech text-xs tracking-widest text-violet-300 uppercase">
                SHADOW EXTRACTION VAULT
              </span>
            </div>
            <h2 className="font-hud text-2xl font-black text-white">
              The Monarch's Shadow Army
            </h2>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Command extracted shadow soldiers through monumental feats of physical discipline.
              Equip honorary titles to your hunter license.
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="font-tech text-xs text-slate-400 uppercase block">Extracted Shadows</span>
            <span className="font-hud text-2xl font-black text-cyan-300 drop-shadow-[0_0_8px_#00D4FF]">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
          {[
            { id: 'all', label: `All Shadows (${achievements.length})` },
            { id: 'unlocked', label: `Extracted Soldiers (${unlockedCount})` },
            { id: 'locked', label: `In Dungeon (${achievements.length - unlockedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
              className={`px-3 py-1 font-hud text-xs uppercase tracking-wider transition-all ${
                activeFilter === tab.id
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                  : 'bg-black/50 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Currently Equipped Title Display */}
      <GlassCard variant="gold" className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="font-tech text-[10px] text-amber-400 uppercase tracking-wider block">
              Currently Equipped Hunter Title
            </span>
            <h3 className="font-hud text-base font-bold text-white tracking-wide">
              {player.title}
            </h3>
          </div>
        </div>

        <span className="font-tech text-xs text-slate-400 uppercase px-2.5 py-1 bg-black/40 border border-slate-700">
          Rank {player.rank} Hunter
        </span>
      </GlassCard>

      {/* Shadow Soldiers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((item) => {
          const isEquipped = item.titleReward && player.title === item.titleReward;
          const progress = getAchievementProgress(item.id);
          const isEligibleToExtract =
            !item.unlocked && progress && progress.current >= progress.target;

          return (
            <GlassCard
              key={item.id}
              variant={item.unlocked ? 'cyan' : isEligibleToExtract ? 'gold' : 'default'}
              className={`p-5 transition-all duration-300 relative overflow-hidden ${
                !item.unlocked && !isEligibleToExtract ? 'opacity-75' : ''
              }`}
            >
              {/* Silhouette Watermark for locked */}
              {!item.unlocked && (
                <div className="absolute top-2 right-2 text-slate-700 pointer-events-none">
                  <Lock className="w-6 h-6" />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Avatar / Shadow Crest */}
                <div
                  className={`w-14 h-14 rounded-none border flex items-center justify-center shrink-0 clip-corner-br ${
                    item.unlocked
                      ? 'bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-400/60 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                      : isEligibleToExtract
                      ? 'bg-gradient-to-br from-amber-950 to-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                      : 'bg-black/60 border-slate-800 text-slate-600'
                  }`}
                >
                  {item.unlocked ? (
                    <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
                  ) : isEligibleToExtract ? (
                    <Zap className="w-7 h-7 text-amber-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-hud text-base font-bold text-white truncate">
                      {item.shadowAlias}
                    </h4>
                    <span className="font-tech text-[10px] uppercase px-1.5 py-0.5 bg-black/50 border border-slate-700 text-slate-300">
                      {item.role}
                    </span>
                  </div>

                  <span className="font-tech text-xs text-cyan-300 block mt-0.5">
                    "{item.name}"
                  </span>

                  <p className="font-sans text-xs text-slate-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Locked Shadow Progress Bar */}
                  {!item.unlocked && progress && (
                    <div className="mt-3 pt-2">
                      <HUDBar
                        current={progress.current}
                        max={progress.target}
                        label="Extraction Resonance"
                        variant={isEligibleToExtract ? 'gold' : 'violet'}
                        size="sm"
                        showPercentage
                        unit={progress.unit}
                      />
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-tech text-[10px] text-slate-400 uppercase block">
                        Extraction Requirement
                      </span>
                      <span className="font-tech text-xs text-slate-200">
                        {item.requirement}
                      </span>
                    </div>

                    {/* Title Equip Button or Arise Extract Button */}
                    {item.unlocked && item.titleReward && (
                      <div>
                        {isEquipped ? (
                          <span className="inline-flex items-center gap-1 font-hud text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1">
                            <Check className="w-3 h-3" /> EQUIPPED
                          </span>
                        ) : (
                          <button
                            onClick={() => actions.equipTitle(item.titleReward!)}
                            className="font-hud text-[11px] font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 px-2.5 py-1 transition-colors uppercase tracking-wider"
                          >
                            Equip Title
                          </button>
                        )}
                      </div>
                    )}

                    {/* Extract Button if ready */}
                    {isEligibleToExtract && (
                      <button
                        onClick={() => actions.extractShadow(item.id)}
                        className="px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-hud text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>ARISE • EXTRACT</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
