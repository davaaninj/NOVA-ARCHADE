import React from 'react';
import { GameDefinition } from '../../types';
import { Play, Sparkles, Trophy, Flame } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface HeroFeaturedWidgetProps {
  game: GameDefinition;
  onPlay: (game: GameDefinition) => void;
  highScore?: number;
}

export const HeroFeaturedWidget: React.FC<HeroFeaturedWidgetProps> = ({
  game,
  onPlay,
  highScore = 0,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/40 p-6 shadow-xl backdrop-blur-md group">
      {/* Background Neon Accent Glow */}
      <div
        className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-35"
        style={{ backgroundColor: game.accentColor }}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-cyber font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Daily Spotlight
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-emerald-400" />
              +50 Bonus XP
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
              {game.difficulty}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-cyber">
            {game.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {game.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60"
              >
                #{tag}
              </span>
            ))}
            {highScore > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-300 ml-2 font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Best: {highScore}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              onPlay(game);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold font-cyber text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            PLAY INSTANTLY
          </button>
          <span className="text-[11px] text-center text-slate-400 font-mono">
            No signup required • 100% Free
          </span>
        </div>
      </div>
    </div>
  );
};
