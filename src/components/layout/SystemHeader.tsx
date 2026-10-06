import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  PlusCircle,
  Edit3,
  Trophy,
  LogOut,
  Menu,
  X,
  User,
  Dumbbell,
  Utensils,
  CheckSquare,
  ShieldCheck,
  LineChart,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Player } from '../../types';
import { isPhotoAvatar } from '../../utils/image';
import { TabType } from './BottomNav';

interface SystemHeaderProps {
  player: Player;
  soundEnabled: boolean;
  reducedGlow: boolean;
  onToggleSound: () => void;
  onToggleReducedGlow: () => void;
  onOpenAPModal?: () => void;
  onOpenEditProfile?: () => void;
  onOpenLeaderboard?: () => void;
  onLogout?: () => void;
  currentTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
  pendingQuestsCount?: number;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  player,
  soundEnabled,
  reducedGlow,
  onToggleSound,
  onToggleReducedGlow,
  onOpenAPModal,
  onOpenEditProfile,
  onOpenLeaderboard,
  onLogout,
  currentTab = 'status',
  onSelectTab,
  pendingQuestsCount = 0,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    if (mobileDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  const rankColors = {
    E: 'bg-slate-700 text-slate-300 border-slate-500',
    D: 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.4)]',
    C: 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    B: 'bg-indigo-950 text-indigo-300 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)]',
    A: 'bg-purple-950 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    S: 'bg-amber-950 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    National: 'bg-rose-950 text-rose-300 border-rose-400 shadow-[0_0_18px_rgba(239,68,68,0.6)]',
  }[player.rank];

  const xpPercent = Math.min(100, Math.round((player.xp / player.xpToNextLevel) * 100));

  const navItems = [
    { id: 'status' as TabType, label: 'Hunter Status', desc: 'Attributes & Vitals', icon: User },
    { id: 'workout' as TabType, label: 'Dungeon Raids', desc: 'Workout sets & overload', icon: Dumbbell },
    { id: 'nutrition' as TabType, label: 'Mana & Nutrition', desc: 'Calorie budget & potions', icon: Utensils },
    { id: 'quests' as TabType, label: 'System Quests', desc: 'Daily mandates & boss raid', icon: CheckSquare, badge: pendingQuestsCount },
    { id: 'army' as TabType, label: 'Shadow Army', desc: 'Extracted soldiers & titles', icon: ShieldCheck },
    { id: 'leaderboard' as TabType, label: 'Arena Leaderboard', desc: 'Global hunter rankings', icon: Trophy, isLive: true },
    { id: 'analytics' as TabType, label: 'Power Telemetry', desc: 'Biometric resonance trends', icon: LineChart },
  ];

  const handleNavClick = (tabId: TabType) => {
    onSelectTab?.(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#07070B]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Player Identity & Title */}
          <div
            onClick={onOpenEditProfile}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group hover:opacity-95 transition-all min-w-0"
            title="Click to edit Hunter Profile"
          >
            {/* Rank Hex Badge or Profile Photo */}
            <div
              className={`relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-hud text-base sm:text-lg font-black clip-hex-btn border ${rankColors} transition-all group-hover:scale-105 overflow-hidden shrink-0`}
            >
              {isPhotoAvatar(player.avatar) ? (
                <>
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 px-1 text-[8px] font-hud bg-black/90 text-cyan-300 font-bold border-t border-l border-cyan-500/40">
                    {player.rank}
                  </span>
                </>
              ) : (
                player.rank
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-hud text-xs sm:text-sm md:text-base font-black text-white tracking-wide flex items-center gap-1 sm:gap-1.5 group-hover:text-cyan-300 transition-colors truncate">
                  <span className="truncate">{player.name}</span>
                  <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400/50 group-hover:text-cyan-400 transition-colors shrink-0" />
                </h1>
                <span className="font-tech text-[9px] sm:text-[10px] uppercase px-1.5 py-0.5 bg-violet-950/80 border border-violet-500/40 text-violet-300 rounded-sm shrink-0 hidden xs:inline">
                  {player.title}
                </span>
              </div>

              {/* Level & XP bar mini */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                <span className="font-hud text-[11px] sm:text-xs font-bold text-cyan-400 shrink-0">
                  LV.{player.level}
                </span>
                <div className="w-16 xs:w-20 sm:w-24 md:w-36 h-1.5 bg-black/60 border border-cyan-500/30 overflow-hidden shrink-0">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_6px_#00D4FF]"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <span className="font-tech text-[11px] text-slate-400 hidden md:inline">
                  {player.xp}/{player.xpToNextLevel} XP
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Ability Points & Accessibility */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {/* Ability Points Banner if available (compact on mobile) */}
            {player.unallocatedPoints > 0 && (
              <button
                onClick={onOpenAPModal}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-hud text-[11px] sm:text-xs font-bold rounded-sm animate-pulse shadow-[0_0_12px_rgba(0,212,255,0.4)] touch-target cursor-pointer"
                title="Allocate Available Ability Points"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+{player.unallocatedPoints} <span className="hidden xs:inline">AP</span></span>
              </button>
            )}

            {/* Quick Arena / Leaderboard Button (Tablet/Desktop) */}
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/50 hover:bg-amber-950/80 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-hud text-xs font-bold rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all cursor-pointer"
                title="Open Live Leaderboard"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Ranks</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </button>
            )}

            {/* Desktop Action Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                aria-label="Toggle Sound Effects"
                className="p-2 rounded-sm bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                title={soundEnabled ? 'Sound FX Enabled' : 'Sound FX Muted'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* Reduced Glow / Motion Toggle */}
              <button
                onClick={onToggleReducedGlow}
                aria-label="Toggle High-Glow Mode"
                title={reducedGlow ? 'Glow Reduced (Click to Restore)' : 'High Neon Glow Active'}
                className={`p-2 rounded-sm border transition-colors ${
                  reducedGlow
                    ? 'bg-slate-800 border-slate-600 text-slate-400'
                    : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(0,212,255,0.2)]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Hunter Logout / Switch Account */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  aria-label="Log Out or Switch Hunter"
                  title="Log Out // Return to Hunter Portal"
                  className="flex items-center gap-1.5 p-2 rounded-sm bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/40 hover:border-rose-400 text-rose-300 transition-colors shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-hud text-[10px] uppercase font-bold">
                    Log Out
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Off-Canvas Hamburger Menu Button (Visible on screens < md) */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle Mobile System Navigation Menu"
              className="md:hidden p-2 rounded-sm bg-cyan-950/50 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,212,255,0.25)] flex items-center justify-center touch-target"
            >
              {mobileDrawerOpen ? (
                <X className="w-5 h-5 text-cyan-300" />
              ) : (
                <Menu className="w-5 h-5 text-cyan-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* OFF-CANVAS MOBILE NAVIGATION & SYSTEM DRAWER (Mobile & Tablet) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <aside className="relative w-full max-w-xs sm:max-w-sm h-full bg-[#0A0B14] border-l-2 border-cyan-500/60 shadow-[0_0_40px_rgba(0,212,255,0.4)] flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-250">
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/25 bg-[#07070F]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
                <h3 className="font-hud text-xs font-bold text-white uppercase tracking-wider">
                  HUNTER SYSTEM // MENU
                </h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-target flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hunter Identity Snapshot in Drawer */}
            <div className="p-4 bg-black/60 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 flex items-center justify-center font-hud text-lg font-black clip-hex-btn border ${rankColors} overflow-hidden shrink-0 shadow-[0_0_12px_rgba(0,212,255,0.3)]`}
                >
                  {isPhotoAvatar(player.avatar) ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    player.rank
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-hud text-sm font-black text-white truncate">
                      {player.name}
                    </h4>
                    <span className="font-hud text-[10px] text-cyan-400 font-bold">
                      LV.{player.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-tech text-xs text-violet-300 truncate">
                      {player.title}
                    </span>
                    <span className="font-hud text-[9px] text-cyan-300 font-bold px-1 bg-cyan-950 border border-cyan-500/40">
                      {player.rank}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/80 border border-cyan-500/30 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 shadow-[0_0_6px_#00D4FF]"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {onOpenEditProfile && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenEditProfile();
                  }}
                  className="mt-3 w-full py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-hud text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Customize Hunter Profile</span>
                </button>
              )}
            </div>

            {/* Navigation Tabs List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-500 px-2 block mb-1">
                Command Deck Navigation
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full p-2.5 rounded-sm flex items-center justify-between text-left transition-all ${
                      isActive
                        ? 'bg-cyan-950/70 border border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                        : 'bg-black/30 border border-transparent text-slate-300 hover:bg-slate-900/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border ${
                          isActive
                            ? 'bg-cyan-900/80 border-cyan-400 text-cyan-300'
                            : 'bg-black/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className={`font-hud text-xs font-bold block truncate ${isActive ? 'text-cyan-200' : 'text-slate-200'}`}>
                          {item.label}
                        </span>
                        <span className="font-tech text-[10px] text-slate-500 block truncate">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-600 text-white font-hud text-[10px] font-bold rounded-full border border-rose-400">
                          {item.badge}
                        </span>
                      )}
                      {item.isLive && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick System Directives & Actions in Drawer */}
            <div className="p-3 bg-[#080811] border-t border-slate-800 space-y-2">
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-500 px-1 block">
                System Controls
              </span>

              {player.unallocatedPoints > 0 && onOpenAPModal && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenAPModal();
                  }}
                  className="w-full py-2 px-3 bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-hud text-xs font-bold flex items-center justify-between rounded-sm animate-pulse"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Allocate Points</span>
                  </span>
                  <span className="font-hud font-black">+{player.unallocatedPoints} AP</span>
                </button>
              )}

              {/* Sound & Glow toggles row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onToggleSound}
                  className="p-2 bg-black/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-tech flex items-center justify-center gap-1.5 rounded-sm transition-colors"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sound: ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sound: OFF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onToggleReducedGlow}
                  className="p-2 bg-black/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-tech flex items-center justify-center gap-1.5 rounded-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{reducedGlow ? 'Glow: MIN' : 'Glow: MAX'}</span>
                </button>
              </div>

              {/* Log out button */}
              {onLogout && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/40 hover:border-rose-400 text-rose-300 font-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-sm transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Hunter</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

