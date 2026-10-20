import React, { useState } from 'react';
import { SkillStats, PlayerProgress } from '../utils/gameRules';
import { GameGenre } from '../types';

interface SkillRadarChartProps {
  stats: SkillStats;
  themeColor?: string;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  stats,
  themeColor = '#06b6d4',
}) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const axes: Array<{ key: keyof SkillStats; label: string; angle: number }> = [
    { key: 'speed', label: 'Speed', angle: 0 },
    { key: 'reflex', label: 'Reflex', angle: 60 },
    { key: 'logic', label: 'Logic', angle: 120 },
    { key: 'strategy', label: 'Strategy', angle: 180 },
    { key: 'precision', label: 'Precision', angle: 240 },
    { key: 'endurance', label: 'Endurance', angle: 300 },
  ];

  const size = 260;
  const center = size / 2;
  const maxRadius = 90;

  // Compute point coordinates
  const getCoordinates = (value: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  const polygonPoints = axes
    .map((axis) => {
      const val = stats[axis.key] || 40;
      const pt = getCoordinates(val, axis.angle);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const skillTips: Record<keyof SkillStats, string> = {
    speed: 'Boost by playing Speed Typer, Reaction Tester, and Math Sprint.',
    reflex: 'Boost by playing Geometry Dash, Whack-A-Mole, and Knife Hit.',
    logic: 'Boost by playing 2048, Minesweeper, and Sudoku.',
    strategy: 'Boost by playing Chess Puzzles, Connect 4, and Tower Defense.',
    precision: 'Boost by playing Tower Stacker, Aim Trainer, and Breakout.',
    endurance: 'Boost by playing longer sessions and trying all genres.',
  };

  return (
    <div className="flex flex-col items-center relative">
      <svg
        width={size}
        height={size}
        className="overflow-visible select-none drop-shadow-md"
        aria-label="Interactive Skill Radar Chart"
      >
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={themeColor} stopOpacity="0.05" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background concentric reference webs (25%, 50%, 75%, 100%) */}
        {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
          const webPoints = axes
            .map((axis) => {
              const pt = getCoordinates(100 * level, axis.angle);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={idx}
              points={webPoints}
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="1"
              strokeDasharray={level < 1 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Radial Axis Spoke Lines */}
        {axes.map((axis, i) => {
          const outer = getCoordinates(100, axis.angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(148, 163, 184, 0.18)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon filled shape */}
        <polygon
          points={polygonPoints}
          fill="url(#radarGrad)"
          stroke={themeColor}
          strokeWidth="2.5"
          filter="url(#glow)"
          className="transition-all duration-700 ease-out"
        />

        {/* Vertex nodes and interactive hover zones */}
        {axes.map((axis) => {
          const val = stats[axis.key] || 40;
          const pt = getCoordinates(val, axis.angle);
          const outerPt = getCoordinates(124, axis.angle);
          const isHovered = hoveredSkill === axis.key;

          return (
            <g key={axis.key}>
              {/* Outer label */}
              <text
                x={outerPt.x}
                y={outerPt.y + (axis.angle === 180 ? 4 : 0)}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[11px] font-cyber font-semibold tracking-wider transition-colors cursor-pointer ${
                  isHovered ? 'fill-white' : 'fill-slate-400'
                }`}
                onMouseEnter={() => setHoveredSkill(axis.key)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                {axis.label} ({val})
              </text>

              {/* Glowing vertex circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#ffffff' : themeColor}
                stroke="#090d16"
                strokeWidth="2"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSkill(axis.key)}
                onMouseLeave={() => setHoveredSkill(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Dynamic Skill Tooltip / Tip */}
      <div className="min-h-[42px] mt-1 text-center px-3 py-1 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-300 max-w-[280px]">
        {hoveredSkill ? (
          <p>
            <span className="font-semibold text-cyan-400 uppercase">
              {hoveredSkill}:{' '}
            </span>
            {skillTips[hoveredSkill as keyof SkillStats]}
          </p>
        ) : (
          <p className="text-slate-400">
            Hover over any vertex to view training suggestions.
          </p>
        )}
      </div>
    </div>
  );
};

interface CategoryDonutChartProps {
  genreCounts: Record<GameGenre, number>;
  onSelectGenre?: (genre: GameGenre) => void;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  genreCounts,
  onSelectGenre,
}) => {
  const [hoveredGenre, setHoveredGenre] = useState<GameGenre | null>(null);

  const genres: Array<{ id: GameGenre; label: string; color: string }> = [
    { id: 'arcade', label: 'Arcade', color: '#10b981' },
    { id: 'puzzle', label: 'Puzzle', color: '#f59e0b' },
    { id: 'reflex', label: 'Reflex', color: '#06b6d4' },
    { id: 'strategy', label: 'Strategy', color: '#8b5cf6' },
    { id: 'casual', label: 'Casual', color: '#ec4899' },
    { id: 'brain', label: 'Brain', color: '#3b82f6' },
  ];

  const total = Math.max(
    1,
    genres.reduce((acc, g) => acc + (genreCounts[g.id] || 0), 0)
  );

  let accumulatedAngle = 0;
  const radius = 68;
  const innerRadius = 46;
  const cx = 90;
  const cy = 90;

  const slices = genres.map((g) => {
    const count = genreCounts[g.id] || 0;
    const fraction = count / total;
    const angle = fraction * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = (((startAngle + Math.max(0.1, angle)) - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return {
      ...g,
      count,
      percent: Math.round(fraction * 100),
      pathData,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* SVG Donut */}
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180" className="select-none">
          {slices.map((slice) => {
            const isHovered = hoveredGenre === slice.id;
            return (
              <path
                key={slice.id}
                d={slice.pathData}
                fill={slice.color}
                opacity={hoveredGenre && !isHovered ? 0.4 : isHovered ? 1 : 0.85}
                stroke="#090d16"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:brightness-125"
                onMouseEnter={() => setHoveredGenre(slice.id)}
                onMouseLeave={() => setHoveredGenre(null)}
                onClick={() => onSelectGenre?.(slice.id)}
              />
            );
          })}
        </svg>

        {/* Center Summary Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xl font-bold font-cyber text-white">
            {hoveredGenre
              ? `${genreCounts[hoveredGenre] || 0}`
              : total === 1 && !genreCounts.arcade
              ? '0'
              : total}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            {hoveredGenre ? hoveredGenre : 'Plays'}
          </span>
        </div>
      </div>

      {/* Genre Legends */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {genres.map((g) => {
          const count = genreCounts[g.id] || 0;
          const isSelected = hoveredGenre === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGenre?.(g.id)}
              onMouseEnter={() => setHoveredGenre(g.id)}
              onMouseLeave={() => setHoveredGenre(null)}
              className={`flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                isSelected
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: g.color }}
              />
              <span className="truncate">{g.label}</span>
              <span className="text-slate-500 font-mono text-[10px] ml-auto">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface PlayActivityHeatmapProps {
  streakDays: number;
  totalPlays: number;
}

export const PlayActivityHeatmap: React.FC<PlayActivityHeatmapProps> = ({
  streakDays,
  totalPlays,
}) => {
  // Generate deterministic past 21 days
  const days = Array.from({ length: 21 }, (_, i) => {
    const isRecent = i >= 21 - Math.min(streakDays, 7);
    const intensity = isRecent ? Math.min(4, Math.floor(Math.random() * 3) + 2) : i % 3 === 0 ? 1 : 0;
    return {
      dayIndex: i,
      intensity,
      plays: intensity * 3,
    };
  });

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return 'bg-emerald-950 border-emerald-900/40 text-emerald-300';
      case 2:
        return 'bg-emerald-800/80 border-emerald-700/60 text-emerald-100';
      case 3:
        return 'bg-emerald-600 border-emerald-500 text-white';
      case 4:
        return 'bg-emerald-400 border-emerald-300 text-slate-900 font-bold';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-600';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-cyber font-bold text-lg flex items-center gap-1">
            🔥 {streakDays} Day Streak
          </span>
          <span className="text-xs text-slate-400">({totalPlays} total sessions)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-900/40" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-600" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {/* Grid of days */}
      <div className="grid grid-flow-col grid-rows-3 gap-1.5 overflow-x-auto py-1">
        {days.map((d) => (
          <div
            key={d.dayIndex}
            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono border transition-transform hover:scale-110 cursor-pointer ${getHeatmapColor(
              d.intensity
            )}`}
            title={`Day ${d.dayIndex + 1}: ${d.plays} plays`}
          >
            {d.intensity > 0 ? d.intensity : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

interface LevelProgressDisplayProps {
  progress: PlayerProgress;
}

export const LevelProgressDisplay: React.FC<LevelProgressDisplayProps> = ({ progress }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-cyber font-bold">
            LVL {progress.level}
          </span>
          <span className="font-semibold text-slate-200">{progress.title}</span>
        </div>
        <span className="text-slate-400 font-mono">
          {progress.xp} / {progress.nextLevelXp} XP
        </span>
      </div>

      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 relative">
        <div
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-500"
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>
    </div>
  );
};
