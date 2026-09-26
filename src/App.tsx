import React, { useState, useEffect } from 'react';
import { usePlayerStore } from './store/usePlayerStore';
import { SystemHeader } from './components/layout/SystemHeader';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { StatusView } from './views/StatusView';
import { WorkoutView } from './views/WorkoutView';
import { NutritionView } from './views/NutritionView';
import { QuestsView } from './views/QuestsView';
import { AchievementsView } from './views/AchievementsView';
import { AnalyticsView } from './views/AnalyticsView';
import { LeaderboardView } from './views/LeaderboardView';
import { AuthView } from './views/AuthView';
import { authService } from './services/authService';
import { HunterAccount } from './types/auth';
import { soundFx } from './utils/audio';
import { LevelUpModal } from './components/modals/LevelUpModal';
import { DungeonClearModal } from './components/modals/DungeonClearModal';
import { DailyQuestArrivalModal } from './components/modals/DailyQuestArrivalModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { AIRepTrackerModal } from './components/modals/AIRepTrackerModal';
import { StreakCalendarModal } from './components/modals/StreakCalendarModal';
import { PushContestArenaModal } from './components/arena/PushContestArenaModal';
import { PlayerStats } from './types';
import { Plus, X, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [state, actions] = usePlayerStore();
  const [currentTab, setCurrentTab] = useState<TabType>('status');
  const [showAPModal, setShowAPModal] = useState(false);
  const [session, setSession] = useState(() => authService.getSession());

  useEffect(() => {
    if (session.isAuthenticated && session.currentUser) {
      actions.syncWithHunterAccount(session.currentUser);
    }
  }, [session.isAuthenticated, session.currentUser, actions]);

  const handleAuthSuccess = (hunter: HunterAccount) => {
    actions.syncWithHunterAccount(hunter);
    setSession({
      currentUser: hunter,
      isAuthenticated: true,
      rememberMe: true,
    });
  };

  const handleLogout = () => {
    soundFx.playClick();
    authService.logout();
    setSession({
      currentUser: null,
      isAuthenticated: false,
      rememberMe: true,
    });
  };

  if (!session.isAuthenticated || !session.currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  const pendingQuestsCount = state.quests.filter((q) => !q.completed).length;

  return (
    <div className="min-h-screen bg-[#07070B] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Fixed Hunter HUD Header */}
      <SystemHeader
        player={state.player}
        soundEnabled={state.soundEnabled}
        reducedGlow={state.reducedGlow}
        onToggleSound={actions.toggleSound}
        onToggleReducedGlow={actions.toggleReducedGlow}
        onOpenAPModal={() => setShowAPModal(true)}
        onOpenEditProfile={actions.openEditProfile}
        onOpenLeaderboard={() => setCurrentTab('leaderboard')}
        onLogout={handleLogout}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-4">
        {currentTab === 'status' && (
          <StatusView onNavigateTab={(tab) => setCurrentTab(tab as TabType)} />
        )}
        {currentTab === 'workout' && <WorkoutView />}
        {currentTab === 'nutrition' && <NutritionView />}
        {currentTab === 'quests' && <QuestsView />}
        {currentTab === 'army' && <AchievementsView />}
        {currentTab === 'leaderboard' && <LeaderboardView />}
        {currentTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav
        activeTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        pendingQuestsCount={pendingQuestsCount}
      />

      {/* Level-Up Overlay */}
      {state.activeModal === 'levelUp' && (
        <LevelUpModal
          info={state.levelUpInfo}
          onClose={actions.closeModal}
        />
      )}

      {/* Dungeon Clearance Victory Overlay */}
      {state.activeModal === 'dungeonClear' && (
        <DungeonClearModal
          workout={state.lastCompletedWorkout}
          loot={state.lastLoot}
          onClose={actions.closeModal}
        />
      )}

      {/* Daily System Notification Modal */}
      {state.activeModal === 'dailyNotification' && (
        <DailyQuestArrivalModal
          quests={state.quests}
          onAccept={actions.closeModal}
        />
      )}

      {/* Hunter Profile & System Identity Editor */}
      {state.activeModal === 'editProfile' && (
        <EditProfileModal
          player={state.player}
          initialTab={state.editProfileTab}
          onSave={actions.updatePlayerProfile}
          onReset={actions.resetPlayerProfile}
          onClose={actions.closeModal}
        />
      )}

      {/* AI Push-up Rep Tracker Modal */}
      {state.activeModal === 'aiRepTracker' && (
        <AIRepTrackerModal
          onClose={actions.closeModal}
          defaultTarget={state.aiTrackerTarget || 'quest'}
        />
      )}

      {/* Goal Streak Calendar Modal */}
      {state.activeModal === 'streakCalendar' && (
        <StreakCalendarModal onClose={actions.closeModal} />
      )}

      {/* Live Push-Up Contest Arena Modal */}
      {state.activeModal === 'pushContestArena' && (
        <PushContestArenaModal
          onClose={actions.closeModal}
          initialRivalId={state.activeContestRivalId}
        />
      )}



      {/* Quick Ability Point Allocator Drawer/Modal */}
      {showAPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#0C0D14] border-2 border-cyan-400 p-6 clip-corner-both shadow-[0_0_35px_rgba(0,212,255,0.4)]">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="font-hud text-sm font-bold text-white uppercase">
                  Allocate Ability Points
                </h3>
              </div>
              <button
                onClick={() => setShowAPModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-tech text-xs text-slate-300 mb-4">
              Points Available: <strong className="font-hud text-cyan-400 text-sm">{state.player.unallocatedPoints} AP</strong>
            </p>

            <div className="space-y-2">
              {(Object.keys(state.player.stats) as (keyof PlayerStats)[]).map((stat) => (
                <div
                  key={stat}
                  className="flex items-center justify-between p-2.5 bg-black/50 border border-slate-800"
                >
                  <div>
                    <span className="font-hud text-xs font-bold text-white block">{stat}</span>
                    <span className="font-tech text-[10px] text-slate-400">Current: {state.player.stats[stat]}</span>
                  </div>

                  <button
                    disabled={state.player.unallocatedPoints <= 0}
                    onClick={() => actions.allocateStat(stat)}
                    className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 disabled:opacity-40 text-cyan-300 font-hud text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> +1
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAPModal(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 border border-slate-700 font-hud text-xs text-slate-300 uppercase tracking-wider hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
