import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Shield,
  Zap,
  Award,
  Crown,
  Swords,
  Flame,
  Check,
  RotateCcw,
  Sliders,
  Coins,
  Key,
  Sparkles,
  Image as ImageIcon,
  Camera,
  Upload,
  Trash2,
  Link as LinkIcon,
  Dumbbell,
  Moon,
  Footprints,
  Droplets,
  Eye,
  Layers,
} from 'lucide-react';
import { Player, Rank, PlayerStats } from '../../types';
import { isPhotoAvatar, processImageFile } from '../../utils/image';

interface EditProfileModalProps {
  player: Player;
  initialTab?: 'identity' | 'rank' | 'avatar' | 'stats';
  onSave: (updated: Partial<Player>) => void;
  onReset: () => void;
  onClose: () => void;
}

export const AVATAR_PRESETS = [
  {
    id: 'shadow-monarch',
    name: 'Shadow Monarch',
    subtitle: 'Ruler of the Dead',
    icon: Crown,
    bgGradient: 'from-violet-900/80 to-black',
    borderColor: 'border-violet-500',
    textColor: 'text-violet-300',
    glowColor: 'shadow-[0_0_15px_rgba(139,92,246,0.4)]',
  },
  {
    id: 'sung-jinwoo',
    name: 'Twin Daggers',
    subtitle: 'Shadow Assassin',
    icon: Swords,
    bgGradient: 'from-cyan-950 to-black',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-300',
    glowColor: 'shadow-[0_0_15px_rgba(0,212,255,0.4)]',
  },
  {
    id: 'igris',
    name: 'Bloodred Knight',
    subtitle: 'Commander Igris',
    icon: Shield,
    bgGradient: 'from-rose-950 to-black',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-300',
    glowColor: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
  },
  {
    id: 'iron',
    name: 'Iron Berserker',
    subtitle: 'Shield Vanguard',
    icon: Dumbbell,
    bgGradient: 'from-slate-800 to-black',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-200',
    glowColor: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
  },
  {
    id: 'beru',
    name: 'Ant Monarch',
    subtitle: 'Royal Marshal',
    icon: Flame,
    bgGradient: 'from-purple-950 to-black',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-300',
    glowColor: 'shadow-[0_0_15px_rgba(192,132,252,0.4)]',
  },
  {
    id: 'kasaka',
    name: 'Kasaka Poison',
    subtitle: 'Serpent Beast',
    icon: Sparkles,
    bgGradient: 'from-emerald-950 to-black',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    glowColor: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]',
  },
  {
    id: 'dire-wolf',
    name: 'Wolf Slayer',
    subtitle: 'Direfang Alpha',
    icon: Zap,
    bgGradient: 'from-blue-950 to-black',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-300',
    glowColor: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]',
  },
  {
    id: 'national',
    name: 'National Sovereign',
    subtitle: 'Top 1 Hunter',
    icon: Award,
    bgGradient: 'from-amber-950 to-black',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-300',
    glowColor: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]',
  },
];

const PRESET_TITLES = [
  'Wolf Slayer',
  'Shadow Monarch',
  'The Bloodred Knight',
  'Iron Will',
  'Beast Slayer',
  'The Undefeated Monarch',
  'Hydration Monarch',
  'Lord of the Skies',
  'Awakened Hunter',
  'National Sovereign',
];

const PRESET_CLASSES = [
  'Shadow Monarch (Awakened)',
  'Shadow Assassin',
  'Necromancer',
  'Heavy Berserker',
  'Arcane Mage',
  'Titan Vanguard',
  'Striker / Brawler',
  'Phantom Ranger',
  'High Priest Healer',
];

const RANKS: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'National'];

