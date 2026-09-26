import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Dumbbell,
  Footprints,
  Shield,
  Search,
  Users,
  Radio,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Heart,
  ChevronRight,
  Filter,
  RefreshCw,
  Target,
  Zap,
  Swords,
} from 'lucide-react';

import { usePlayerStore } from '../store/usePlayerStore';
import { GlassCard } from '../components/common/GlassCard';
import {
  HunterLeaderboardEntry,
  LeaderboardCategory,
  DivisionFilter,
  LiveActivityEvent,
} from '../types/leaderboard';
import {
  INITIAL_HUNTERS,
  MOCK_ACTIVITY_FEED,
  createPlayerLeaderboardEntry,
  getRankedHunters,
  GUILD_OPTIONS,
} from '../data/leaderboardData';
import { HunterDetailModal } from '../components/leaderboard/HunterDetailModal';
import { AVATAR_PRESETS } from '../components/modals/EditProfileModal';
import { isPhotoAvatar } from '../utils/image';
import { soundFx } from '../utils/audio';

const STORAGE_RESPECT_KEY = 'shadow_fitness_respected_hunters';
const STORAGE_RIVAL_KEY = 'shadow_fitness_ghost_rival_id';

export const LeaderboardView: React.FC = () => {
  const [state, actions] = usePlayerStore();
  const { player, workouts, steps, achievements } = state;

  const [category, setCategory] = useState<LeaderboardCategory>('power');
  const [division, setDivision] = useState<DivisionFilter>('all');
  const [selectedGuild, setSelectedGuild] = useState<string>('All Guilds');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedHunter, setSelectedHunter] = useState<HunterLeaderboardEntry | null>(null);
  const [respectedMap, setRespectedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RESPECT_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [ghostRivalId, setGhostRivalId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_RIVAL_KEY) || null;
    } catch {
      return null;
    }
  });

  // Dynamic simulation state: live ticker events & live hunter volume/power shifts
  const [huntersList, setHuntersList] = useState<HunterLeaderboardEntry[]>(INITIAL_HUNTERS);
  const [activities, setActivities] = useState<LiveActivityEvent[]>(MOCK_ACTIVITY_FEED);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeTickerIndex, setActiveTickerIndex] = useState<number>(0);
  const playerCardRef = useRef<HTMLDivElement | null>(null);

  // Weekly countdown timer mock (resets every Sunday midnight)
  const [timeRemaining, setTimeRemaining] = useState({ days: 2, hours: 14, mins: 38, secs: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        return { days: Math.max(0, prev.days - 1), hours: 23, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate activity ticker every 4.5 seconds
  useEffect(() => {
    const ticker = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % activities.length);
    }, 4500);
    return () => clearInterval(ticker);
  }, [activities.length]);

  // Occasional live simulation: simulated hunter logs a set or gains XP
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Pick random simulated hunter (excluding player)
      setHuntersList((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const hunter = prev[randomIndex];
        const xpBoost = Math.floor(Math.random() * 250) + 50;
        const volumeBoost = Math.floor(Math.random() * 400) + 100;

        const updated = [...prev];
        updated[randomIndex] = {
          ...hunter,
          powerRating: hunter.powerRating + xpBoost,
          workoutVolumeKg: hunter.workoutVolumeKg + volumeBoost,
        };
        return updated;
      });

      // Add a fresh ticker feed event
      const sampleEvents = [
        'crushed 5x5 Heavy Squat session',
        'cleared B-Rank Gate with zero fatigue',
        'logged +1,200kg bench press volume',
        'unlocked 15,000 steps daily raid tier',
        'channeled mana into new compound PR',
      ];
      const randomHunter = huntersList[Math.floor(Math.random() * huntersList.length)];
      const randomText = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];

      const newEvent: LiveActivityEvent = {
        id: `act-${Date.now()}`,
        hunterName: randomHunter.name,
        avatar: randomHunter.avatar,
        rank: randomHunter.rank,
        message: `${randomText} (+${Math.floor(Math.random() * 300 + 100)} XP)`,
        timestamp: 'Just now',
        type: 'gate_clear',
      };

      setActivities((prev) => [newEvent, ...prev.slice(0, 7)]);
    }, 9000);

    return () => clearInterval(interval);
  }, [isSimulating, huntersList]);

  // Construct combined list including player's dynamic entry
  const playerEntry = useMemo(() => {
    return createPlayerLeaderboardEntry(player, workouts, steps, achievements);
  }, [player, workouts, steps, achievements]);

  const allHuntersWithPlayer = useMemo(() => {
    return [playerEntry, ...huntersList];
  }, [playerEntry, huntersList]);

  // Sort and apply filters
  const rankedHunters = useMemo(() => {
    const sorted = getRankedHunters(allHuntersWithPlayer, category);

    return sorted.filter((hunter) => {
      // Guild filter
      if (selectedGuild !== 'All Guilds' && hunter.guild !== selectedGuild) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = hunter.name.toLowerCase().includes(query);
        const matchesTitle = hunter.title.toLowerCase().includes(query);
        const matchesGuild = hunter.guild.toLowerCase().includes(query);
        if (!matchesName && !matchesTitle && !matchesGuild) return false;
      }
      // Division filter
      if (division === 'my_tier') {
        return hunter.rank === player.rank || hunter.isPlayer;
      }
      if (division === 'top10') {
        const top10Ids = new Set(sorted.slice(0, 10).map((h) => h.id));
        return top10Ids.has(hunter.id) || hunter.isPlayer;
      }
      return true;
    });
  }, [allHuntersWithPlayer, category, selectedGuild, searchQuery, division, player.rank]);

  // Find player's current rank in the entire ranked list
  const fullRankedList = useMemo(() => {
    return getRankedHunters(allHuntersWithPlayer, category);
  }, [allHuntersWithPlayer, category]);

  const playerRankIndex = fullRankedList.findIndex((h) => h.isPlayer);
  const playerRankNum = playerRankIndex + 1;
  const rivalAhead = playerRankIndex > 0 ? fullRankedList[playerRankIndex - 1] : null;

  // Respect / Mana Handler
  const handleRespect = (hunterId: string) => {
    setRespectedMap((prev) => {
      const next = { ...prev, [hunterId]: true };
      try {
        localStorage.setItem(STORAGE_RESPECT_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    setHuntersList((prev) =>
      prev.map((h) => (h.id === hunterId ? { ...h, respectCount: h.respectCount + 1 } : h))
    );
  };

  const handleToggleGhostRival = (hunterId: string) => {
    const newId = ghostRivalId === hunterId ? null : hunterId;
    setGhostRivalId(newId);
    try {
      if (newId) localStorage.setItem(STORAGE_RIVAL_KEY, newId);
      else localStorage.removeItem(STORAGE_RIVAL_KEY);
    } catch {
      // Ignore
    }
  };

  const scrollToPlayer = () => {
    soundFx.playClick();
    if (playerCardRef.current) {
      playerCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Top 3 Podium hunters from the sorted list
  const podium = useMemo(() => {
    return {
      first: fullRankedList[0] || null,
      second: fullRankedList[1] || null,
      third: fullRankedList[2] || null,
    };
  }, [fullRankedList]);

  // Metric value formatting helper
  const getMetricDisplay = (hunter: HunterLeaderboardEntry) => {
    switch (category) {
      case 'power':
        return {
          value: hunter.powerRating.toLocaleString(),
          unit: 'PWR',
          label: 'Combat Power',
          icon: Trophy,
          color: 'text-cyan-400',
        };
      case 'volume':
        return {
          value: hunter.workoutVolumeKg.toLocaleString(),
          unit: 'kg',
          label: 'Total Tonnage',
          icon: Dumbbell,
          color: 'text-rose-400',
        };
      case 'streak':
        return {
          value: hunter.streakDays.toString(),
          unit: 'Days',
          label: 'Iron Streak',
          icon: Flame,
          color: 'text-amber-400',
        };
      case 'floor':
        return {
          value: `F.${hunter.dungeonFloor}`,
          unit: '',
          label: 'Dungeon Depth',
          icon: Footprints,
          color: 'text-emerald-400',
        };
      case 'shadows':
        return {
          value: hunter.shadowsCount.toString(),
          unit: 'Soldiers',
          label: 'Shadow Legion',
          icon: Shield,
          color: 'text-purple-400',
        };
    }
  };

  const rankBadgeStyle = (rank: string) => {
    switch (rank) {
      case 'National':
        return 'bg-rose-950 text-rose-300 border-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'S':
        return 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'A':
        return 'bg-purple-950 text-purple-300 border-purple-500';
      case 'B':
        return 'bg-indigo-950 text-indigo-300 border-indigo-500';
      case 'C':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500';
      case 'D':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* 1. Holographic Broadcast Header & Telemetry */}
      <GlassCard variant="cyan" cornerCut="both" className="p-4 sm:p-5 relative overflow-hidden">
        {/* Glow ambient background aura */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
              <span className="font-tech text-xs tracking-widest text-cyan-300 uppercase font-bold flex items-center gap-1.5">
                <span>LIVE HUNTER LEADERBOARD • WORLD ASSOCIATION</span>
              </span>
            </div>
            <h1 className="font-hud text-xl sm:text-2xl font-black text-white tracking-wide">
              Global Gate Resonance Rankings
            </h1>
            <p className="font-sans text-xs text-slate-400 mt-0.5">
              Real-time biometric standing across registered awakened hunters.
            </p>
          </div>

          {/* Live countdown & telemetry status */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Weekly reset countdown */}
            <div className="px-3 py-1.5 bg-black/60 border border-slate-800 rounded-sm">
              <div className="font-tech text-[10px] uppercase text-slate-400">Weekly Raid Cycle</div>
              <div className="font-hud text-xs font-bold text-amber-400">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.mins}m {timeRemaining.secs}s
              </div>
            </div>

            {/* Live simulation toggle */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border font-tech text-xs rounded-sm transition-all ${
                isSimulating
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title="Toggle simulated live gate telemetry events"
            >
              <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{isSimulating ? 'Telemetry: LIVE' : 'Telemetry: Paused'}</span>
            </button>
          </div>
        </div>

        {/* Live News Ticker */}
        {activities.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-black/70 border border-cyan-500/30 rounded-sm text-xs overflow-hidden">
            <span className="font-hud text-[10px] font-black uppercase text-cyan-400 bg-cyan-950/90 px-1.5 py-0.5 border border-cyan-500/40 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> LIVE FEED
            </span>
            <div className="font-sans text-xs text-slate-200 truncate flex-1 animate-in fade-in key={activeTickerIndex}">
              <strong className="text-cyan-300 font-hud mr-1.5">
                {activities[activeTickerIndex]?.hunterName}:
              </strong>
              <span className="text-slate-300">{activities[activeTickerIndex]?.message}</span>
              <span className="text-slate-500 text-[10px] ml-2">
                ({activities[activeTickerIndex]?.timestamp})
              </span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* 2. Top 3 Podium Section */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4">
        {/* Silver - 2nd Place */}
        {podium.second && (
          <div
            onClick={() => setSelectedHunter(podium.second)}
            className="cursor-pointer group flex flex-col items-center p-3 sm:p-4 bg-gradient-to-t from-slate-900/90 to-[#121422] border-2 border-slate-400/60 clip-corner-tl shadow-[0_0_20px_rgba(148,163,184,0.2)] hover:border-slate-300 hover:shadow-[0_0_25px_rgba(148,163,184,0.4)] transition-all transform hover:-translate-y-1"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center font-hud text-xs sm:text-sm font-black text-slate-200 mb-2 shadow-[0_0_10px_#94A3B8]">
              2
            </div>

            {/* Avatar Frame */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-sm border-2 border-slate-400 bg-black/80 flex items-center justify-center overflow-hidden mb-2">
              {isPhotoAvatar(podium.second.avatar) ? (
                <img
                  src={podium.second.avatar}
                  alt={podium.second.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
              )}
              <span className={`absolute bottom-0 right-0 px-1 text-[8px] font-hud font-bold border ${rankBadgeStyle(podium.second.rank)}`}>
                {podium.second.rank}
              </span>
            </div>

            <h3 className="font-hud text-xs sm:text-sm font-black text-white text-center truncate max-w-full group-hover:text-cyan-300">
              {podium.second.name}
            </h3>
            <p className="font-tech text-[10px] text-slate-400 uppercase truncate">
              {podium.second.title}
            </p>

            <div className="mt-2 text-center">
              <span className="font-hud text-xs sm:text-sm font-black text-slate-200 block">
                {getMetricDisplay(podium.second).value}
              </span>
              <span className="font-tech text-[9px] text-slate-400 uppercase">
                {getMetricDisplay(podium.second).unit}
              </span>
            </div>
          </div>
        )}

        {/* Gold - 1st Place (Center / Taller) */}
        {podium.first && (
          <div
            onClick={() => setSelectedHunter(podium.first)}
            className="cursor-pointer group flex flex-col items-center p-4 sm:p-5 bg-gradient-to-t from-amber-950/80 via-[#1A1608] to-[#251E09] border-2 border-amber-400 clip-corner-both shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:border-amber-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.65)] transition-all transform hover:-translate-y-1 z-10"
          >
            <div className="relative mb-2">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 drop-shadow-[0_0_12px_#F59E0B] animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black font-hud text-[11px] font-black flex items-center justify-center">
                1
              </div>
            </div>

            {/* Avatar Frame */}
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-sm border-2 border-amber-400 bg-black/90 flex items-center justify-center overflow-hidden mb-2 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              {isPhotoAvatar(podium.first.avatar) ? (
                <img
                  src={podium.first.avatar}
                  alt={podium.first.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-amber-300" />
              )}
              <span className={`absolute bottom-0 right-0 px-1.5 text-[9px] font-hud font-black border ${rankBadgeStyle(podium.first.rank)}`}>
                {podium.first.rank}
              </span>
            </div>

            <h3 className="font-hud text-sm sm:text-base font-black text-amber-200 text-center truncate max-w-full">
              {podium.first.name}
            </h3>
            <p className="font-tech text-xs text-amber-400/90 uppercase font-bold truncate">
              {podium.first.title}
            </p>

            <div className="mt-2 text-center">
              <span className="font-hud text-sm sm:text-base font-black text-white block text-glow-gold">
                {getMetricDisplay(podium.first).value}
              </span>
              <span className="font-tech text-[10px] text-amber-300 uppercase font-bold">
                {getMetricDisplay(podium.first).unit}
              </span>
            </div>
          </div>
        )}

        {/* Bronze - 3rd Place */}
        {podium.third && (
          <div
            onClick={() => setSelectedHunter(podium.third)}
            className="cursor-pointer group flex flex-col items-center p-3 sm:p-4 bg-gradient-to-t from-orange-950/80 to-[#1A1412] border-2 border-orange-500/60 clip-corner-br shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:border-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-1"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-900 border-2 border-orange-400 flex items-center justify-center font-hud text-xs sm:text-sm font-black text-orange-200 mb-2 shadow-[0_0_10px_#EA580C]">
              3
            </div>

            {/* Avatar Frame */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-sm border-2 border-orange-400 bg-black/80 flex items-center justify-center overflow-hidden mb-2">
              {isPhotoAvatar(podium.third.avatar) ? (
                <img
                  src={podium.third.avatar}
                  alt={podium.third.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-orange-300" />
              )}
              <span className={`absolute bottom-0 right-0 px-1 text-[8px] font-hud font-bold border ${rankBadgeStyle(podium.third.rank)}`}>
                {podium.third.rank}
              </span>
            </div>

            <h3 className="font-hud text-xs sm:text-sm font-black text-white text-center truncate max-w-full group-hover:text-cyan-300">
              {podium.third.name}
            </h3>
            <p className="font-tech text-[10px] text-slate-400 uppercase truncate">
              {podium.third.title}
            </p>

            <div className="mt-2 text-center">
              <span className="font-hud text-xs sm:text-sm font-black text-orange-200 block">
                {getMetricDisplay(podium.third).value}
              </span>
              <span className="font-tech text-[9px] text-slate-400 uppercase">
                {getMetricDisplay(podium.third).unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Selector Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(
          [
            { id: 'power', label: 'Combat Power', icon: Trophy, unit: 'PWR' },
            { id: 'volume', label: 'Tonnage Volume', icon: Dumbbell, unit: 'kg' },
            { id: 'streak', label: 'Iron Streak', icon: Flame, unit: 'Days' },
            { id: 'floor', label: 'Dungeon Depth', icon: Footprints, unit: 'Floor' },
            { id: 'shadows', label: 'Shadow Army', icon: Shield, unit: 'Shadows' },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const isActive = category === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                setCategory(item.id);
              }}
              className={`p-2.5 sm:p-3 border flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,212,255,0.35)]'
                  : 'bg-black/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="font-hud text-xs font-bold text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Division Filters & Search Input */}
      <GlassCard variant="default" className="p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Division Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(
              [
                { id: 'all', label: 'Global Ranking' },
                { id: 'weekly', label: 'Weekly League' },
                { id: 'my_tier', label: `My Bracket (${player.rank}-Rank)` },
                { id: 'top10', label: 'Top 10 Elite' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  soundFx.playClick();
                  setDivision(d.id);
                }}
                className={`px-3 py-1.5 font-hud text-[11px] font-bold uppercase whitespace-nowrap border transition-all ${
                  division === d.id
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-black/40 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Search & Guild Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search hunter or guild..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-black/60 border border-slate-800 focus:border-cyan-400 text-xs text-white rounded-none outline-none font-sans"
              />
            </div>

            <select
              value={selectedGuild}
              onChange={(e) => setSelectedGuild(e.target.value)}
              className="py-1 px-2 bg-black/60 border border-slate-800 focus:border-cyan-400 text-xs text-slate-300 rounded-none outline-none font-sans cursor-pointer"
            >
              {GUILD_OPTIONS.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* 5. Leaderboard Roster Table */}
      <div className="space-y-2">
        {rankedHunters.map((hunter, index) => {
          const rankNumber = fullRankedList.findIndex((h) => h.id === hunter.id) + 1;
          const isPlayer = hunter.isPlayer;
          const isRival = hunter.id === ghostRivalId;
          const metric = getMetricDisplay(hunter);
          const hasRespected = !!respectedMap[hunter.id];

          return (
            <div
              key={hunter.id}
              ref={isPlayer ? playerCardRef : null}
              className={`p-3 sm:p-4 border flex items-center justify-between gap-3 transition-all ${
                isPlayer
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.3)] ring-1 ring-cyan-400/50'
                  : isRival
                  ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  : 'bg-black/50 border-slate-800/80 hover:border-cyan-500/40 hover:bg-black/70'
              }`}
            >
              {/* Left: Rank, Movement & Identity */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                {/* Rank Number */}
                <div className="w-7 sm:w-9 text-center shrink-0">
                  <span
                    className={`font-hud text-sm sm:text-base font-black ${
                      rankNumber === 1
                        ? 'text-amber-400'
                        : rankNumber === 2
                        ? 'text-slate-300'
                        : rankNumber === 3
                        ? 'text-orange-400'
                        : isPlayer
                        ? 'text-cyan-300'
                        : 'text-slate-400'
                    }`}
                  >
                    #{rankNumber}
                  </span>

                  {/* Rank movement */}
                  <div className="flex items-center justify-center text-[9px] font-tech font-bold">
                    {hunter.rankChange > 0 ? (
                      <span className="text-emerald-400 flex items-center">
                        <ArrowUp className="w-2.5 h-2.5" />
                        {hunter.rankChange}
                      </span>
                    ) : hunter.rankChange < 0 ? (
                      <span className="text-rose-400 flex items-center">
                        <ArrowDown className="w-2.5 h-2.5" />
                        {Math.abs(hunter.rankChange)}
                      </span>
                    ) : (
                      <span className="text-slate-600 flex items-center">
                        <Minus className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar Frame */}
                <div
                  onClick={() => setSelectedHunter(hunter)}
                  className="relative w-10 h-10 sm:w-12 sm:h-12 border border-cyan-500/50 bg-black/80 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden group/avatar"
                >
                  {isPhotoAvatar(hunter.avatar) ? (
                    <img
                      src={hunter.avatar}
                      alt={hunter.name}
                      className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-cyan-400" />
                  )}
                  <span
                    className={`absolute bottom-0 right-0 px-1 text-[7px] font-hud font-bold border ${rankBadgeStyle(
                      hunter.rank
                    )}`}
                  >
                    {hunter.rank}
                  </span>
                </div>

                {/* Name, Title, Guild */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4
                      onClick={() => setSelectedHunter(hunter)}
                      className={`font-hud text-xs sm:text-sm font-black truncate cursor-pointer hover:underline ${
                        isPlayer ? 'text-cyan-300' : 'text-white'
                      }`}
                    >
                      {hunter.name}
                    </h4>

                    {isPlayer && (
                      <span className="px-1.5 py-0.2 bg-cyan-400 text-black font-hud text-[9px] font-black uppercase">
                        YOU
                      </span>
                    )}
                    {isRival && (
                      <span className="px-1.5 py-0.2 bg-purple-500 text-white font-hud text-[9px] font-bold uppercase flex items-center gap-0.5">
                        <Target className="w-2.5 h-2.5" /> RIVAL
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-tech">
                    <span className="text-violet-300 truncate">{hunter.title}</span>
                    <span>•</span>
                    <span className="truncate">{hunter.guild}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-amber-400 font-hud hidden sm:inline">LV.{hunter.level}</span>
                  </div>
                </div>
              </div>

              {/* Right: Metric Value & Actions */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="text-right">
                  <span className={`font-hud text-xs sm:text-base font-black ${metric.color} block`}>
                    {metric.value}
                  </span>
                  <span className="font-tech text-[10px] text-slate-400 uppercase">
                    {metric.unit || metric.label}
                  </span>
                </div>

                {/* Respect / Heart Button */}
                <button
                  onClick={() => {
                    handleRespect(hunter.id);
                    soundFx.playManaSent();
                  }}
                  disabled={hasRespected}
                  className={`p-1.5 rounded-sm border transition-all ${
                    hasRespected
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : 'bg-black/60 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
                  }`}
                  title={hasRespected ? 'Mana already sent' : 'Send Mana Blessing'}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasRespected ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* Live Push Contest Duel Button */}
                {!isPlayer && (
                  <button
                    onClick={() => actions.openPushContest(hunter.id)}
                    className="px-2 py-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 hover:border-rose-400 font-hud text-[10px] text-rose-300 font-bold uppercase transition-all shadow-[0_0_8px_rgba(255,59,92,0.2)] flex items-center gap-1 active:scale-95"
                    title="Challenge to Live Push-up Contest"
                  >
                    <Swords className="w-3 h-3 text-rose-400" />
                    <span>Duel</span>
                  </button>
                )}

                {/* Inspect Button */}
                <button
                  onClick={() => setSelectedHunter(hunter)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 font-hud text-[10px] text-slate-300 hover:text-white uppercase transition-colors"
                >
                  Inspect
                </button>
              </div>
            </div>

          );
        })}
      </div>

      {/* 6. Sticky Bottom Dock for Player Standing */}
      <div className="fixed bottom-14 left-0 right-0 z-30 px-3 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="p-3 bg-[#0A0C16]/95 backdrop-blur-xl border border-cyan-400/70 clip-corner-both shadow-[0_0_25px_rgba(0,212,255,0.35)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none border border-cyan-400 bg-cyan-950 flex items-center justify-center font-hud text-xs font-black text-cyan-300 shadow-[0_0_10px_#00D4FF]">
                #{playerRankNum}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-hud text-xs font-black text-white">
                    {player.name} (Your Standing)
                  </span>
                  <span className={`px-1 text-[8px] font-hud font-bold border ${rankBadgeStyle(player.rank)}`}>
                    {player.rank}
                  </span>
                </div>

                <div className="font-tech text-[11px] text-slate-300">
                  Rating: <strong className="text-cyan-400 font-hud">{playerEntry.powerRating.toLocaleString()} PWR</strong>
                  {rivalAhead && (
                    <span className="ml-2 text-slate-400 hidden sm:inline">
                      | Next Rank: <strong className="text-amber-400">{rivalAhead.name}</strong> (+
                      {(rivalAhead.powerRating - playerEntry.powerRating).toLocaleString()} PWR ahead)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={scrollToPlayer}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-hud text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(0,212,255,0.4)] active:scale-95 transition-all"
            >
              Jump to Me
            </button>
          </div>
        </div>
      </div>

      {/* 7. Hunter License Detail Modal */}
      <HunterDetailModal
        hunter={selectedHunter}
        onClose={() => setSelectedHunter(null)}
        onRespect={handleRespect}
        hasRespected={selectedHunter ? !!respectedMap[selectedHunter.id] : false}
        isGhostRival={selectedHunter ? selectedHunter.id === ghostRivalId : false}
        onToggleGhostRival={handleToggleGhostRival}
      />
    </div>
  );
};
