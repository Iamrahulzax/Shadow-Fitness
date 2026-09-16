import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Quest } from '../../types';

interface DailyQuestArrivalModalProps {
  quests: Quest[];
  onAccept: () => void;
}

export const DailyQuestArrivalModal: React.FC<DailyQuestArrivalModalProps> = ({ quests, onAccept }) => {
  const dailyQuests = quests.filter((q) => q.category === 'daily_system');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0C0D14] border-2 border-cyan-500 shadow-[0_0_35px_rgba(0,212,255,0.35)] clip-corner-both p-6 text-center overflow-hidden">
        {/* Top Floating Alert Banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-tech text-xs tracking-widest uppercase mb-4 shadow-[0_0_12px_rgba(0,212,255,0.3)]">
          <Bell className="w-3.5 h-3.5 animate-bounce text-cyan-300" />
          SYSTEM NOTIFICATION
        </div>

        <h3 className="font-hud text-2xl md:text-3xl font-black text-white tracking-wide">
          A NEW QUEST HAS ARRIVED
        </h3>
        <p className="font-tech text-slate-300 text-xs tracking-wider uppercase mt-1">
          [Daily Mandate: Physical Conditioning for Awakening]
        </p>

        {/* Quest List Box */}
        <div className="my-5 p-3.5 bg-black/60 border border-cyan-500/20 text-left space-y-2.5">
          {dailyQuests.map((q) => (
            <div key={q.id} className="flex items-center justify-between font-tech text-xs">
              <span className="flex items-center gap-2 text-slate-200">
                {q.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-cyan-500/50 shrink-0 flex items-center justify-center text-[10px] text-cyan-400">
                    •
                  </div>
                )}
                {q.title.replace('[Daily System Quest] ', '')}
              </span>
              <span className="font-hud text-[11px] text-cyan-400">
                {q.current} / {q.target} {q.unit}
              </span>
            </div>
          ))}
        </div>

        {/* Motivational / Thematic Footnote */}
        <div className="flex items-start gap-2 p-2.5 bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] font-sans text-left mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            The System records every rep and stride. Continuous discipline elevates your hunter ranking.
          </span>
        </div>

        {/* Accept Button */}
        <button
          onClick={onAccept}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-hud font-black text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] clip-hex-btn flex items-center justify-center gap-1.5"
        >
          <span>ACCEPT SYSTEM MANDATE</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
