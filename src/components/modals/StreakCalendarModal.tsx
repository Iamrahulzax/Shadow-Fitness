import React from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { StreakCalendar } from '../calendar/StreakCalendar';

interface StreakCalendarModalProps {
  onClose: () => void;
}

export const StreakCalendarModal: React.FC<StreakCalendarModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.15)_0%,transparent_75%)] pointer-events-none" />

      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0A0A10] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,212,255,0.3)] clip-corner-both flex flex-col overflow-hidden">
        {/* Modal Window Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0E0F17] border-b border-cyan-500/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
            <h3 className="font-hud text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Hunter Goal Clearance & Streak Registry
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <StreakCalendar onClose={onClose} isModal={true} />
        </div>
      </div>
    </div>
  );
};
