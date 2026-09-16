import React from 'react';
import { PlayerStats } from '../../types';

interface StatRadarChartProps {
  stats: PlayerStats;
  maxStatValue?: number;
  onStatClick?: (stat: keyof PlayerStats) => void;
  highlightStat?: keyof PlayerStats | null;
}

interface StatPoint {
  key: keyof PlayerStats;
  label: string;
  sublabel: string;
  value: number;
  angle: number; // in radians
}

export const StatRadarChart: React.FC<StatRadarChartProps> = ({
  stats,
  maxStatValue = 100,
  onStatClick,
  highlightStat,
}) => {
  const size = 280;
  const center = size / 2;
  const radius = size * 0.38;

  // 5 stats organized clockwise starting from top
  const statList: { key: keyof PlayerStats; label: string; sublabel: string }[] = [
    { key: 'STR', label: 'STR', sublabel: 'Strength' },
    { key: 'VIT', label: 'VIT', sublabel: 'Vitality' },
    { key: 'PER', label: 'PER', sublabel: 'Perception' },
    { key: 'INT', label: 'INT', sublabel: 'Intelligence' },
    { key: 'AGI', label: 'AGI', sublabel: 'Agility' },
  ];

  const totalPoints = statList.length;
  // Starting from -PI / 2 (top)
  const points: StatPoint[] = statList.map((stat, idx) => {
    const angle = (idx * 2 * Math.PI) / totalPoints - Math.PI / 2;
    return {
      ...stat,
      value: stats[stat.key],
      angle,
    };
  });

  // Calculate polygon path for arbitrary percentage
  const getPolygonPoints = (pct: number) => {
    return points
      .map((p) => {
        const r = radius * pct;
        const x = center + r * Math.cos(p.angle);
        const y = center + r * Math.sin(p.angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  };

  // Player's actual stat polygon
  const playerStatPolygon = points
    .map((p) => {
      // normalize stat value with min threshold so polygon is visible
      const normalized = Math.max(0.18, Math.min(1, p.value / maxStatValue));
      const r = radius * normalized;
      const x = center + r * Math.cos(p.angle);
      const y = center + r * Math.sin(p.angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-[0_0_15px_rgba(0,212,255,0.2)]"
      >
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#5B7FFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7B5CFF" stopOpacity="0.1" />
          </radialGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Decorative Compass Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius * 1.14}
          fill="none"
          stroke="rgba(91, 127, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Concentric Pentagon Grid */}
        {gridLevels.map((lvl, index) => (
          <polygon
            key={`grid-${index}`}
            points={getPolygonPoints(lvl)}
            fill="none"
            stroke={index === gridLevels.length - 1 ? 'rgba(0, 212, 255, 0.35)' : 'rgba(91, 127, 255, 0.15)'}
            strokeWidth={index === gridLevels.length - 1 ? '1.5' : '1'}
          />
        ))}

        {/* Radial Axis Lines */}
        {points.map((p, idx) => {
          const x2 = center + radius * Math.cos(p.angle);
          const y2 = center + radius * Math.sin(p.angle);
          return (
            <line
              key={`axis-${idx}`}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(91, 127, 255, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Active Player Stat Filled Area */}
        <polygon
          points={playerStatPolygon}
          fill="url(#radarFill)"
          stroke="#00D4FF"
          strokeWidth="2.5"
          filter="url(#glowFilter)"
          className="transition-all duration-700 ease-out"
        />

        {/* Vertex Dots and Label Anchors */}
        {points.map((p) => {
          const normalized = Math.max(0.18, Math.min(1, p.value / maxStatValue));
          const dotRadius = radius * normalized;
          const dotX = center + dotRadius * Math.cos(p.angle);
          const dotY = center + dotRadius * Math.sin(p.angle);

          // Outer label position
          const labelDist = radius * 1.34;
          const labelX = center + labelDist * Math.cos(p.angle);
          const labelY = center + labelDist * Math.sin(p.angle);

          const isHighlighted = highlightStat === p.key;

          return (
            <g key={`vertex-${p.key}`} className="cursor-pointer" onClick={() => onStatClick?.(p.key)}>
              {/* Vertex Dot */}
              <circle
                cx={dotX}
                cy={dotY}
                r={isHighlighted ? 6 : 4.5}
                fill="#00D4FF"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all duration-300 shadow-glow-cyan"
              />

              {/* Label Group */}
              <g transform={`translate(${labelX}, ${labelY})`}>
                <text
                  x={0}
                  y={-4}
                  textAnchor="middle"
                  className={`font-hud font-bold text-xs tracking-wider transition-colors ${
                    isHighlighted ? 'fill-cyan-300 drop-shadow-[0_0_8px_#00D4FF]' : 'fill-slate-200'
                  }`}
                >
                  {p.label}
                </text>
                <text
                  x={0}
                  y={12}
                  textAnchor="middle"
                  className="font-hud font-semibold text-[13px] fill-cyan-400"
                >
                  {p.value}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Subtitle helper */}
      <div className="flex items-center gap-4 text-[10px] font-tech tracking-wider text-slate-400 mt-1 uppercase">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#00D4FF]" />
          Synchronized Resonance
        </span>
        <span className="text-slate-600">•</span>
        <span>Peak: {Math.max(...Object.values(stats))}</span>
      </div>
    </div>
  );
};
