import React, { useState } from 'react';
import {
  Swords,
  Plus,
  Trash2,
  Check,
  Timer,
  Trophy,
  Dumbbell,
  Flame,
  ChevronDown,
  Sparkles,
  Zap,
  Camera,
} from 'lucide-react';
import { Rank, WorkoutExercise, ExerciseSet } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { GlassCard } from '../components/common/GlassCard';
import { soundFx } from '../utils/audio';

const PRESET_EXERCISES = [
  { name: 'Barbell Bench Press', category: 'Chest' as const },
  { name: 'Incline Dumbbell Press', category: 'Chest' as const },
  { name: 'Barbell Back Squat', category: 'Legs' as const },
  { name: 'Romanian Deadlift', category: 'Legs' as const },
  { name: 'Deadlift (Conventional)', category: 'Back' as const },
  { name: 'Weighted Pull-ups', category: 'Back' as const },
  { name: 'Barbell Overhead Press', category: 'Shoulders' as const },
  { name: 'Dumbbell Lateral Raises', category: 'Shoulders' as const },
  { name: 'Barbell Bicep Curls', category: 'Arms' as const },
  { name: 'Tricep Rope Pushdown', category: 'Arms' as const },
  { name: 'Hanging Leg Raises', category: 'Core' as const },
];

