import React from 'react';
import { PlayerProgress } from '../utils/gameRules';
import { ThemePreset } from '../types';
import { sounds } from '../utils/soundEffects';
import {
  Gamepad2,
  Sliders,
  Volume2,
  VolumeX,
  Search,
  Sparkles,
  Flame,
  Monitor,
  Trophy,
} from 'lucide-react';

interface HeaderProps {
  progress: PlayerProgress;
  streakDays: number;
  onOpenCustomizer: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenTrophies: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  streakDays,
  onOpenCustomizer,
  isMuted,
  onToggleMute,
  scanlinesEnabled,
  onToggleScanlines,
  searchQuery,
  onSearchChange,
  onOpenTrophies,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-cyan-500/20 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wider flex items-center gap-1.5">
                  NOVA<span className="text-cyan-400">ARCADE</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-cyber px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  50+ GAMES
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Instant Free Browser Games • No Login Needed
              </p>
            </div>
          </div>

          {/* Mobile Right Quick Action */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenCustomizer();
              }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
              aria-label="Customize"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              aria-label="Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 50+ games by title, genre, or tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 font-mono transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: XP Status & Customizer Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Level & Streak Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="flex items-center gap-1 text-xs text-amber-400 font-cyber font-bold">
              <Flame className="w-4 h-4 text-amber-400" />
              {streakDays}d
            </span>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-cyber font-bold text-cyan-300">
                  LVL {progress.level}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {progress.xp} XP
                </span>
              </div>
              <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-0.5">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-cyan-950/40 border-cyan-800/80 text-cyan-300'
            }`}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label="Sound Toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={onToggleScanlines}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              scanlinesEnabled
                ? 'bg-purple-950/40 border-purple-800/80 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle CRT Scanline Overlay"
            aria-label="Toggle Scanlines"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Customize Widgets Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenCustomizer();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-cyan-500/30 text-cyan-300 font-cyber font-bold text-xs cursor-pointer shadow-md shadow-cyan-500/10 hover:border-cyan-400 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>CUSTOMIZE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
