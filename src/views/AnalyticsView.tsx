import React, { useState } from 'react';
import {
  LineChart,
  TrendingUp,
  Footprints,
  Moon,
  Zap,
  Activity,
  Award,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { GlassCard } from '../components/common/GlassCard';
import { StatRadarChart } from '../components/common/StatRadarChart';
import { HUDBar } from '../components/common/HUDBar';

export const AnalyticsView: React.FC = () => {
  const [state, actions] = usePlayerStore();
  const { player, sleep, steps, workouts } = state;

  const [stepsInput, setStepsInput] = useState(1500);
  const [sleepInput, setSleepInput] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState<'Restful' | 'Average' | 'Restless'>('Restful');
  const [logStatus, setLogStatus] = useState<string | null>(null);
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');

  const handleLogSteps = (e: React.FormEvent) => {
    e.preventDefault();
    actions.addSteps(Number(stepsInput));
    setLogStatus(`Logged +${stepsInput.toLocaleString()} steps! Dungeon floor progress updated.`);
    setTimeout(() => setLogStatus(null), 3000);
  };

  const handleLogSleep = (e: React.FormEvent) => {
    e.preventDefault();
    actions.logSleep(Number(sleepInput), sleepQuality);
    setLogStatus(`Vitality Sleep Chamber recorded: ${sleepInput}h (${sleepQuality})!`);
    setTimeout(() => setLogStatus(null), 3000);
  };

  // Dynamic progressive overload power calculation
  const totalRaidVolume = workouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
  const currentPower = Math.round(
    player.level * 1000 +
    player.stats.STR * 35 +
    player.stats.VIT * 25 +
    player.stats.AGI * 25 +
    player.stats.INT * 20 +
    player.stats.PER * 30 +
    totalRaidVolume * 0.4
  );

  const powerTrend = trendRange === '7d' ? [
    { day: 'Mon', power: Math.max(100, Math.round(currentPower * 0.76)) },
    { day: 'Tue', power: Math.max(120, Math.round(currentPower * 0.81)) },
    { day: 'Wed', power: Math.max(140, Math.round(currentPower * 0.85)) },
    { day: 'Thu', power: Math.max(160, Math.round(currentPower * 0.89)) },
    { day: 'Fri', power: Math.max(180, Math.round(currentPower * 0.93)) },
    { day: 'Sat', power: Math.max(190, Math.round(currentPower * 0.97)) },
    { day: 'Today', power: currentPower },
  ] : [
    { day: 'W1', power: Math.max(100, Math.round(currentPower * 0.65)) },
    { day: 'W2', power: Math.max(120, Math.round(currentPower * 0.75)) },
    { day: 'W3', power: Math.max(140, Math.round(currentPower * 0.86)) },
    { day: 'W4', power: currentPower },
  ];

  const maxPower = Math.max(...powerTrend.map((p) => p.power));

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <GlassCard variant="cyan" cornerCut="both" className="p-4 sm:p-5">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="font-hud text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
              Physical Resonance & Power Telemetry
            </h2>
          </div>
          <span className="font-tech text-[10px] sm:text-xs text-cyan-300">Biometric Sync Active</span>
        </div>
        <p className="font-sans text-xs text-slate-300">
          Analyze progressive overload trajectories, dungeon floor penetration depths, and recovery circle cycles.
        </p>

        {logStatus && (
          <div className="mt-3 p-2.5 bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-xs font-tech flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="break-words">{logStatus}</span>
          </div>
        )}
      </GlassCard>

      {/* Signature 5-Stat Status Radar Hero */}
      <GlassCard variant="cyan" className="p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 mb-4 border-b border-cyan-500/20 pb-2">
          <h3 className="font-hud text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            Hero 5-Stat Pentagon Matrix
          </h3>
          <span className="font-tech text-xs text-slate-400">
            Total Points: {Object.values(player.stats).reduce((a, b) => a + b, 0)}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          <StatRadarChart stats={player.stats} />

          {/* Stat Breakdowns */}
          <div className="w-full md:w-64 space-y-2 font-tech text-xs">
            <div className="p-2 bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">STR (Strength Volume)</span>
              <span className="font-hud text-cyan-400 font-bold">{player.stats.STR}</span>
            </div>
            <div className="p-2 bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">VIT (Vitality & Sleep)</span>
              <span className="font-hud text-emerald-400 font-bold">{player.stats.VIT}</span>
            </div>
            <div className="p-2 bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">AGI (Agility & Traversal)</span>
              <span className="font-hud text-amber-400 font-bold">{player.stats.AGI}</span>
            </div>
            <div className="p-2 bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">INT (Intelligence & Hydration)</span>
              <span className="font-hud text-cyan-400 font-bold">{player.stats.INT}</span>
            </div>
            <div className="p-2 bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-300">PER (Perception & Discipline)</span>
              <span className="font-hud text-violet-400 font-bold">{player.stats.PER}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Progressive Overload / Power Level Trend Chart */}
      <GlassCard variant="violet" className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-violet-500/20 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400 shrink-0" />
            <h3 className="font-hud text-xs font-bold uppercase tracking-wider text-white">
              Progressive Overload: Hunter Power Trajectory
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-0.5 bg-black/60 border border-violet-500/30 rounded-sm">
              <button
                type="button"
                onClick={() => setTrendRange('7d')}
                className={`px-2 py-0.5 text-[10px] font-hud uppercase transition-colors ${
                  trendRange === '7d'
                    ? 'bg-violet-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTrendRange('30d')}
                className={`px-2 py-0.5 text-[10px] font-hud uppercase transition-colors ${
                  trendRange === '30d'
                    ? 'bg-violet-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4 Weeks
              </button>
            </div>
            <span className="font-hud text-xs text-cyan-300 font-bold">{currentPower.toLocaleString()} PWR</span>
          </div>
        </div>

        {/* Custom Glowing SVG Bar / Trend Visual */}
        <div className="h-44 w-full flex items-end justify-between gap-1 sm:gap-2 pt-6 px-1 sm:px-2 overflow-x-auto mobile-scroll-container">
          {powerTrend.map((item) => {
            const heightPct = Math.round((item.power / maxPower) * 100);
            return (
              <div key={item.day} className="flex-1 min-w-[32px] flex flex-col items-center gap-1.5 sm:gap-2 h-full justify-end">
                <span className="font-hud text-[9px] sm:text-[10px] text-cyan-300 font-bold truncate max-w-full">{item.power}</span>
                <div className="w-full bg-slate-900 border border-violet-500/30 overflow-hidden relative h-full max-h-28">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 via-violet-500 to-cyan-400 shadow-[0_0_10px_rgba(123,92,255,0.6)] absolute bottom-0 transition-all duration-700"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="font-tech text-[9px] sm:text-[10px] text-slate-400 uppercase">{item.day}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Steps & Dungeon Floor Penetration + Sleep Recovery Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Steps Dungeon Traversal */}
        <GlassCard variant="cyan" className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-cyan-400 shrink-0" />
              <h3 className="font-hud text-xs font-bold text-white uppercase tracking-wider">
                Dungeon Traversal: Floor {steps.dungeonFloor}
              </h3>
            </div>
            <span className="font-tech text-xs text-cyan-300">
              {steps.distanceKm} KM Traversed
            </span>
          </div>

          <HUDBar
            current={steps.currentSteps}
            max={steps.targetSteps}
            label="Daily Stride Progress"
            unit="Steps"
            variant="cyan"
            size="md"
            showPercentage
          />

          {/* Quick Steps Logging Form */}
          <form onSubmit={handleLogSteps} className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-1">
            <input
              type="number"
              step="500"
              value={stepsInput}
              onChange={(e) => setStepsInput(Number(e.target.value))}
              className="flex-1 min-w-0 bg-black/60 border border-slate-700 px-3 py-2 sm:py-1.5 text-xs text-white font-hud focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-2 sm:py-1.5 bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-cyan-900 touch-target shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Traverse Steps
            </button>
          </form>

          {/* Lore Unlocked in Dungeon */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="font-tech text-[10px] text-slate-400 uppercase block">Floor Rune Archives</span>
            {steps.loreDiscovered.slice(-2).map((lore, idx) => (
              <p key={idx} className="font-sans text-[11px] text-slate-300 italic bg-black/30 p-2 border border-slate-800">
                "{lore}"
              </p>
            ))}
          </div>
        </GlassCard>

        {/* Sleep & Vitality Recovery Chamber */}
        <GlassCard variant={sleep.debuffActive ? 'danger' : 'emerald'} className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className={`w-4 h-4 ${sleep.debuffActive ? 'text-rose-400' : 'text-emerald-400'}`} />
              <h3 className="font-hud text-xs font-bold text-white uppercase tracking-wider">
                Vitality Sleep Chamber
              </h3>
            </div>
            <span className={`font-tech text-xs ${sleep.debuffActive ? 'text-rose-400' : 'text-emerald-300'}`}>
              {sleep.hours}h / {sleep.targetHours}h ({sleep.recoveryPercentage}% Rest)
            </span>
          </div>

          <HUDBar
            current={sleep.recoveryPercentage}
            max={100}
            label="Cellular Recovery Rating"
            variant={sleep.debuffActive ? 'rose' : 'emerald'}
            size="md"
            sublabel={sleep.quality}
          />

          {sleep.debuffActive && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 text-rose-300 font-tech text-xs flex items-center gap-2">
              <span>⚠️ Physical Fatigue Debuff: VIT temporarily penalized (-2). Rest 7+ hours tonight to cleanse debuff.</span>
            </div>
          )}

          {/* Log Sleep Form */}
          <form onSubmit={handleLogSleep} className="space-y-2 pt-1">
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              <input
                type="number"
                step="0.5"
                value={sleepInput}
                onChange={(e) => setSleepInput(Number(e.target.value))}
                className="bg-black/60 border border-slate-700 px-3 py-2 sm:py-1.5 text-xs text-white font-hud focus:outline-none focus:border-emerald-400"
              />
              <select
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value as typeof sleepQuality)}
                className="bg-black/60 border border-slate-700 px-2 py-2 sm:py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Restful">Restful (Deep Cryo)</option>
                <option value="Average">Average</option>
                <option value="Restless">Restless (Interrupted)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-1.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-hud text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 touch-target"
            >
              Update Recovery Chamber Log
            </button>
          </form>
        </GlassCard>
      </div>

      {/* Demo Controls & Stat Reset */}
      <GlassCard variant="default" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="font-hud text-xs font-bold text-white uppercase">
            Hunter Protocol Controls
          </h4>
          <p className="font-sans text-[11px] text-slate-400">
            Reset local test records or restore pristine seeded sample data.
          </p>
        </div>

        <button
          onClick={() => actions.resetDemoData()}
          className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-500 text-xs font-tech uppercase text-slate-300 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-seed Sample Hunter Data
        </button>
      </GlassCard>
    </div>
  );
};