export const WorkoutView: React.FC = () => {
  const [state, actions] = usePlayerStore();
  const { workouts, player } = state;

  // Active workout state
  const [isLoggingActive, setIsLoggingActive] = useState(false);
  const [dungeonName, setDungeonName] = useState('B-Rank Fortress: Shadow Crucible');
  const [gateRank, setGateRank] = useState<Rank>('B');
  const [duration, setDuration] = useState(45);
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([
    {
      id: 'ex-1',
      name: 'Barbell Back Squat',
      category: 'Legs',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 80, completed: true },
        { setNumber: 2, reps: 8, weightKg: 95, completed: true },
        { setNumber: 3, reps: 6, weightKg: 105, completed: false },
      ],
    },
    {
      id: 'ex-2',
      name: 'Barbell Bench Press',
      category: 'Chest',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 70, completed: true },
        { setNumber: 2, reps: 8, weightKg: 80, completed: false },
      ],
    },
  ]);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Toggle set completed
  const handleToggleSet = (exerciseId: string, setIdx: number) => {
    soundFx.playClick();
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const nextSets = ex.sets.map((s, idx) =>
          idx === setIdx ? { ...s, completed: !s.completed } : s
        );
        return { ...ex, sets: nextSets };
      })
    );
  };

  // Add a new set to an exercise
  const handleAddSet = (exerciseId: string) => {
    soundFx.playClick();
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: ExerciseSet = {
          setNumber: ex.sets.length + 1,
          reps: lastSet ? lastSet.reps : 10,
          weightKg: lastSet ? lastSet.weightKg : 50,
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      })
    );
  };

  // Add new exercise
  const handleAddExercise = (name: string, category: WorkoutExercise['category']) => {
    soundFx.playClick();
    const newEx: WorkoutExercise = {
      id: 'ex-' + Date.now(),
      name,
      category,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 60, completed: false },
        { setNumber: 2, reps: 10, weightKg: 60, completed: false },
        { setNumber: 3, reps: 8, weightKg: 65, completed: false },
      ],
    };
    setActiveExercises((prev) => [...prev, newEx]);
  };

  // Update set values
  const handleUpdateSet = (
    exerciseId: string,
    setIdx: number,
    field: 'reps' | 'weightKg',
    value: number
  ) => {
    setActiveExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const nextSets = ex.sets.map((s, idx) =>
          idx === setIdx ? { ...s, [field]: Math.max(0, value) } : s
        );
        return { ...ex, sets: nextSets };
      })
    );
  };

  // Remove exercise
  const handleRemoveExercise = (exerciseId: string) => {
    soundFx.playClick();
    setActiveExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  // Complete & clear dungeon
  const handleFinishWorkout = () => {
    actions.logWorkout({
      dungeonName,
      gateRank,
      durationMinutes: duration,
      totalVolumeKg: 0, // auto-calculated inside store
      exercises: activeExercises,
    });
    setIsLoggingActive(false);
  };

  // Calculate live volume
  const currentVolume = activeExercises.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((setTotal, s) => {
        return setTotal + (s.completed ? s.reps * s.weightKg : 0);
      }, 0)
    );
  }, 0);

  // Progressive overload power level calculation
  const totalRaidVolumeAllTime = workouts.reduce((sum, w) => sum + w.totalVolumeKg, 0);
  const powerLevel = Math.round(player.stats.STR * 15 + totalRaidVolumeAllTime / 100);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <GlassCard variant="violet" cornerCut="both" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Swords className="w-4 h-4 text-violet-400" />
              <span className="font-tech text-xs tracking-widest text-violet-300 uppercase">
                DUNGEON RAID COMMAND CENTER
              </span>
            </div>
            <h2 className="font-hud text-2xl font-black text-white">
              Power Level: <span className="text-cyan-400 drop-shadow-[0_0_8px_#00D4FF]">{powerLevel}</span>
            </h2>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Every completed set chips away at gate barriers and triggers weapon / cosmetic loot drops.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => actions.openAIRepTracker('workout')}
              className="px-4 py-3 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-hud text-xs font-black tracking-widest uppercase transition-all clip-hex-btn shadow-[0_0_15px_rgba(0,212,255,0.3)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>AI Push-up Scanner</span>
            </button>

            <button
              onClick={() => setIsLoggingActive(!isLoggingActive)}
              className={`px-5 py-3 font-hud text-xs font-black tracking-widest uppercase transition-all clip-hex-btn shadow-lg flex items-center justify-center gap-2 ${
                isLoggingActive
                  ? 'bg-rose-900/80 border border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(255,59,92,0.4)]'
                  : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(123,92,255,0.4)]'
              }`}
            >
              {isLoggingActive ? (
                <>Collapse Active Raid</>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Enter New Gate Raid
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Active Workout Logger View */}
      {isLoggingActive && (
        <GlassCard variant="cyan" cornerCut="both" className="p-5 border-cyan-400/50 space-y-6">
          {/* Dungeon Name & Gate Rank Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-cyan-500/20 pb-4">
            <div className="sm:col-span-2">
              <label className="block font-tech text-xs text-slate-300 uppercase mb-1">
                Dungeon Gate Designation
              </label>
              <input
                type="text"
                value={dungeonName}
                onChange={(e) => setDungeonName(e.target.value)}
                className="w-full bg-black/60 border border-cyan-500/30 px-3 py-2 text-sm font-hud text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-tech text-xs text-slate-300 uppercase mb-1">
                Gate Threat Rank
              </label>
              <select
                value={gateRank}
                onChange={(e) => setGateRank(e.target.value as Rank)}
                className="w-full bg-black/60 border border-cyan-500/30 px-3 py-2 text-sm font-hud text-white focus:outline-none focus:border-cyan-400"
              >
                {(['E', 'D', 'C', 'B', 'A', 'S'] as Rank[]).map((r) => (
                  <option key={r} value={r}>
                    {r}-Rank Gate
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Ticker Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-black/50 border border-slate-800">
            <div>
              <span className="font-tech text-[11px] text-slate-400 uppercase block">Active Volume Lifted</span>
              <span className="font-hud text-xl text-cyan-300 font-bold">
                {currentVolume.toLocaleString()} <span className="text-xs text-slate-400">KG</span>
              </span>
            </div>
            <div>
              <span className="font-tech text-[11px] text-slate-400 uppercase block">Est. XP Yield</span>
              <span className="font-hud text-xl text-amber-300 font-bold">
                +{Math.round(200 + currentVolume / 30)} <span className="text-xs text-slate-400">XP</span>
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
              <span className="font-tech text-[11px] text-slate-400 uppercase">Rest: {timerSeconds}s</span>
              <button
                onClick={() => setTimerSeconds((prev) => (prev <= 30 ? 90 : prev - 30))}
                className="px-2 py-1 bg-slate-800 border border-slate-700 text-xs font-hud text-slate-300"
              >
                Reset 90s
              </button>
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-4">
            {activeExercises.map((exercise, exIdx) => (
              <div
                key={exercise.id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-none clip-corner-br"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-none bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-hud text-xs flex items-center justify-center font-bold">
                      {exIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-hud text-sm font-bold text-white tracking-wide">
                        {exercise.name}
                      </h4>
                      <span className="font-tech text-[10px] text-slate-400 uppercase">
                        {exercise.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sets Header */}
                <div className="grid grid-cols-12 gap-2 text-[11px] font-tech text-slate-400 uppercase px-1 mb-1.5">
                  <span className="col-span-2 text-center">Set</span>
                  <span className="col-span-4 text-center">Weight (KG)</span>
                  <span className="col-span-4 text-center">Reps</span>
                  <span className="col-span-2 text-center">Clear</span>
                </div>

                {/* Sets rows */}
                <div className="space-y-2">
                  {exercise.sets.map((set, setIdx) => (
                    <div
                      key={set.setNumber}
                      className={`grid grid-cols-12 gap-2 items-center p-1.5 border transition-colors ${
                        set.completed
                          ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-200'
                          : 'bg-black/40 border-slate-800'
                      }`}
                    >
                      <span className="col-span-2 text-center font-hud text-xs font-bold text-slate-400">
                        {set.setNumber}
                      </span>
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.weightKg}
                          onChange={(e) =>
                            handleUpdateSet(exercise.id, setIdx, 'weightKg', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-black/60 border border-slate-700 text-center font-hud text-xs py-1 text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            handleUpdateSet(exercise.id, setIdx, 'reps', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full bg-black/60 border border-slate-700 text-center font-hud text-xs py-1 text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => handleToggleSet(exercise.id, setIdx)}
                          className={`w-7 h-7 rounded-none border flex items-center justify-center transition-all ${
                            set.completed
                              ? 'bg-cyan-500 border-cyan-400 text-black font-bold shadow-[0_0_8px_#00D4FF]'
                              : 'bg-black/60 border-slate-700 text-slate-500 hover:border-cyan-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddSet(exercise.id)}
                  className="mt-2.5 w-full py-1.5 bg-black/40 border border-dashed border-slate-700 hover:border-cyan-400/60 font-tech text-xs text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Set
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Presets Bar */}
          <div className="space-y-2">
            <span className="font-tech text-xs uppercase tracking-wider text-slate-400 block">
              Spawn Target Exercise
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EXERCISES.slice(0, 6).map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleAddExercise(preset.name, preset.category)}
                  className="px-2.5 py-1 bg-black/60 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 font-tech text-xs text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Complete Dungeon Button */}
          <button
            onClick={handleFinishWorkout}
            disabled={currentVolume === 0}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-50 text-white font-hud font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(0,212,255,0.5)] clip-hex-btn flex items-center justify-center gap-2 active:scale-95"
          >
            <Trophy className="w-5 h-5 text-amber-300" />
            <span>CONQUER DUNGEON & EXTRACT LOOT</span>
          </button>
        </GlassCard>
      )}

      {/* Hunter Raid History / Past Dungeons Cleared */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-hud text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-cyan-400" />
            Hunter Raid Log
          </h3>
          <span className="font-tech text-xs text-slate-400">
            {workouts.length} Cleared Gate{workouts.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="space-y-3">
          {workouts.map((workout) => (
            <GlassCard key={workout.id} variant="default" className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-hud text-xs px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                      {workout.gateRank}-RANK
                    </span>
                    <h4 className="font-hud text-sm font-bold text-white">
                      {workout.dungeonName}
                    </h4>
                  </div>
                  <span className="font-tech text-xs text-slate-400 mt-0.5 block">
                    {workout.date} • Duration: {workout.durationMinutes}m
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-hud text-base font-bold text-cyan-300">
                    {workout.totalVolumeKg.toLocaleString()} KG
                  </span>
                  <span className="font-tech text-[11px] text-amber-400 block">
                    +{workout.xpGained} XP
                  </span>
                </div>
              </div>

              {/* Exercises Summary */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {workout.exercises.map((ex) => (
                  <span
                    key={ex.id}
                    className="px-2 py-0.5 bg-black/40 border border-slate-800 font-tech text-[11px] text-slate-300"
                  >
                    {ex.name} ({ex.sets.length} sets)
                  </span>
                ))}
              </div>

              {/* Spoils loot tag if earned */}
              {workout.lootEarned && (
                <div className="p-2 bg-slate-900/60 border border-violet-500/30 flex items-center gap-2 text-xs font-tech text-violet-300">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Spoil Extracted: <strong>{workout.lootEarned.name}</strong></span>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