const rankBadges: Record<Rank, { bg: string; border: string; text: string; glow: string }> = {
  E: { bg: 'bg-slate-900', border: 'border-slate-600', text: 'text-slate-400', glow: 'shadow-none' },
  D: { bg: 'bg-cyan-950', border: 'border-cyan-500', text: 'text-cyan-300', glow: 'shadow-[0_0_10px_rgba(0,212,255,0.4)]' },
  C: { bg: 'bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-300', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' },
  B: { bg: 'bg-indigo-950', border: 'border-indigo-500', text: 'text-indigo-300', glow: 'shadow-[0_0_10px_rgba(99,102,241,0.4)]' },
  A: { bg: 'bg-purple-950', border: 'border-purple-500', text: 'text-purple-300', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]' },
  S: { bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-300', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' },
  National: { bg: 'bg-rose-950', border: 'border-rose-500', text: 'text-rose-300', glow: 'shadow-[0_0_18px_rgba(239,68,68,0.6)]' },
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  player,
  initialTab,
  onSave,
  onReset,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'rank' | 'avatar' | 'stats'>(
    initialTab || 'identity'
  );

  // Form states initialized from current player
  const [name, setName] = useState(player.name);
  const [title, setTitle] = useState(player.title);
  const [hunterClass, setHunterClass] = useState(player.hunterClass || 'Shadow Monarch (Awakened)');
  const [hunterId, setHunterId] = useState(player.hunterId || 'SL-7709');
  const [bio, setBio] = useState(player.bio || 'Every rep brings me closer to the Monarch of Shadows. Arise.');
  const [rank, setRank] = useState<Rank>(player.rank);
  const [level, setLevel] = useState(player.level);
  const [xp, setXp] = useState(player.xp);
  const [xpToNextLevel, setXpToNextLevel] = useState(player.xpToNextLevel);
  const [unallocatedPoints, setUnallocatedPoints] = useState(player.unallocatedPoints);
  const [gold, setGold] = useState(player.gold);
  const [streakDays, setStreakDays] = useState(player.streakDays);
  const [streakKeys, setStreakKeys] = useState(player.streakKeys);
  const [avatar, setAvatar] = useState(
    player.avatar && !isPhotoAvatar(player.avatar) ? player.avatar : 'shadow-monarch'
  );
  const [customPhoto, setCustomPhoto] = useState<string>(
    isPhotoAvatar(player.avatar) ? player.avatar! : ''
  );
  const [urlInput, setUrlInput] = useState<string>(
    player.avatar && (player.avatar.startsWith('http://') || player.avatar.startsWith('https://'))
      ? player.avatar
      : ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<PlayerStats>({ ...player.stats });

  const handleStatChange = (key: keyof PlayerStats, value: number) => {
    setStats((prev) => ({
      ...prev,
      [key]: Math.max(1, value),
    }));
  };

  const handleLevelChange = (newLevel: number) => {
    const validLevel = Math.max(1, Math.min(100, newLevel));
    setLevel(validLevel);
    // Suggest rank automatically based on standard Solo Leveling brackets if user hasn't overridden
    if (validLevel >= 70) setRank('National');
    else if (validLevel >= 50) setRank('S');
    else if (validLevel >= 40) setRank('A');
    else if (validLevel >= 30) setRank('B');
    else if (validLevel >= 20) setRank('C');
    else if (validLevel >= 10) setRank('D');
    else setRank('E');

    setXpToNextLevel(Math.floor(1000 * Math.pow(1.15, validLevel - 1)));
  };

  const handleFileSelected = async (file: File) => {
    setUploadError(null);
    setIsProcessingImage(true);
    try {
      const optimizedDataUrl = await processImageFile(file, 360, 0.85);
      setCustomPhoto(optimizedDataUrl);
      setUrlInput('');
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process image file.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUploadError('Please enter a valid image URL');
      return;
    }
    setUploadError(null);
    setCustomPhoto(trimmed);
  };

  const handleRemovePhoto = () => {
    setCustomPhoto('');
    setUrlInput('');
    setUploadError(null);
  };

  const handleSave = () => {
    const finalAvatar = customPhoto.trim() ? customPhoto.trim() : avatar;
    onSave({
      name: name.trim() || 'Hunter Jin',
      title: title.trim() || 'Hunter',
      hunterClass: hunterClass.trim() || 'Shadow Monarch',
      hunterId: hunterId.trim() || 'SL-7709',
      bio: bio.trim(),
      rank,
      level,
      xp,
      xpToNextLevel,
      unallocatedPoints,
      gold,
      streakDays,
      streakKeys,
      avatar: finalAvatar,
      stats,
    });
  };

  // Find active avatar preset if applicable
  const selectedPreset = AVATAR_PRESETS.find((p) => p.id === avatar) || AVATAR_PRESETS[0];
  const AvatarIcon = selectedPreset.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#090A10] border-2 border-cyan-500/80 clip-corner-both shadow-[0_0_40px_rgba(0,212,255,0.35)] text-slate-100 overflow-hidden">
        
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 via-slate-900/60 to-black">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-none shadow-[0_0_10px_#00D4FF] animate-pulse" />
            <div>
              <h2 className="font-hud text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Hunter Profile Overwrite
                <span className="text-[10px] font-tech text-cyan-400 bg-cyan-950/80 px-2 py-0.5 border border-cyan-500/40 rounded-sm">
                  SYSTEM AUTH // ROOT
                </span>
              </h2>
              <p className="font-tech text-xs text-slate-400">
                Modify Hunter credentials, rank authorization, and biometric attributes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Profile Quick Preview Banner */}
        <div className="px-5 py-3 bg-black/60 border-b border-cyan-500/20 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Avatar Visualizer */}
            <div className="relative w-12 h-12 rounded-sm border border-cyan-400/60 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,212,255,0.3)]">
              {customPhoto ? (
                <img
                  src={customPhoto}
                  alt="Custom Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setCustomPhoto('')}
                />
              ) : (
                <AvatarIcon className={`w-6 h-6 ${selectedPreset.textColor}`} />
              )}
              <span className="absolute bottom-0 right-0 px-1 text-[9px] font-hud bg-black/90 text-cyan-300 font-bold border-t border-l border-cyan-500/40">
                {rank}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud text-base font-black text-white tracking-wide">
                  {name || 'Unknown Hunter'}
                </span>
                <span className="font-tech text-xs px-2 py-0.5 bg-violet-950/80 border border-violet-500/40 text-violet-300">
                  {title}
                </span>
              </div>
              <div className="font-tech text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-cyan-400 font-semibold">{hunterClass}</span>
                <span>•</span>
                <span className="text-slate-400">ID: {hunterId}</span>
                <span>•</span>
                <span className="font-hud text-cyan-300">LV. {level}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-hud text-xs px-2.5 py-1 border font-bold clip-hex-btn ${rankBadges[rank].bg} ${rankBadges[rank].border} ${rankBadges[rank].text} ${rankBadges[rank].glow}`}
            >
              {rank} RANK
            </span>
          </div>
        </div>

        {/* Tab Selector Navigation */}
        <div className="flex border-b border-cyan-500/20 bg-black/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('identity')}
            className={`flex items-center gap-2 px-4 py-2.5 font-hud text-xs font-bold uppercase transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'identity'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1. Identity & Creed
          </button>
          <button
            onClick={() => setActiveTab('rank')}
            className={`flex items-center gap-2 px-4 py-2.5 font-hud text-xs font-bold uppercase transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'rank'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            2. Rank & Progression
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex items-center gap-2 px-4 py-2.5 font-hud text-xs font-bold uppercase transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'avatar'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            3. Profile Photo & Sigil
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 font-hud text-xs font-bold uppercase transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'stats'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            4. System Attributes
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: IDENTITY & CREED */}
          {activeTab === 'identity' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Hunter Name Input */}
              <div className="space-y-1.5">
                <label className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Hunter Name (Required)</span>
                  <span className="font-tech text-[11px] text-cyan-400 font-normal">Original: Hunter Jin</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter hunter name (e.g. Sung Jin-Woo, Rahul, Hunter Jin)"
                    className="w-full bg-black/70 border border-cyan-500/50 focus:border-cyan-400 text-white px-3.5 py-2.5 text-sm font-sans placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                  />
                </div>
              </div>

              {/* Hunter Title */}
              <div className="space-y-1.5">
                <label className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Hunter Title</span>
                  <span className="font-tech text-[11px] text-slate-400">Custom or Quick Select</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter or select title"
                  className="w-full bg-black/70 border border-slate-700 focus:border-violet-400 text-violet-200 px-3.5 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-violet-400"
                />
                {/* Title Preset Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_TITLES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTitle(t)}
                      className={`font-tech text-xs px-2.5 py-1 border transition-all ${
                        title === t
                          ? 'bg-violet-900 border-violet-400 text-violet-100 shadow-[0_0_8px_rgba(139,92,246,0.4)]'
                          : 'bg-black/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hunter Class */}
              <div className="space-y-1.5">
                <label className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Hunter Class / Archetype
                </label>
                <input
                  type="text"
                  value={hunterClass}
                  onChange={(e) => setHunterClass(e.target.value)}
                  placeholder="e.g. Shadow Monarch, Assassin, Heavy Berserker"
                  className="w-full bg-black/70 border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 text-sm font-sans focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setHunterClass(cls)}
                      className={`font-tech text-xs px-2 py-0.5 border ${
                        hunterClass === cls
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hunter License ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Hunter License Code
                  </label>
                  <input
                    type="text"
                    value={hunterId}
                    onChange={(e) => setHunterId(e.target.value)}
                    placeholder="SL-7709"
                    className="w-full bg-black/70 border border-slate-700 focus:border-cyan-400 text-cyan-300 font-hud px-3.5 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Hunter Bio / Creed */}
              <div className="space-y-1.5">
                <label className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Hunter Creed / System Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Declare your hunter motto..."
                  className="w-full bg-black/70 border border-slate-700 focus:border-cyan-400 text-slate-200 px-3.5 py-2 text-xs font-sans focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: RANK & PROGRESSION */}
          {activeTab === 'rank' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Rank Grid Selection */}
              <div className="space-y-2">
                <label className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Select Authorized Hunter Rank
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {RANKS.map((r) => {
                    const badge = rankBadges[r];
                    const isSelected = rank === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRank(r)}
                        className={`p-2.5 flex flex-col items-center justify-center border transition-all ${badge.bg} ${
                          isSelected
                            ? `${badge.border} ring-2 ring-cyan-400 ${badge.glow} scale-105`
                            : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600'
                        }`}
                      >
                        <span className={`font-hud font-black text-sm sm:text-base ${badge.text}`}>
                          {r}
                        </span>
                        <span className="font-tech text-[9px] text-slate-400 uppercase">RANK</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level and XP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-black/50 border border-cyan-500/20">
                <div className="space-y-1.5">
                  <label className="font-hud text-xs font-bold text-cyan-300 uppercase">
                    Level (1 - 100)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={level}
                      onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-black border border-cyan-500/50 text-white font-hud text-lg px-3 py-1.5 text-center focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-hud text-xs font-bold text-slate-300 uppercase">
                    Current XP
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={xp}
                    onChange={(e) => setXp(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black border border-slate-700 text-white font-hud text-sm px-3 py-2 text-center focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-hud text-xs font-bold text-slate-300 uppercase">
                    XP Required (Next Level)
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={xpToNextLevel}
                    onChange={(e) => setXpToNextLevel(Math.max(100, parseInt(e.target.value) || 1000))}
                    className="w-full bg-black border border-slate-700 text-white font-hud text-sm px-3 py-2 text-center focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Streaks, Keys, AP & Currency */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-black/60 border border-slate-800 space-y-1">
                  <span className="font-tech text-xs text-amber-400 flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5" /> Gate Streak
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={streakDays}
                    onChange={(e) => setStreakDays(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/80 border border-slate-700 text-white font-hud text-sm px-2 py-1 text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center">Days logged</span>
                </div>

                <div className="p-3 bg-black/60 border border-slate-800 space-y-1">
                  <span className="font-tech text-xs text-purple-400 flex items-center gap-1 font-bold">
                    <Key className="w-3.5 h-3.5" /> Streak Keys
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={streakKeys}
                    onChange={(e) => setStreakKeys(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/80 border border-slate-700 text-white font-hud text-sm px-2 py-1 text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center">Aegis Protection</span>
                </div>

                <div className="p-3 bg-black/60 border border-slate-800 space-y-1">
                  <span className="font-tech text-xs text-cyan-400 flex items-center gap-1 font-bold">
                    <Zap className="w-3.5 h-3.5" /> Ability Points
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={unallocatedPoints}
                    onChange={(e) => setUnallocatedPoints(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/80 border border-slate-700 text-white font-hud text-sm px-2 py-1 text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center">Unallocated AP</span>
                </div>

                <div className="p-3 bg-black/60 border border-slate-800 space-y-1">
                  <span className="font-tech text-xs text-yellow-400 flex items-center gap-1 font-bold">
                    <Coins className="w-3.5 h-3.5" /> Gold Credits
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={gold}
                    onChange={(e) => setGold(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/80 border border-slate-700 text-white font-hud text-sm px-2 py-1 text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center">System Gold</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE PHOTO & SIGIL */}
          {activeTab === 'avatar' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Profile Photo Uploader Section */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-4 sm:p-5 bg-black/70 border transition-all rounded-sm ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                    : 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                }`}
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span className="font-hud text-xs font-bold text-white uppercase tracking-wider">
                      Hunter Biometric Photo
                    </span>
                    <span className="text-[10px] font-tech text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 border border-cyan-500/30">
                      CUSTOM PORTRAIT
                    </span>
                  </div>
                  {customPhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-1 font-tech text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-sm transition-colors"
                      title="Remove custom photo and revert to hunter sigil"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Portrait Frame Preview */}
                  <div className="relative group shrink-0">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-sm border-2 border-cyan-400/80 bg-slate-950 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                      {customPhoto ? (
                        <img
                          src={customPhoto}
                          alt="Hunter Profile"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setUploadError('Failed to load image from provided source.');
                            setCustomPhoto('');
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                          <AvatarIcon className={`w-10 h-10 ${selectedPreset.textColor} mb-1`} />
                          <span className="font-tech text-[10px] text-slate-400 uppercase">
                            Preset Active
                          </span>
                        </div>
                      )}

                      {/* Rank tag in corner */}
                      <span className="absolute bottom-0 right-0 px-1.5 py-0.5 text-[9px] font-hud bg-black/90 text-cyan-300 font-black border-t border-l border-cyan-500/50">
                        {rank}
                      </span>

                      {/* Hover action on portrait */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/75 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-cyan-300 transition-opacity cursor-pointer"
                        title="Click to choose a new photo"
                      >
                        <Upload className="w-5 h-5 mb-0.5" />
                        <span className="font-hud text-[9px] uppercase font-bold tracking-wider">
                          Change
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Controls & Drag Zone */}
                  <div className="flex-1 w-full space-y-3">
                    <p className="font-tech text-xs text-slate-300">
                      Personalize Hunter Jin with your personal portrait or anime avatar. Drag and drop any image file onto this card, or choose an upload method below:
                    </p>

                    {/* Action buttons row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-hud text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,212,255,0.25)] hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Upload Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-tech text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        title="Capture using device camera or selfie"
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Take Photo</span>
                      </button>

                      {customPhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="flex items-center gap-1.5 px-2.5 py-2 bg-black/60 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/60 text-slate-400 hover:text-rose-300 font-tech text-xs transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Use Preset Crest</span>
                        </button>
                      )}
                    </div>

                    {/* Hidden inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />

                    {/* Processing State */}
                    {isProcessingImage && (
                      <div className="flex items-center gap-2 p-2 bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-tech text-xs animate-pulse">
                        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span>Optimizing image resolution and compressing for local storage...</span>
                      </div>
                    )}

                    {/* Error Display */}
                    {uploadError && (
                      <div className="p-2 bg-rose-950/60 border border-rose-500/60 text-rose-200 font-tech text-xs">
                        {uploadError}
                      </div>
                    )}

                    <div className="font-tech text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span>• Supports JPG, PNG, WEBP, GIF</span>
                      <span>• Auto-resized to 360×360 px</span>
                      <span>• Saved permanently in browser</span>
                    </div>
                  </div>
                </div>

                {/* Web Image URL Alternative */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <label className="font-tech text-xs text-slate-400 flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3 text-cyan-400" />
                    <span>Or paste image URL directly:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 bg-black/90 border border-slate-800 focus:border-cyan-400 text-slate-200 px-3 py-1.5 text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-tech font-bold uppercase transition-colors"
                    >
                      Apply
                    </button>
                    {urlInput && (
                      <button
                        type="button"
                        onClick={() => setUrlInput('')}
                        className="px-2 py-1.5 bg-slate-900 text-slate-400 text-xs font-tech hover:text-slate-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Preset Hunter Sigils */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Solo Leveling Hunter Sigils
                  </label>
                  <span className="font-tech text-[11px] text-slate-400">
                    {customPhoto ? '(Fallback if photo removed)' : '(Currently Active)'}
                  </span>
                </div>
                <p className="font-tech text-xs text-slate-400">
                  Select an iconic shadow sovereign persona or monster hunter emblem:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AVATAR_PRESETS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = avatar === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setAvatar(item.id);
                        }}
                        className={`p-2.5 text-left border rounded-sm flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? `bg-gradient-to-b ${item.bgGradient} ${item.borderColor} ${item.glowColor} ring-1 ring-cyan-400`
                            : 'bg-black/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-sm bg-black/60 border ${item.borderColor} flex items-center justify-center mb-1.5`}
                        >
                          <Icon className={`w-4 h-4 ${item.textColor}`} />
                        </div>
                        <span className="font-hud text-xs font-bold text-white text-center">
                          {item.name}
                        </span>
                        <span className="font-tech text-[10px] text-slate-400 text-center">
                          {item.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM ATTRIBUTES (STATS) */}
          {activeTab === 'stats' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-hud text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Core 5-Stat Attributes Configuration
                  </h3>
                  <p className="font-tech text-xs text-slate-400">
                    Directly calibrate Hunter Jin's biometric stats and power scale
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-tech text-xs text-slate-400 block">Total Stat Sum</span>
                  <span className="font-hud text-cyan-300 font-bold text-base">
                    {stats.STR + stats.VIT + stats.AGI + stats.INT + stats.PER}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'STR' as keyof PlayerStats,
                    label: 'Strength (STR)',
                    desc: 'Workout Volume & Heavy Sets Power',
                    icon: Dumbbell,
                    color: 'text-rose-400',
                    border: 'border-rose-500/40',
                  },
                  {
                    key: 'VIT' as keyof PlayerStats,
                    label: 'Vitality (VIT)',
                    desc: 'Sleep Recovery & HP Pool',
                    icon: Moon,
                    color: 'text-emerald-400',
                    border: 'border-emerald-500/40',
                  },
                  {
                    key: 'AGI' as keyof PlayerStats,
                    label: 'Agility (AGI)',
                    desc: 'Steps Logged & Dungeon Running Depth',
                    icon: Footprints,
                    color: 'text-amber-400',
                    border: 'border-amber-500/40',
                  },
                  {
                    key: 'INT' as keyof PlayerStats,
                    label: 'Intelligence (INT)',
                    desc: 'Hydration & Nutrition Macronutrient Balance',
                    icon: Droplets,
                    color: 'text-cyan-400',
                    border: 'border-cyan-500/40',
                  },
                  {
                    key: 'PER' as keyof PlayerStats,
                    label: 'Perception (PER)',
                    desc: 'Discipline Streak & Daily Quest Consistency',
                    icon: Eye,
                    color: 'text-violet-400',
                    border: 'border-violet-500/40',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const val = stats[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-3 bg-black/60 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <div className={`p-1.5 bg-black border ${item.border} rounded-sm`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div>
                          <span className="font-hud text-xs font-bold text-white block">
                            {item.label}
                          </span>
                          <span className="font-tech text-[10px] text-slate-400">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {/* Value controller */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatChange(item.key, val - 1)}
                          className="w-7 h-7 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-hud text-sm flex items-center justify-center transition-colors active:scale-95"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={val}
                          onChange={(e) => handleStatChange(item.key, parseInt(e.target.value) || 1)}
                          className="w-16 bg-black border border-cyan-500/40 text-cyan-300 font-hud font-bold text-center py-1 text-sm focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleStatChange(item.key, val + 1)}
                          className="w-7 h-7 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-hud text-sm flex items-center justify-center transition-colors active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Controls */}
        <div className="px-5 py-3.5 border-t border-cyan-500/30 bg-black/80 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-300 font-tech text-xs uppercase tracking-wider transition-all"
            title="Revert back to default Hunter Jin data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-tech text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-hud text-xs font-black uppercase tracking-wider shadow-[0_0_15px_#00D4FF] hover:shadow-[0_0_22px_#00D4FF] transition-all clip-hex-btn active:scale-95"
            >
              <Check className="w-4 h-4" />
              Save & Synchronize
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
