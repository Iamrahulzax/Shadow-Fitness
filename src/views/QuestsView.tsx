import React, { useState } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  Zap,
  Swords,
  Shield,
  Dumbbell,
  Flame,
  CheckCircle2,
  Circle,
  Skull,
  Trophy,
  Camera,
  Calendar,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { GlassCard } from '../components/common/GlassCard';
import { HUDBar } from '../components/common/HUDBar';

export const QuestsView: React.FC = () => {
  const [state, actions] = usePlayerStore();
  const { quests } = state;
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily_system' | 'daily_habit' | 'weekly_raid'>('all');

  const filteredQuests = quests.filter((q) => {
    if (activeFilter === 'all') return true;
    return q.category === activeFilter;
  });

  // Weekly Raid Boss Metrics
  const raidQuest = quests.find((q) => q.category === 'weekly_raid');
  const bossHpPercent = raidQuest
    ? Math.max(0, 100 - Math.round((raidQuest.current / raidQuest.target) * 100))
    : 30;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Notification Banner */}
      <GlassCard variant="cyan" cornerCut="both" className="p-5">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
            <h2 className="font-hud text-sm font-bold tracking-wider text-white uppercase">
              System Directives & Gate Mandates
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => actions.openStreakCalendar()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 font-hud text-[11px] rounded-sm transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)]"
              title="View Goal Streak Calendar"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{state.player.streakDays}-Day Streak</span>
              <Calendar className="w-3 h-3 text-amber-400 ml-0.5" />
            </button>
            <span className="font-tech text-xs text-cyan-300">
              {quests.filter((q) => q.completed).length} / {quests.length} Completed
            </span>
          </div>

        </div>

        <p className="font-sans text-xs text-slate-300 leading-relaxed">
          Daily and weekly mandates issued by the Hunter System. Completion unlocks substantial XP yields,
          stat advancements, and rare shadow armaments.
        </p>

        {/* Filter Navigation */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
          {[
            { id: 'all', label: 'All Mandates' },
            { id: 'daily_system', label: 'Jinwoo Daily 100s' },
            { id: 'daily_habit', label: 'Habits & Recovery' },
            { id: 'weekly_raid', label: 'Weekly Red Gate' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
              className={`px-3 py-1 font-tech text-xs uppercase tracking-wider rounded-none transition-all ${
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

      {/* AI Push-up Scanner Action Banner */}
      <GlassCard variant="cyan" cornerCut="both" className="p-4 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-violet-950/40 border-cyan-400/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.4)] shrink-0">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-tech text-[10px] px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 uppercase font-bold">
                  AI Computer Vision
                </span>
                <span className="font-hud text-xs text-white font-bold uppercase tracking-wider">
                  Push-up Rep Scanner
                </span>
              </div>
              <p className="font-sans text-xs text-slate-300 mt-0.5">
                Turn on your camera for automatic rep counting, biomechanical elbow angle tracking & form validation.
              </p>
            </div>
          </div>

          <button
            onClick={() => actions.openAIRepTracker('quest')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-hud text-xs font-bold uppercase tracking-widest clip-hex-btn shadow-[0_0_15px_rgba(0,212,255,0.4)] flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Launch AI Scanner</span>
          </button>
        </div>
      </GlassCard>

      {/* Weekly Raid Boss Banner (Red Gate) */}
      {raidQuest && (
        <GlassCard variant="danger" cornerCut="both" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-rose-500 animate-pulse" />
              <div>
                <span className="font-tech text-[10px] text-rose-400 uppercase tracking-widest block">
                  WEEKLY RED GATE BOSS RAID
                </span>
                <h3 className="font-hud text-base font-bold text-white tracking-wide">
                  The Frost Monarch's Vanguard (Ice Elf Warlord)
                </h3>
              </div>
            </div>
            <span className="font-hud text-xs text-rose-400 font-bold">
              Boss HP: {bossHpPercent}%
            </span>
          </div>

          <HUDBar
            current={bossHpPercent}
            max={100}
            variant="rose"
            label="Boss Vitality Barrier"
            sublabel={`${raidQuest.current.toLocaleString()} / ${raidQuest.target.toLocaleString()} kg Volume Dealt`}
            size="md"
          />

          <div className="flex items-center justify-between text-xs font-tech text-slate-300 pt-1">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" /> Reward: +{raidQuest.xpReward} XP + S-Rank Spoil
            </span>
            <span className="text-slate-400">Resets in 3 days</span>
          </div>
        </GlassCard>
      )}

      {/* Quests List */}
      <div className="space-y-3">
        {filteredQuests.map((quest) => {
          const isSystem = quest.category === 'daily_system';

          return (
            <GlassCard
              key={quest.id}
              variant={quest.completed ? 'default' : isSystem ? 'cyan' : 'violet'}
              interactive
              onClick={() => actions.toggleQuest(quest.id)}
              className={`p-4 transition-all duration-300 ${
                quest.completed ? 'opacity-70 bg-black/40' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Checkbox Icon */}
                <div className="mt-0.5 shrink-0">
                  {quest.completed ? (
                    <div className="w-5 h-5 bg-cyan-500 border border-cyan-400 rounded-none flex items-center justify-center text-black font-bold text-xs shadow-[0_0_10px_#00D4FF]">
                      ✓
                    </div>
                  ) : (
                    <div className="w-5 h-5 border border-slate-600 rounded-none hover:border-cyan-400 transition-colors" />
                  )}
                </div>

                {/* Quest Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4
                      className={`font-hud text-sm font-bold truncate ${
                        quest.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {quest.title}
                    </h4>

                    <span className="font-hud text-xs text-amber-300 font-bold shrink-0">
                      +{quest.xpReward} XP
                    </span>
                  </div>

                  <p className="font-sans text-xs text-slate-400 mt-1 leading-relaxed">
                    {quest.description}
                  </p>

                    {/* Progress & Stat Reward Badge */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 font-tech text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Progress:</span>
                        <span className="font-hud text-cyan-300 font-bold">
                          {quest.current} / {quest.target} {quest.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {quest.id === 'q-sys-1' && !quest.completed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.openAIRepTracker('quest');
                            }}
                            className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-hud text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(0,212,255,0.3)] transition-all"
                          >
                            <Camera className="w-3 h-3 text-cyan-400" />
                            <span>AI Track</span>
                          </button>
                        )}

                        {quest.statReward && (
                          <span className="px-2 py-0.5 bg-cyan-950/70 border border-cyan-500/30 text-[11px] font-tech text-cyan-300 uppercase">
                            +1 {quest.statReward} Attribute
                          </span>
                        )}
                      </div>
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
