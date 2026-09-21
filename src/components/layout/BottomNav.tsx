import React from 'react';
import { User, Dumbbell, Utensils, CheckSquare, ShieldCheck, LineChart, Trophy } from 'lucide-react';

export type TabType =
  | 'status'
  | 'workout'
  | 'nutrition'
  | 'quests'
  | 'army'
  | 'leaderboard'
  | 'analytics';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingQuestsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingQuestsCount,
}) => {
  const tabs = [
    { id: 'status' as TabType, label: 'Status', icon: User },
    { id: 'workout' as TabType, label: 'Dungeon', icon: Dumbbell },
    { id: 'nutrition' as TabType, label: 'Mana', icon: Utensils },
    { id: 'quests' as TabType, label: 'Quests', icon: CheckSquare, badge: pendingQuestsCount },
    { id: 'army' as TabType, label: 'Shadows', icon: ShieldCheck },
    { id: 'leaderboard' as TabType, label: 'Arena', icon: Trophy, isLive: true },
    { id: 'analytics' as TabType, label: 'Trends', icon: LineChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A10]/95 backdrop-blur-xl border-t border-cyan-500/20 px-1 sm:px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.7)]">
      <div className="max-w-lg mx-auto grid grid-cols-7 gap-0.5 sm:gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-sm transition-all duration-200 ${
                isActive
                  ? 'text-cyan-300 bg-cyan-950/40 border-t-2 border-cyan-400 -translate-y-0.5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {/* Badge for quests */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-0.5 right-1 sm:right-2 w-3.5 h-3.5 bg-rose-600 text-[9px] font-hud font-bold text-white rounded-full flex items-center justify-center border border-rose-400 shadow-[0_0_6px_#FF3B5C]">
                  {tab.badge}
                </span>
              )}

              {/* Pulsing live dot for Arena */}
              {tab.isLive && (
                <span className="absolute top-1 right-1 sm:right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
              )}

              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 transition-transform ${
                  isActive ? 'scale-110 drop-shadow-[0_0_8px_#00D4FF]' : ''
                }`}
              />
              <span className={`text-[9px] sm:text-[10px] font-tech tracking-wider uppercase truncate max-w-full ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
