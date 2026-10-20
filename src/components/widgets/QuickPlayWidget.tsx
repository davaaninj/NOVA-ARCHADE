import React from 'react';
import { GameDefinition } from '../../types';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { Play, Star, Clock, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface QuickPlayWidgetProps {
  favorites: string[];
  recentGameIds: string[];
  onPlayGame: (game: GameDefinition) => void;
}

export const QuickPlayWidget: React.FC<QuickPlayWidgetProps> = ({
  favorites,
  recentGameIds,
  onPlayGame,
}) => {
  // Combine favorites and recent games, or fallback to popular
  const quickIds = Array.from(new Set([...favorites, ...recentGameIds]));
  const displayGames =
    quickIds.length > 0
      ? quickIds
          .map((id) => GAMES_CATALOG.find((g) => g.id === id))
          .filter((g): g is GameDefinition => g !== undefined)
          .slice(0, 4)
      : GAMES_CATALOG.filter((g) => g.featured).slice(0, 4);

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-cyan-500/20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-cyan-400" />
          Quick Launch Deck
        </h3>
        <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
          1-CLICK
        </span>
      </div>

      <div className="my-2 grid grid-cols-2 gap-2">
        {displayGames.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              sounds.playClick();
              onPlayGame(game);
            }}
            className="flex flex-col items-start p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: game.accentColor }}
              />
              <Play className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xs font-cyber font-bold text-slate-200 group-hover:text-cyan-300 truncate w-full">
              {game.title}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">
              {game.genre}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 text-center font-mono">
        Star games to pin them right here
      </p>
    </div>
  );
};
