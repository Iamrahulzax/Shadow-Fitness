import React from 'react';

interface HUDBarProps {
  current: number;
  max: number;
  label?: string;
  sublabel?: string;
  variant?: 'cyan' | 'violet' | 'gold' | 'emerald' | 'rose';
  showPercentage?: boolean;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  segmented?: boolean;
}

export const HUDBar: React.FC<HUDBarProps> = ({
  current,
  max,
  label,
  sublabel,
  variant = 'cyan',
  showPercentage = false,
  unit = '',
  size = 'md',
  segmented = true,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((current / (max || 1)) * 100)));

  const variantStyles = {
    cyan: {
      bar: 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 shadow-[0_0_12px_rgba(0,212,255,0.8)]',
      glow: 'shadow-[0_0_15px_rgba(0,212,255,0.5)]',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
    },
    violet: {
      bar: 'bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-300 shadow-[0_0_12px_rgba(123,92,255,0.8)]',
      glow: 'shadow-[0_0_15px_rgba(123,92,255,0.5)]',
      text: 'text-violet-400',
      border: 'border-violet-500/30',
    },
    gold: {
      bar: 'bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    emerald: {
      bar: 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    rose: {
      bar: 'bg-gradient-to-r from-rose-600 via-rose-500 to-pink-300 shadow-[0_0_12px_rgba(255,59,92,0.8)]',
      glow: 'shadow-[0_0_15px_rgba(255,59,92,0.5)]',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
    },
  }[variant];

  const heightClass = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  }[size];

  return (
    <div className="w-full">
      {(label || sublabel) && (
        <div className="flex justify-between items-baseline mb-1.5 font-tech text-xs tracking-wider">
          <span className="text-slate-300 uppercase flex items-center gap-1.5">
            {label}
            {showPercentage && <span className={`font-hud text-[11px] ${variantStyles.text}`}>({percentage}%)</span>}
          </span>
          <span className="font-hud tracking-tight text-slate-200">
            {sublabel || (
              <>
                <span className={`font-semibold ${variantStyles.text}`}>{current.toLocaleString()}</span>
                <span className="text-slate-500"> / {max.toLocaleString()}{unit ? ` ${unit}` : ''}</span>
              </>
            )}
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={`w-full bg-black/60 rounded-none border ${variantStyles.border} ${heightClass} p-[2px] relative overflow-hidden clip-corner-br`}
      >
        {/* Fill */}
        <div
          className={`h-full ${variantStyles.bar} transition-all duration-500 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Edge Glow Bead */}
          {percentage > 0 && percentage < 100 && (
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_#fff]" />
          )}
        </div>

        {/* Segmented Grid Overlay */}
        {segmented && (
          <div className="absolute inset-0 pointer-events-none hud-segments opacity-30" />
        )}
      </div>
    </div>
  );
};
