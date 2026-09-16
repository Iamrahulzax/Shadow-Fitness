import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'cyan' | 'violet' | 'gold' | 'default' | 'danger' | 'emerald';
  cornerCut?: 'tl' | 'br' | 'both' | 'none';
  interactive?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'cyan',
  cornerCut = 'both',
  interactive = false,
  glowOnHover = true,
  onClick,
}) => {
  const cornerClass = {
    tl: 'clip-corner-tl',
    br: 'clip-corner-br',
    both: 'clip-corner-both',
    none: 'rounded-sm',
  }[cornerCut];

  const variantStyles = {
    cyan: 'border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(0,212,255,0.1)]',
    violet: 'border-violet-500/25 hover:border-violet-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(123,92,255,0.1)]',
    gold: 'border-amber-500/30 hover:border-amber-400/60 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(245,158,11,0.15)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(16,185,129,0.15)]',
    danger: 'border-rose-500/30 hover:border-rose-400/60 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,59,92,0.15)]',
    default: 'border-slate-700/50 hover:border-slate-600 shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
  }[variant];

  const hoverGlow = glowOnHover
    ? variant === 'cyan'
      ? 'hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]'
      : variant === 'violet'
      ? 'hover:shadow-[0_0_20px_rgba(123,92,255,0.25)]'
      : variant === 'gold'
      ? 'hover:shadow-[0_0_22px_rgba(245,158,11,0.3)]'
      : variant === 'emerald'
      ? 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
      : 'hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative bg-[#0E0F17]/85 backdrop-blur-md border transition-all duration-300 ${cornerClass} ${variantStyles} ${hoverGlow} ${
        interactive ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      {/* HUD Corner Tech Crosshairs */}
      <div className="absolute top-1 left-1.5 w-1.5 h-1.5 border-t border-l border-white/20 pointer-events-none" />
      <div className="absolute top-1 right-1.5 w-1.5 h-1.5 border-t border-r border-white/20 pointer-events-none" />
      <div className="absolute bottom-1 left-1.5 w-1.5 h-1.5 border-b border-l border-white/20 pointer-events-none" />
      <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 border-b border-r border-white/20 pointer-events-none" />

      {children}
    </div>
  );
};
